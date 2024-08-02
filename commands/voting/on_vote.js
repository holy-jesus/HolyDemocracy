import { bot } from "../../bot.js";
import { Chat, Voting } from "../../models/index.js";
import { votingText } from "./format_text.js";
import { editMessage, isVotingDone } from "../../utils.js";
import { getVotingButtons } from "../../buttons/voting.js";
import { endVoting } from "./end_voting.js";

/**
 *
 * @param {import("node-telegram-bot-api").CallbackQuery} event
 * @returns
 */
async function onVote(event) {
  if (!event.data.startsWith("+") && !event.data.startsWith("-")) return;

  const votingObj = await Voting.findById(event.data.slice(1));

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

  const actionText = event.data.startsWith("+") ? "за" : "против";
  let newChoice = event.data.startsWith("+") ? votingObj.yes : votingObj.no;
  let prevChoice = event.data.startsWith("+") ? votingObj.no : votingObj.yes;

  // if (newChoice.includes(event.from.id)) {
  //   await bot.answerCallbackQuery(event.id, {
  //     text: `Вы уже проголосовали ${actionText}`,
  //   });
  //   return;
  // }

  newChoice.push(event.from.id);
  prevChoice = prevChoice.filter((id) => id != event.from.id);
  votingObj.yes = event.data.startsWith("+") ? newChoice : prevChoice;
  votingObj.no = event.data.startsWith("+") ? prevChoice : newChoice;

  await votingObj.save();
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
