# Quick Start - Authentication System

## 🚀 Get Started in 3 Steps

### Step 1: Setup Environment Variables

1. Create a Neon database at https://neon.tech (free tier available)
2. Copy your connection string
3. Update `.env`:

```env
DATABASE_URL=your_neon_connection_string_here
AUTH_SECRET=run_this_command_below_to_generate
AUTH_URL=http://localhost:5000
```

Generate AUTH_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 2: Create Database Tables

```bash
npm run db:push
```

### Step 3: Start the App

```bash
npm run dev
```

Visit: http://localhost:5000

## ✅ What's Included

- ✨ User registration & login
- 🔐 Secure password hashing (bcrypt)
- 🎫 JWT session management
- 🛡️ Protected routes
- 👤 User profile menu
- 🗄️ PostgreSQL with Neon
- 🚀 Vercel-ready deployment

## 📝 Usage Examples

### Add User Menu to Your Page

```tsx
import { UserMenu } from "@/components/UserMenu";

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <UserMenu />
    </header>
  );
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

### Get Current User

```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  
  return <div>Hello {user?.name}!</div>;
}
```

## 🌐 Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` (your production URL)
4. Deploy!

## 📚 Full Documentation

See `AUTH_SETUP.md` for detailed documentation.

## 🔧 Database Management

View your database in browser:
```bash
npm run db:studio
```

## 🆘 Troubleshooting

**"DATABASE_URL must be set"**
- Make sure `.env` file exists with DATABASE_URL

**"Invalid credentials"**
- Check email/password are correct
- Ensure user exists in database

**Tables don't exist**
- Run `npm run db:push` to create tables

**Session not persisting**
- Check AUTH_SECRET is set
- Clear browser cookies and try again
