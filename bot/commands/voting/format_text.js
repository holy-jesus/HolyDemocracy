import { Chat, Voting } from "#root/models/index.js";
import { getUserMention } from "#root/utils.js";

/**
 *
 * @param {import("node-telegram-bot-api").User} starter
 * @param {import("node-telegram-bot-api").User} candidate
 * @param {Voting} votingObj
 * @param {Chat} chatObj
 * @param {String} reason
 * @returns {String}
 */
function votingText(starter, candidate, votingObj, chatObj, reason = null) {
  const actionText = votingObj.action == "mute" ? "мут" : "бан";
  const reasonText = {
    timeout: "Голосование закончилось, время вышло.",
    yes: "Голосование закончилось, набралось необходимое количество голосов за.",
    no: "Голосование закончилось, набралось необходимое количество голосов против.",
    cancel: "Голосование отменил администратор.",
    waiting:
      "Голосование закончилось, набралось необходимое количество голосов за. Ожидаем подтверждения от администратора.",
    ban_yes:
      "Голосование закончилось, набралось необходимое количество голосов за. Администратор одобрил бан.",
    ban_no:
      "Голосование закончилось, набралось необходимое количество голосов за. Администратор отклонил бан.",
    [null]: `Голосование продлится до ${votingObj.until.toLocaleString(
      "ru-RU"
    )}`,
    [undefined]: `Голосование продлится до ${votingObj.until.toLocaleString(
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
    reasonText
  );
}

export { votingText };
