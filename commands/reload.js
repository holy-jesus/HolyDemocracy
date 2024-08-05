import { bot } from "../bot.js";
import { getOrCreateChat, isCooldown, setCooldown, updateAdministrators } from "../utils.js";


bot.onText("/reload", async (msg) => {
  if (msg.chat.type == "private") return;
  const chat = await getOrCreateChat(msg.chat.id, msg.chat.title)
  await updateAdministrators(chat)
})