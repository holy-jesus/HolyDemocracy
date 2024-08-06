import { bot, botAccount } from "../../bot.js";
import { Chat, Voting } from "../../models/index.js";
import {
  isAdministrator,
  getUserMention,
  sendMessage,
  setCooldown,
  isCooldown,
} from "../../utils.js";
import { getVotingButtons } from "../../buttons/voting.js";
import { votingText } from "./format_text.js";
import { endVoting } from "./end_voting.js";

/**
 * @param {import("node-telegram-bot-api").Message} msg
 * @param {String} action
 */
async function startVoting(msg, action) {
  const chatObj = await Chat.findById(msg.chat.id);
  const starter = msg.from;

  // Находим кандидата
  let candidateId = null;
  const textMention = msg.entities.find(
    (value) => value.type == "text_mention"
  );
  if (msg.reply_to_message) {
    candidateId = msg.reply_to_message.from.id;
  } else if (textMention) {
    candidateId = textMention.user.id;
  }

  if (!candidateId || candidateId == null) {
    return await sendMessage(
      msg.chat.id,
      getUserMention(starter) +
        ", чтобы использовать эту команду вы должны ответить на сообщение нужного человека с этой командой."
    );
  }

  // Проверки на возможность запустить голосование
  const candidate = await bot.getChatMember(msg.chat.id, candidateId);
  const existingVoting = await Voting.findOne({
    $or: [
      { candidateId: candidateId },
      { candidateId: starter.id },
      { starterId: starter.id },
    ],
    $and: [{ done: null, chatId: msg.chat.id }],
  });
  let errorText = null;
  if (
    candidateId == starter.id ||
    candidateId == botAccount.id ||
    candidate.user.is_bot ||
    candidate.status != "member"
  ) {
    errorText =
      getUserMention(starter) +
      ", вы не можете использовать эту команду на этого пользователя.";
  } else if (existingVoting) {
    errorText =
      getUserMention(starter) + ", вы не можете начать голосование сейчас.";
  } else if (!(await isAdministrator(msg.chat.id, botAccount.id))) {
    errorText =
      getUserMention(starter) +
      ", я не могу начать голосование, пока у меня нету прав администратора.";
  } else if (await isCooldown(msg.chat.id, msg.from.id, "vote")) {
    errorText = getUserMention(starter) + ", у вас сейчас КД.";
  }
  if (errorText) return await sendMessage(msg.chat.id, errorText);

  // Создаём новое голосование и отправляем его в чат
  const votingUntil = new Date(
    Date.now() + chatObj.settings.timeForVoting * 1000
  );
  const votingObj = new Voting({
    chatId: msg.chat.id,
    candidateId: candidateId,
    starterId: starter.id,
    startedMessageId: msg?.reply_to_message?.message_id
      ? msg.reply_to_message.message_id
      : msg.message_id,
    action: action,
    started: new Date(),
    until: votingUntil,
    yes: [starter.id],
    neededYes:
      action == "mute"
        ? chatObj.settings.votesForMute
        : chatObj.settings.votesForBan,
    no: [],
    neededNo: chatObj.settings.votesAgainst,
  });
  const votingMessage = await sendMessage(
    msg.chat.id,
    votingText(starter, candidate.user, votingObj, chatObj),
    getVotingButtons(votingObj._id.toString())
  );

  // Создаём таймаут, чтобы через необходимое время голосование закончилось
  const timeoutId = setTimeout(
    () => endVoting(chatObj, votingObj, starter, candidate.user, "timeout"),
    chatObj.settings.timeForVoting * 1000
  );
  votingObj.messageId = votingMessage.message_id;
  votingObj.timeoutId = timeoutId[Symbol.toPrimitive]();
  await votingObj.save();
  await setCooldown(
    msg.chat.id,
    chatObj.settings.cooldown,
    msg.from.id,
    "vote"
  );
}

export { startVoting };
