# Deployment Guide

This guide will help you deploy the coaching platform to production.

## Prerequisites

- GitHub account with this repository (push code)
- Supabase account (already created)
- Vercel account (already created)

---

## Step 1: Push Code to GitHub

### 1.1 Create Repository on GitHub

1. Go to https://github.com/new
2. Create a new repository named `coaching-platform`
3. Set it to **Public** (for GitHub Pages)
4. **Do NOT initialize** with README, .gitignore, or license

### 1.2 Push Code to GitHub

In your terminal, from the project directory:

```bash
# Initialize git if not already done
git init

# Add GitHub remote
git remote add origin https://github.com/mlunin-git/coaching-platform.git

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Coaching platform MVP"

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Setup Supabase Database

### 2.1 Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter project name: `coaching-platform`
4. Choose a region (pick closest to you)
5. Create a strong database password
6. Wait 3-5 minutes for creation

### 2.2 Run Database Schema

1. Go to Supabase Dashboard → Project → SQL Editor
2. Click "New Query"
3. Copy entire contents of `supabase/schema.sql`
4. Paste into query editor
5. Click "Run"
6. Wait for completion (you should see "Success")

### 2.3 Get Your Credentials

1. Go to Supabase Dashboard → Project Settings → API
2. Copy:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
3. Save these temporarily - you'll need them for Vercel

---

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select "Import Git Repository"
4. Find and select `coaching-platform` repository
5. Click "Import"

### 3.2 Add Environment Variables

In Vercel project settings:

1. Go to Settings → Environment Variables
2. Add two variables:
   - **NEXT_PUBLIC_SUPABASE_URL**: (paste from Supabase)
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: (paste from Supabase)
3. Click "Save"

### 3.3 Deploy

1. Click "Deploy"
2. Wait 2-5 minutes for build to complete
3. Once complete, you'll get a production URL

**Your app is now live!** 🎉

---

## Step 4: Test Your Application

### 4.1 Test Signup

1. Visit your Vercel URL
2. Click "Sign up here"
3. Select "Coach" as role
4. Enter test data:
   - Name: `Test Coach`
   - Email: `coach@test.com`
   - Password: `TestPassword123!`
5. Click "Create Account"

### 4.2 Test Coach Dashboard

1. You should be redirected to `/coach/clients`
2. Add a test client:
   - Name: `Test Client`
   - Email: `client@test.com`
3. Click "Add Client"

### 4.3 Test Task Creation

1. Go to Coach Tasks page
2. Create a test task:
   - Title: `Complete Module 1`
   - Description: `Watch all videos and complete exercises`
3. Click "Create Task"

### 4.4 Test Client Login

1. Open an incognito/private window
2. Go to your Vercel URL
3. Sign in with:
   - Email: `client@test.com`
   - Password: `TestPassword123!` (temporary - reset needed)
4. You should see the task you created
5. Try checking it off

---

## Step 5: Post-Deployment Checklist

- [ ] Database schema created successfully
- [ ] Vercel environment variables configured
- [ ] Signup works for both coaches and clients
- [ ] Coaches can add clients
- [ ] Coaches can create tasks
- [ ] Tasks appear for all clients
- [ ] Clients can mark tasks complete
- [ ] Progress bar updates correctly

---

## Troubleshooting

### Build fails on Vercel

**Error**: "Cannot find module '@supabase/supabase-js'"

**Solution**:
1. Make sure `package.json` is in root directory
2. Run `npm install` locally first
3. Commit and push `package-lock.json`

### Tasks don't appear for clients

**Error**: Client sees empty task list

**Solution**:
1. Check that client was added to coach's account
2. Verify coach created tasks after adding client
3. Check Supabase RLS policies are enabled
4. Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Can't login after signup

**Error**: "Login failed"

**Solution**:
1. Wait 5 seconds after signup (email confirmation)
2. Try the temporary password again
3. Check email for confirmation link
4. Verify email/password are correct

### Environment variables not working

**Error**: "Missing Supabase environment variables"

**Solution**:
1. Go to Vercel → Settings → Environment Variables
2. Verify both variables are set
3. Redeploy project after adding variables
4. Wait 2 minutes for changes to take effect

---

## Making Updates

Every time you update code:

1. Make changes locally
2. Test with `npm run dev`
3. Commit: `git commit -m "Your message"`
4. Push: `git push origin main`
5. Vercel automatically redeploys
6. Wait 2-5 minutes for deployment

---

## Environment Variables Reference

```bash
# .env.local (for local development)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These are PUBLIC keys - it's safe to use them in frontend code. They only have read/write permissions defined by RLS policies.

---

## Support

If you get stuck:

1. Check Vercel logs: Project → Deployments → expand failed deployment
2. Check Supabase logs: Project → Logs → Recent
3. Check browser console: Right-click → Inspect → Console tab
4. Read error messages carefully - they usually tell you what's wrong
