import { bot, botAccount } from "../bot.js";
import { Chat } from "../models/index.js";
import { isAdministrator, sendMessage } from "../utils.js";

/**
 *
 * @param {Chat.settings} settings
 * @returns {String}
 */
function getHelp(settings) {
  let spaces = Math.max(...Object.keys(settings).map((value) => value.length));
  let text = "Ключ" + " ".repeat(spaces - 4) + " | " + "Текущее значение\n";
  for (let [key, value] of Object.entries(settings)) {
    text += key + " ".repeat(spaces - key.length) + " | " + value + "\n";
  }
  return (
    "Использование:\n" +
    "/settings <b>*Ключ*</b> - Чтобы получить справку по настройке\n\n" +
    "/settings <b>*Ключ*</b> <b>*Новое значение*</b> - Чтобы установить новое значение\n\n" +
    "<pre><code>" +
    text +
    "</code></pre>"
  );
}

bot.onText("/settings", async (msg) => {
  if (msg.chat.type == "private") {
    const chats = await Chat.find({
      $or: [{ admins: msg.from.id }, { creator: msg.from.id }],
    });
    console.log(chats, msg.from.id);

    if (chats.length == 0) {
      await sendMessage(
        msg.chat.id,
        "У вас нету чатов, в которых вы являетесь администратором."
      );
      return;
    } else {
      await sendMessage(msg.chat.id, getHelp(chats[0].settings));
      return;
    }
  } else {
    if (!(await isAdministrator(msg.chat.id, msg.from.id))) return;

    const chatObj = await Chat.findById(msg.chat.id);

    await sendMessage(msg.chat.id, getHelp(chatObj.settings));
  }
});
