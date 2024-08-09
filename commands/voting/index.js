import { bot } from "#root/bot.js";
import { startVoting } from "#root/commands/voting/start_voting.js";
import { onVote } from "#root/commands/voting/on_vote.js";
import { isBlocked } from "#root/utils.js";

bot.onText("/votemute", async (msg) => {
  if (await isBlocked(msg.chat.id, msg.from.id)) return;
  await startVoting(msg, "mute");
});

bot.onText("/voteban", async (msg) => {
  if (await isBlocked(msg.chat.id, msg.from.id)) return;
  await startVoting(msg, "ban");
});

bot.on("callback_query", async (event) => {
  if (await isBlocked(event.message.chat.id, event.from.id)) return;
  await onVote(event);
});
