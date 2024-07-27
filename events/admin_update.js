import { Chat, Voting } from "../models/index.js";
import { bot, botAccount } from "../bot.js";
import { updateAdministrators } from "../utils.js";

bot.on("chat_member", async (event) => {
  const chat = await Chat.findById(event.chat.id);
  if (chat) await updateAdministrators(chat);
});

bot.on("my_chat_member", async (event) => {
  if (
    event.new_chat_member.status == "kicked" ||
    event.new_chat_member.status == "left"
  ) {
    await Chat.deleteOne({_id: event.chat.id})
    for (let votingObj of await Voting.find({chatId: event.chat.id})) {
      if (votingObj.done == null) {
        clearTimeout(votingObj.timeoutId)
      }
      await votingObj.deleteOne()
    }
    return;
  }
  const chat = await Chat.findById(event.chat.id);
  if (chat) await updateAdministrators(chat);
});
