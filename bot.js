import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.TOKEN, {
  polling: {
    params: {
      allowed_updates: JSON.stringify([
        "update_id",
        "message",
        "edited_message",
        "channel_post",
        "edited_channel_post",
        "inline_query",
        "chosen_inline_result",
        "callback_query",
        "shipping_query",
        "pre_checkout_query",
        "poll",
        "poll_answer",
        "my_chat_member",
        "chat_member",
      ]),
    },
  },
});

const botAccount = await bot.getMe();

export { bot, botAccount };
