# IvyLevel Frontend

**Version:** MVP 1.0.3
**Last Updated:** January 21, 2026 @ 20:15 PST
**Framework:** Next.js 14 + React + Tailwind

---

## Overview

The frontend is a Next.js application providing:
- 6-frame assessment flow
- Multi-tab dashboard
- Execution coaching interface
- Real-time agent chat

---

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# Run development server
npm run dev
```

Open http://localhost:3000

---

## Documentation

| Document | Description |
|----------|-------------|
| [COMPONENTS.md](./COMPONENTS.md) | Component library guide |
| [FRAMES.md](./FRAMES.md) | Assessment frames guide |

---

## Directory Structure

```
/app/                    # Next.js App Router
├── (auth)/              # Auth routes
├── (dashboard)/         # Dashboard routes
│   ├── assessment/      # Assessment frames
│   ├── dashboard/       # Main dashboard
│   └── execution/       # Execution hub
├── api/                 # API routes
└── docs/                # ← YOU ARE HERE

/components/             # React components
├── frames/              # Assessment frame components
├── dashboard/           # Dashboard tab components
├── ui/                  # shadcn/ui primitives
└── ...

/lib/                    # Utilities
├── store/               # Zustand stores
├── constants/           # Brand constants
├── api/                 # API clients
└── utils/               # Helper functions

/hooks/                  # React hooks
```

---

## Key Technologies

| Technology | Purpose |
|------------|---------|
| Next.js 14 | App router, SSR |
| React 18 | UI components |
| Tailwind CSS | Styling |
| shadcn/ui | Component primitives |
| Zustand | State management |
| Supabase | Auth, database |
| Framer Motion | Animations |

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Features
NEXT_PUBLIC_ENABLE_PROACTIVE=true
```

---

## Key Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Landing | Marketing page |
| `/login` | Auth | Login page |
| `/assessment` | Frames | 6-frame assessment |
| `/dashboard` | Dashboard | Main dashboard |
| `/dashboard/execution` | ExecutionHub | Weekly planning |
| `/dashboard/multi-agent` | MultiAgent | Agent chat |

---

## Styling Guide

### Brand Colors

```typescript
import { BRAND_COLORS } from '@/lib/constants/brand'

// Primary: #FF4A23 (IvyLevel orange)
// Secondary: #641432 (IvyLevel maroon)
// Success: #16a34a
// Warning: #d97706
// Error: #dc2626
```

### Important: Light Mode Only

Frame components use **light mode** styling. Do NOT use dark mode Tailwind classes like `text-text-primary` in frames.

See `/lib/constants/brand.ts` for all brand constants.

---

## State Management

### Zustand Stores

| Store | Purpose |
|-------|---------|
| `useProfileStore` | Current user profile |
| `useAssessmentStore` | Assessment state |
| `useDashboardStore` | Dashboard tab state |
| `useExecutionStore` | Execution hub state |

**Example:**
```typescript
import { useProfileStore } from '@/lib/store/profile'

const profile = useProfileStore((state) => state.profile)
```

---

## Building

```bash
# Production build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```
