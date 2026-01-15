# Coaching Platform - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase

#### Create Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Get your credentials from Project Settings > API

#### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

### 3. Apply Database Migrations

Apply migrations via Supabase Dashboard or CLI:
```bash
supabase db push
```

### 4. Seed Default Users (Optional)

Create demo users for testing:

```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run seed script
npx ts-node scripts/seed-users.ts
```

**Demo Credentials:**
- Coach: `coach@example.com` / `demo123`
- Client: `client@example.com` / `demo123`

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

✅ **Multi-language Support**
- German (default) and English
- Language switcher in header

✅ **Authentication**
- Email/password for coaches and clients
- Supabase Auth integration

✅ **Coach Features**
- Manage clients
- Create and assign tasks
- Real-time messaging
- View client progress

✅ **Client Features**
- View assigned tasks
- Track progress
- Mark tasks complete
- Real-time messaging with coach

✅ **Real-time Messaging**
- WebSocket via Supabase Realtime
- Unread message notifications
- Auto-mark as read
- Support for non-authenticated clients

✅ **Security**
- Row-Level Security (RLS) policies
- All data isolated by user/coach-client relationship
- No direct user-to-user messaging

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (coach)/           # Coach dashboard
│   │   ├── clients/       # Client management
│   │   └── messages/      # Messaging interface
│   ├── (client)/          # Client dashboard
│   │   ├── tasks/         # Task list
│   │   └── messages/      # Messaging interface
│   └── layout.tsx         # Root layout with i18n provider
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── messaging.ts       # Message operations
│   ├── language.ts        # i18n utilities
│   └── translations/      # Language JSON files
├── hooks/
│   ├── useUnreadMessages.ts
│   └── useRealtimeMessages.ts
├── contexts/
│   └── LanguageContext.tsx # i18n context
└── supabase/
    └── migrations/        # Database migrations
```

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

---

## Database Schema

### Tables
- `users` - User profiles (coaches and clients)
- `clients` - Coach-client relationships
- `tasks` - Tasks created by coaches
- `client_tasks` - Task assignments with status
- `messages` - Messages between coach and client

### Security
- All tables have RLS (Row-Level Security) enabled
- Coaches can only access their own data
- Clients can only access their own data
- Non-authenticated clients have limited access

---

## Language Support

### Supported Languages
- 🇩🇪 German (default)
- 🇬🇧 English

### Adding Translations
1. Add keys to `lib/translations/de.json` and `lib/translations/en.json`
2. Use `useLanguage()` hook in components:
   ```tsx
   const { t } = useLanguage();
   return <div>{t("common.logout")}</div>;
   ```

---

## Troubleshooting

### "Missing SUPABASE_SERVICE_KEY"
- Get service key from Supabase Dashboard > Settings > API
- Add to `.env.local`

### "Users already exist"
- Safe to run seed script multiple times
- It skips existing users

### "Authentication failed"
- Check credentials in `.env.local`
- Verify project is accessible from your IP

---

## Next Steps

1. ✅ Setup complete!
2. Login with demo credentials or create your account
3. Add clients and create tasks
4. Try real-time messaging
5. Switch between German and English

Enjoy! 🚀
