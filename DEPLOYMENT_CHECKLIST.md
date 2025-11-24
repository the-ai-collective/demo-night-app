# Vercel Deployment Checklist ✅

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

- [ ] Code is pushed to GitHub/GitLab/Bitbucket
- [ ] All tests pass locally
- [ ] Environment variables documented

## Database Setup

- [ ] PostgreSQL database created (Vercel Postgres, Neon, or Supabase)
- [ ] `DATABASE_URL` configured (with connection pooling)
- [ ] `DATABASE_URL_NON_POOLING` configured (direct connection)
- [ ] Database migrations tested locally

## Vercel KV Setup

- [ ] Vercel KV instance created
- [ ] `KV_URL` configured
- [ ] `KV_REST_API_URL` configured
- [ ] `KV_REST_API_TOKEN` configured
- [ ] `KV_REST_API_READ_ONLY_TOKEN` configured

## Authentication Setup

- [ ] Google OAuth app created
- [ ] `GOOGLE_CLIENT_ID` obtained
- [ ] `GOOGLE_CLIENT_SECRET` obtained
- [ ] OAuth redirect URIs configured:
  - [ ] Production: `https://your-domain.vercel.app/api/auth/callback/google`
  - [ ] Preview deployments (optional)

## Environment Variables in Vercel

- [ ] `DATABASE_URL` set
- [ ] `DATABASE_URL_NON_POOLING` set
- [ ] `NEXTAUTH_SECRET` generated and set (use: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` set to your Vercel domain
- [ ] `GOOGLE_CLIENT_ID` set
- [ ] `GOOGLE_CLIENT_SECRET` set
- [ ] `KV_URL` set (or auto-provided by Vercel)
- [ ] `KV_REST_API_URL` set (or auto-provided by Vercel)
- [ ] `KV_REST_API_TOKEN` set (or auto-provided by Vercel)
- [ ] `KV_REST_API_READ_ONLY_TOKEN` set (or auto-provided by Vercel)
- [ ] `NEXT_PUBLIC_URL` set to your Vercel domain
- [ ] `NEXT_PUBLIC_BASE_URL` set (default: `https://aicollective.com`)
- [ ] `SEED_TOKEN` set (optional, for database seeding)

## Deployment

- [ ] Project imported to Vercel
- [ ] Build settings verified:
  - [ ] Framework: Next.js
  - [ ] Build Command: `prisma migrate deploy && prisma generate && next build`
  - [ ] Install Command: `yarn install`
- [ ] First deployment completed
- [ ] Build logs checked for errors
- [ ] Database migrations ran successfully

## Post-Deployment

- [ ] Application accessible at production URL
- [ ] Database seeded with test data (optional):
  - [ ] Visit `/api/seed?token=your-seed-token` or use CLI
- [ ] Authentication tested:
  - [ ] Google OAuth login works
  - [ ] User can access admin panel
- [ ] Test user login verified (`test@example.com` if seeded)
- [ ] Admin panel accessible at `/admin`
- [ ] All features tested

## Security

- [ ] `NEXTAUTH_SECRET` is a strong random string
- [ ] `SEED_TOKEN` set (if using seed API route)
- [ ] OAuth redirect URIs match deployment URLs
- [ ] Environment variables not exposed in client-side code
- [ ] Seed API route secured or removed after use

## Monitoring

- [ ] Vercel deployment logs reviewed
- [ ] Function logs checked for runtime errors
- [ ] Database connection monitoring set up
- [ ] Error tracking configured (optional)

## Custom Domain (Optional)

- [ ] Custom domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] `NEXTAUTH_URL` updated to custom domain
- [ ] `NEXT_PUBLIC_URL` updated to custom domain
- [ ] Google OAuth redirect URIs updated

## Final Verification

- [ ] Homepage loads correctly
- [ ] Authentication flow works end-to-end
- [ ] Admin features functional
- [ ] Database queries working
- [ ] No console errors
- [ ] Performance acceptable

---

**Quick Commands:**

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Seed database via API (after deployment)
curl -X POST "https://your-domain.vercel.app/api/seed?token=your-seed-token"

# Or seed via CLI
vercel env pull .env.local
npx prisma db seed
```

---

**Need Help?** See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

