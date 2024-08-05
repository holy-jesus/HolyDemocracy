import { bot } from "../../bot.js";
import { sendMainMenu } from "./main_menu.js";
import { sendSubMenu } from "./sub_menu.js";
import { onNewValue } from "./on_new_value.js";
import { askForNewValue } from "./update_value.js";

if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != "undefined" ? args[number] : match;
    });
  };
}

bot.onText("/settings", async (msg) => {
  await sendMainMenu(msg);
});

bot.on("callback_query", async (event) => {
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
