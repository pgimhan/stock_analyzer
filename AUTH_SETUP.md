# Authentication Setup Guide

## Prerequisites
- Neon Database account (https://neon.tech)
- Node.js installed

## Setup Steps

### 1. Configure Environment Variables

Update your `.env` file with:

```env
# Database - Get this from your Neon dashboard
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# NextAuth - Generate a secret key
AUTH_SECRET=your_secret_key_here
AUTH_URL=http://localhost:5000
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Push Database Schema

Run this command to create the authentication tables in your Neon database:

```bash
npm run db:push
```

This creates:
- `user` table (id, name, email, password, emailVerified, image)
- `account` table (for OAuth providers)
- `session` table (for session management)
- `verificationToken` table (for email verification)

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test Authentication

1. Navigate to `http://localhost:5000/register`
2. Create a new account
3. Login at `http://localhost:5000/login`

## Usage in Components

### Check Authentication Status

```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;
  
  return <div>Welcome {user?.name}!</div>;
}
```

### Protect Routes

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

<Route path="/dashboard">
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
</Route>
```

### Sign Out

```tsx
import { signOut } from "@/lib/auth";

<button onClick={() => signOut()}>Logout</button>
```

## Vercel Deployment

### 1. Add Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables:

- `DATABASE_URL` - Your Neon database connection string
- `AUTH_SECRET` - Your generated secret key
- `AUTH_URL` - Your production URL (e.g., https://your-app.vercel.app)

### 2. Deploy

```bash
vercel --prod
```

The database tables will be automatically created on first deployment if using `db:push`.

## Database Management

View and manage your database:

```bash
npm run db:studio
```

This opens Drizzle Studio at `https://local.drizzle.studio`

## Security Notes

- Passwords are hashed using bcrypt (10 rounds)
- Sessions use JWT tokens
- Never commit `.env` file to git
- Use strong AUTH_SECRET in production
- Enable SSL for database connections in production
