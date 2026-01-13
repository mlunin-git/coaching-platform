# Quick Reference Card

**Coaching Platform MVP** - All the commands and info you need in one place.

---

## Accounts & Links

| Service | What | Link |
|---------|------|------|
| **GitHub** | Code hosting | https://github.com/mlunin-git/coaching-platform |
| **Supabase** | Database | https://app.supabase.com |
| **Vercel** | Hosting | https://vercel.com/dashboard |
| **Local Dev** | Development | http://localhost:3000 |

---

## Installation & Running

```bash
# First time setup
npm install

# Start development server
npm run dev

# Check for errors
npm run type-check

# Format code
npm run lint
```

---

## Database Setup (First Time Only)

```sql
-- Copy entire contents of supabase/schema.sql
-- Go to Supabase → SQL Editor → New Query
-- Paste and run
-- Wait for "Success" message
```

---

## Environment Variables

```bash
# Create file: .env.local

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get from: Supabase → Settings → API

---

## Git Workflow

```bash
# First time (setup)
git init
git remote add origin https://github.com/mlunin-git/coaching-platform.git
git branch -M main

# Every update
git add .
git commit -m "Your message"
git push origin main

# Check status
git status
git log --oneline
```

---

## App Routes

### Coach Routes
| Route | Purpose |
|-------|---------|
| `/login` | Sign in page |
| `/signup` | Create account |
| `/coach/clients` | Manage clients |
| `/coach/tasks` | Create tasks |

### Client Routes
| Route | Purpose |
|-------|---------|
| `/login` | Sign in page |
| `/signup` | Create account |
| `/client/tasks` | View & complete tasks |

### Special Routes
| Route | Purpose |
|-------|---------|
| `/` | Redirect (home) |
| `/api/*` | API routes (future use) |

---

## File Locations

```
app/
├── (auth)/
│   ├── login/page.tsx        # Login page
│   └── signup/page.tsx       # Signup page
├── (coach)/
│   ├── layout.tsx            # Coach layout
│   ├── clients/page.tsx      # Manage clients
│   └── tasks/page.tsx        # Create tasks
├── (client)/
│   ├── layout.tsx            # Client layout
│   └── tasks/page.tsx        # View tasks
├── layout.tsx                # Root layout
└── page.tsx                  # Home (redirects)

lib/
├── supabase.ts              # Database client
├── auth.ts                  # Auth functions
├── database.types.ts        # Types
└── utils.ts                 # Utilities

supabase/
└── schema.sql               # Database schema
```

---

## Database Tables

```
users
├── id (UUID, Primary Key)
├── email (String, Unique)
├── role (coach | client)
├── name (String)
└── created_at (Timestamp)

clients
├── id (UUID, Primary Key)
├── coach_id (FK → users)
├── user_id (FK → users)
├── name (String)
└── created_at (Timestamp)

tasks
├── id (UUID, Primary Key)
├── coach_id (FK → users)
├── title (String)
├── description (Text)
├── created_at (Timestamp)
└── updated_at (Timestamp)

client_tasks
├── id (UUID, Primary Key)
├── client_id (FK → clients)
├── task_id (FK → tasks)
├── status (pending | completed)
├── completed_at (Timestamp)
└── created_at (Timestamp)
```

---

## Deployment Checklist

```
Pre-Deployment:
☐ npm run type-check (no errors)
☐ Test locally (npm run dev)
☐ All tests pass
☐ No console errors

Deploy:
☐ git push origin main
☐ Wait for Vercel build (2-5 min)
☐ Vercel deployment shows green checkmark
☐ Visit production URL
☐ Test signup/login
☐ Test coach flow
☐ Test client flow
☐ Check progress bar works
```

---

## Environment Files

```
.env.local           ← Development secrets (don't commit)
.env.example         ← Template (commit this)
supabase/.env        ← Supabase CLI config (optional)
```

---

## Common Commands

```bash
# Development
npm run dev              # Start server

# Production
npm run build            # Build for production
npm run start            # Start production server

# Quality
npm run lint             # Check code style
npm run type-check       # Check TypeScript errors

# Git
git status              # What changed?
git add .               # Stage all changes
git commit -m "msg"     # Create commit
git push                # Push to GitHub
git log -n 5            # Show recent commits
```

---

## Test User Accounts

```
Coach Account:
- Email: coach@localhost.test
- Password: TestPass123!
- Role: Coach

Client Account:
- Email: client@localhost.test
- Password: TestPass123!
- Role: Client
```

---

## Key Files to Remember

| File | Edit When |
|------|-----------|
| `app/(coach)/clients/page.tsx` | Change coach clients UI |
| `app/(coach)/tasks/page.tsx` | Change task creation UI |
| `app/(client)/tasks/page.tsx` | Change client task UI |
| `lib/auth.ts` | Change authentication logic |
| `supabase/schema.sql` | Add database tables |
| `package.json` | Add new dependencies |
| `.env.local` | Change environment variables |

---

## Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` (Mac/Linux) |
| Module not found | `npm install` |
| TypeScript errors | `npm run type-check` |
| Can't login | Wait 5 seconds, hard refresh (Cmd+Shift+R) |
| Env vars not working | Restart dev server after editing .env.local |

---

## Cost Reference

| Service | Free Tier | Next Tier |
|---------|-----------|----------|
| Vercel | 100 GB bandwidth | $20/month Pro |
| Supabase | 500 MB storage | $25/month |
| GitHub | Unlimited | Free forever |
| Total | **$0/month** | ~$45/month |

---

## Important Links

- Documentation: See `START_HERE.md`
- Getting Started: `GETTING_STARTED.md`
- GitHub Setup: `GITHUB_SETUP.md`
- Deployment: `DEPLOYMENT.md`
- Full Plan: `PROJECT_PLAN.md`
- AI Instructions: `CLAUDE.md`

---

## Before You Start

☐ Node.js 18+ installed
☐ Git installed
☐ GitHub account created
☐ Supabase account created
☐ Vercel account created
☐ Supabase credentials saved

---

**Questions?** Check `START_HERE.md` → specific guide files → error message documentation
