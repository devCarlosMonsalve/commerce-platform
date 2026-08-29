# Commerce Platform Frontend

Next.js application for the Commerce Platform multi-tenant SaaS. It provides the
authenticated operational interface for products, customers, sales orders,
suppliers, purchase orders, and goods receipts.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, App Router, Turbopack |
| UI | Material UI 9 and Tailwind CSS 4 |
| Internationalization | next-intl: Spanish, English, and French |
| Authentication | Backend-issued httpOnly JWT cookie with credentialed Axios requests |
| API client | Axios, configured through `NEXT_PUBLIC_API_URL` |
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
| `NEXT_PUBLIC_SITE_URL` | Public application URL used for metadata, normally `http://localhost:3000` |

## Current screens

- Localized landing page
- Login and registration
- Authenticated dashboard
- Active organization selection and persistence
- Product management: list, create, edit, deactivate
- Customer management: list, create, edit
- Sales order management: list, create, snapshot review, and lifecycle actions
- Supplier management: list, create, and edit
- Purchase orders: list, create, and receive items partially or completely

## Tenant and session behavior

- The active organization scopes every organization-owned API request.
- The backend validates the authenticated user's membership before permitting
  access to that organization's data.
- Axios sends credentialed requests so the backend-issued httpOnly JWT cookie is
  included.
- A `401 Unauthorized` response clears the local authenticated state and
  redirects the user to the localized login route.

Order lifecycles, historical product snapshots, receipt validation, and stock
updates are enforced by the backend; the frontend presents their workflows and
API results.

Owners and administrators access AI from the global right-side Operations
Assistant drawer. It never runs automatically: users explicitly request an
organization summary, a route-contextual summary, guided operational search,
or supply review. The drawer keeps AI secondary to normal workflows and
contains provider failures without blocking catalog, sales, or purchasing work.

LLM actions use Gemini first and OpenAI only as a fallback. If Gemini supplies
a temporary retry time and both providers fail, the drawer shows a localized
countdown and temporarily disables its LLM actions. It never displays raw
provider errors, quota data, or credentials.

Supply review is independent of LLM availability. It identifies active products
with stock at or below five units and shows their priority, current stock, open
purchase orders, and units pending receipt. Each item directs the user to
create a purchase order or review open purchase orders; it is read-only,
requires human review, and never creates orders automatically.

## Structure

```text
src/
├── app/[locale]/    # Server-first localized route conventions
├── components/      # Shared UI components
├── context/         # Authentication and organization state
├── features/        # Domain-specific interactive client screens
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
npm run test:e2e # Playwright public-route tests
```

For local setup, configure the variables in `.env.example` and follow the setup
steps above.
