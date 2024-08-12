import { bot } from "#root/bot/bot.js";
import { getBanUserButton } from "#root/bot/buttons/ban_user.js";
import { getVotingBanDecision } from "#root/bot/buttons/voting_ban.js";

import { Chat, Voter, Voting } from "#root/models/index.js";
import {
  editMessage,
  getUserMention,
  sendToAllAdmins,
  timeoutUser,
  isAdministrator,
  banUser,
  setCooldown,
  hyperlink,
} from "#root/utils.js";
import { votingText } from "#root/bot/commands/voting/format_text.js";
import { getGoToMessageButtons } from "#root/bot/buttons/go_to_message.js";

/**
 *
 * @param {import("mongoose").HydratedDocument<Chat>} chatObj
 * @param {import("mongoose").HydratedDocument<Voting>} votingObj
 * @param {import("node-telegram-bot-api").User} starter
 * @param {import("node-telegram-bot-api").User} candidate
 * @param {String} reason
 */
async function notifyAdmins(
  chatObj,
  votingObj,
  starter,
  candidate,
  reason = null
) {
  if (["cancel", "ban_yes", "ban_no"].includes(reason)) return;
  const actionText = votingObj.action == "mute" ? "мут" : "бан";
  const reasonText = {
    timeout: "вышло время.",
    yes: "набралось необходимое количество голосов за.",
    no: "набралось необходимое количество голосов против.",
    waiting:
      "набралось необходимое количество голосов за.\nТребуется ваше подтверждение на бан.",
  }[reason];

  const yes = [];
  const no = [];
  for (let userId of votingObj.yes) {
    let voter = await Voter.findOne({
      votingId: votingObj._id,
      userId: userId,
    });
    if (!voter)
      voter = (await bot.getChatMember(votingObj.chatId, userId)).user;

    yes.push(getUserMention({ username: voter.username, id: userId }));
  }
  for (let userId of votingObj.no) {
    let voter = await Voter.findOne({
      votingId: votingObj._id,
      userId: userId,
    });
    if (!voter)
      voter = (await bot.getChatMember(votingObj.chatId, userId)).user;

    no.push(getUserMention({ username: voter.username, id: userId }));
    //no.push(getUserMention((await bot.getChatMember(votingObj.chatId, userId)).user))
  }

  const text =
    `Голосование на <b>${actionText}</b> закончилось по причине: ${reasonText}\n\n` +
    `Голосование начал: ${getUserMention(starter)} [${starter.id}]\n` +
    `Кандидат на ${actionText}: ${getUserMention(candidate)} [${
      candidate.id
    }]\n\n` +
    `За проголосовали (${votingObj.yes.length}/${
      votingObj.neededYes
    }): ${yes.join(", ")}\n` +
    `Против проголосовали (${votingObj.no.length}/${
      votingObj.neededNo
    }): ${no.join(", ")}\n`;
  await sendToAllAdmins(
    chatObj,
    text,
    getGoToMessageButtons(
      votingObj.chatId.toString().slice(4),
      votingObj.messageId
    )
  );
}

/**
 *
 * @param {import("mongoose").HydratedDocument<Chat>} chatObj
 * @param {import("mongoose").HydratedDocument<Voting>} votingObj
 * @param {import("node-telegram-bot-api").User} starter
 * @param {import("node-telegram-bot-api").User} candidate
 * @param {String} reason
 * @param {Boolean} start
 */
