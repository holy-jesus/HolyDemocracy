import { bot } from "#root/bot/bot.js";
import { startVoting } from "#root/bot/commands/voting/start_voting.js";
import { onVote } from "#root/bot/commands/voting/on_vote.js";

bot.onText(/^\/votemute/, async (msg) => {
  await startVoting(msg, "mute");
});

bot.onText(/^\/voteban/, async (msg) => {
  await startVoting(msg, "ban");
});

bot.on("callback_query", async (event) => {
  await onVote(event);
});
