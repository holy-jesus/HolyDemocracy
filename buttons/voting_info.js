/**
 *
 * @param {String} _id
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[][]}
 */
function getVotersButtons(chatId, userId) {
  return [
    [
      {
        text: "Заблокировать пользователя начавшего голосование",
        callback_data: `bl${chatId}|${userId}`,
      },
    ],
    [
      {
        text: "Разблокировать пользователя начавшего голосование",
        callback_data: `un${chatId}|${userId}`,
      },
    ],

    // [
    //   { text: "Показать кто проголосовал против", callback_data: "vn" + _id }
    // ]
  ];
}

export { getVotersButtons };
