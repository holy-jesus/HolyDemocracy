const valueText = {
  [true]: "Включено",
  [false]: "Выключено",
};

const maxValueTemplate = "<b>Максимальное значение:</b> <u>{0}{1}.</u>\n";
const minValueTemplate = "<b>Минимальное значение:</b> <u>{0}{1}.</u>\n";
const currentValueTemplate = "<b>Текущее значение:</b> <u>{0}{1}.</u>\n";

class Setting {
  constructor(type, unit, description, min_value = null, max_value = null) {
    this.type = type;
    this.unit = unit ? " " + unit : "";
    this.description = description;
    this.min_value = min_value;
    this.max_value = max_value;
  }

  checkValue(value) {
    return (
      typeof value === this.type.name.toLowerCase() &&
      (this.type === Boolean ||
        (value >= this.min_value &&
          (this.max_value === null || value <= this.max_value)))
    );
  }

  getDescription(currentValue) {
    return this.description + "\n\n" + this.getValuesText(currentValue);
  }

  getValuesText(currentValue) {
    return (
      (this.max_value
        ? maxValueTemplate.format(this.max_value, this.unit)
        : "") +
      (this.min_value
        ? minValueTemplate.format(this.min_value, this.unit)
        : "") +
      currentValueTemplate.format(
        valueText[currentValue] ?? currentValue,
        this.unit
      )
    );
  }
}

const settings = {
  onlyCreatorCanAccessSettings: new Setting(
    Boolean,
    "",
    "При включении этой настройки только создатель чата может получить доступ к настройкам."
  ),
  mentionOnlyCreator: new Setting(
    Boolean,
    "",
    "При включении этой настройки бот будет присылать сообщение только создателю чата при успешном завершении голосования на бан."
  ),
  votesForBan: new Setting(
    Number,
    "голосов",
    "Необходимое количество голосов за для бана.",
    2
  ),
  votesForMute: new Setting(
    Number,
    "голосов",
    "Необходимое количество голосов за для мута.",
    2
  ),
  votesAgainst: new Setting(
    Number,
    "голосов",
    "Необходимое количество против чтобы отклонить голосование.",
    2
  ),
  timeForVoting: new Setting(
    Number,
    "секунд",
    "Время, на протяжении которого будут собираться голоса.",
    30,
    3600
  ),
  muteTime: new Setting(
    Number,
    "секунд",
    "На какое время отстранять участника, при успешном завершении голосования на мут.",
    60,
    31536000
  ),
  cooldown: new Setting(
    Number,
    "секунд",
    "Время между которым один пользователь запускать голосования.",
    0,
    31536000
  ),
};

export { settings };
