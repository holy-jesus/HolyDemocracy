## HolyDemocracy

#### Бот пока что в очень раннем состоянии и пока не предназначен для использования.

Телеграм бот, который позволяет участникам чата начинать голосования на мут/кик участника. 

Бот в телеграме: [@HolyDemocracyBot](https://t.me/HolyDemocracyBot)

### Установка

Для работы бота требуется MongoDB. [Инструкция по установке MongoDB.](https://www.mongodb.com/docs/manual/administration/install-community/)

Установка бота:

```
git clone https://github.com/holy-jesus/HolyDemocracy
cd HolyDemocracy/
npm i
```

Перед запуском:
1) Надо переназвать файл .env.example в .env; 
2) В TOKEN вставить токен бота полученный от [@BotFather](https://t.me/BotFather);
3) В MONGODB_URL заменить USERNAME и PASSWORD на логин и пароль соответственно от аккаунта MongoDB, если для доступа к базе данных логин и пароль не требуются, то нужно убрать `USERNAME:PASSWORD@`

Для запуска:

```
npm run start
```

### TODO

- Перейти от relative импортов к absolute
- Перейти к ENUMS от фиг пойми чего
- i18n
- Добавить комментарии
- Добавить логирование
