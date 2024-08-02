import { isBlocked } from "../utils.js";

/**
 *
 * @param {Number} chatId
 * @param {Number} userId
 * @returns {Promise<import("node-telegram-bot-api").InlineKeyboardButton[][]>}
 */
async function getVotingInfoButtons(chatId, userId) {
  const blocked = await isBlocked(chatId, userId)
  return [
    [
      {
        text: blocked ? "Заблокировать" : "Разблокировать" + "пользователя начавшего голосование",
        callback_data: blocked ? "bl" : "un"  + `${chatId}|${userId}`,
      },
    ]
  ];
}

export { getVotingInfoButtons };
