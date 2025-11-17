# Cloud Database Setup (No Docker Required)

Since Docker Desktop isn't available, use a free cloud database instead.

## 🚀 Option 1: Neon (Recommended - Fastest)

### Step 1: Sign Up & Create Database

1. Go to **https://neon.tech**
2. Click **"Sign Up"** (use GitHub for fastest signup)
3. Click **"Create Project"**
4. Settings:
   - **Project name:** demo-night-app
   - **Region:** Choose closest to you (US East, EU, etc.)
   - **PostgreSQL version:** 15 or 16 (either works)
5. Click **"Create Project"**

### Step 2: Copy Connection String

After creating the project, you'll see a connection string:

```
postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string!**

### Step 3: Update .env File

Open `E:\AI_collective\demo_app\demo-night-app\.env` and update these lines:

```env
# Replace these two lines:
DATABASE_URL="your-neon-connection-string-here"
DATABASE_URL_NON_POOLING="your-neon-connection-string-here"
```

Example:
```env
DATABASE_URL="postgresql://myuser:mypass@ep-cool-sound-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_NON_POOLING="postgresql://myuser:mypass@ep-cool-sound-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Step 4: Run Migration

```powershell
cd E:\AI_collective\demo_app\demo-night-app
yarn db:migrate:deploy
yarn prisma generate
yarn dev
```

**Done!** ✅ Your database is now hosted in the cloud.

---

## 🔄 Option 2: Supabase (Alternative)

### Step 1: Sign Up

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign in with GitHub

### Step 2: Create Project

1. Click **"New Project"**
2. Settings:
   - **Name:** demo-night-app
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest
3. Click **"Create new project"** (takes ~2 minutes)

### Step 3: Get Connection String

1. Go to **Settings** (gear icon) → **Database**
2. Scroll to **Connection string**
3. Select **"URI"** tab
4. Click **"Copy"**

### Step 4: Update .env

```env
DATABASE_URL="postgresql://postgres:yourpassword@db.xxx.supabase.co:5432/postgres"
DATABASE_URL_NON_POOLING="postgresql://postgres:yourpassword@db.xxx.supabase.co:5432/postgres"
```

### Step 5: Run Migration

```powershell
cd E:\AI_collective\demo_app\demo-night-app
yarn db:migrate:deploy
yarn prisma generate
yarn dev
```

---

## 🎯 What About Redis?

For now, you can skip Redis for development. The app will work without it for local testing.

**If you need Redis later:**

### Upstash (Free Redis)

1. Go to **https://upstash.com**
2. Create account
3. Click **"Create Database"**
4. Select **"Redis"**
5. Choose free tier
6. Copy the **REST API** credentials
7. Update `.env`:

```env
KV_REST_API_URL="https://your-db.upstash.io"
KV_REST_API_TOKEN="your-token-here"
```

---

## ✅ Verification Steps

After updating `.env` and running migration:

```powershell
# 1. Test database connection
yarn prisma db push

# 2. Open Prisma Studio to verify
yarn db:studio

# 3. Start the app
yarn dev
```

You should see:
- No database connection errors
- Prisma Studio opens at http://localhost:5555
- App runs at http://localhost:3000

---

## 🆘 Troubleshooting

### "Can't reach database server"
- Double-check your connection string in `.env`
- Make sure you copied the entire string including `?sslmode=require`
- Verify the database is created in Neon/Supabase dashboard

### "Invalid connection string"
- Connection string should start with `postgresql://`
- Make sure there are no extra spaces
- Verify password doesn't have special characters that need encoding

### Migration fails
- Check that the database is accessible
- Try `yarn db:push` instead for development
- Verify your IP isn't blocked (Neon/Supabase allow all IPs by default)

---

## 📊 What You Get (Free Tier)

**Neon:**
- ✅ 3 GB storage
- ✅ 100 hours compute/month
- ✅ Auto-scaling
- ✅ Instant branching

**Supabase:**
- ✅ 500 MB database
- ✅ 2 GB bandwidth
- ✅ Unlimited API requests
- ✅ Authentication included

Both are **more than enough** for development and small projects!

---

## 🚀 Production Deployment

When deploying to Vercel:

1. Vercel will ask for database connection
2. Use your Neon/Supabase connection string
3. Set both `DATABASE_URL` and `DATABASE_URL_NON_POOLING`
4. Vercel will automatically run migrations
5. Done!

---

**Need help?** Just update your `.env` with the Neon connection string and run:

```powershell
yarn db:migrate:deploy
yarn prisma generate
yarn dev
```
