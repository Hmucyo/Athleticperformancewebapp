# Deploy Supabase Edge Function

## Prerequisites

1. **Supabase CLI installed**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project setup** (Already configured in `/utils/supabase/info.tsx`)
   - Project ID: `kelawywzkwtpiqpdgzmh`

## Deployment Steps

### Step 1: Login to Supabase CLI

```bash
supabase login
```

This will open a browser window. Log in with your Supabase account credentials.

### Step 2: Link Your Project

```bash
supabase link --project-ref kelawywzkwtpiqpdgzmh
```

You may be prompted to enter your database password.

### Step 3: Deploy the Edge Function

From the root of your project, run:

```bash
supabase functions deploy server
```

This will deploy the edge function located at `/supabase/functions/server/` to your Supabase project.

### Step 4: Verify Deployment

Test the health endpoint:

```bash
curl https://kelawywzkwtpiqpdgzmh.supabase.co/functions/v1/make-server-9340b842/health
```

You should see: `{"status":"ok"}`

### Step 5: Create Admin Account

After the edge function is deployed, you can create an admin account using this curl command:

```bash
curl -X POST https://kelawywzkwtpiqpdgzmh.supabase.co/functions/v1/make-server-9340b842/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "email": "admin@afsp.com",
    "password": "AdminPass123!",
    "fullName": "Admin",
    "role": "admin"
  }'
```

Replace `YOUR_ANON_KEY` with your actual anon key from `/utils/supabase/info.tsx`.

## Alternative: Deploy via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/kelawywzkwtpiqpdgzmh
2. Navigate to **Edge Functions** in the left sidebar
3. Click **Deploy new function**
4. Upload the contents of `/supabase/functions/server/`
5. Name it: `server`
6. Deploy

## Troubleshooting

### Error: "Failed to fetch"
- This means the edge function is not deployed yet
- Follow the deployment steps above

### Error: "Invalid session"
- Check that your Supabase credentials in `/utils/supabase/info.tsx` are correct
- Ensure the edge function is deployed

### Error: "CORS error"
- The edge function has CORS enabled for all origins
- If you still see CORS errors, check your Supabase project settings

## Environment Variables

The edge function requires these environment variables to be set in your Supabase project:

- `SUPABASE_URL`: Automatically set by Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Automatically set by Supabase

These are automatically available in edge functions and don't need manual configuration.

## Testing After Deployment

Once deployed, test the admin login at:
https://your-app-url.com/admin

Use credentials:
- Email: `admin@afsp.com`
- Password: `AdminPass123!`

(Or whatever credentials you created in Step 5)
