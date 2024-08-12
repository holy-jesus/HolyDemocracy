import { bot, botAccount } from "#root/bot/bot.js";
import { Chat, Voting } from "#root/models/index.js";
import {
  isAdministrator,
  getUserMention,
  sendMessage,
  setCooldown,
  isCooldown,
} from "#root/utils.js";
import { getVotingButtons } from "#root/bot/buttons/voting.js";
import { votingText } from "#root/bot/commands/voting/format_text.js";
import { endVoting } from "#root/bot/commands/voting/end_voting.js";
import { getUserIdFromLogin, isClientInitialized } from "#root/bot/client.js";

/**
 * @param {import("node-telegram-bot-api").Message} msg
 * @param {String} action
 */
async function startVoting(msg, action) {
  if (await isCooldown(msg.chat.id, msg.from.id, "vote")) {
    return await sendMessage(
      msg.chat.id,
      getUserMention(starter) + ", у вас сейчас КД."
    );
  }
  const chatObj = await Chat.findById(msg.chat.id);
  const starter = msg.from;

  // Находим кандидата
  let candidateId = null;
  const textMention = msg.entities.find(
    (value) => value.type == "text_mention"
  );
  const mention = msg.entities.find((value) => value.type == "mention");
  if (msg.reply_to_message) {
    candidateId = msg.reply_to_message.from.id;
  } else if (textMention) {
    candidateId = textMention.user.id;
  } else if (isClientInitialized && mention) {
    const login = msg.text.slice(
      mention.offset,
      mention.offset + mention.length
    );
    candidateId = await getUserIdFromLogin(login);
  }

  if (isClientInitialized && mention && !candidateId) {
    return await sendMessage(
      msg.chat.id,
      getUserMention(starter) +
        `, вы не можете начать голосование на этого пользователя.`
    );
  } else if (!isClientInitialized && mention && !candidateId) {
    return await sendMessage(
      msg.chat.id,
      getUserMention(starter) +
        ", чтобы использовать эту команду вы должны ответить на сообщение нужного пользователя с этой командой."
    );
  } else if (isClientInitialized && !mention && !candidateId) {
    return await sendMessage(
      msg.chat.id,
      getUserMention(starter) +
        `, чтобы использовать эту команду с упоминанием нужного пользователя \`/vote${action}\`, либо ответив на его сообщение.`
    );
  } else if (!isClientInitialized && !candidateId) {
    return await sendMessage(
      msg.chat.id,
      getUserMention(starter) +
        `, чтобы использовать эту команду вы должны ответить на сообщение нужного пользователя с этой командой.`
    );
  }

  if (await isCooldown(msg.chat.id, undefined, `cooldown${candidateId}`)) {
    return await sendMessage(
      msg.chat.id,
      getUserMention(starter) +
        ", вы не можете начать голосование на этого пользователя пока что."
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
    (action == "mute" && candidate.status != "member") ||
    (action == "ban" &&
      candidate.status != "member" &&
      candidate.status != "restricted")
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
}

export { startVoting };
