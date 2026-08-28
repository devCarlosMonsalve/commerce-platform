# Commerce Platform Frontend

Next.js application for Commerce Platform.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, App Router, Turbopack |
| UI | Material UI 9 and Tailwind CSS 4 |
| Internationalization | next-intl: Spanish, English, and French |
| Authentication | JWT stored locally and sent with Axios |
| Language | TypeScript |

## Setup

The backend must run at `http://localhost:3001`.

```bash
cp .env.example .env.local
npm install
npm run dev
```

The application runs at `http://localhost:3000`.

## Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL, normally `http://localhost:3001/api` |

## Current screens

- Localized landing page
- Login and registration
- Authenticated dashboard
- Active organization selection and persistence
- Product management: list, create, edit, deactivate
- Customer management: list, create, edit
- Order management: list, create, snapshot review, lifecycle actions

## Structure

```text
src/
├── app/[locale]/    # Localized pages
├── components/      # Shared UI components
├── context/         # Authentication and organization state
├── i18n/            # Locale routing configuration
├── lib/             # Axios and Material UI theme
├── services/        # API service clients
└── proxy.ts         # Next.js locale proxy
messages/            # ES, EN, and FR translations
```

## Scripts

```bash
npm run dev    # Development server
npm run build  # Production build
npm run start  # Production server
npm run lint   # ESLint
```

For complete local setup, see [development documentation](../docs/development.md).
