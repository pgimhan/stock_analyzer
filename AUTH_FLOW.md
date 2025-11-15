# Authentication Flow Diagram

## 🔐 Registration Flow

```
User                    Frontend                Backend                 Database
  |                        |                       |                        |
  |--[Fill Register Form]->|                       |                        |
  |                        |                       |                        |
  |--[Submit]------------->|                       |                        |
  |                        |                       |                        |
  |                        |--[POST /api/auth/---->|                        |
  |                        |   register]           |                        |
  |                        |   {email, password}   |                        |
  |                        |                       |                        |
  |                        |                       |--[Check if user]------>|
  |                        |                       |   exists               |
  |                        |                       |<-[No]------------------|
  |                        |                       |                        |
  |                        |                       |--[Hash password]       |
  |                        |                       |   (bcrypt)             |
  |                        |                       |                        |
  |                        |                       |--[Insert user]-------->|
  |                        |                       |<-[User created]--------|
  |                        |                       |                        |
  |                        |<-[Success]------------|                        |
  |<-[Redirect to /]-------|                       |                        |
```

## 🔑 Login Flow

```
User                    Frontend                Backend                 Database
  |                        |                       |                        |
  |--[Fill Login Form]--->|                       |                        |
  |                        |                       |                        |
  |--[Submit]------------->|                       |                        |
  |                        |                       |                        |
  |                        |--[POST /api/auth/---->|                        |
  |                        |   callback/           |                        |
  |                        |   credentials]        |                        |
  |                        |   {email, password}   |                        |
  |                        |                       |                        |
  |                        |                       |--[Find user by]------->|
  |                        |                       |   email                |
  |                        |                       |<-[User data]-----------|
  |                        |                       |                        |
  |                        |                       |--[Compare password]    |
  |                        |                       |   (bcrypt.compare)     |
  |                        |                       |                        |
  |                        |                       |--[Generate JWT]        |
  |                        |                       |   token                |
  |                        |                       |                        |
  |                        |                       |--[Create session]----->|
  |                        |                       |<-[Session saved]-------|
  |                        |                       |                        |
  |                        |<-[JWT token]----------|                        |
  |                        |   (in cookie)         |                        |
  |                        |                       |                        |
  |<-[Redirect to /]-------|                       |                        |
```

## 🛡️ Protected Route Access

```
User                    Frontend                Backend                 Database
  |                        |                       |                        |
  |--[Visit /dashboard]-->|                       |                        |
  |                        |                       |                        |
  |                        |--[useAuth hook]       |                        |
  |                        |                       |                        |
  |                        |--[GET /api/auth/----->|                        |
  |                        |   session]            |                        |
  |                        |   (with JWT cookie)   |                        |
  |                        |                       |                        |
  |                        |                       |--[Verify JWT]          |
  |                        |                       |                        |
  |                        |                       |--[Get session]-------->|
  |                        |                       |<-[Session data]--------|
  |                        |                       |                        |
  |                        |<-[User data]----------|                        |
  |                        |                       |                        |
  |<-[Show Dashboard]------|                       |                        |
  |                        |                       |                        |
  
  If NOT authenticated:
  |                        |                       |                        |
  |                        |<-[null]---------------|                        |
  |<-[Redirect to /login]--|                       |                        |
```

## 🚪 Logout Flow

```
User                    Frontend                Backend                 Database
  |                        |                       |                        |
  |--[Click Logout]------->|                       |                        |
  |                        |                       |                        |
  |                        |--[POST /api/auth/---->|                        |
  |                        |   signout]            |                        |
  |                        |                       |                        |
  |                        |                       |--[Delete session]----->|
  |                        |                       |<-[Deleted]-------------|
  |                        |                       |                        |
  |                        |<-[Clear cookie]-------|                        |
  |                        |                       |                        |
  |<-[Redirect to /login]--|                       |                        |
```

## 🔄 Session Validation (Every Request)

```
Browser                 Frontend                Backend                 Database
  |                        |                       |                        |
  |--[Page Load]---------->|                       |                        |
  |                        |                       |                        |
  |                        |--[useAuth hook]       |                        |
  |                        |   triggers            |                        |
  |                        |                       |                        |
  |                        |--[GET /api/auth/----->|                        |
  |                        |   session]            |                        |
  |                        |   (JWT in cookie)     |                        |
  |                        |                       |                        |
  |                        |                       |--[Decode JWT]          |
  |                        |                       |                        |
  |                        |                       |--[Check expiry]        |
  |                        |                       |                        |
  |                        |                       |--[Validate session]--->|
  |                        |                       |<-[Session valid]-------|
  |                        |                       |                        |
  |                        |<-[User data]----------|                        |
  |                        |                       |                        |
  |--[Render with user]--->|                       |                        |
```

## 📊 Data Flow Summary

### Registration
1. User submits form → Frontend
2. Frontend sends to `/api/auth/register`
3. Backend hashes password (bcrypt)
4. Backend saves user to database
5. User auto-logged in
6. Redirect to home

### Login
1. User submits credentials → Frontend
2. Frontend sends to `/api/auth/callback/credentials`
3. Backend finds user in database
4. Backend compares password hash
5. Backend generates JWT token
6. Token stored in HTTP-only cookie
7. Redirect to home

### Session Check
1. Frontend calls `useAuth()` hook
2. Hook fetches `/api/auth/session`
3. Backend validates JWT from cookie
4. Returns user data or null
5. Frontend updates UI accordingly

### Logout
1. User clicks logout
2. Frontend calls `/api/auth/signout`
3. Backend deletes session
4. Cookie cleared
5. Redirect to login

## 🔒 Security Layers

```
┌─────────────────────────────────────────┐
│  1. HTTPS (in production)               │
│     └─ Encrypted data transmission      │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  2. Password Hashing (bcrypt)           │
│     └─ 10 rounds, salted                │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  3. JWT Tokens                          │
│     └─ Signed with AUTH_SECRET          │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  4. HTTP-Only Cookies                   │
│     └─ Not accessible via JavaScript    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  5. CSRF Protection (NextAuth)          │
│     └─ Built-in token validation        │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  6. SQL Injection Protection            │
│     └─ Drizzle ORM parameterized queries│
└─────────────────────────────────────────┘
```

## 🗄️ Database Schema

```
┌─────────────────────────────────────────┐
│              USER TABLE                 │
├─────────────────────────────────────────┤
│ id              VARCHAR (UUID)          │
│ email           VARCHAR (UNIQUE)        │
│ password        VARCHAR (HASHED)        │
│ name            VARCHAR (NULLABLE)      │
│ emailVerified   TIMESTAMP (NULLABLE)    │
│ image           VARCHAR (NULLABLE)      │
└─────────────────────────────────────────┘
           ↓ (1:N)
┌─────────────────────────────────────────┐
│            SESSION TABLE                │
├─────────────────────────────────────────┤
│ sessionToken    VARCHAR (PK)            │
│ userId          VARCHAR (FK → user.id)  │
│ expires         TIMESTAMP               │
└─────────────────────────────────────────┘
```

## 🎯 Key Components

### Backend
- **NextAuth.js**: Authentication framework
- **Drizzle ORM**: Database queries
- **bcrypt**: Password hashing
- **JWT**: Token generation

### Frontend
- **useAuth hook**: Session state management
- **React Query**: Data fetching & caching
- **Wouter**: Routing
- **Protected Routes**: Access control

### Database
- **Neon PostgreSQL**: Serverless database
- **Connection pooling**: Automatic scaling
- **SSL**: Encrypted connections
