import { isBlocked } from "../utils.js";

/**
 *
 * @param {Number} chatId
 * @param {Number} userId
 * @returns {Promise<import("node-telegram-bot-api").InlineKeyboardButton[][]>}
 */
async function getVotingInfoButtons(chatId, userId) {
  return [
    [
      {
        text: ((await isBlocked(chatId, userId)) ? "Заблокировать" : "Разблокировать") + "пользователя начавшего голосование",
        callback_data: ((await isBlocked(chatId, userId)) ? "bl" : "un" ) + `${chatId}|${userId}`,
      },
    ]
  ];
}

export { getVotingInfoButtons };
