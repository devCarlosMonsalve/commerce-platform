# Local development

## Prerequisites

- Node.js 20.19 or later
- Docker Desktop with Docker Compose

## 1. Configure PostgreSQL

Copy the root environment template to `.env` and choose a local database password:

```bash
cp .env.example .env
```

Then start PostgreSQL:

```bash
docker compose up -d
```

PostgreSQL listens at `localhost:5432`. Its data is stored in the named Docker volume `postgres_data`.

## 2. Configure and run the backend

From `backend-mmp`, copy `.env.example` to `.env`. Set `DATABASE_URL` with the same database user, password, and database name configured in the root `.env`.

```bash
cd backend-mmp
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

The API and health check are available at:

- `http://localhost:3001/api`
- `http://localhost:3001/api/health`

`CORS_ORIGIN` must allow the frontend origin, normally `http://localhost:3000`. Cookie auth uses credentialed CORS, so do not use `*` for this value.

If the database password contains URL-reserved characters, encode it in `DATABASE_URL`. For example, use `%23` for `#`.

## 3. Configure and run the frontend

From `frontend-mmp`, copy `.env.example` to `.env.local`:

```bash
cd frontend-mmp
cp .env.example .env.local
npm install
npm run dev
```

The frontend is available at `http://localhost:3000`. It expects the API at `http://localhost:3001/api`.
Set `NEXT_PUBLIC_SITE_URL` to the public frontend URL. It defaults to `http://localhost:3000` for local development and is used to generate metadata links.

Authentication is stored in an httpOnly cookie issued by the backend. Keep the frontend and backend origins aligned with `CORS_ORIGIN` so credentialed requests can include that cookie.

## Validation commands

```bash
# Backend
cd backend-mmp
npx tsc --noEmit
npm test
npm run build

# Frontend
cd frontend-mmp
npm run lint
npm run test:e2e
npm run build
```
