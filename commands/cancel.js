import { bot } from "../bot.js";
import { Chat, Voting } from "../models/index.js";
import { editMessage, sendMessage, isAdministrator } from "../utils.js";
import { votingText } from "./voting/format_text.js";

bot.onText("/cancel", async (msg) => {
  if ((await isAdministrator(msg.chat.id, msg.from.id)) == false) {
    return;
  }
  const args = msg.text.split(" ").filter((value) => value != "");
  if (args.length != 2)
    return await sendMessage(
      msg.chat.id,
      "Использование:\n\n/cancel <b>[ID поста]</b>",
      undefined,
      msg.message_id
    );
  let votingObj;
  try {
    votingObj = await Voting.findById(args[1]);
  } catch {
    return await sendMessage(
      msg.chat.id,
      "Неправильное айди.",
      undefined,
      msg.message_id
    );
  }
  if (!votingObj)
    return await sendMessage(
      msg.chat.id,
      "Не смог найти голосование по айди.",
      undefined,
      msg.message_id
    );

  if (votingObj.done)
    return await sendMessage(
      msg.chat.id,
      "Это голосование уже закончилось.",
      undefined,
      msg.message_id
    );
  const chatObj = await Chat.findById(votingObj.chatId);

  votingObj.done = "cancel";
  await votingObj.save();
  const starter = await bot.getChatMember(
    votingObj.chatId,
    votingObj.starterId
  );
  const candidate = await bot.getChatMember(
    votingObj.chatId,
    votingObj.candidateId
  );
  await editMessage(
    votingObj.chatId,
    votingObj.messageId,
    votingText(starter.user, candidate.user, votingObj, chatObj, "cancel")
  );
  clearTimeout(votingObj.timeoutId);
  await sendMessage(
    msg.chat.id,
    "Успешно отменил голосование.",
    undefined,
    msg.message_id
  );
});
