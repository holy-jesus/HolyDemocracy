import { Chat, Voting, Block, Cooldown } from "#root/models/index.js";
import { bot, botAccount } from "#root/bot.js";

/**
 *
 * @param {Number} chatId
 * @param {Number} userId
 * @returns {Promise<Boolean>}
 */
async function isAdministrator(chatId, userId) {
  return (
    (await Chat.findOne({
      _id: chatId,
      $or: [{ creator: userId }, { admins: userId }],
    })) !== null || userId == 1087968824 // 1087968824 - GroupAnonymousBot
  );
}

/**
 *
 * @param {Chat} chatObj
 * @returns {Promise<null>}
 */
async function updateAdministrators(chatObj) {
  const botChatMember = await bot.getChatMember(chatObj._id, botAccount.id);
  let admins = null;
  try {
    admins = await bot.getChatAdministrators(chatObj._id);
  } catch {
    return;
  }
  let adminsIDS = [];
  if (
    botChatMember.status == "administrator" &&
    botChatMember.can_restrict_members &&
    botChatMember.can_delete_messages
  ) {
    adminsIDS.push(botAccount.id);
  }
  let creatorID = 0;
  for (let admin of admins) {
    if (admin.status == "creator") {
      creatorID = admin.user.id;
    } else if (admin.status == "administrator") {
      adminsIDS.push(admin.user.id);
    }
  }
  chatObj.admins = adminsIDS;
  chatObj.creator = creatorID;
  await chatObj.save();
}

/**
 *
 * @param {import('node-telegram-bot-api').User} user
 * @returns {String}
 */
function getUserMention(user) {
  const text = user?.username ? user.username : user.first_name;
  return `<a href="tg://user?id=${user.id}">${text}</a>`;
}

/**
 *
 * @param {import("mongoose").HydratedDocument<Chat>} chatObj
 * @param {Voting} votingObj
 * @returns {String | Boolean}
 */
function isVotingDone(votingObj) {
  if (votingObj.neededYes <= votingObj.yes.length) return "yes";
  if (votingObj.neededNo <= votingObj.no.length) return "no";
  if (votingObj.until <= new Date()) return "timeout";
  return false;
}

/**
 *
 * @param {Number} chatId
 * @param {Number} userId
 * @param {Number} duration
 * @returns {Promise<Boolean>}
 */
async function timeoutUser(chatId, userId, duration) {
  let success;
  await bot
    .restrictChatMember(chatId, userId, {
      until_date: Date.now() / 1000 + duration,
      permissions: [],
    })
    .then(
      () => (success = true),
      () => (success = false)
    );
  return success;
}

async function banUser(chatId, userId, duration) {
  let success;
  await bot
    .banChatMember(chatId, userId, {
      until_date: Date.now() / 1000 + duration,
      revoke_messages: true,
    })
    .then(
      () => (success = true),
      () => (success = false)
    );
  return success;
}

/**
 *
 * @param {Number} chatId
 * @param {String} text
 * @param {import("node-telegram-bot-api").InlineKeyboardButton[][] | undefined} inline_keyboard
 * @param {Number | undefined} reply_to_message_id
 * @returns {Promise<import("node-telegram-bot-api").Message | Boolean>}
 */
async function sendMessage(
  chatId,
  text,
  inline_keyboard = undefined,
  reply_to_message_id = undefined
) {
  let value;
  await bot
    .sendMessage(chatId, text, {
      parse_mode: "HTML",
      reply_markup: inline_keyboard
        ? { inline_keyboard: inline_keyboard }
        : undefined,
      reply_to_message_id: reply_to_message_id,
    })
    .then(
      (message) => (value = message),
      () => (value = false)
    );
  return value;
}

/**
 *
 * @param {Number} chatId
 * @param {Number} messageId
 * @param {String} text
 * @param {import("node-telegram-bot-api").InlineKeyboardButton[][]} inline_keyboard
 * @returns {Promise<import("node-telegram-bot-api").Message | Boolean>}
 */
