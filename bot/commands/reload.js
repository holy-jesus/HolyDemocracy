import { bot } from "#root/bot/bot.js";
import {
  getOrCreateChat,
  isCooldown,
  setCooldown,
  updateAdministrators,
} from "#root/utils.js";

bot.onText("/reload", async (msg) => {
  if (msg.chat.type == "private") return;
  if (await isCooldown(chatObj._id, undefined, "updateAdministrators")) return;
  const chat = await getOrCreateChat(msg.chat.id, msg.chat.title);
  await updateAdministrators(chat);
  await setCooldown(chatObj._id, 60, undefined, "reload");
});
