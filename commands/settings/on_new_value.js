import { getSettingsGoBackButtons } from "#root/buttons/settings_go_back.js";
import { Chat, Status } from "#root/models/index.js";
import { sendMessage } from "#root/utils.js";
import { settings } from "#root/commands/settings/settings.js";

/**
 *
 * @param {import("node-telegram-bot-api").Message} msg
 * @returns
 */
async function onNewValue(msg) {
  if (msg.text.startsWith("/")) {
    await Status.deleteOne({ _id: msg.chat.id });
    return;
  }
  const status = await Status.findById({ _id: msg.from.id });
  if (!status) return;
  const chatObj = await Chat.findById(status.chatId);
  if (
    chatObj.creator != msg.from.id &&
    ((chatObj.admins.includes(msg.from.id) &&
      chatObj.settings.onlyCreatorCanAccessSettings) ||
      !chatObj.admins.includes(msg.from.id))
  ) {
    return;
  }

  const value = parseInt(msg.text);
  if (!settings[status.key].checkValue(value)) {
    await sendMessage(msg.chat.id, "Неверное значение, попробуйте ещё раз.");
    return;
  }
  chatObj.settings[status.key] = value;
  await chatObj.save();
  await status.deleteOne();
  await sendMessage(
    msg.chat.id,
    "Успешно обновил значение.",
    getSettingsGoBackButtons(chatObj._id)
  );
}

export { onNewValue };
