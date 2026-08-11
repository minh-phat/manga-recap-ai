# manga-recap-ai
làm video từ truyện tranh

## Cấu trúc

- `backend/` — NestJS + MongoDB driver, cung cấp API auth (register/login) và projects.
- `frontend/` — Next.js + Tailwind, giao diện login/register và quản lý project.

## Chạy dự án

### Backend

```bash
cd backend
cp .env.example .env   # điền MONGODB_URI, MONGODB_DB_NAME, JWT_SECRET
npm install
npm run start:dev
```

Mặc định chạy ở `http://localhost:3001`.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Mặc định chạy ở `http://localhost:3000`.

## API

- `POST /auth/register` — `{ email, password, name }` → `{ accessToken, user }`
- `POST /auth/login` — `{ email, password }` → `{ accessToken, user }`
- `POST /projects` (yêu cầu `Authorization: Bearer <token>`) — `{ name }`
- `GET /projects` (yêu cầu `Authorization: Bearer <token>`) — danh sách project của user hiện tại

