import { bot } from "../../bot.js";
import { Chat, Status } from "../../models/index.js";
import { sendSubMenu } from "./sub_menu.js";
import { editMessage } from "../../utils.js";
import { settings } from "./settings.js";

/**
 * 
 * @param {import("node-telegram-bot-api").CallbackQuery} event 
 * @returns 
 */
async function askForNewValue(event) {
  let [chatId, key] = event.data.slice(3).split("|");
  const chatObj = await Chat.findById(chatId);
  if (!chatObj) {
    await bot.answerCallbackQuery(event.id, {
      text: "Произошла ошибка при обработке запроса, повторите попытку позже",
    });
    return;
  }
  if (["onlyCreatorCanAccessSettings", "mentionOnlyCreator"].includes(key)) {
    if (event.from.id != chatObj.creator) {
      await bot.answerCallbackQuery(event.id, {
        text: "Только создатель чата может редактировать эту настройку",
      });
      return;
    }
    chatObj.settings[key] = !chatObj.settings[key];
    await chatObj.save();
    await sendSubMenu(event);
    return;
  }
  await Status.updateOne(
    { _id: event.from.id },
    { $set: { _id: event.from.id, chatId: chatId, key: key } },
    { upsert: true }
  );
  await editMessage(
    event.message.chat.id,
    event.message.message_id,
    "Отправьте новое значение.\n\n" +
      settings[key].getValuesText(chatObj.settings[key])
  );
  await bot.answerCallbackQuery(event.id);
}

export { askForNewValue };
