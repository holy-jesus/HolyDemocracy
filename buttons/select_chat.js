/**
 *
 * @param {Array} chats
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[][]}
 */
function getChatSelectionButtons(callbackStart = "", callbackEnd = "", chats) {
  const keyboard = []
  for (let chat of chats) {
    keyboard.push([{text: chat.title, callback_data: callbackStart + chat._id + callbackEnd}])
  }
  return keyboard
}


export { getChatSelectionButtons };
