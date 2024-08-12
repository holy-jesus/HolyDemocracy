/**
 * @param {Number} chatId
 * @param {Number} messageId 
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[][]}
 */
function getGoToMessageButtons(chatId, messageId) {
  return [
    [
      {
        text: "Перейти к голосованию",
        url: `https://t.me/c/${chatId}/${messageId}`
      },
    ],
  ];
}

export { getGoToMessageButtons };
