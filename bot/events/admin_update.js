import { Chat, Voting } from "../../models/index.js";
import { bot, botAccount } from "../bot.js";
import {
  updateAdministrators,
  deleteChat,
  getOrCreateChat,
} from "../../utils.js";

bot.on("chat_member", async (event) => {
  const chat = await getOrCreateChat(event.chat.id, event.chat.title);
  await updateAdministrators(chat);
});

bot.on("my_chat_member", async (event) => {
  if (
    botAccount.id == event.new_chat_member.user.id &&
    (event.new_chat_member.status == "kicked" ||
      event.new_chat_member.status == "left")
  ) {
    return await deleteChat(event.chat.id);
  }
  const chat = await getOrCreateChat(event.chat.id, event.chat.title);
  await updateAdministrators(chat);
});
