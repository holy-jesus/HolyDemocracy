import "#root/bot/commands/settings/index.js";
import "#root/bot/commands/voting/index.js";
import "#root/bot/commands/about.js";
import "#root/bot/commands/block.js";
import "#root/bot/commands/cancel.js";
import "#root/bot/commands/reload.js";
import "#root/bot/commands/start.js";
import "#root/bot/commands/unblock.js";
import "#root/bot/commands/vanish.js";

import { bot } from "../bot.js";

await bot.setMyCommands([
  { command: "votemute", description: "Начинает голосование за мут участника" },
  { command: "voteban", description: "Начинает голосование за бан участника" },
  { command: "vanish", description: "Мутит вас на 60 секунд" },
  {
    command: "cancel",
    description: "Отменяет голосование (доступно только для администраторов)",
  },
  {
    command: "settings",
    description: "Настройки бота (доступно только для администраторов)",
  },
  {
    command: "block",
    description:
      "Блокирует пользователя, чтобы он не мог использовать команды /votemute и /voteban (доступно только для администраторов)",
  },
  {
    command: "unblock",
    description:
      "Разблокирует пользователя, чтобы он опять смог использовать бота (доступно только для администраторов)",
  },
  // {
  //   command: "about",
  //   description: "О боте (доступно только в личных сообщениях с ботом)",
  // },
  // {
  //   command: "start",
  //   description:
  //     "Пишет стартовое сообщение (доступно только в личных сообщениях с ботом)",
  // },
]);
