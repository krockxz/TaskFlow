<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# 📋 Product Requirements Document

## Async Team Coordination Hub - MVP (Simple Version)


***

## 1. PROJECT OVERVIEW

**Name:** TaskFlow - Async Team Notifications

**Problem:** Remote teams can't track when work is ready to be handed off across timezones. Work gets siloed.

**Solution:** Simple pub/sub notification system that alerts team members when tasks need their input.

**Tech Stack (ALL FREE):**

- **Frontend:** Next.js + TypeScript
- **Backend:** Node.js + Express
- **Pub/Sub:** Redis (free tier or self-hosted)
- **Database:** PostgreSQL (free tier: Render, Railway, or local)
- **Hosting:** Vercel (frontend - free), Railway/Render (backend - free tier)

***

## 2. CORE FEATURES (MVP ONLY)

### Feature 1: Create \& Assign Tasks

```
User can:
- Create a task with title + description
- Assign to team members
- Set status: "open" → "in_progress" → "ready_for_review" → "done"
- Set priority: Low/Medium/High
```


### Feature 2: Task Status Change Notifications

```
When task status changes:
- Publish event to Redis pub/sub
- Notify assigned user in real-time (via WebSocket)
- Show toast notification: "Task X is ready for your review"
```


### Feature 3: Task Dashboard

```
Simple table showing:
- Task name
- Status
- Assigned to
- Priority
- Last updated
- Single click to update status
```


### Feature 4: Real-Time Updates

```
Use WebSocket to:
- Subscribe to task events
- Auto-update dashboard when teammate changes status
- Show live notification when task needs attention
```


### Feature 5: Simple Notification Log

```
Show last 10 notifications:
- "Alice marked Task-5 as ready for review - 2 mins ago"
- "Bob completed Task-3 - 15 mins ago"
```


***

