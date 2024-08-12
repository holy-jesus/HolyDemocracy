import { Chat } from "../../models/index.js";
import { bot, botAccount } from "../bot.js";
import { sendMessage, updateAdministrators } from "../../utils.js";

bot.on("new_chat_members", async (event) => {
  const chatObj =
    (await Chat.findById(event.chat.id)) ||
    new Chat({
      _id: event.chat.id,
      title: event.chat.title,
    });
  await updateAdministrators(chatObj);
  if (event.new_chat_members[0].id != botAccount.id) {
    return;
  }
  await sendMessage(
    event.chat.id,
    "Привет! 👋\n\nЯ бот, который позволит вам проголосовать за мут или бан нарушителя, если модераторов нету в чате.\n\n<b>Доступные команды:</b>\n/votemute - начинает голосование на мут участника, чтобы команда сработала необходимо ответить командой на сообщение нужного человека.\n/voteban - начинает голосование за бан участника, чтобы команда сработала необходимо ответить командой на сообщение нужного человека.\n/vanish - мутит вас на 60 секунд\n\nЧтобы я начал работать, надо выдать мне права администратора."
  );
});
