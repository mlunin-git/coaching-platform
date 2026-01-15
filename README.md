# Coaching Platform MVP

Simple, secure coaching platform where coaches manage clients and track their progress through tasks.

## Project Overview

**What it does:**
- Coaches create tasks that all clients see
- Clients view their tasks and mark them as complete
- Coaches track client progress
- Coaches create planning groups for collaborative year planning
- Participants can join planning groups via shareable links (no login required)
- Groups can submit ideas, vote, create events, and view analytics
- Full security with Row-Level Security (RLS) policies

**Who uses it:**
- **Coaches**: Manage clients, create tasks, view progress, create planning groups
- **Clients**: See assigned tasks, update status, message coach
- **Participants**: Join planning groups, submit ideas, vote, attend events

## Tech Stack

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Auth**: Email/Password + Row-Level Security
- **Hosting**: Vercel (frontend) + Supabase (backend)
- **Cost**: Free tier ($0/month for 10-20 clients)

## Project Structure

```
coaching-platform/
├── SETUP.md          # Account creation guide
├── CLAUDE.md         # Instructions for Claude Code
├── PROJECT_PLAN.md   # Development roadmap
├── app/              # Next.js frontend
├── lib/              # Shared utilities
├── supabase/         # Database migrations & types
├── public/           # Static assets
└── package.json      # Dependencies
```

## Quick Start

1. **Setup**: Follow [SETUP.md](./SETUP.md) to create accounts
2. **Development**: I will create repository and environment configuration
3. **Deploy**: Push to GitHub → automatic deployment to Vercel

## Database Schema

### users
- id, email, password_hash, role (coach|client), name

### clients
- id, coach_id, user_id, name

### tasks
- id, coach_id, title, description, created_at, updated_at

### client_tasks
- id, client_id, task_id, status (pending|completed), completed_at

## Security

- All data access controlled via Row-Level Security (RLS)
- Coaches can only see their own clients and tasks
- Clients can only see their own tasks
- Passwords hashed and never exposed
- HTTPS enforced on all connections

## Development Timeline

**Phase 1 (MVP)**: 3-5 days
- User authentication (coach + client)
- Admin dashboard (view clients, create tasks)
- Client dashboard (view tasks, mark complete)
- Basic styling

**Phase 2 (Later)**
- Payment integration
- Session scheduling
- Notifications
- Advanced analytics

## Status

Currently: Planning & Setup
Next: Repository creation & environment configuration
