import { bot } from "#root/bot/bot.js";
import { isAdministrator, timeoutUser } from "#root/utils.js";

bot.onText("/vanish", async (msg) => {
  if (
    msg.chat.type == "private" ||
    (await isAdministrator(msg.chat.id, msg.from.id))
  )
    return;
  await timeoutUser(msg.chat.id, msg.from.id, 60);
  try {
    await bot.deleteMessage(msg.chat.id, msg.message_id);
  } catch {}
});
