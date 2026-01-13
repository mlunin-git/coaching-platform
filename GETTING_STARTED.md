# Getting Started - Local Development

This guide helps you run the coaching platform on your computer.

---

## Prerequisites

- **Node.js 18+**: Download from https://nodejs.org (use LTS version)
- **Git**: Download from https://git-scm.com
- **A code editor**: VS Code recommended (https://code.visualstudio.com)
- **Supabase account**: Already created ✅
- **Vercel account**: Already created ✅

---

## Installation

### 1. Install Dependencies

```bash
# Navigate to project directory
cd path/to/coaching-platform

# Install all dependencies
npm install

# This may take 2-3 minutes
```

### 2. Setup Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your Supabase keys:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from:
- Login to https://app.supabase.com
- Go to Project Settings → API
- Copy Project URL and Anon Key

---

## Running Locally

```bash
# Start development server
npm run dev

# You should see:
# ▲ Next.js 15.0.0
# - Local:        http://localhost:3000
#
# ✓ Ready in 2.3s

# Open http://localhost:3000 in your browser
```

---

## Testing the App

### Test 1: Create Coach Account

1. Visit http://localhost:3000
2. Redirects to login page
3. Click "Sign up here"
4. Select "Coach"
5. Fill in:
   - Name: `John Coach`
   - Email: `coach@localhost.test`
   - Password: `TestPass123!`
6. Click "Create Account"
7. You should see Coach Dashboard

### Test 2: Add a Client

1. You're on `/coach/clients`
2. Fill in form:
   - Client Name: `Jane Learner`
   - Client Email: `client@localhost.test`
3. Click "Add Client"
4. Client appears in the list

### Test 3: Create a Task

1. Click navigation (if exists) or visit `http://localhost:3000/coach/tasks`
2. Fill in:
   - Task Title: `Week 1 Exercises`
   - Description: `Complete all exercises from module 1`
3. Click "Create Task"
4. Task appears in list

### Test 4: Login as Client

1. Open **new incognito window** (important - keeps sessions separate)
2. Visit http://localhost:3000
3. Click "Sign up here"
4. Select "Client"
5. Use email: `client@localhost.test` (email from Step 2)
6. Use password: `TestPass123!` (the default password we set)
7. Click "Create Account"
8. Client should see the task you created
9. Try checking it off!

### Test 5: Verify as Coach

1. Go back to coach window
2. The client progress should show the task as completed

---

## Useful Commands

```bash
# Stop the development server
# Press Ctrl+C (or Cmd+C on Mac)

# Format code
npm run lint

# Check for TypeScript errors
npm run type-check

# Build for production (optional locally)
npm run build

# Start production build locally (for testing)
npm run start
```

---

## File Structure Explained

```
coaching-platform/
├── app/                    # All pages and layouts
│   ├── (auth)/            # Login/signup pages
│   ├── (coach)/           # Coach dashboard pages
│   ├── (client)/          # Client dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage (redirects)
├── lib/                    # Helper functions
│   ├── supabase.ts        # Database client
│   ├── auth.ts            # Authentication functions
│   ├── database.types.ts  # TypeScript types
│   └── utils.ts           # Utilities
├── public/                 # Static files
├── supabase/              # Database schema
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind config
└── next.config.ts         # Next.js config
```

---

## Common Issues

### "Module not found" Error

**Error**: `Error: Cannot find module 'next'`

**Solution**:
```bash
npm install
```

Run this to reinstall all dependencies.

### Port 3000 Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill the process on port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Missing Supabase environment variables"

**Error**: Shows up when visiting the app

**Solution**:
1. Check `.env.local` exists in project root
2. Verify it has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Restart dev server: Stop with Ctrl+C, run `npm run dev` again

### Can't Login

**Error**: "Login failed" message

**Solution**:
1. Make sure you used correct email/password
2. Check email is exactly the same as signup
3. Wait 5 seconds after signup
4. Hard refresh page: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## Next Steps

Once local development works:

1. Read [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Push code to GitHub
2. Read [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to production
3. Share your live app!

---

## Asking for Help

When something doesn't work:

1. Check the error message carefully
2. Look in this guide's "Common Issues" section
3. Check browser console: Right-click → Inspect → Console tab
4. Include error message when asking for help
