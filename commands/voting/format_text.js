import { bot } from "../../bot.js";
import { Chat, Voting } from "../../models/index.js";
import { getUserMention } from "../../utils.js";

/**
 *
 * @param {import("node-telegram-bot-api").Message | import("node-telegram-bot-api").CallbackQuery} event
 * @param {import("node-telegram-bot-api").User} candidate
 * @param {Voting} votingObj
 * @param {Chat} chatObj
 * @param {String} action
 * @returns {String}
 */
function votingText(
  starter,
  candidate,
  votingObj,
  chatObj,
  reason = null
) {
  const actionText = votingObj.action == "mute" ? "мут" : "бан";
  const reasonText = {
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
  }[reason];
  return (
    `${getUserMention(starter)} ` +
    `начал голосование на ${actionText} участника ${getUserMention(
      candidate
    )}\n\n` +
    `За: ${votingObj.yes.length} из ${chatObj.settings.votesForMute}\n` +
    `Против: ${votingObj.no.length} из ${chatObj.settings.votesAgainst}\n\n` +
    reasonText +
    `\n\nID голосования: ${votingObj._id.toString()}`
  );
}

export { votingText };
