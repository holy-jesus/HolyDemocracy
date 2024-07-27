import { bot, botAccount } from "../bot.js";

bot.on("error", async (event) => {
  console.log(event)
});

bot.on("polling_error", async (event) => {
  console.log(event)
})

bot.on("webhook_error", async (event) => {
  console.log(event)
})