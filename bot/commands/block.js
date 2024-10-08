import { bot } from "#root/bot/bot.js";
import { Chat, Block } from "#root/models/index.js";
import {
  isAdministrator,
  sendMessage,
  getOnlyFirstArgument,
} from "#root/utils.js";

bot.onText(/^\/block/, async (msg) => {
  if (msg.chat.type == "private") {
    const userId = getOnlyFirstArgument(msg.text);
    if (!userId) {
      return await sendMessage(
        msg.chat.id,
        "Использование:\n\n/block <b>[ID пользователя]</b>"
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
      const message = await blockUser(chats[0]._id, userId);
      await sendMessage(msg.chat.id, message, undefined, msg.message_id);
      return;
    }
    const chatsButtons = [];

    for (let chat of chats) {
      chatsButtons.push({
        text: chat.title,
        callback_data: `bl${chat._id}|${userId}`,
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
        "Использование:\n\n/block <b>[ID пользователя]</b>"
      );
    }
    const message = await blockUser(msg.chat.id, userId);
    await sendMessage(msg.chat.id, message, undefined, msg.message_id);
    return;
  }
});

bot.on("callback_query", async (event) => {
  if (!event.data.startsWith("blo")) return;
  const [chatId, userId] = event.data.slice(3).split("|");
  await bot
    .answerCallbackQuery(event.id, {
      text: await blockUser(chatId, userId),
    })
    .catch(() => {});
});

/**
 *
 * @param {Number} chatId
 * @param {Number} userId
 * @returns {Promise<String>}
 */
async function blockUser(chatId, userId) {
  try {
    await bot.getChatMember(chatId, userId);
  } catch {
    return "Неверное ID пользователя.";
  }
  if (await Block.countDocuments({ userId: userId, chatId: chatId })) {
    return "Этот пользователь уже заблокирован.";
  } else if (await isAdministrator(chatId, userId)) {
    return "Этот пользователь администратор.";
  }
  const blockObj = new Block({ userId: userId, chatId: chatId });
  await blockObj.save();
  return "Пользователь был успешно заблокирован.";
}
