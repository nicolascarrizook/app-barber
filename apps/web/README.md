# @barbershop/web

**Admin Dashboard & Client App** built with Next.js 14.

## Purpose

Modern, responsive web application for barbershop management and client bookings.

## Architecture

```
src/
├── app/              # Next.js App Router
│   ├── (auth)/      # Authentication routes
│   ├── (dashboard)/ # Admin dashboard
│   └── (client)/    # Client-facing pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── features/    # Feature-specific components
├── lib/             # Utilities
├── stores/          # Zustand stores
└── hooks/           # Custom React hooks
```

## Features

- Next.js 14 with App Router
- Server Components & Client Components
- Tailwind CSS + shadcn/ui
- Zustand for state management
- TanStack Query for data fetching
- React Hook Form + Zod validation
- Responsive design (mobile-first)
- Real-time updates

## Running

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Tests
npm run test
```

## Access

- Development: `http://localhost:3001`
- Admin Dashboard: `/dashboard`
- Client Booking: `/book`
