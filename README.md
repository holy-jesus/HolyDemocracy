## HolyDemocracy

#### Бот пока что в очень раннем состоянии и пока не предназначен для использования.

Телеграм бот, который позволяет участникам чата начинать голосования на мут/кик участника. 

Бот в телеграме: [@HolyDemocracyBot](t.me/HolyDemocracyBot)

### Установка

Для работы бота требуется MongoDB. [Инструкция.](https://www.mongodb.com/docs/manual/administration/install-community/)

```
git clone https://github.com/holy-jesus/HolyDemocracy
cd HolyDemocracy/
npm i
```

Перед запуском надо переназвать файл .env.example в .env и в TOKEN вставить токен бота полученный от [@BotFather](https://t.me/BotFather), в MONGODB_URL заменить USERNAME и PASSWORD на логин и пароль соответственно от аккаунта MongoDB, если для доступа к базе данных аккаунт не требуется, то нужно убрать `USERNAME:PASSWORD@`

Для запуска:

```
npm run start
```

### TODO

- Перейти к ENUMS от фиг пойми чего
- i18n
- Добавить больше комментариев
