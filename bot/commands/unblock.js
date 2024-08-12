import { bot } from "#root/bot/bot.js";
import { Chat, Block } from "#root/models/index.js";
import {
  isAdministrator,
  sendMessage,
  getOnlyFirstArgument,
} from "#root/utils.js";

bot.onText(/^\/unblock/, async (msg) => {
  if (msg.chat.type == "private") {
    const userId = getOnlyFirstArgument(msg.text);
    if (!userId) {
      return await sendMessage(
        msg.chat.id,
        "Использование:\n\n/unblock <b>[ID пользователя]</b>"
      );
    }
    const chats = await Chat.find({
      $or: [
        { creator: msg.from.id },
        {
          admins: msg.from.id,
        },
      ],
    });
    if (!chats) {
      await sendMessage(
        msg.chat.id,
        "У вас нету каналов, в которых бы вы были администратором."
      );
    } else if (chats.length == 1) {
      const message = await unblockUser(chats[0]._id, userId);
      await sendMessage(msg.chat.id, message, undefined, msg.message_id);
      return;
    }
    const chatsButtons = [];

    for (let chat of chats) {
      chatsButtons.push({
        text: (await bot.getChat(chat._id)).title,
        callback_data: `un${chat._id}|${userId}`,
      });
    }

    await sendMessage(msg.chat.id, "Выберите необходимый чат:", [chatsButtons]);
  } else if (await isAdministrator(msg.chat.id, msg.from.id)) {
    let userId = getOnlyFirstArgument(msg.text);
    if (!userId && msg.reply_to_message) {
      userId = msg.reply_to_message.from.id;
    }
    if (!userId) {
      return await sendMessage(
        msg.chat.id,
        "Использование:\n\n/unblock <b>[ID пользователя]</b>"
      );
    }
    const message = await unblockUser(msg.chat.id, userId);
    await sendMessage(msg.chat.id, message, undefined, msg.message_id);
    return;
  }
});

bot.on("callback_query", async (event) => {
  if (!event.data.startsWith("un")) return;
  const args = event.data.replace("un", "").split("|");
  const chatId = args[0];
  const userId = args[1];
  await bot
    .answerCallbackQuery(event.id, {
      text: await unblockUser(chatId, userId),
    })
    .catch(() => {});
});

/**
 *
 * @param {Number} chatId
 * @param {Number} userId
 * @param {Promise<String>}
 */
async function unblockUser(chatId, userId) {
  try {
    await bot.getChatMember(chatId, userId);
  } catch {
    return "Неверное ID пользователя.";
  }
  if (!(await Block.countDocuments({ userId: userId, chatId: chatId }))) {
    return "Этот пользователь незаблокирован.";
  } else if (await isAdministrator(chatId, userId)) {
    return "Этот пользователь администратор.";
  }
  await Block.deleteOne({ userId: userId, chatId: chatId });
  return "Пользователь был успешно разблокирован.";
}
