import { bot } from "#root/bot/bot.js";
import { Chat } from "#root/models/index.js";
import { sendMainMenu } from "#root/bot/commands/settings/main_menu.js";
import { sendSubMenu } from "#root/bot/commands/settings/sub_menu.js";
import { onNewValue } from "#root/bot/commands/settings/on_new_value.js";
import { askForNewValue } from "#root/bot/commands/settings/update_value.js";

if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != "undefined" ? args[number] : match;
    });
  };
}

bot.onText(/^\/settings/, async (msg) => {
  await sendMainMenu(msg);
});

bot.on("callback_query", async (event) => {
  if (!event.data.startsWith("set") && !event.data.startsWith("upd")) return;
  let chatId = event.data.slice(3).split("|")[0];
  if (
    (await Chat.countDocuments({
      $or: [
        {
          _id: chatId,
          admins: event.from.id,
          "settings.onlyCreatorCanAccessSettings": false,
        },
        { _id: chatId, creator: event.from.id },
      ],
    })) == 0
  ) {
    return;
  }
  if (event.data.startsWith("set")) {
    await sendSubMenu(event);
  } else if (event.data.startsWith("upd")) {
    await askForNewValue(event);
  }
});

// При введении нового значения для настройки
bot.on("message", async (msg) => {
  if (msg.chat.type != "private") return;
  await onNewValue(msg);
});
