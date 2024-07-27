import { bot, botAccount } from "../bot.js";
import { Chat } from "../models/index.js";
import { isAdministrator } from "../utils.js";

async function sendSettings(chatId, isOwner) {}

bot.onText("/settings", async (msg) => {
  if (msg.chat.type != "private") {
    const chatObj = await Chat.findById(msg.chat.id);
    console.log(chatObj);
    if (!chatObj) return;
    const isAdmin = msg.from.id in chatObj.admins;
    const isCreator = msg.from.id == chatObj.creator;
    if (
      isCreator ||
      (isAdmin && chatObj.settings.onlyCreatorCanAccessSettings)
    ) {
      try {
        await bot.sendMessage(
          msg.from.id,
          `Настройки канала "${
            msg.chat.title
          }"\n\nТекущие настройки:\n\nТолько администратор может получить доступ к настройкам: ${
            chatObj.settings.onlyCreatorCanAccessSettings ? "Да" : "Нет"
          }\n`
        );
      } catch {
        await bot.sendMessage(
          msg.chat.id,
          `Получить доступ к настройкам канала можно в личных сообщениях с ботом.\n@${botAccount.username}`
        );
      }
    } else if (isAdmin) {
      await bot.sendMessage(
        msg.chat.id,
        "Только владелец канала может получить доступ к настройкам."
      );
    } else {
      await bot.sendMessage(
        msg.chat.id,
        "Только администраторы могут получить доступ к настройкам."
      );
    }
  } else {
    const chats = await Chat.find({
      $or: [
        { creator: msg.from.id },
        {
          admins: msg.from.id,
          settings: { onlyCreatorCanAccessSettings: false },
        },
      ],
    });
    if (!chats) {
      await bot.sendMessage(
        msg.chat.id,
        "У вас нету каналов которые вы можете настроить."
      );
    }
    const chatsButtons = [];

    for (let chat of chats) {
      chatsButtons.push({
        text: (await bot.getChat(chat._id)).title,
        callback_data: `chat${chat._id}`,
      });
    }
    await bot.sendMessage(msg.chat.id, "Выберите необходимый чат:", {
      reply_markup: {
        inline_keyboard: [chatsButtons],
      },
    });
  }
});
