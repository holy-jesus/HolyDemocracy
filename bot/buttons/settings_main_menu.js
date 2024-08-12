import { Chat } from "#root/models/index.js";

const names = {
  onlyCreatorCanAccessSettings: "Доступ к настройкам",
  mentionOnlyCreator: "Упоминать при бане",
  votesForBan: "Количество голосов для бана",
  votesForMute: "Количество голосов для мута",
  votesAgainst: "Количество голосов против",
  timeForVoting: "Время для голосования",
  muteTime: "На какое время мутить",
  cooldown: "КД",
};

/**
 *
 * @param {Chat.settings} settings
 * @param {Number | null} chatId
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[][]}
 */
function getSettingsMainMenuButttons(settings, chatId = null) {
  let keyboard = [];
  let row = [];
  for (let key of Object.keys(settings)) {
    row.push({
      text: names[key],
      callback_data: "set" + (chatId ? chatId : "") + "|" + key,
    });
    if (row.reduce((partialSum, a) => partialSum + a.text.length, 0) > 25) {
      keyboard.push(row);
      row = [];
    } 
  }
  if (row.length >= 1) {
    keyboard.push(row);
  }
  return keyboard;
}

export { getSettingsMainMenuButttons };
