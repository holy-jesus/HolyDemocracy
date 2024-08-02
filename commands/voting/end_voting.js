import { bot } from "../../bot.js";
import { getBanUserButton } from "../../buttons/ban_user.js";
import { getVotingBanDecision } from "../../buttons/voting_ban.js";

import { Chat, Voting } from "../../models/index.js";
import {
  editMessage,
  getUserMention,
  sendToAllAdmins,
  timeoutUser,
  countTimeouts,
  isAdministrator,
  banUser,
} from "../../utils.js";
import { votingText } from "./format_text.js";

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

    if (timeouts.length == 3) {
      const ids = [];
      for (let timeout of timeouts) {
        ids.push(timeout._id.toString());
      }

      await sendToAllAdmins(
        chatObj,
        `Пользователь ${getUserMention(candidate)} ` +
          `[${candidate.id}] получил 3 таймаут.\n\n` +
          `ID голосований: ${ids.join(", ")}`,
        getBanUserButton(candidate.id)
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
}

bot.on("callback_query", async (event) => {
  if (!event.data.startsWith("conf") && !event.data.startsWith("deny")) return;
  // conf - confirm - забанить
  // deny - deny - разблокировать пользователя
  const id = event.data.slice(4);
  const votingObj = await Voting.findById(id);

  if (!votingObj) return;

  if (!(await isAdministrator(votingObj.chatId, event.from.id))) {
    await bot.answerCallbackQuery(event.id, {
      text: "Вы не являетесь администратором.",
    });
    return;
  }

  if (event.data.startsWith("conf")) {
    const success = await banUser(votingObj.chatId, votingObj.candidateId, 0);
    if (success)
      await bot.answerCallbackQuery(event.id, {
        text: "Пользователь был успешно заблокирован",
      });
    else
      await bot.answerCallbackQuery(event.id, {
        text: "Произошла ошибка при блокировке пользователя",
      });
    await editMessage(
      votingObj.chatId,
      votingObj.messageId,
      votingText(starter, candidate, votingObj, chatObj, "ban_yes")
    );
  } else {
    await bot.getChatMember(votingObj.chatId, votingObj.candidateId);
    await bot.restrictChatMember(votingObj.chatId, votingObj.candidateId, {
      can_send_other_messages: true,
      can_add_web_page_previews: true,
      until_date: Date.now() / 1000 + 60,
    });
    await editMessage(
      votingObj.chatId,
      votingObj.messageId,
      votingText(starter, candidate, votingObj, chatObj, "ban_no")
    );
    await bot.answerCallbackQuery(event.id, {
      text: "Пользователь был успешно разблокирован",
    });
  }
});

export { endVoting };
