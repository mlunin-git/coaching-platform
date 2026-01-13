# Coaching Platform - Development Plan

## Phase 1: MVP (Estimated 3-5 days)

### 1. Project Setup
- [ ] Create GitHub repository
- [ ] Initialize Next.js 15 project
- [ ] Add TypeScript, Tailwind CSS, shadcn/ui
- [ ] Setup environment variables structure
- [ ] Deploy skeleton to Vercel

**Output**: Empty Next.js app deployed to Vercel

---

### 2. Database & Auth Setup
- [ ] Create Supabase project
- [ ] Design database schema:
  - `users` (id, email, role, name, created_at)
  - `clients` (id, coach_id, user_id, name)
  - `tasks` (id, coach_id, title, description, created_at)
  - `client_tasks` (id, client_id, task_id, status, completed_at)
- [ ] Create RLS policies for all tables
- [ ] Setup Supabase client in Next.js

**Output**: Secure database with RLS policies

---

### 3. Authentication System
- [ ] Email/password signup (coach + client registration)
- [ ] Email/password login
- [ ] Session management with Supabase
- [ ] Protected routes middleware
- [ ] Logout functionality

**Pages**:
- `/login` - Login page (both roles use same page)
- `/signup` - Signup with role selection
- `/` - Redirect to dashboard based on role

**Output**: Working auth system, redirects to correct dashboard

---

### 4. Coach Dashboard
- [ ] View list of clients
- [ ] Add new client (email + name)
- [ ] Create task (visible to all clients)
- [ ] View client progress (task completion %)
- [ ] Logout

**Pages**:
- `/coach/clients` - List clients with add form
- `/coach/tasks` - Create tasks, view all tasks
- `/coach/progress` - Client progress tracking

**Output**: Coach can manage everything

---

### 5. Client Dashboard
- [ ] View assigned tasks
- [ ] Mark task as complete/incomplete
- [ ] See task description
- [ ] View completion date
- [ ] Logout

**Pages**:
- `/client/tasks` - List of tasks with checkboxes
- `/client/dashboard` - Quick stats (X of Y tasks completed)

**Output**: Client can see and complete tasks

---

### 6. Styling & UI Polish
- [ ] Consistent design across pages
- [ ] Mobile responsive
- [ ] Dark/light mode (optional, use system preference)
- [ ] Loading states
- [ ] Error messages

**Output**: Professional-looking interface

---

### 7. Testing & Deployment
- [ ] Test all authentication flows
- [ ] Test RLS policies (try to access other coach's data)
- [ ] Test task creation and completion
- [ ] Deploy to Vercel
- [ ] Test in production
- [ ] Create user documentation

**Output**: Production-ready MVP

---

## Database Schema Details

### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'coach' or 'client'
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### clients table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES users(id),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### tasks table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### client_tasks table
```sql
CREATE TABLE client_tasks (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id),
  task_id UUID NOT NULL REFERENCES tasks(id),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed'
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## RLS Policies

### users table
- Users can only read their own profile
- Users can only update their own profile

### clients table
- Coaches can only see their own clients
- Clients can see their own client record

### tasks table
- Coaches can see only their own tasks
- Clients can see all tasks

### client_tasks table
- Coaches can see task completion status for their own clients
- Clients can see and update only their own task statuses

---

## API Endpoints (if needed)

```
POST   /api/auth/signup       - Register new user
POST   /api/auth/login        - Login user
POST   /api/auth/logout       - Logout user
GET    /api/coach/clients     - Get coach's clients
POST   /api/coach/clients     - Add new client
POST   /api/coach/tasks       - Create new task
GET    /api/coach/tasks       - Get coach's tasks
GET    /api/client/tasks      - Get client's tasks
PATCH  /api/client/tasks/:id  - Update task status
```

**Note**: Most operations can be done via Supabase client directly; API routes only needed for complex business logic.

---

## Future Features (Phase 2+)

- [ ] Payment integration (Stripe)
- [ ] Session scheduling (calendar)
- [ ] Email notifications
- [ ] File uploads (documents, images)
- [ ] Progress analytics & reports
- [ ] Coaching notes
- [ ] Email reminders
- [ ] Mobile app (React Native)
- [ ] Two-factor authentication
- [ ] Team management (multiple coaches)

---

## Success Criteria

✅ MVP is done when:
1. User can signup as coach or client
2. Coach can add clients
3. Coach can create tasks
4. All clients see tasks
5. Clients can mark tasks complete
6. Coach can view progress
7. Data is secure (RLS working)
8. Deployed to production
9. No security vulnerabilities
10. Responsive on mobile
