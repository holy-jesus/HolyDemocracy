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
  text += "_".repeat(text.split("|")[0].length) + "|" + "_".repeat(text.split("|")[1].length) + '\n'
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

/**
 *
 * @param {String} key
 * @param {Chat.settings} settings
 * @returns {String}
 */
function getHelpSetting(key, settings) {
  return settings[key].toString();
}

bot.onText("/settings", async (msg) => {
  let chatObj = null;
  if (msg.chat.type == "private") {
    const chats = await Chat.find({
      $or: [{ admins: msg.from.id }, { creator: msg.from.id }],
    });

    if (chats.length == 1) {
      chatObj = chats[0];
    } else if (chats.length > 1) {
    }
  } else {
    if (!(await isAdministrator(msg.chat.id, msg.from.id))) return;

    chatObj = await Chat.findById(msg.chat.id);
  }

  if (!chatObj) {
    await sendMessage(
      msg.chat.id,
      "У вас нету чатов, в которых вы являетесь администратором."
    );
    return;
  }

  const args = msg.text.split(" ").filter((value) => value != "");

  if (args.length == 1 || args.length > 3) {
    await sendMessage(msg.chat.id, getHelp(chatObj.settings));
  } else if (args.length == 2) {
    await sendMessage(msg.chat.id, getHelpSetting(args[1], chatObj.settings))
  } else if (args.length == 3) {
  }
});
