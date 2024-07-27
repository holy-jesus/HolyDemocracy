import { Chat } from "../models/index.js";
import { bot, botAccount } from "../bot.js";
import { updateAdministrators } from "../utils.js";

bot.on("left_chat_member", async (event) => {
  if (event.left_chat_member.id == botAccount.id) {
    await Chat.deleteOne({ _id: event.chat.id });
  } else {
    await updateAdministrators(await Chat.findById(event.chat.id));
  }
});
