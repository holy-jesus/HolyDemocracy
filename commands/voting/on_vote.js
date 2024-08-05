import { bot } from "../../bot.js";
import { Chat, Voting } from "../../models/index.js";
import { votingText } from "./format_text.js";
import { editMessage, isVotingDone } from "../../utils.js";
import { getVotingButtons } from "../../buttons/voting.js";
import { endVoting } from "./end_voting.js";

/**
 *
 * @param {import("node-telegram-bot-api").CallbackQuery} event
 */
async function onVote(event) {
  if (!event.data.startsWith("+") && !event.data.startsWith("-")) return;

  let votingObj = await Voting.findById(event.data.slice(1));

  if (votingObj.done) {
    await bot.answerCallbackQuery(event.id, {
      text: "Это голосование уже закончилось",
    });
    return;
  }

  const chatObj = await Chat.findById(event.message.chat.id);
  const candidate = await bot.getChatMember(
    event.message.chat.id,
    votingObj.candidateId
  );
  const starter = await bot.getChatMember(
    event.message.chat.id,
    votingObj.starterId
  );
  const yes = event.data.startsWith("+");

  const actionText = yes ? "за" : "против";

  votingObj = await Voting.findOneAndUpdate(
    { _id: votingObj._id },
    {
      [process.env.DEBUG ? "$push" : "$addToSet"]: {
        [yes ? "yes" : "no"]: event.from.id,
      },
      $pull: process.env.DEBUG
        ? {}
        : { [yes ? "no" : "yes"]: event.from.id },
    },
    { new: true }
  );

  await bot.answerCallbackQuery(event.id, {
    text: `Вы успешно проголосовали ${actionText}`,
  });

  const done = isVotingDone(votingObj);

  if (done) {
    await endVoting(chatObj, votingObj, starter.user, candidate.user, done);
    return;
  }

  await editMessage(
    votingObj.chatId,
    votingObj.messageId,
    votingText(starter.user, candidate.user, votingObj, chatObj, done),
    getVotingButtons(votingObj._id)
  );
}

export { onVote };
