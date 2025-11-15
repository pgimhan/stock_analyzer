# 🔐 Authentication System - Stock Analyzer

Complete authentication system using **NextAuth.js v5** + **Neon PostgreSQL** + **Drizzle ORM**, optimized for **Vercel** deployment.

## 🚀 Quick Start

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL and AUTH_SECRET

# 2. Create database tables
npm run db:push

# 3. Start development
npm run dev
```

Visit http://localhost:5000/register to create your first account!

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** | ✅ Step-by-step setup guide |
| **[QUICKSTART.md](QUICKSTART.md)** | ⚡ Get started in 3 steps |
| **[AUTH_SETUP.md](AUTH_SETUP.md)** | 📖 Detailed configuration guide |
| **[AUTH_FLOW.md](AUTH_FLOW.md)** | 🔄 Visual flow diagrams |
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | 📊 Technical implementation details |

## ✨ Features

- ✅ **User Registration** - Email & password signup
- ✅ **User Login** - Secure authentication
- ✅ **Session Management** - JWT-based sessions
- ✅ **Protected Routes** - Route guards for authenticated pages
- ✅ **User Profile** - Display logged-in user info
- ✅ **Password Security** - bcrypt hashing (10 rounds)
- ✅ **Vercel Ready** - Optimized for serverless deployment
- ✅ **PostgreSQL** - Neon serverless database
- ✅ **Type Safe** - Full TypeScript support

## 🛠️ Tech Stack

### Backend
- **NextAuth.js v5** - Authentication framework
- **Drizzle ORM** - Type-safe database queries
- **Neon PostgreSQL** - Serverless database
- **bcrypt** - Password hashing
- **Express** - API server

### Frontend
- **React 18** - UI framework
- **TanStack Query** - Data fetching
- **Wouter** - Lightweight routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## 📁 Project Structure

```
StockAnalyzer/
├── 📄 Documentation
│   ├── SETUP_CHECKLIST.md      # Setup guide
│   ├── QUICKSTART.md            # Quick start
│   ├── AUTH_SETUP.md            # Detailed docs
│   ├── AUTH_FLOW.md             # Flow diagrams
│   └── IMPLEMENTATION_SUMMARY.md # Technical details
│
├── 🗄️ Database
│   ├── shared/db-schema.ts      # Database schema
│   ├── server/db.ts             # DB connection
│   └── drizzle.config.ts        # Drizzle config
│
├── 🔐 Authentication
│   ├── server/auth.ts           # NextAuth config
│   ├── server/routes.ts         # Auth API routes
│   └── client/src/lib/auth.ts   # Auth utilities
│
├── 🎨 UI Components
│   ├── client/src/pages/Login.tsx
│   ├── client/src/pages/Register.tsx
│   ├── client/src/components/UserMenu.tsx
│   ├── client/src/components/ProtectedRoute.tsx
│   └── client/src/hooks/useAuth.ts
│
└── 🔧 Configuration
    ├── .env                     # Environment variables
    ├── .env.example             # Example env file
    └── vercel.json              # Vercel config
```

## 🎯 Usage Examples

### Check if User is Logged In

```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;
  
  return <div>Welcome {user.name}!</div>;
}
```

### Protect a Route

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

<Route path="/dashboard">
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
</Route>
```

### Add User Menu

```tsx
import { UserMenu } from "@/components/UserMenu";

function Header() {
  return (
    <header className="flex justify-between p-4">
      <h1>Stock Analyzer</h1>
      <UserMenu />
    </header>
  );
}
```

### Manual Auth Operations

```tsx
import { signIn, signUp, signOut } from "@/lib/auth";

// Register
await signUp("user@example.com", "password123", "John Doe");

// Login
await signIn("user@example.com", "password123");

// Logout
await signOut();
```

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema to database
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio
npm run db:check         # Check database status

# Type checking
npm run check            # TypeScript type check
```

## 🌐 Deployment to Vercel

### 1. Environment Variables

Add these in Vercel dashboard:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=your_secret_key
AUTH_URL=https://your-app.vercel.app
```

### 2. Deploy

```bash
git push origin main
```

Vercel will automatically deploy on push.

### 3. Database Setup

After first deployment, run:

```bash
npm run db:push
```

Or enable automatic migrations in your build command.

## 🔒 Security Features

- ✅ **Password Hashing** - bcrypt with 10 rounds
- ✅ **JWT Tokens** - Signed with secret key
- ✅ **HTTP-Only Cookies** - Protected from XSS
- ✅ **CSRF Protection** - Built into NextAuth
- ✅ **SQL Injection Protection** - Drizzle ORM parameterized queries
- ✅ **SSL/TLS** - Encrypted database connections

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE "user" (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR,
  name VARCHAR,
  emailVerified TIMESTAMP,
  image VARCHAR
);
```

### Sessions Table
```sql
CREATE TABLE "session" (
  sessionToken VARCHAR PRIMARY KEY,
  userId VARCHAR NOT NULL REFERENCES "user"(id),
  expires TIMESTAMP NOT NULL
);
```

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check database status
npm run db:check

# Verify .env file
cat .env | grep DATABASE_URL
```

### Authentication Not Working
```bash
# Verify AUTH_SECRET is set
cat .env | grep AUTH_SECRET

# Clear browser cookies
# Try incognito mode
```

### Tables Don't Exist
```bash
# Push schema to database
npm run db:push
```

## 🎓 Learning Resources

- [NextAuth.js Documentation](https://authjs.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Neon Documentation](https://neon.tech/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 🔄 What's Next?

### Recommended Enhancements
- [ ] Add email verification
- [ ] Add password reset functionality
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Add user profile page
- [ ] Add role-based access control (RBAC)
- [ ] Add 2FA authentication
- [ ] Add remember me functionality
- [ ] Add account deletion
- [ ] Add password strength requirements
- [ ] Add rate limiting

### Example: Add Google OAuth

1. Install provider:
```bash
npm install @auth/core
```

2. Update `server/auth.ts`:
```tsx
import Google from "next-auth/providers/google";

providers: [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  Credentials({ /* ... */ }),
]
```

3. Add to `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

## 📞 Support

- Check documentation files in the project root
- Review `AUTH_FLOW.md` for visual diagrams
- Verify environment variables are set correctly
- Ensure database is accessible

## 📝 License

MIT

---

**Built with ❤️ for Stock Analyzer**

Ready to add authentication to your stock analysis application!
