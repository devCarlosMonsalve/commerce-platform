# frontend-mmp

Frontend for **Commerce Platform** — built with Next.js, Material UI, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![MUI](https://img.shields.io/badge/MUI-6.x-007FFF?style=flat-square&logo=mui&logoColor=white)](https://mui.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 + App Router + Turbopack |
| UI Components | Material UI v6 (dark theme) |
| Utilities | Tailwind CSS v4 |
| Font | Geist (Vercel) |
| Language | TypeScript |

---

## Getting Started

### Prerequisites
- Node.js v20+
- Backend running at `http://localhost:3000`

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App available at: `http://localhost:3001`

---

## Project Structure

```
src/
+-- app/               # Next.js App Router pages
+-- components/        # Shared UI components
¦   +-- providers.tsx  # MUI ThemeProvider
+-- lib/
    +-- theme.ts       # MUI dark theme configuration
```

---

## Scripts

```bash
npm run dev       # Development server (Turbopack)
npm run build     # Production build
npm run start     # Production server
npm run lint      # ESLint
```
