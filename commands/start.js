import { bot } from "../bot.js";
import { sendMessage } from "../utils.js";

bot.onText("/start", async (msg) => {
  if (msg.chat.id != msg.from.id) return;
  await sendMessage(
    msg.chat.id,
    "Привет! 👋\n\nЭтот бот предоставляет функционал голосования на мут/бан участника, чтобы участники чата могли сами замутить/забанить нарушителя, пока модераторов нету рядом.\n\nЧтобы начать добавьте меня в необходимый чат."
  );
});
