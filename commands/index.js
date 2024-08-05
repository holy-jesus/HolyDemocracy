import "./settings/index.js";
import "./voting/index.js";
import "./about.js";
import "./block.js";
import "./cancel.js";
import "./get_voting.js";
import "./reload.js";
import "./start.js";
import "./unblock.js";
import "./vanish.js";

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
    command: "get_voting",
    description:
      "Отображает информацию о голосовании (доступно только для администраторов)",
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
  {
    command: "about",
    description: "О боте (доступно только в личных сообщениях с ботом)",
  },
  {
    command: "start",
    description:
      "Пишет стартовое сообщение (доступно только в личных сообщениях с ботом)",
  },
]);
