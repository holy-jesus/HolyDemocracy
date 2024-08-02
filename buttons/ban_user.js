/**
 * 
 * @param {Number} candidateId 
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[][]}
 */
function getBanUserButton(candidateId) {
  return [
    [
      {
        text: "Забанить пользователя",
        callback_data: `ban${candidateId}`,
      },
    ],
  ];
}

export { getBanUserButton}