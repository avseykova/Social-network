# 📦 Node.js Социальная Сеть Backend

Полностью модульная архитектура backend-приложения на Express, Socket.IO и MongoDB.

## 🚀 Стек
- **Express.js** — REST API
- **Socket.IO** — real-time сообщения
- **MongoDB (Mongoose)** — база данных
- **bcrypt.js** — хеширование паролей
- **dotenv** — переменные окружения

## 🗂️ Структура проекта

```
project-root/
├── controllers/        # Логика обработки данных
│   ├── auth.controller.js
│   ├── chat.controller.js
│   ├── user.controller.js
│   ├── post.controller.js
│   └── feed.controller.js
│
├── routes/             # Роуты API
│   ├── auth.routes.js
│   ├── chat.routes.js
│   ├── user.routes.js
│   ├── post.routes.js
│   └── feed.routes.js
│
├── sockets/            # WebSocket логика
│   └── chatSocket.js
│
├── utils/              # Вспомогательные функции
│   └── messageHandlers.js
│
├── models/             # Mongoose схемы (User, Post, Chat, ...)
│
├── uploads/            # Статические файлы (аватары, картинки)
│
├── .env                # Конфигурация окружения
├── server.js           # Главная точка входа
└── README.md           # Документация
```

## 🔌 API

### Auth
- `POST /api/register` — регистрация
- `POST /api/login` — вход

### User
- `GET /api/users`
- `POST /api/user-info`
- `PUT /api/updateuser`
- `GET /api/followers/:userId`
- `GET /api/subscriptions/:userId`
- `PUT /api/subscribe`
- `PUT /api/unsubscribe`

### Chat
- `POST /api/chats`
- `GET /api/messages?sender_id=&receiver_id=`

### Post
- `POST /api/posts`
- `GET /api/posts/:userId`
- `DELETE /api/posts/:postId`
- `PUT /api/posts/like`

### Feed
- `POST /api/feed`

### Profile
- `POST /api/upload`

## 📡 Socket.IO
- `messageRoom` — присоединение к чату
- `chatMessage` — отправка сообщения
- `messageUpdated` — обновление сообщения
- `messageDelete` — удаление сообщения

## ⚙️ Настройки
Создай файл `.env` в корне:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/yourdbname
```

## 🏁 Запуск
```bash
npm install
npm run dev
```

---