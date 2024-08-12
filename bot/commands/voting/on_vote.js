import { bot } from "#root/bot/bot.js";
import { Chat, Voter, Voting } from "#root/models/index.js";
import { votingText } from "#root/bot/commands/voting/format_text.js";
import { editMessage, isVotingDone, isBlocked } from "#root/utils.js";
import { getVotingButtons } from "#root/bot/buttons/voting.js";
import { endVoting } from "#root/bot/commands/voting/end_voting.js";

/**
 *
 * @param {import("node-telegram-bot-api").CallbackQuery} event
 */
async function onVote(event) {
  if (!event.data.startsWith("+") && !event.data.startsWith("-")) return;
  if (await isBlocked(event.message.chat.id, event.from.id)) return;
  let votingObj = await Voting.findById(event.data.slice(1));

  if (votingObj.done) {
    await bot
      .answerCallbackQuery(event.id, {
        text: "Это голосование уже закончилось",
      })
      .catch(() => {});
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
      $pull: process.env.DEBUG ? {} : { [yes ? "no" : "yes"]: event.from.id },
    },
    { new: true }
  );

  await Voter.updateOne(
    {
      votingId: votingObj._id,
      userId: event.from.id,
      username: event.from.username || event.from.first_name,
    },
    {
      $set: {
        votingId: votingObj._id,
        userId: event.from.id,
        username: event.from.username || event.from.first_name,
      },
    },
    { upsert: true }
  );

  await bot
    .answerCallbackQuery(event.id, {
      text: `Вы успешно проголосовали ${actionText}`,
    })
    .catch(() => {});

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
