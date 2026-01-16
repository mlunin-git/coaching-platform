# Coaching Platform

## Project Context

A **coaching platform MVP** with collaborative year planning features:
- **Coaches** manage clients, create tasks, and organize planning groups
- **Clients** view and complete tasks, participate in planning discussions
- **Participants** can access planning groups via shareable links (no login required)
- All data is secure using Row-Level Security (RLS) policies

## Features

### Core Coaching Features
- Coach dashboard with client management
- Task creation and tracking (per-client or global)
- Client dashboard with task completion tracking
- Message communication between coaches and clients
- Multi-language support (English, German, Russian, Ukrainian)

### Year Planning Module
- Coaches create planning groups and share via tokens
- Participants access without login (name-based selection)
- Ideas submission with voting system
- Event creation and promotion from ideas
- Shared calendar visualization
- Analytics dashboard (yearly events chart, visited cities map)
- Participant tracking for events

## Tech Stack

- **Frontend**: Next.js 15 (TypeScript, React, Tailwind CSS)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Database**: PostgreSQL with RLS policies
- **Charts**: Recharts for analytics visualization
- **Maps**: React Simple Maps for city distribution
- **Hosting**: Vercel (frontend) + Supabase (backend)

## Code Standards

- TypeScript strict mode (no `any` types)
- Tailwind CSS for styling
- Simple, readable code over complex abstractions
- All database queries use Supabase client
- RLS policies enforced at database layer
- Secure password generation using crypto.getRandomValues()
- Optimized queries (no N+1 patterns)

## File Organization

```
app/
├── (auth)/                    # Authentication pages
├── coach/                     # Coach dashboard (protected)
├── client/                    # Client dashboard (protected)
├── planning/                  # Year Planning Module
│   ├── admin/                # Planning admin (coach only)
│   ├── [groupId]/            # Planning group (public, token-based)
│   └── page.tsx              # Planning landing page
├── privacy/                   # Privacy policy page
├── layout.tsx                # Root layout with Navigation & Footer
└── page.tsx                  # Home page

lib/
├── supabase.ts              # Supabase client (singleton)
├── auth.ts                  # Auth helpers
├── messaging.ts             # Messaging logic
├── planning.ts              # Planning utilities
├── password-generator.ts    # Secure password utilities
├── database.types.ts        # Generated Supabase types
└── language.ts              # i18n helpers

hooks/
├── useRealtimeMessages.ts
└── useUnreadMessages.ts

contexts/
└── LanguageContext.tsx      # Multi-language support

components/
├── Navigation.tsx           # Global navigation (all pages)
├── Footer.tsx              # Global footer with privacy link
├── planning/               # Year Planning components
├── ui/                     # Reusable UI components
└── [other components]

lib/translations/           # i18n files (en, de, ru, uk)

supabase/
├── migrations/             # Database migrations
└── schema.sql             # Current schema

scripts/
├── seed-users.ts          # Create demo users
├── apply-missing-policies.js  # Apply RLS policies
└── migrate.js             # Migration utilities
```

## Important Rules

1. **Security First**: All data access must use RLS policies
2. **Keep it Simple**: React hooks for state management
3. **TypeScript Strict**: No `any` types (strict mode enforced)
   - Accept nullable types (`string | null`) when optional parameters can be undefined
   - Add null checks in functions before using potentially null values
4. **Environment Variables**: Store sensitive keys in `.env.local` only
5. **Password Security**: Always use `generateSecurePassword()` from `lib/password-generator.ts`
6. **Token-Based Access**: Planning module uses secure tokens for public access
7. **Internationalization**: All UI text must support 4 languages (EN, DE, RU, UK)
8. **No Hardcoded Secrets**: Verify .env.local is in .gitignore before committing
9. **Git Workflow**: Never push to production without explicit user approval
10. **Build Verification**: Test build locally (`npm run build`) before pushing to catch TypeScript errors

## Mobile Responsiveness

**Breakpoint Strategy** (Tailwind defaults):
- `sm:` (640px) - Small phones, fine-grained adjustments
- `md:` (768px) - Primary mobile/tablet boundary
- `lg:` (1024px) - Desktop and larger screens
- `xl:` (1280px) - Large desktop

**Responsive Component Patterns**:

1. **Grids**: Use responsive grid-cols
   - `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (stack mobile, 2 cols tablet, 3 cols desktop)
   - Mobile: 1 column, Tablet+: multiple columns

2. **Flexbox**: Use responsive flex-direction
   - `flex flex-col sm:flex-row` (vertical on mobile, horizontal on sm+)

3. **Spacing**: Use responsive padding/margins
   - `p-3 sm:p-4 lg:p-6` (reduce padding on mobile)

4. **Typography**: Scale text sizes
   - `text-base sm:text-lg` (smaller on mobile)
   - `text-xl sm:text-2xl` (scale up numbers/headings)

5. **Buttons**: Full-width on mobile
   - `w-full sm:w-auto` (full width on mobile, auto on sm+)

6. **Avoid Sticky**: Don't use sticky positioning on mobile
   - Desktop: `lg:sticky lg:top-8` only
   - Mobile: Remove sticky for normal scrolling

## Database Migrations

**Important**: Migrations added to `supabase/migrations/` are tracked in git but must be **applied manually** to the database.

**Workflow**:
1. Create migration file in `supabase/migrations/`
2. Commit and push to GitHub (migrations are NOT automatically applied by Vercel)
3. **Manually apply** migration to Supabase database (via Supabase dashboard or CLI)
4. Add note in commit message if migration is pending application

**Example**: Migration `012_add_public_select_to_planning_groups.sql` was committed but needs manual application.

## Security Checklist

- ✅ .env.local properly gitignored
- ✅ No hardcoded API keys or passwords in code
- ✅ _reviews/ directory excluded from git
- ✅ Scripts use environment variables for sensitive data
- ✅ RLS policies properly configured
- ✅ Service Role key accessed only via environment variables
- ✅ Token generation uses crypto.getRandomValues()
- ✅ .npmrc configured for peer dependency resolution
