# Vercel Deployment Script for PowerShell
# This script helps deploy to Vercel and set environment variables

Write-Host "🚀 Starting Vercel Deployment..." -ForegroundColor Cyan

# Check if logged in
try {
    vercel whoami | Out-Null
    Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Vercel. Please run: vercel login" -ForegroundColor Red
    exit 1
}

# Read environment variables from .env.development.local
if (-not (Test-Path .env.development.local)) {
    Write-Host "❌ .env.development.local not found" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Setting environment variables..." -ForegroundColor Yellow

# Function to get env value
function Get-EnvValue {
    param($Key)
    $line = Get-Content .env.development.local | Where-Object { $_ -match "^$Key=" }
    if ($line) {
        $value = $line -replace "^$Key=", "" -replace '^"', '' -replace '"$', ''
        return $value
    }
    return $null
}

# Set environment variables for production
# Database
$dbUrl = Get-EnvValue "DATABASE_URL"
if ($dbUrl) {
    Write-Host "Setting DATABASE_URL..." -ForegroundColor Gray
    echo $dbUrl | vercel env add DATABASE_URL production
}

$dbNonPooling = Get-EnvValue "DATABASE_URL_UNPOOLED"
if (-not $dbNonPooling) {
    $dbNonPooling = Get-EnvValue "DATABASE_URL_NON_POOLING"
}
if ($dbNonPooling) {
    Write-Host "Setting DATABASE_URL_NON_POOLING..." -ForegroundColor Gray
    echo $dbNonPooling | vercel env add DATABASE_URL_NON_POOLING production
}

# NextAuth
$nextAuthSecret = Get-EnvValue "NEXTAUTH_SECRET"
if ($nextAuthSecret) {
    Write-Host "Setting NEXTAUTH_SECRET..." -ForegroundColor Gray
    echo $nextAuthSecret | vercel env add NEXTAUTH_SECRET production
}

# Google OAuth
$googleClientId = Get-EnvValue "GOOGLE_CLIENT_ID"
if ($googleClientId) {
    Write-Host "Setting GOOGLE_CLIENT_ID..." -ForegroundColor Gray
    echo $googleClientId | vercel env add GOOGLE_CLIENT_ID production
}

$googleClientSecret = Get-EnvValue "GOOGLE_CLIENT_SECRET"
if ($googleClientSecret) {
    Write-Host "Setting GOOGLE_CLIENT_SECRET..." -ForegroundColor Gray
    echo $googleClientSecret | vercel env add GOOGLE_CLIENT_SECRET production
}

# KV/Redis
$kvUrl = Get-EnvValue "KV_URL"
if ($kvUrl) {
    Write-Host "Setting KV_URL..." -ForegroundColor Gray
    echo $kvUrl | vercel env add KV_URL production
}

$kvRestApiUrl = Get-EnvValue "KV_REST_API_URL"
if ($kvRestApiUrl) {
    Write-Host "Setting KV_REST_API_URL..." -ForegroundColor Gray
    echo $kvRestApiUrl | vercel env add KV_REST_API_URL production
}

$kvToken = Get-EnvValue "KV_REST_API_TOKEN"
if ($kvToken) {
    Write-Host "Setting KV_REST_API_TOKEN..." -ForegroundColor Gray
    echo $kvToken | vercel env add KV_REST_API_TOKEN production
}

$kvReadOnlyToken = Get-EnvValue "KV_REST_API_READ_ONLY_TOKEN"
if ($kvReadOnlyToken) {
    Write-Host "Setting KV_REST_API_READ_ONLY_TOKEN..." -ForegroundColor Gray
    echo $kvReadOnlyToken | vercel env add KV_REST_API_READ_ONLY_TOKEN production
}

# Public URLs
$publicUrl = Get-EnvValue "NEXT_PUBLIC_URL"
if ($publicUrl) {
    Write-Host "Setting NEXT_PUBLIC_URL (will update after deploy)..." -ForegroundColor Gray
    echo $publicUrl | vercel env add NEXT_PUBLIC_URL production
}

$publicBaseUrl = Get-EnvValue "NEXT_PUBLIC_BASE_URL"
if ($publicBaseUrl) {
    Write-Host "Setting NEXT_PUBLIC_BASE_URL..." -ForegroundColor Gray
    echo $publicBaseUrl | vercel env add NEXT_PUBLIC_BASE_URL production
}

# Optional Resend
$resendKey = Get-EnvValue "RESEND_API_KEY"
if ($resendKey) {
    Write-Host "Setting RESEND_API_KEY..." -ForegroundColor Gray
    echo $resendKey | vercel env add RESEND_API_KEY production
}

Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan

# Deploy
vercel --prod

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📝 Don't forget to:" -ForegroundColor Yellow
Write-Host "   1. Update NEXTAUTH_URL with your actual Vercel URL" -ForegroundColor White
Write-Host "   2. Update NEXT_PUBLIC_URL with your actual Vercel URL" -ForegroundColor White
Write-Host "   3. Update Google OAuth redirect URIs in Google Cloud Console" -ForegroundColor White

