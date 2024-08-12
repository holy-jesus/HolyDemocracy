/**
 * @param {String} key
 * @param {Number | null} chatId
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[][]}
 */
function getSettingsSubMenuButtons(key, chatId = null) {
  return [
    [
      {
        text: "Вернуться обратно",
        callback_data: "set" + (chatId ? chatId : "") + "|",
      },
      {
        text: "Обновить значение",
        callback_data: "upd" + (chatId ? chatId : "") + "|" + key,
      },
    ],
  ];
}

export { getSettingsSubMenuButtons };
