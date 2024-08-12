import { bot, botAccount } from "../bot.js";
import {
  deleteChat,
  getOrCreateChat,
  updateAdministrators,
} from "../../utils.js";

bot.on("left_chat_member", async (event) => {
  if (event.left_chat_member.id == botAccount.id) {
    await deleteChat(event.chat.id);
  } else {
    const chat = await getOrCreateChat(event.chat.id, event.chat.title);
    await updateAdministrators(chat);
  }
});
