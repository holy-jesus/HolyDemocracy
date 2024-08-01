import { Chat, Voting } from "../models/index.js";
import { bot } from "../bot.js";
import { isVotingDone, updateAdministrators, deleteChat } from "../utils.js";
import { endVoting } from "../commands/voting/end_voting.js";

for (let chatObj of await Chat.find()) {
  try {
    await bot.getChat(chatObj._id);
    await updateAdministrators(chatObj);
  } catch {
    await deleteChat(chatObj.id);
  }
}

for (let votingObj of await Voting.find({ done: null })) {
  let chatObj = await Chat.findById(votingObj.chatId);
  let starter = await bot.getChatMember(votingObj.chatId, votingObj.starterId);
  let candidate = await bot.getChatMember(
    votingObj.chatId,
    votingObj.candidateId
  );
  let done = isVotingDone(votingObj);
  if (done) {
    await endVoting(
      chatObj,
      votingObj,
      starter.user,
      candidate.user,
      done,
      true
    );
  } else {
    let timeout = setTimeout(
      () =>
        endVoting(chatObj, votingObj, starter.user, candidate.user, "timeout"),
      votingObj.until.getTime() - Date.now()
    );
    votingObj.timeoutId = timeout[Symbol.toPrimitive]();
    await votingObj.save();
  }
}
