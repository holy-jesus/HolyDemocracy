/**
 * @param {Number | null} chatId
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[][]}
 */
function getSettingsGoBackButtons(chatId = null) {
  return [
    [
      {
        text: "Вернуться в главное меню",
        callback_data: "set" + (chatId ? chatId : "") + "|",
      },
    ],
  ];
}

export { getSettingsGoBackButtons };
