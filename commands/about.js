import { bot } from "#root/bot.js";
import { sendMessage } from "#root/utils.js";

bot.onText("/about", async (msg) => {
  if (msg.chat.type != "private") return;
  await sendMessage(
    msg.chat.id,
    '<a href="https://github.com/holy-jesus/HolyDemocracy">HolyDemocracy</a>\n\nСоздал @ho1y_jesus'
  );
});
