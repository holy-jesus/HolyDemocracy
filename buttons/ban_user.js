/**
 *
 * @param {Number} candidateId
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[][]}
 */
function getBanUserButton(chatId, candidateId) {
  console.log(`ban${chatId}|${candidateId}`);
  return [
    [
      {
        text: "Забанить пользователя",
        callback_data: `ban${chatId}|${candidateId}`,
      },
    ],
  ];
}

import { bot } from "#root/bot.js";

bot.on("callback_query", async (event) => {
  if (!event.data.startsWith("ban")) return;
  let [chatId, userId] = event.data.slice(3).split("|");
  let text = ""
  await bot.banChatMember(chatId, userId).then(
    async () => {text = "Пользователь был успешно заблокирован"},
    async () => {text = "Произошла ошибка при блокировке пользователя"}
  );
  await bot
    .answerCallbackQuery(event.id, {
      text: text,
    })
    .catch(() => {});
});

export { getBanUserButton };
