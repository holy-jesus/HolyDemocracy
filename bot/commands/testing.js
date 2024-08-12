import { bot } from "#root/bot/bot.js";

bot.onText(/^\/test/, ()=> {console.log("TEST")})