# Vercel Deployment Guide 🚀

This guide will walk you through deploying the Demo Night App to Vercel.

## Prerequisites

- A Vercel account (free tier is fine)
- A PostgreSQL database (Vercel Postgres, Neon, Supabase, or any PostgreSQL provider)
- A Vercel KV instance (for Redis caching)
- Google OAuth credentials

## Step-by-Step Deployment

### 1. Set Up Database

You'll need a PostgreSQL database with connection pooling support. Here are recommended options:

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database" → Select "Postgres"
4. Create a new database (free tier available)
5. Vercel will automatically provide `DATABASE_URL` and `POSTGRES_PRISMA_URL`
6. For `DATABASE_URL_NON_POOLING`, use the direct connection string (without `?pgbouncer=true`)

#### Option B: Neon (Free Tier Available)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. For pooling: Use the connection pooler URL as `DATABASE_URL`
5. For non-pooling: Use the direct connection URL as `DATABASE_URL_NON_POOLING`

#### Option C: Supabase (Free Tier Available)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Use the pooled connection for `DATABASE_URL`
6. Use the direct connection for `DATABASE_URL_NON_POOLING`

### 2. Set Up Vercel KV (Redis)

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database" → Select "KV"
3. Create a new KV instance (free tier available)
4. Vercel will automatically provide:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - For production: `https://your-domain.vercel.app/api/auth/callback/google`
   - For preview deployments: `https://your-preview-url.vercel.app/api/auth/callback/google`
7. Copy the Client ID and Client Secret

### 4. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your repository
5. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `prisma migrate deploy && prisma generate && next build` (already in vercel.json)
   - **Install Command**: `yarn install` (already in vercel.json)
   - **Root Directory**: `./` (default)

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

### 5. Configure Environment Variables

In your Vercel project dashboard, go to Settings → Environment Variables and add:

#### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?pgbouncer=true
DATABASE_URL_NON_POOLING=postgresql://user:password@host:port/database

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://your-domain.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Vercel KV (automatically provided if using Vercel KV)
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=your-token
KV_REST_API_READ_ONLY_TOKEN=your-read-only-token

# Public URLs
NEXT_PUBLIC_URL=https://your-domain.vercel.app
NEXT_PUBLIC_BASE_URL=https://aicollective.com
```

#### Optional Variables

```env
# Email (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Demo Night App
```

**Important Notes:**
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- Update `NEXTAUTH_URL` and `NEXT_PUBLIC_URL` with your actual Vercel domain
- For preview deployments, Vercel automatically sets `VERCEL_URL` which NextAuth uses

### 6. Run Database Migrations

After the first deployment, you need to run migrations:

1. Go to your Vercel project dashboard
2. Navigate to the "Deployments" tab
3. Find your latest deployment
4. Click the three dots → "View Function Logs"
5. Or use Vercel CLI:

```bash
# Connect to your project
vercel link

# Run migrations (this happens automatically during build, but you can verify)
vercel env pull .env.local
npx prisma migrate deploy
```

The build command in `vercel.json` already includes `prisma migrate deploy`, so migrations should run automatically during deployment.

### 7. Seed the Database (Optional - for test data)

After deployment, you can seed the database with test data using the built-in seed API route:

#### Option A: Using the Seed API Route (Recommended)

1. Set an optional `SEED_TOKEN` environment variable in Vercel (for security):
   ```env
   SEED_TOKEN=your-random-secret-token-here
   ```

2. Visit the seed endpoint:
   ```
   https://your-domain.vercel.app/api/seed?token=your-random-secret-token-here
   ```
   
   Or if you didn't set `SEED_TOKEN`, you can access it without a token (less secure):
   ```
   https://your-domain.vercel.app/api/seed
   ```

3. The endpoint will return a success message when seeding is complete.

4. **Security Note**: After seeding, you may want to delete or further secure this route in production.

#### Option B: Using Vercel CLI

```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma db seed
```

### 8. Verify Deployment

1. Visit your deployed URL: `https://your-project.vercel.app`
2. Test authentication with Google OAuth
3. Check the admin panel: `https://your-project.vercel.app/admin`
4. Verify database connectivity

## Post-Deployment Checklist

- [ ] Database migrations completed successfully
- [ ] Environment variables configured correctly
- [ ] Google OAuth redirect URIs updated
- [ ] Database seeded with test data (optional)
- [ ] Application accessible at production URL
- [ ] Authentication working
- [ ] Admin panel accessible

## Troubleshooting

### Build Fails with Prisma Errors

- Ensure `DATABASE_URL` and `DATABASE_URL_NON_POOLING` are set correctly
- Check that the database is accessible from Vercel's IP addresses
- Verify Prisma schema is valid: `npx prisma validate`

### Authentication Not Working

- Verify `NEXTAUTH_URL` matches your deployment URL
- Check Google OAuth redirect URIs include your Vercel domain
- Ensure `NEXTAUTH_SECRET` is set and is a valid random string

### Database Connection Issues

- Verify connection strings are correct
- Check database provider allows connections from Vercel
- For connection pooling, ensure `DATABASE_URL` uses the pooler endpoint
- For migrations, ensure `DATABASE_URL_NON_POOLING` uses direct connection

### Environment Variables Not Loading

- Ensure variables are set in Vercel dashboard (Settings → Environment Variables)
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

## Custom Domain Setup

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update environment variables:
   - `NEXTAUTH_URL=https://your-custom-domain.com`
   - `NEXT_PUBLIC_URL=https://your-custom-domain.com`
5. Update Google OAuth redirect URIs

## Monitoring and Logs

- View deployment logs in Vercel dashboard
- Check function logs for runtime errors
- Monitor database connections and performance
- Set up Vercel Analytics for usage tracking

## Cost Considerations

**Free Tier Limits:**
- Vercel: 100GB bandwidth, unlimited requests
- Vercel Postgres: 256MB storage, 60 hours compute
- Vercel KV: 1GB storage, 30M commands/month

For production use, consider upgrading to Pro plan ($20/month) for:
- More bandwidth and storage
- Better performance
- Priority support

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Prisma migration status
3. Verify all environment variables
4. Check database connectivity
5. Contact support: [engineering@aicollective.com](mailto:engineering@aicollective.com)