## 3. DATABASE SCHEMA (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50), -- "open" | "in_progress" | "ready_for_review" | "done"
  priority VARCHAR(20), -- "low" | "medium" | "high"
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Task events (for audit trail)
CREATE TABLE task_events (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  event_type VARCHAR(50), -- "created" | "assigned" | "status_changed" | "completed"
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```


***

## 4. BACKEND API ENDPOINTS (Node.js + Express)

### Authentication

```
POST /auth/register
  Body: { name, email, password }
  Response: { token, user }

POST /auth/login
  Body: { email, password }
  Response: { token, user }
```


### Tasks

```
GET /api/tasks
  Response: [{ id, title, status, assignedTo, priority, updatedAt }]

POST /api/tasks
  Body: { title, description, assignedTo, priority }
  Response: { id, title, ... }

PATCH /api/tasks/:id
  Body: { status } OR { priority } OR { assignedTo }
  Response: { updated task }

GET /api/tasks/:id
  Response: { task details + full event history }
```


### Notifications

```
GET /api/notifications
  Response: [{ id, message, taskId, createdAt, read }]

PATCH /api/notifications/:id
  Body: { read: true }
  Response: { notification }
```


### WebSocket (Socket.io)

```
SUBSCRIBE: "task:updates"
  Server sends: { taskId, newStatus, changedBy, timestamp }

PUBLISH: "task:status-changed"
  Client sends: { taskId, newStatus }
```


***

## 5. FRONTEND (Next.js) - PAGE STRUCTURE

### Pages to Build

**1. `/login`**

- Email + Password input
- Sign up link
- Simple form

**2. `/dashboard`** (Main Page)

- Table of all tasks
- Columns: Title | Status | Assigned To | Priority | Updated
- Click status to open modal and change it
- Real-time updates (WebSocket)

**3. `/tasks/new`**

- Form to create task
- Title, Description, Assign To (dropdown), Priority
- Submit button

**4. `/tasks/:id`**

- Full task details
- Description
- Event history (who changed what, when)
- Status change buttons (dropdown)
- Notification log for this task

**5. `/notifications`** (Optional)

- List of recent notifications
- Mark as read checkbox
- Link to task

***

## 6. CORE FLOW (User Journey)

```
1. Alice logs in → sees dashboard
2. Alice creates "Design homepage" task, assigns to Bob
3. System publishes event: "task:created"
4. Event stored in task_events table
5. Notification created: "Alice created task for you"
6. Bob's dashboard updates in real-time (WebSocket)
7. Bob sees toast: "New task: Design homepage"
8. Bob clicks task, reads details
9. Bob changes status to "in_progress"
10. System publishes: "task:status_changed"
11. Alice gets notification: "Bob started Design homepage"
12. Alice's dashboard updates real-time
```


***

## 7. REDIS PUB/SUB ARCHITECTURE (SIMPLE)

```
Redis Channel: "tasks"

When task status changes:
1. Backend publishes: { taskId, newStatus, changedBy, timestamp }
2. All connected WebSocket clients subscribed to "tasks" receive it
3. Frontend updates UI without page reload

Message Format:
{
  "type": "task:status_changed",
  "taskId": "uuid",
  "newStatus": "ready_for_review",
  "changedBy": "alice",
  "timestamp": 1705262000
}
```


***

## 8. IMPLEMENTATION PRIORITY (Build in This Order)

### Phase 1: Basic Setup (Day 1)

- [ ] Create Next.js project
- [ ] Create Express backend
- [ ] Set up PostgreSQL schema
- [ ] Set up Redis connection


### Phase 2: Auth \& Database (Day 2)

- [ ] User registration/login
- [ ] JWT tokens
- [ ] Create task CRUD endpoints
- [ ] Query tasks from DB


### Phase 3: Frontend Dashboard (Day 3)

- [ ] Task table component
- [ ] Create task form
- [ ] Status update dropdown
- [ ] Real-time table refresh (polling first, WebSocket later)


### Phase 4: Real-Time Updates (Day 4)

- [ ] Set up Socket.io on backend
- [ ] Connect WebSocket from Next.js
- [ ] Publish task changes to Redis
- [ ] Subscribe to updates, auto-refresh dashboard


### Phase 5: Notifications (Day 5)

- [ ] Store notifications in DB
- [ ] Display notification toast
- [ ] Notification log page
- [ ] Mark as read functionality

***

## 9. FREE HOSTING SETUP

### Frontend (Vercel)

```bash
npm i -g vercel
vercel deploy
# Automatic deployment from GitHub
```


### Backend (Railway or Render)

```
1. Push code to GitHub
2. Connect Railway/Render
3. Add env vars (DATABASE_URL, REDIS_URL, JWT_SECRET)
4. Deploy
```


### Database (PostgreSQL)

**Options:**

- **Railway.app** - Free tier: 5GB PostgreSQL
- **Render.com** - Free tier: PostgreSQL included
- **Local PostgreSQL** - Free, run locally


### Redis

**Options:**

- **Redis Cloud** - Free tier: 30MB
- **Upstash.com** - Free tier: 10K commands/day (enough for MVP)
- **Local Redis** - Free, run locally with Docker

***

## 10. ENVIRONMENT VARIABLES

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# Backend (.env)
PORT=3001
DATABASE_URL=postgresql://user:password@localhost/taskflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
NODE_ENV=development
```


***

## 11. WHAT NOT TO BUILD (Keep It Simple)

❌ Email notifications (use toast instead)
❌ Timezone calculations
❌ Vector clocks / causality tracking
❌ CRDTs / offline support
❌ Event sourcing
❌ Real audit trail
❌ User permissions/roles
❌ Comments on tasks
❌ File attachments
❌ Advanced filtering
❌ Analytics dashboard
❌ Mobile app

***

## 12. SUCCESS CRITERIA (MVP DONE WHEN)

✅ Users can register + login
✅ Create tasks and assign to teammates
✅ Task status changes in real-time across all users
✅ Toast notification appears when task status changes
✅ Dashboard shows all tasks with live updates
✅ Notification log shows recent changes
✅ Deploy to Vercel (frontend) + Railway (backend)
✅ Works with 5+ concurrent users

***

## 13. SAMPLE CODE STRUCTURE

```
frontend (Next.js)
├── app/
│   ├── page.tsx (redirect to /dashboard)
│   ├── login/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── TaskTable.tsx
│   │       ├── TaskModal.tsx
│   │       └── NotificationToast.tsx
│   └── tasks/
│       ├── new/
│       │   └── page.tsx
│       └── [id]/
│           └── page.tsx
├── lib/
│   ├── api.ts (fetch helpers)
│   ├── socket.ts (WebSocket client)
│   └── auth.ts (token management)
└── public/

backend (Express)
├── src/
│   ├── index.ts (main server)
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   └── notifications.ts
│   ├── controllers/
│   │   ├── taskController.ts
│   │   └── authController.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── services/
│   │   ├── redisService.ts
│   │   └── taskService.ts
│   └── types/
│       └── index.ts
└── .env
```


***

## 14. QUICK START COMMANDS

```bash
# Frontend
npx create-next-app@latest taskflow --typescript
cd taskflow
npm install socket.io-client axios
npm run dev

# Backend
mkdir backend
cd backend
npm init -y
npm install express socket.io redis pg dotenv cors
npm install -D typescript ts-node @types/node
npm run dev

# Database (local PostgreSQL)
createdb taskflow
psql taskflow < schema.sql

# Redis (local)
redis-server
```


***

## 15. ESTIMATED TIME

- **Days 1-2:** Setup + Auth
- **Days 3-4:** Dashboard + CRUD
- **Days 5:** Real-time WebSocket
- **Days 6:** Notifications + Polish
- **Days 7:** Deploy + Testing

**Total: ~1 week for MVP**

***

## 16. WHAT TO TELL CLAUDE WHEN BUILDING

When you use Claude to code, say:

*"I want to build a simple task notification system. Use Next.js frontend, Express backend, PostgreSQL, Redis. Start with auth, then task CRUD, then real-time WebSocket updates. Keep it minimal - just tasks, status changes, and real-time notifications. No advanced features."*

Then ask for:

1. Express backend setup with API routes
2. Next.js dashboard with task table
3. Socket.io integration for real-time updates
4. PostgreSQL schema + migrations

***

**This PRD is ready to hand to Claude AI for implementation. It's simple, free, and shippable in 1 week.** 🚀

