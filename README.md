## HolyDemocracy

Телеграм бот, который позволяет участникам чата начинать голосования на мут/кик участника. 

~~Бот в телеграме: [@HolyDemocracyBot](https://t.me/HolyDemocracyBot)~~ (пока не работает)

### Установка

Для работы бота требуется MongoDB. [Инструкция по установке.](https://www.mongodb.com/docs/manual/administration/install-community/)

Установка бота:

```
git clone https://github.com/holy-jesus/HolyDemocracy
cd HolyDemocracy/
npm i
```

Перед запуском:
1) Надо переназвать файл .env.example в .env; 
2) В `TOKEN` вставить токен бота полученный от [@BotFather](https://t.me/BotFather);
3) __(Опционально)__ Для того чтобы команды работали через пинг надо создать приложение [по этой ссылке](https://my.telegram.org/apps) и вставить `App api_id` -> `API_ID` и `App api_hash` -> `API_HASH`

Для запуска:

```
npm run start
```

### TODO

- Улучшить ошибки, вместо "вы не можете начать голосование сейчас" писать точную причину.
- Что-то придумать с `callback_query`
- Перейти к ENUMS от фиг пойми чего
- i18n
- Добавить комментарии
- Добавить логирование
