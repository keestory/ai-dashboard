# InsightFlow Deployment Guide

## Overview

This guide covers deploying InsightFlow to production using:
- **Vercel** for the Next.js web application
- **EAS** (Expo Application Services) for the mobile app
- **Supabase** for backend services

---

## Prerequisites

1. Accounts:
   - [Vercel](https://vercel.com) account
   - [Expo](https://expo.dev) account (for mobile)
   - [Supabase](https://supabase.com) project
   - [Anthropic](https://anthropic.com) API key

2. CLI Tools:
   ```bash
   npm install -g vercel
   npm install -g eas-cli
   npm install -g supabase
   ```

---

## 1. Supabase Setup

### 1.1 Create Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note down:
   - Project URL
   - Anon key
   - Service role key

### 1.2 Run Migrations

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 1.3 Configure Storage

1. Go to Storage in Supabase Dashboard
2. Create buckets:
   - `uploads` (for analysis files)
   - `reports` (for generated PDFs)

3. Set up storage policies (see supabase/storage-policies.sql)

### 1.4 Deploy Edge Functions

```bash
# Deploy the analysis function
supabase functions deploy process-analysis
```

---

## 2. Vercel Deployment (Web)

### 2.1 Connect Repository

```bash
# Login to Vercel
vercel login

# Initialize project
cd apps/web
vercel
```

### 2.2 Configure Environment Variables

In Vercel Dashboard, add these environment variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `NEXT_PUBLIC_APP_URL` | Your production URL |

### 2.3 Configure Build Settings

In Vercel project settings:
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && turbo run build --filter=@repo/web`
- **Install Command**: `cd ../.. && pnpm install`

### 2.4 Deploy

```bash
# Deploy to production
vercel --prod
```

### 2.5 Configure Domain

1. Go to Vercel project settings > Domains
2. Add your custom domain
3. Configure DNS as instructed

---

## 3. EAS Deployment (Mobile)

### 3.1 Configure EAS

```bash
cd apps/mobile

# Login to Expo
eas login

# Configure project
eas build:configure
```

### 3.2 Update app.json

Update `apps/mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 3.3 Create Environment Config

Create `apps/mobile/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your-supabase-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your-supabase-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your-supabase-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3.4 Build for iOS

```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### 3.5 Build for Android

```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

---

## 4. Post-Deployment Checklist

### 4.1 Verify Functionality

- [ ] User can sign up and log in
- [ ] OAuth (Google/Kakao) works
- [ ] File upload works
- [ ] Analysis completes successfully
- [ ] Real-time updates work
- [ ] Reports can be generated

### 4.2 Configure OAuth Providers

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Configure Google OAuth
3. Configure Kakao OAuth
4. Add redirect URLs for production

### 4.3 Set Up Monitoring

1. Configure Vercel Analytics
2. Set up error tracking (Sentry recommended)
3. Configure Supabase alerts

### 4.4 Security Checklist

- [ ] All environment variables are set
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Row Level Security is enabled on all tables
- [ ] Sensitive routes are protected

---

## 5. CI/CD Pipeline

### GitHub Actions for Web

Create `.github/workflows/web.yml`:

```yaml
name: Web CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 6. Rollback Procedure

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Database Rollback

```bash
# Create backup before changes
supabase db dump > backup.sql

# Restore from backup
psql -h [host] -U [user] -d [database] < backup.sql
```

---

## 7. Environment-Specific Configurations

### Development
- Use local Supabase: `supabase start`
- Use development API keys
- Enable debug logging

### Staging
- Use staging Supabase project
- Test with production-like data
- Run E2E tests

### Production
- Use production Supabase project
- Enable monitoring and alerts
- Configure CDN caching

---

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Check Supabase Edge Function logs
3. Review browser console for client errors

Contact: support@insightflow.com
