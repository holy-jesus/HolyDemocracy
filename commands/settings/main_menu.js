import { Chat } from "../../models/index.js";
import { sendMessage, getUserMention } from "../../utils.js";
import { getSettingsMainMenuButttons } from "../../buttons/settings_main_menu.js";
import { getChatSelectionButtons } from "../../buttons/select_chat.js";

/**
 *
 * @param {import("node-telegram-bot-api").Message} msg
 * @returns
 */
async function sendMainMenu(msg) {
  if (msg.chat.type == "private") {
    let chatObj = null;
    const chats = await Chat.find({
      $or: [{ admins: msg.from.id, "settings.onlyCreatorCanAccessSettings": false }, { creator: msg.from.id }],
    });

    if (chats.length == 1) {
      chatObj = chats[0];
    } else if (chats.length > 1) {
      return await sendMessage(
        msg.chat.id,
        "Выберите чат:",
        getChatSelectionButtons("set", "|", chats)
      );  
    }

    if (!chatObj) {
      await sendMessage(
        msg.chat.id,
        "У вас нету чатов, в которых вы можете получить доступ к настройкам."
      );
      return;
    }

    await sendMessage(
      msg.chat.id,
      "Настройки чата <b>" +  chatObj.title + "</b>\n\n" +"Выберите нужную настройку:",
      getSettingsMainMenuButttons(chatObj.settings, chatObj.id)
    );
  } else {
    const chatObj = await Chat.findById(msg.chat.id);
    const message = await sendMessage(
      msg.from.id,
      "Настройки чата <b>" +  chatObj.title + "</b>\n\n" +"Выберите нужную настройку:",
      getSettingsMainMenuButttons(chatObj.settings, msg.chat.id)
    );
    if (message === false) {
      await sendMessage(
        msg.chat.id,
        getUserMention(msg.from) +
          ", эта команда работает только в личных сообщениях с ботом."
      );
    }
  }
}

export { sendMainMenu };
