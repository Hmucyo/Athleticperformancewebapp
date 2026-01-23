# Deployment Guide

## Quick Deploy to GitHub

### Step 1: Initialize Git Repository (Local)

```bash
# Navigate to your project directory
cd your-project-directory

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AFSP Platform v1.0 - Phase 1 & 2 complete"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it: `afsp-platform` (or your preferred name)
5. Choose visibility (Public or Private)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### Step 3: Push to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR-USERNAME/afsp-platform.git

# Push code to GitHub
git push -u origin main

# If you get an error about 'main' not existing, try:
git branch -M main
git push -u origin main
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project Name: `AFSP Platform`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
   - Pricing Plan: Free or Pro

### 2. Get Your Credentials

In your Supabase project dashboard:

1. Go to Settings → API
2. Copy these values:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key
   - Service Role Key (keep this secret!)

### 3. Update Project Configuration

Edit `/utils/supabase/info.tsx`:

```typescript
// Extract project ID from URL: https://YOUR-PROJECT-ID.supabase.co
export const projectId = 'YOUR-PROJECT-ID';
export const publicAnonKey = 'YOUR-ANON-KEY';
```

### 4. Set Supabase Secrets

In Supabase Dashboard → Settings → Vault (or use CLI):

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR-PROJECT-ID

# Set secrets
supabase secrets set SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set SUPABASE_DB_URL=your-db-connection-string
```

### 5. Deploy Edge Function

```bash
# Deploy the server function
supabase functions deploy server

# Verify deployment
supabase functions list
```

## Initial Data Setup

### Create Admin User

Use cURL or Postman to create the first admin:

```bash
curl -X POST https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-9340b842/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "SecurePassword123!",
    "fullName": "Admin Name",
    "role": "admin"
  }'
```

### Test Authentication

1. Open your application
2. Click "Sign In"
3. Use the admin credentials you just created
4. You should see the admin dashboard

## Environment Variables (Optional)

For production deployments, consider using environment variables:

Create `.env.local` (already in .gitignore):

```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Update `/utils/supabase/info.tsx`:

```typescript
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'fallback-id';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback-key';
```

## Deploy to Production

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts, then deploy to production
vercel --prod
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

### Option 3: GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
```

## Post-Deployment Checklist

- [ ] Verify admin login works
- [ ] Create test athlete account
- [ ] Test program enrollment
- [ ] Upload test journal entry with media
- [ ] Send test chat message
- [ ] Verify admin can see athletes
- [ ] Test exercise assignment
- [ ] Check responsive design on mobile
- [ ] Verify all API endpoints are working
- [ ] Set up SSL certificate (automatic with Vercel/Netlify)
- [ ] Configure custom domain (optional)

## Troubleshooting

### Edge Function not found
- Make sure you deployed: `supabase functions deploy server`
- Check function logs: `supabase functions logs server`

### CORS errors
- Verify the server has CORS enabled (it should be in index.tsx)
- Check Supabase dashboard → Edge Functions → Configuration

### Authentication errors
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
- Check that email confirmation is disabled in Supabase Auth settings
- Go to: Authentication → Settings → Enable "Confirm email" OFF

### Storage upload errors
- Verify bucket `make-9340b842-journal-media` was created
- Check Storage policies in Supabase dashboard
- Ensure private bucket is configured correctly

## Monitoring

### View Logs

```bash
# Edge function logs
supabase functions logs server

# Follow logs in real-time
supabase functions logs server --tail
```

### Database Queries

Use Supabase SQL Editor to query data:

```sql
-- View all users (using KV store)
SELECT * FROM kv_store_9340b842 WHERE key LIKE 'user:%';

-- View all programs
SELECT * FROM kv_store_9340b842 WHERE key LIKE 'enrollment:%';

-- View journal entries
SELECT * FROM kv_store_9340b842 WHERE key LIKE 'journal:%';
```

## Support

If you encounter issues:
1. Check Supabase function logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Review the README.md for setup instructions
5. Open an issue on GitHub

## Security Notes

⚠️ **Important Security Reminders:**
- Never commit `.env` files to Git
- Keep SERVICE_ROLE_KEY secret (server-side only)
- Use environment variables in production
- Enable Row Level Security (RLS) for additional protection
- Regularly rotate API keys
- Use HTTPS in production (automatic with Vercel/Netlify)
