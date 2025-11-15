# 🚀 Setup Checklist - Authentication System

Follow these steps to get your authentication system running.

## ✅ Step-by-Step Setup

### 1️⃣ Database Setup (Neon PostgreSQL)

- [ ] Go to https://neon.tech and create a free account
- [ ] Create a new project
- [ ] Copy the connection string (looks like: `postgresql://user:pass@host.neon.tech/db`)
- [ ] Paste it in `.env` as `DATABASE_URL`

### 2️⃣ Generate Authentication Secret

Run one of these commands:

**Option A - Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option B - Using OpenSSL:**
```bash
openssl rand -base64 32
```

- [ ] Copy the generated secret
- [ ] Paste it in `.env` as `AUTH_SECRET`

### 3️⃣ Configure Environment Variables

Your `.env` file should look like this:

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
AUTH_SECRET=your_generated_secret_here
AUTH_URL=http://localhost:5000
```

- [ ] Verify all three variables are set

### 4️⃣ Install Dependencies

```bash
npm install
```

- [ ] Wait for installation to complete

### 5️⃣ Create Database Tables

```bash
npm run db:push
```

This creates:
- `user` table
- `session` table
- `account` table
- `verificationToken` table

- [ ] Verify tables were created successfully

### 6️⃣ Verify Database Connection

```bash
npm run db:check
```

Expected output:
```
🔍 Checking database connection...
✅ Database connection successful
✅ Users table exists
📊 Total users: 0
```

- [ ] Confirm all checks pass

### 7️⃣ Start Development Server

```bash
npm run dev
```

- [ ] Server starts on http://localhost:5000

### 8️⃣ Test Authentication

1. **Register a new user:**
   - [ ] Go to http://localhost:5000/register
   - [ ] Fill in name, email, password
   - [ ] Click "Register"
   - [ ] Should redirect to home page

2. **Test login:**
   - [ ] Go to http://localhost:5000/login
   - [ ] Enter your email and password
   - [ ] Click "Sign In"
   - [ ] Should redirect to home page

3. **Verify session:**
   - [ ] Open browser DevTools → Network tab
   - [ ] Visit http://localhost:5000/api/auth/session
   - [ ] Should see your user data

### 9️⃣ Add User Menu to Your App

Edit your main page/component:

```tsx
import { UserMenu } from "@/components/UserMenu";

function YourPage() {
  return (
    <div>
      <header className="flex justify-between p-4">
        <h1>Stock Analyzer</h1>
        <UserMenu />
      </header>
      {/* rest of your app */}
    </div>
  );
}
```

- [ ] User menu appears in your app
- [ ] Shows user name/email when logged in
- [ ] Logout button works

### 🔟 Deploy to Vercel (Optional)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add authentication system"
   git push
   ```
   - [ ] Code pushed to GitHub

2. **Import to Vercel:**
   - [ ] Go to https://vercel.com
   - [ ] Click "Import Project"
   - [ ] Select your repository

3. **Add Environment Variables:**
   - [ ] Add `DATABASE_URL` (same as local)
   - [ ] Add `AUTH_SECRET` (same as local)
   - [ ] Add `AUTH_URL` (your Vercel URL, e.g., https://your-app.vercel.app)

4. **Deploy:**
   - [ ] Click "Deploy"
   - [ ] Wait for deployment to complete
   - [ ] Test registration and login on production

## 🎉 Success Criteria

You're done when:
- ✅ Users can register
- ✅ Users can login
- ✅ Users can logout
- ✅ Protected routes redirect to login
- ✅ User menu shows logged-in user
- ✅ Sessions persist across page refreshes

## 🆘 Troubleshooting

### "DATABASE_URL must be set"
→ Check `.env` file exists and has `DATABASE_URL`

### "Users table does not exist"
→ Run `npm run db:push`

### "Invalid credentials" on login
→ Make sure you registered first at `/register`

### Session not persisting
→ Check `AUTH_SECRET` is set in `.env`
→ Clear browser cookies and try again

### Can't connect to database
→ Verify Neon database is running
→ Check connection string is correct
→ Ensure `?sslmode=require` is at the end

## 📚 Next Steps

After setup is complete:
- [ ] Read `QUICKSTART.md` for usage examples
- [ ] Read `AUTH_SETUP.md` for detailed docs
- [ ] Customize login/register pages
- [ ] Add protected routes to your app
- [ ] Consider adding OAuth providers

## 🛠️ Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run db:push` | Push schema to database |
| `npm run db:check` | Check database status |
| `npm run db:studio` | Open database GUI |
| `npm run build` | Build for production |

## 📞 Need Help?

- Check `IMPLEMENTATION_SUMMARY.md` for technical details
- Review `AUTH_SETUP.md` for configuration options
- Verify all environment variables are set correctly
