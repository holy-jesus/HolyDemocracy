/**
 *
 * @param {String} _id
 * @returns {import("node-telegram-bot-api").InlineKeyboardButton[][]}
 */
function getVotingButtons(_id) {
  return [
    [
      { text: "За", callback_data: "+" + _id },
      { text: "Против", callback_data: "-" + _id },
    ],
  ];
}

export { getVotingButtons };
