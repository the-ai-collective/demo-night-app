# Deployment Guide - Demo Night App

Deploy the Demo Night App to Vercel using the CLI in ~10 minutes.

## Quick Start

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Create databases
vercel postgres create demo-night-db
vercel kv create demo-night-kv

# 5. Configure environment variables and redeploy
vercel env add NEXTAUTH_SECRET production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add RESEND_API_KEY production
vercel env add NEXT_PUBLIC_URL production
vercel --prod
```

## Prerequisites

- Vercel account (free tier works)
- `.env.production.local` file created (included in repo with credentials)
- New NEXTAUTH_SECRET (generate with `openssl rand -base64 32`)

---

## Deployment Steps

### 1. Install and Login

```bash
npm i -g vercel
vercel login
```

### 2. Initial Deploy

```bash
vercel --prod
```

The build will fail initially - that's expected. We need to create databases first.

### 3. Create Databases

```bash
# Create Postgres database
vercel postgres create demo-night-db
# Choose your region, link to your project

# Create KV/Redis database
vercel kv create demo-night-kv
# Choose same region, link to your project
```

### 4. Configure Environment Variables

Use the values from `.env.production.local`:

```bash
# Generate new secret first
openssl rand -base64 32

# Add environment variables
vercel env add NEXTAUTH_SECRET production
# Paste the generated secret

vercel env add GOOGLE_CLIENT_ID production
# Paste from .env.production.local

vercel env add GOOGLE_CLIENT_SECRET production
# Paste from .env.production.local

vercel env add RESEND_API_KEY production
# Paste from .env.production.local

vercel env add NEXT_PUBLIC_URL production
# Enter your Vercel URL (e.g., https://demo-night-app.vercel.app)

vercel env add NEXT_PUBLIC_BASE_URL production
# Enter: https://aicollective.com
```

### 5. Configure Database Connection Pooling

```bash
# Pull environment variables to see auto-created database URLs
vercel env pull .env.vercel.local

# View the POSTGRES URLs
cat .env.vercel.local | grep POSTGRES

# Add non-pooling URL (use POSTGRES_URL value)
vercel env add DATABASE_URL_NON_POOLING production
# Paste the POSTGRES_URL value

# Update DATABASE_URL to use pooled connection
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# Paste the POSTGRES_URL_POOLED value
```

### 6. Redeploy

```bash
vercel --prod --force
```

The build should now succeed!

### 7. Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Add production redirect URI:
   ```
   https://your-actual-vercel-url.vercel.app/api/auth/callback/google
   ```

### 8. Create Admin User

```bash
# Pull production database URL
vercel env pull .env.vercel.local

# Open Prisma Studio
dotenv -e .env.vercel.local -- npx prisma studio

# Find your user and change role to "admin"
```

Or use the Vercel Dashboard → Storage → Postgres → Data tab to edit the User table directly.

## Useful Commands

### View Deployment Logs
```bash
vercel logs --follow
```

### Manage Environment Variables
```bash
# List all variables
vercel env ls

# Pull to local file
vercel env pull .env.vercel.local

# Add variable
vercel env add VARIABLE_NAME production

# Remove variable
vercel env rm VARIABLE_NAME production
```

### Database Management
```bash
# List databases
vercel postgres ls
vercel kv ls

# Connect to Postgres
vercel postgres connect demo-night-db

# Access KV key
vercel kv get currentEvent --database demo-night-kv
```

### Deployment Management
```bash
# List deployments
vercel ls

# Deploy to production
vercel --prod

# Force rebuild
vercel --prod --force
```

## Troubleshooting

### Build fails with migration errors
- Verify `DATABASE_URL_NON_POOLING` is set correctly
- Check migration files in `prisma/migrations/` are valid
- View logs: `vercel logs --follow`

### Google OAuth redirect error
- Add production URL to Google Console → Credentials → Authorized redirect URIs:
  ```
  https://your-app.vercel.app/api/auth/callback/google
  ```

### Emails not sending
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for errors
- Check spam folder

### Rate limit errors
- Verify KV database is created and linked
- Check KV environment variables are set

### Database connection errors
- Ensure `DATABASE_URL` uses `POSTGRES_URL_POOLED` value
- Verify `DATABASE_URL_NON_POOLING` uses `POSTGRES_URL` value

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [Prisma Docs](https://www.prisma.io/docs)
