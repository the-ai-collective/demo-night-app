#!/bin/bash
# Vercel Deployment Script
# This script helps deploy to Vercel and set environment variables

echo "🚀 Starting Vercel Deployment..."

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel"

# Read environment variables from .env.development.local
if [ ! -f .env.development.local ]; then
    echo "❌ .env.development.local not found"
    exit 1
fi

echo "📝 Setting environment variables..."

# Set environment variables for production
# Note: DATABASE_URL_UNPOOLED will be mapped to DATABASE_URL_NON_POOLING

# Database
vercel env add DATABASE_URL production < <(grep "^DATABASE_URL=" .env.development.local | cut -d '=' -f2- | tr -d '"')
vercel env add DATABASE_URL_NON_POOLING production < <(grep "^DATABASE_URL_UNPOOLED=" .env.development.local | cut -d '=' -f2- | tr -d '"' || grep "^DATABASE_URL_NON_POOLING=" .env.development.local | cut -d '=' -f2- | tr -d '"')

# NextAuth
vercel env add NEXTAUTH_SECRET production < <(grep "^NEXTAUTH_SECRET=" .env.development.local | cut -d '=' -f2- | tr -d '"')
vercel env add NEXTAUTH_URL production <<< "https://your-project.vercel.app"  # Will be updated after first deploy

# Google OAuth
vercel env add GOOGLE_CLIENT_ID production < <(grep "^GOOGLE_CLIENT_ID=" .env.development.local | cut -d '=' -f2-)
vercel env add GOOGLE_CLIENT_SECRET production < <(grep "^GOOGLE_CLIENT_SECRET=" .env.development.local | cut -d '=' -f2-)

# KV/Redis
vercel env add KV_URL production < <(grep "^KV_URL=" .env.development.local | cut -d '=' -f2- | tr -d '"')
vercel env add KV_REST_API_URL production < <(grep "^KV_REST_API_URL=" .env.development.local | cut -d '=' -f2- | tr -d '"')
vercel env add KV_REST_API_TOKEN production < <(grep "^KV_REST_API_TOKEN=" .env.development.local | cut -d '=' -f2-)
vercel env add KV_REST_API_READ_ONLY_TOKEN production < <(grep "^KV_REST_API_READ_ONLY_TOKEN=" .env.development.local | cut -d '=' -f2-)

# Public URLs
vercel env add NEXT_PUBLIC_URL production <<< "https://your-project.vercel.app"  # Will be updated after first deploy
vercel env add NEXT_PUBLIC_BASE_URL production < <(grep "^NEXT_PUBLIC_BASE_URL=" .env.development.local | cut -d '=' -f2- | tr -d '"')

# Optional Resend
if grep -q "^RESEND_API_KEY=" .env.development.local; then
    vercel env add RESEND_API_KEY production < <(grep "^RESEND_API_KEY=" .env.development.local | cut -d '=' -f2-)
fi

echo "✅ Environment variables set"
echo "🚀 Deploying to Vercel..."

# Deploy
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Update NEXTAUTH_URL with your actual Vercel URL"
echo "   2. Update NEXT_PUBLIC_URL with your actual Vercel URL"
echo "   3. Update Google OAuth redirect URIs"

