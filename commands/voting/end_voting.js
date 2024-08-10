import { bot } from "#root/bot.js";
import { getBanUserButton } from "#root/buttons/ban_user.js";
import { getVotingBanDecision } from "#root/buttons/voting_ban.js";

import { Chat, Voting } from "#root/models/index.js";
import {
  editMessage,
  getUserMention,
  sendToAllAdmins,
  timeoutUser,
  countTimeouts,
  isAdministrator,
  banUser,
  setCooldown
} from "#root/utils.js";
import { votingText } from "#root/commands/voting/format_text.js";

/**
 *
 * @param {import("mongoose").Document<Chat>} chatObj
 * @param {import("mongoose").Document<Voting>} votingObj
 * @param {import("node-telegram-bot-api").User} starter
 * @param {import("node-telegram-bot-api").User} candidate
 * @param {String} reason
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
    timeouts.push(votingObj)
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
        `<a href="https://t.me/c/${votingObj.chatId.toString().slice(4)}/${
          votingObj.messageId
        }">Перейти к голосованию</a>`,
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
  await setCooldown(chatObj._id, 180, undefined, `cooldown${candidate.id}`)
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
