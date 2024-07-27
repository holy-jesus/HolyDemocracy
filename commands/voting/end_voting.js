import { bot } from "../../bot.js";
import { Chat, Voting } from "../../models/index.js";
import {
  editMessage,
  getUserMention,
  sendToAllAdmins,
  timeoutUser,
  countTimeouts,
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

  if (reason == "yes") {
    if (votingObj.action == "mute") {
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
          `Пользователь ${getUserMention(candidate)} [${
            candidate.id
          }] получил 3 таймаут.\n\nID голосований: ${ids.join(", ")}`,
          [
            [
              {
                text: "Забанить пользователя",
                callback_data: `ban${candidate.id}`,
              },
            ],
          ]
        );
      }
    } else {
      await sendToAllAdmins(
        chatObj,
        `Голосование на бан участника ${getUserMention(
          candidate
        )} успешно завершился, требуется ваше подтверждение\n\n` +
          `<a href="https://t.me/c/${votingObj.chatId.toString().slice(4)}/${
            votingObj.messageId
          }">Перейти к голосованию</a>`
      );
    }
  }

  await editMessage(
    votingObj.chatId,
    votingObj.messageId,
    votingText(starter, candidate, votingObj, chatObj, reason)
  );
  votingObj.done = reason;
  await votingObj.save();
}

export { endVoting };
