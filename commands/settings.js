import { bot, botAccount } from "../bot.js";
import { Chat } from "../models/index.js";
import { isAdministrator, sendMessage } from "../utils.js";

async function sendSettings(chatId, isOwner) {}

/**
 * 
 * @param {Number} settings
 */
async function getHelp(settings) {
  let text = "";

  return "Использование:\n/settings <b>*Ключ*</b> <b>*Значение*</b>\n\nКлюч | Текущее значение\n" + text
}

bot.onText("/settings", async (msg) => {
  if (msg.chat.type == "private") {

  } else {
    const chatObj = (await Chat.findById(msg.chat.id))
    chatObj
  }
});
