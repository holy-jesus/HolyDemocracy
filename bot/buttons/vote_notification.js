import { Voting } from "#root/models/index.js";

/**
 * @param {import("mongoose").HydratedDocument<Voting>} votingObj
 * @param {Boolean} thirdTimeout
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[]}
 */
function getActionsButtons(votingObj, thirdTimeout) {
  const row = [];
  if (votingObj.action == "mute") {
    row.push({
      text: "Отменить ограничения",
      callback_data: "unt" + votingObj._id.toString(),
    });
    if (thirdTimeout)
      row.push({
        text: "Забанить пользователя",
        callback_data: `ban${votingObj.chatId}|${votingObj.candidateId}`,
      });
  } else {
    row.push(
      { text: "Забанить", callback_data: "conf" + votingObj._id.toString() },
      {
        text: "Снять ограничения",
        callback_data: "deny" + votingObj._id.toString(),
      }
    );
  }
  return row;
}

/**
 * @param {import("mongoose").HydratedDocument<Voting>} votingObj
 * @param {Boolean} thirdTimeout
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[][]}
 */
function getVoteNotificationButtons(votingObj, thirdTimeout) {
  return [
    getActionsButtons(votingObj, thirdTimeout),
    [
      {
        text: "Перейти к голосованию",
        url: `https://t.me/c/${votingObj.chatId.toString().slice(4)}/${votingObj.messageId}`,
      },
    ],
  ];
}

export { getVoteNotificationButtons };
