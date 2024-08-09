import { bot } from "#root/bot.js";
import { getSettingsSubMenuButtons } from "#root/buttons/settings_sub_menu.js";
import { Chat } from "#root/models/index.js";
import { settings } from "#root/commands/settings/settings.js";
import { editMessage } from "#root/utils.js";
import { getSettingsMainMenuButttons } from "#root/buttons/settings_main_menu.js";

/**
 * 
 * @param {import("node-telegram-bot-api").CallbackQuery} event 
 * @returns 
 */
async function sendSubMenu(event) {
  await bot.answerCallbackQuery(event.id).catch(() => {});
  let [chatId, key] = event.data.slice(3).split("|");
  const chatObj = await Chat.findById(chatId);
  if (!key) {
    await editMessage(
      event.message.chat.id,
      event.message.message_id,
      "Настройки чата <b>" +  chatObj.title + "</b>\n\n" +"Выберите нужную настройку:",
      getSettingsMainMenuButttons(chatObj.settings, chatId)
    );
    return;
  }
  const value = chatObj.settings[key].toString();
  await editMessage(
    event.message.chat.id,
    event.message.message_id,
    settings[key].getDescription(value),
    getSettingsSubMenuButtons(key, chatId)
  );
}

export { sendSubMenu }