async function editMessage(
  chatId,
  messageId,
  text,
  inline_keyboard = undefined
) {
  let value;
  await bot
    .editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "HTML",
      reply_markup: inline_keyboard
        ? { inline_keyboard: inline_keyboard }
        : undefined,
    })
    .then(
      (message) => (value = message),
      () => (value = false)
    );
  return value;
}

/**
 *
 * @param {Chat} chatId
 * @param {String} text
 * @param {import("node-telegram-bot-api").InlineKeyboardButton[][]} inline_keyboard
 */
async function sendToAllAdmins(chatObj, text, inline_keyboard = undefined) {
  await sendMessage(chatObj.creator, text, inline_keyboard);
  if (chatObj.settings.mentionOnlyCreator) return;

  for (let adminId of chatObj.admins) {
    await sendMessage(adminId, text, inline_keyboard);
  }
}

/**
 *
 * @param {String} text
 * @returns {String}
 */
function getOnlyFirstArgument(text) {
  const args = text.split(" ").filter((value) => value != "");
  return args.length == 2 ? args[1] : null;
}

/**
 *
 * @param {Number} chatId
 * @param {Number} userId
 * @returns {Promise<Boolean>}
 */
async function isBlocked(chatId, userId) {
  return (await Block.countDocuments({ userId: userId, chatId: chatId })) >= 1;
}

/**
 *
 * @param {Number} chatId
 * @param {Number} userId
 * @returns {Number}
 */
async function countTimeouts(chatId, userId) {
  return await Voting.countDocuments({
    chatId: chatId,
    candidateId: userId,
    done: "yes",
  });
}

/**
 *
 * @param {Number} chatId
 * @param {Boolean} start
 */
async function deleteChat(chatId, start = false) {
  await bot.leaveChat(chatId).catch(() => {});
  const chatObj = await Chat.findById(chatId);
  if (!chatObj) return;
  for (let votingObj of await Voting.find({ chatId: chatId, done: null })) {
    if (!start) clearTimeout(votingObj.timeoutId);
    await votingObj.deleteOne();
  }
  for (let blockObj of await Block.find({ chatId: chatId }))
    await blockObj.deleteOne();
  for (let cooldownObj of await Cooldown.find({ chatId: chatId }))
    await cooldownObj.deleteOne();
}

/**
 *
 * @param {Number} chatId
 * @param {Number | undefined} userId
 * @param {String | undefined} command
 * @returns {Promise<Boolean>}
 */
async function isCooldown(chatId, userId = undefined, command = undefined) {
  const cooldownObj = await Cooldown.findOne({
    chatId: chatId,
    userId: userId,
    command: command,
  });
  if (!cooldownObj || Date.now() / 1000 > cooldownObj.until) return false;
  return true;
}

/**
 *
 * @param {Number} chatId
 * @param {Number} duration
 * @param {Number | undefined} userId
 * @param {String | undefined} command
 */
async function setCooldown(
  chatId,
  duration,
  userId = undefined,
  command = undefined
) {
  await Cooldown.updateOne(
    {
      chatId: chatId,
      userId: userId,
      command: command,
    },
    {
      $set: {
        chatId: chatId,
        userId: userId,
        command: command,
        until: Date.now() / 1000 + duration,
      },
    },
    { upsert: true }
  );
}

/**
 *
 * @param {Number} chatId
 */
async function getOrCreateChat(chatId, title = null) {
  return await Chat.findByIdAndUpdate(
    chatId,
    { $set: { _id: chatId, title: title } },
    { upsert: true, new: true }
  );
}

export {
  isAdministrator,
  updateAdministrators,
  getUserMention,
  isVotingDone,
  banUser,
  timeoutUser,
  sendMessage,
  editMessage,
  sendToAllAdmins,
  getOnlyFirstArgument,
  isBlocked,
  countTimeouts,
  deleteChat,
  isCooldown,
  setCooldown,
  getOrCreateChat,
};