async function endVoting(
  chatObj,
  votingObj,
  starter,
  candidate,
  reason = null,
  start = false
) {
  if (!start) clearTimeout(votingObj.timeoutId);
  let buttons = undefined;

  if (reason == "yes" && votingObj.action == "mute") {
    await timeoutUser(chatObj._id, candidate.id, chatObj.settings.muteTime);

    const timeouts = await Voting.find({
      chatId: chatObj._id,
      candidateId: candidate.id,
      action: "mute",
      done: "yes",
    });
    timeouts.push(votingObj);
    if (timeouts.length == 3) {
      const ids = [];
      for (let timeout of timeouts) {
        // ids.push(timeout._id.toString());
        ids.push(
          `<a href="https://t.me/c/${timeout.chatId.toString().slice(4)}/${
            timeout.messageId
          }">${timeout._id.toString()}</a>`
        );
      }

      await sendToAllAdmins(
        chatObj,
        `Пользователь ${getUserMention(candidate)} ` +
          `[${candidate.id}] получил 3 таймаут.\n\n` +
          `ID голосований: ${ids.join(", ")}`,
        getBanUserButton(chatObj._id, candidate.id)
      );
    }
  } else if (reason == "yes" && votingObj.action == "ban") {
    buttons = getVotingBanDecision(votingObj._id.toString());

    await sendToAllAdmins(
      chatObj,
      `Голосование на бан участника ${getUserMention(
        candidate
      )} успешно завершился, он находится в таймауте до вашего подтверждения\n\n` +
        hyperlink(
          `https://t.me/c/${votingObj.chatId.toString().slice(4)}/${
            votingObj.messageId
          }`,
          "Перейти к голосованию"
        ),
      buttons
    );

    await timeoutUser(chatObj._id, candidate.id, 0);

    reason = "waiting";
  }
  await editMessage(
    votingObj.chatId,
    votingObj.messageId,
    votingText(starter, candidate, votingObj, chatObj, reason),
    buttons
  );
  votingObj.done = reason;
  await votingObj.save();
  await setCooldown(chatObj._id, 180, undefined, `cooldown${candidate.id}`);
  await setCooldown(
    chatObj._id,
    chatObj.settings.cooldown,
    starter.id,
    "vote"
  );

  await notifyAdmins(chatObj, votingObj, starter, candidate, reason);
  // А стоит ли удалять? 🤔
  // await Voter.deleteMany({votingId: votingObj._id})
}

bot.on("callback_query", async (event) => {
  if (!event.data.startsWith("conf") && !event.data.startsWith("deny")) return;
  // conf - confirm - забанить
  // deny - deny - разблокировать пользователя
  const id = event.data.slice(4);
  const votingObj = await Voting.findById(id);
  const chatObj = await Chat.findById(votingObj.chatId);
  const starter = await bot.getChatMember(
    votingObj.chatId,
    votingObj.starterId
  );
  const candidate = await bot.getChatMember(
    votingObj.chatId,
    votingObj.candidateId
  );
  let reason;

  if (!votingObj) return;

  if (!(await isAdministrator(votingObj.chatId, event.from.id))) {
    await bot
      .answerCallbackQuery(event.id, {
        text: "Вы не являетесь администратором.",
      })
      .catch(() => {});
    return;
  }

  if (event.data.startsWith("conf")) {
    reason = "ban_yes";

    const success = await banUser(votingObj.chatId, votingObj.candidateId, 0);

    await bot
      .answerCallbackQuery(event.id, {
        text: success
          ? "Пользователь был успешно заблокирован"
          : "Произошла ошибка при блокировке пользователя",
      })
      .catch(() => {});

    await editMessage(
      votingObj.chatId,
      votingObj.messageId,
      votingText(starter.user, candidate.user, votingObj, chatObj, reason)
    );
  } else {
    reason = "ban_no";

    if (candidate.status == "restricted")
      await bot
        .restrictChatMember(votingObj.chatId, votingObj.candidateId, {
          can_send_other_messages: true,
          can_add_web_page_previews: true,
          until_date: Date.now() / 1000 + 60,
        })
        .catch(() => {});

    await editMessage(
      votingObj.chatId,
      votingObj.messageId,
      votingText(starter.user, candidate.user, votingObj, chatObj, reason)
    );

    await bot
      .answerCallbackQuery(event.id, {
        text: "Пользователь был успешно разблокирован",
      })
      .catch(() => {});
  }

  votingObj.done = reason;
  await votingObj.save();
});

export { endVoting };
