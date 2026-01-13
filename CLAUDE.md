# Coaching Platform - Claude Code Instructions

## Project Context

This is a **coaching platform MVP** being built from scratch. The goal is to create a simple, secure platform where:
- Coaches manage clients and create tasks
- Clients view and complete their tasks
- All data is secure using Row-Level Security (RLS)

## Tech Stack Decision

- **Frontend**: Next.js 15 (TypeScript, React, Tailwind CSS)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Hosting**: Vercel (frontend) + Supabase (backend)
- **Database**: PostgreSQL with RLS policies
- **No customization needed**: All tasks/UI are static across clients

## Development Phases

### Phase 1: MVP (Weeks 1-2)
1. Create GitHub repository with Next.js + Supabase boilerplate
2. Setup authentication (email/password for coach and clients)
3. Build Supabase tables: users, clients, tasks, client_tasks
4. Create RLS policies for data isolation
5. Build UI:
   - Login page
   - Coach dashboard (clients list, create tasks, view progress)
   - Client dashboard (view tasks, mark complete)
6. Deploy to Vercel + Supabase
7. Test all security policies

### Phase 2: Future Enhancements (Not yet)
- Payment integration (Stripe)
- Session scheduling
- Email notifications
- Progress analytics
- File upload for submissions

## Code Standards

- TypeScript everywhere (strict mode)
- Tailwind CSS for styling
- No custom CSS files
- Use shadcn/ui components where appropriate
- Simple, readable code over complex abstractions
- All database queries use Supabase client
- RLS policies enforced at database layer

## File Organization

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (coach)/           # Coach dashboard (protected)
│   │   ├── layout.tsx
│   │   ├── clients/page.tsx
│   │   └── tasks/page.tsx
│   ├── (client)/          # Client dashboard (protected)
│   │   ├── layout.tsx
│   │   └── tasks/page.tsx
│   ├── api/               # API routes (if needed)
│   └── layout.tsx         # Root layout
├── lib/
│   ├── supabase.ts        # Supabase client initialization
│   ├── auth.ts            # Authentication helpers
│   └── utils.ts           # Shared utilities
├── components/
│   ├── ui/                # Reusable UI components
│   └── dashboard/         # Dashboard-specific components
└── types/
    └── database.ts        # Database type definitions
```

## Important Rules

1. **Security First**: All data access must use RLS. Never trust client-side security.
2. **Keep it Simple**: No state management libraries yet (React hooks are enough)
3. **No Bloat**: Only write code for MVP features
4. **TypeScript Strict**: Enable strict mode, no `any` types
5. **Environment Variables**: Store Supabase keys in `.env.local`
6. **No External APIs**: Use only Supabase for backend
7. **Clean Commits**: Meaningful commit messages, one feature per commit

## Testing Checklist

Before deploying each feature:
- [ ] Authentication works (signup/login both roles)
- [ ] Coach can create tasks
- [ ] All clients see new tasks
- [ ] Client can mark task complete
- [ ] Coach sees updated progress
- [ ] RLS policies prevent cross-client data access
- [ ] No console errors in browser
- [ ] Responsive on mobile

## Deployment Process

1. Push to GitHub
2. Vercel auto-deploys from GitHub
3. Supabase migrations applied via CLI
4. Test on production environment
5. Share staging/production URLs

## Communication

- Use clear, concise messages
- Ask questions before making assumptions
- Provide context when reporting issues
- Include specific file paths and line numbers in discussions

## Getting Help

If anything is unclear:
1. Check this document first
2. Review code comments for context
3. Ask specific questions about requirements
4. Request code review for security concerns
