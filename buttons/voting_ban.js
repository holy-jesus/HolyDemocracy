/**
 * 
 * @param {String} votingId 
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[][]}
 */
function getVotingBanDecision(votingId) {
  return [
    [
      { text: "Забанить", callback_data: "conf" + votingId },
      {
        text: "Снять ограничения",
        callback_data: "deny" + votingId,
      },
    ],
  ];
}

export { getVotingBanDecision }