import { bot } from "../bot.js";
import { getOrCreateChat, updateAdministrators } from "../utils.js";


bot.onText("/reload", async (msg) => {
  const chat = await getOrCreateChat(msg.chat.id)
  await updateAdministrators(chat)
})