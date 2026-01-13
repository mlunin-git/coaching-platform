# GitHub Setup Guide

## Quick Start

This guide walks you through getting the code on GitHub for the first time.

---

## What You'll Do

1. Create a GitHub repository
2. Push your local code to GitHub
3. Setup automatic deployment with Vercel

---

## Step 1: Create GitHub Repository

### Via GitHub Website

1. Go to https://github.com/new
2. Enter:
   - **Repository name**: `coaching-platform`
   - **Description**: "Simple and secure coaching platform"
   - **Privacy**: Public
3. **Skip** initializing with README, .gitignore, license
4. Click "Create repository"

You'll see a setup page with commands. **Don't close this!**

---

## Step 2: Push Code to GitHub

Copy and run these commands in your terminal (in your project folder):

```bash
# If you haven't already, initialize git
git init

# Add your GitHub repository as remote
git remote add origin https://github.com/mlunin-git/coaching-platform.git

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Coaching platform MVP with Next.js, Supabase, and authentication"

# Rename branch to main (GitHub default)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Done!** Your code is now on GitHub.

You can verify by visiting:
https://github.com/mlunin-git/coaching-platform

---

## Step 3: Verify on GitHub

1. Go to your repository URL
2. You should see all the project files listed
3. Check that `.env.local` is **NOT** listed (it's in `.gitignore`)

---

## Step 4: Setup for Automatic Deployment

Once your code is on GitHub, Vercel can automatically deploy every time you push.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

**Key points**:
- Connect GitHub to Vercel
- Add environment variables in Vercel settings
- Every `git push` automatically redeploys

---

## Making Future Updates

After the initial setup, updating is simple:

```bash
# Make your changes to code files
# Then:

git add .
git commit -m "Your change description"
git push origin main

# Vercel automatically redeploys in 2-5 minutes
```

---

## Helpful Commands

```bash
# Check git status (what's changed/staged)
git status

# View recent commits
git log --oneline

# Add specific file instead of all
git add file.tsx
git add app/page.tsx

# See what changed before committing
git diff

# See what's staged
git diff --cached
```

---

## Troubleshooting

### "Repository not found"

**Error**: `fatal: Repository not found`

**Solution**:
1. Check you're using correct GitHub username
2. Verify remote URL: `git remote -v`
3. Fix if needed: `git remote set-url origin https://github.com/mlunin-git/coaching-platform.git`

### "Permission denied (publickey)"

**Error**: `Permission denied (publickey). fatal: Could not read from remote repository`

**Solution**:
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: Settings → SSH and GPG keys → New SSH key
3. Or use HTTPS instead of SSH

### Git won't let me push

**Error**: `Updates were rejected because the tip of your current branch is behind its remote counterpart`

**Solution**:
```bash
# Pull changes first
git pull origin main

# Then push
git push origin main
```

---

## What Each File Does

| File | Purpose |
|------|---------|
| `package.json` | Lists npm dependencies |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `app/` | Next.js pages and layouts |
| `lib/` | Helper functions (auth, database, utils) |
| `public/` | Static files (images, etc) |
| `.gitignore` | Files NOT to push to GitHub |

---

## Important: Don't Commit These Files

These are already in `.gitignore`:
- `.env.local` - Has secret API keys
- `node_modules/` - Dependencies (reinstalled from package.json)
- `.next/` - Build artifacts
- `*.pem` - Certificate files

**NEVER manually commit these!**

---

## Next Steps

1. ✅ Code is on GitHub
2. Read [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Deploy to Vercel
4. Test on production
5. Share your app! 🚀
