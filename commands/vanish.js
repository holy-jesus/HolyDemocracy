import { bot } from "../bot.js";
import { isAdministrator, timeoutUser } from "../utils.js";

bot.onText("/vanish", async (msg) => {
  if (
    msg.chat.type == "private" ||
    (await isAdministrator(msg.chat.id, msg.from.id))
  )
    return;
  await timeoutUser(msg.chat.id, msg.from.id, 60);
});
