# Chhayavastralaya Platform

Commerce OS for small & medium businesses — Phase 1 MVP.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui**
- **Prisma** + **PostgreSQL**
- **NextAuth.js** (credentials)
- **Anthropic Claude API** (AI assistant)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY

# 3. Push DB schema
npm run db:push

# 4. Run dev server
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & Signup pages
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── page.tsx      # Dashboard home
│   │   ├── inventory/    # Inventory management
│   │   ├── orders/       # Orders & sales
│   │   ├── customers/    # Customer CRM
│   │   ├── staff/        # Staff management
│   │   ├── analytics/    # Reports & analytics
│   │   └── settings/     # Store settings
│   └── api/              # API routes
├── components/
│   ├── layout/           # Sidebar, providers
│   └── dashboard/        # Shared UI components
├── lib/                  # db, auth, utils
├── types/                # TypeScript types
└── styles/               # Global CSS
prisma/
└── schema.prisma         # Full DB schema
```

## Phase 1 Roadmap

- [x] Project scaffold + auth
- [x] Database schema (all modules)
- [x] Dashboard shell + navigation
- [x] Inventory list page
- [x] Orders list page
- [x] Staff list page
- [x] Analytics page
- [x] Customers page
- [x] Settings page
- [ ] Add/Edit product forms
- [ ] POS order creation flow
- [ ] Stock movement tracking
- [ ] Invoice generation
- [ ] AI assistant (Claude API)
- [ ] Razorpay payment integration
