import { bot } from "../bot.js";
import { getVotingInfoButtons } from "../buttons/voting_info.js";
import { Voting } from "../models/index.js";
import {
  getUserMention,
  isAdministrator,
  sendMessage,
  getOnlyFirstArgument,
} from "../utils.js";

bot.onText("/get_voting", async (msg) => {
  await getVoting(msg);
});

bot.onText("/getVoting", async (msg) => {
  await getVoting(msg);
});

bot.onText("/getvoting", async (msg) => {
  await getVoting(msg);
});

/**
 *
 * @param {import("node-telegram-bot-api").Message} msg
 * @returns
 */
async function getVoting(msg) {
  if (
    (await isAdministrator(msg.chat.id, msg.from.id)) == false &&
    msg.chat.type != "private"
  ) {
    return;
  }
  const votingId = getOnlyFirstArgument(msg.text);
  if (votingId === null)
    return await sendMessage(
      msg.chat.id,
      "Использование:\n\n/get_voting <b>[ID поста]</b>",
      undefined,
      msg.message_id
    );
  let votingObj;
  try {
    votingObj = await Voting.findById(votingId);
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

  const starter = await bot.getChatMember(
    votingObj.chatId,
    votingObj.starterId
  );
  const candidate = await bot.getChatMember(
    votingObj.chatId,
    votingObj.candidateId
  );
  const status = {
    timeout: "Голосование закончилось, время вышло.",
    yes: "Голосование закончилось, набралось необходимое количество голосов за.",
    no: "Голосование закончилось, набралось необходимое количество голосов против.",
    cancel: "Голосование отменил администратор.",
    [null]: `Голосование продлится до ${votingObj.until.toLocaleString(
      "ru-RU"
    )}`,
    [false]: `Голосование продлится до ${votingObj.until.toLocaleString(
      "ru-RU"
    )}`,
    [undefined]: `Голосование продлится до ${votingObj.until.toLocaleString(
      "ru-RU"
    )}`,
  }[votingObj.done];

  const message = await sendMessage(
    msg.chat.id,
    `Голосование:\n\n` +
      `Начал голосование: ${getUserMention(starter.user)} [${
        starter.user.id
      }]\n` +
      `Кандидат: ${getUserMention(candidate.user)} [${candidate.user.id}]\n\n` +
      `Голосование началось в ${votingObj.started.toLocaleString("ru-RU")}\n` +
      status +
      "\n\n" +
      `Голосов за ${votingObj.yes.length} из ${votingObj.neededYes}\n` +
      `Голосов против ${votingObj.no.length} из ${votingObj.neededNo}`,
      await getVotingInfoButtons(votingObj.chatId, votingObj.starterId)
  );
}
