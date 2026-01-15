# Coaching Platform

## Project Context

A **coaching platform MVP** where:
- Coaches manage clients and create tasks
- Clients view and complete their tasks
- All data is secure using Row-Level Security (RLS)

## Tech Stack

- **Frontend**: Next.js 15 (TypeScript, React, Tailwind CSS)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Database**: PostgreSQL with RLS policies

## Code Standards

- TypeScript strict mode (no `any` types)
- Tailwind CSS for styling
- Simple, readable code over complex abstractions
- All database queries use Supabase client
- RLS policies enforced at database layer

## File Organization

```
app/
├── (auth)/                 # Authentication pages
├── coach/                  # Coach dashboard (protected)
├── client/                 # Client dashboard (protected)
├── api/                    # API routes
└── layout.tsx

lib/
├── supabase.ts            # Supabase client
├── auth.ts                # Auth helpers
├── messaging.ts           # Messaging logic
├── database.types.ts      # Generated types
└── language.ts            # i18n

hooks/
├── useRealtimeMessages.ts
└── useUnreadMessages.ts

contexts/
└── LanguageContext.tsx

components/
├── ui/                    # Reusable UI
└── [other components]

lib/translations/          # i18n files
```

## Important Rules

1. **Security First**: All data access must use RLS
2. **Keep it Simple**: React hooks for state management
3. **TypeScript Strict**: No `any` types
4. **Environment Variables**: Store sensitive keys in `.env.local`
