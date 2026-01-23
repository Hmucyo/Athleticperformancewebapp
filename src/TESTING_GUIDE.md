# Testing Guide - AFSP Platform

## Quick Start: Creating Test Accounts

### ⚠️ Important: First-Time Setup

If you're seeing "Invalid login credentials" errors, it means you need to create an account first. The platform requires user accounts to exist in Supabase Auth before you can sign in.

---

## Method 1: Sign Up via UI (Recommended)

### Create Athlete Account
1. Open your application
2. Click "Sign In" button
3. Click "Sign Up" at the bottom
4. Fill in:
   - Full Name: `Test Athlete`
   - Email: `athlete@test.com`
   - Password: `TestPass123!`
   - Confirm Password: `TestPass123!`
5. Click "Sign Up"
6. You'll be automatically signed in

### Create Admin Account
Admin accounts must be created via API (Method 2) since the UI only creates athlete accounts.

---

## Method 2: Create via API (For Admin Accounts)

### Using cURL (Command Line)

**Create Admin Account:**
```bash
curl -X POST https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-9340b842/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -d '{
    "email": "admin@afsp.com",
    "password": "AdminPass123!",
    "fullName": "AFSP Admin",
    "role": "admin"
  }'
```

**Create Athlete Account:**
```bash
curl -X POST https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-9340b842/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -d '{
    "email": "john@athlete.com",
    "password": "AthletePass123!",
    "fullName": "John Doe",
    "role": "athlete"
  }'
```

### Using Postman/Insomnia

1. **Create a new POST request**
2. **URL:** `https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-9340b842/auth/signup`
3. **Headers:**
   ```
   Content-Type: application/json
   Authorization: Bearer YOUR-ANON-KEY
   ```
4. **Body (JSON):**
   ```json
   {
     "email": "admin@afsp.com",
     "password": "AdminPass123!",
     "fullName": "AFSP Admin",
     "role": "admin"
   }
   ```
5. **Send** - You should get a success response

### Using JavaScript Console

Open browser console (F12) on your app page and run:

```javascript
// Create Admin
fetch('https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-9340b842/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR-ANON-KEY'
  },
  body: JSON.stringify({
    email: 'admin@afsp.com',
    password: 'AdminPass123!',
    fullName: 'AFSP Admin',
    role: 'admin'
  })
})
.then(r => r.json())
.then(d => console.log('Admin created:', d))
.catch(e => console.error('Error:', e));

// Create Athlete
fetch('https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-9340b842/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR-ANON-KEY'
  },
  body: JSON.stringify({
    email: 'athlete@test.com',
    password: 'TestPass123!',
    fullName: 'Test Athlete',
    role: 'athlete'
  })
})
.then(r => r.json())
.then(d => console.log('Athlete created:', d))
.catch(e => console.error('Error:', e));
```

---

## Test Account Credentials

After creation, use these to test:

### Admin Account
- **Email:** `admin@afsp.com`
- **Password:** `AdminPass123!`
- **Access:** Admin dashboard with all features

### Athlete Account
- **Email:** `athlete@test.com`
- **Password:** `TestPass123!`
- **Access:** Athlete dashboard

---

## Verifying Accounts in Supabase

### Check via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. You should see your created users listed
4. Check the `user_metadata` to see the role

### Check via SQL

In Supabase SQL Editor:

```sql
-- View auth users
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users;
```

### Check via KV Store

```sql
-- View user profiles in KV store
SELECT * FROM kv_store_9340b842 
WHERE key LIKE 'user:%';
```

---

## Common Issues & Solutions

### Issue: "Invalid login credentials"
**Cause:** User doesn't exist in Supabase Auth
**Solution:** Create the account first using Method 1 or 2 above

### Issue: "Email already exists"
**Cause:** Account was already created
**Solution:** Use the sign-in form instead, or reset password

### Issue: "Failed to sign up"
**Cause:** Supabase Edge Function not deployed or credentials wrong
**Solution:** 
1. Check Supabase function logs: `supabase functions logs server`
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Redeploy: `supabase functions deploy server`

### Issue: "Missing required fields"
**Cause:** Email, password, or fullName not provided
**Solution:** Include all required fields in signup request

### Issue: "Password too weak"
**Cause:** Supabase password requirements not met
**Solution:** Use at least 6 characters (recommended: 8+ with mix of letters/numbers)

---

## Testing Workflows

### Test Athlete Experience

1. **Sign Up** as athlete
2. **View Dashboard** - Check if daily exercises load
3. **Browse Programs** - View available training programs
4. **Create Custom Program** - Go through 4-step wizard
5. **Create Journal Entry** - Add text and upload an image
6. **Send Chat Message** - Post in General channel
7. **Mark Exercise Complete** - Track progress
8. **View Profile** - Check user info

### Test Admin Experience

1. **Create Admin Account** via API (Method 2)
2. **Sign In** as admin
3. **View Dashboard** - Check athlete count
4. **Browse Athletes** - See all registered users
5. **Assign Exercise** - Create workout for specific athlete
6. **View Chat** - Check messages from athletes

---

## Development Tips

### Auto-Login for Testing

Add this to your browser console for quick testing:

```javascript
// Store credentials
localStorage.setItem('testAthleteEmail', 'athlete@test.com');
localStorage.setItem('testAthletePwd', 'TestPass123!');
localStorage.setItem('testAdminEmail', 'admin@afsp.com');
localStorage.setItem('testAdminPwd', 'AdminPass123!');

// Quick login function
function quickLogin(type = 'athlete') {
  const email = type === 'admin' 
    ? localStorage.getItem('testAdminEmail')
    : localStorage.getItem('testAthleteEmail');
  const password = type === 'admin'
    ? localStorage.getItem('testAdminPwd')
    : localStorage.getItem('testAthletePwd');
  
  // Fill form and submit
  document.querySelector('input[type="email"]').value = email;
  document.querySelector('input[type="password"]').value = password;
  console.log('Form filled, submit manually or press Enter');
}
```

### Reset Test Data

If you need to start fresh:

```sql
-- Delete all test data (in Supabase SQL Editor)
DELETE FROM kv_store_9340b842 WHERE key LIKE 'journal:%';
DELETE FROM kv_store_9340b842 WHERE key LIKE 'enrollment:%';
DELETE FROM kv_store_9340b842 WHERE key LIKE 'exercise:%';
DELETE FROM kv_store_9340b842 WHERE key LIKE 'message:%';

-- Keep user accounts but reset their data
UPDATE kv_store_9340b842 
SET value = jsonb_set(value, '{programs}', '[]'::jsonb)
WHERE key LIKE 'user:%';
```

---

## Production Considerations

### Before Going Live

- [ ] Remove test accounts
- [ ] Enable email confirmation in Supabase Auth settings
- [ ] Set up proper password reset flow
- [ ] Configure email templates
- [ ] Set up rate limiting
- [ ] Enable RLS (Row Level Security) policies
- [ ] Review and update CORS settings
- [ ] Set up monitoring and alerts

### Creating Production Admin

Use secure password and store safely:

```bash
curl -X POST https://YOUR-PROD-PROJECT.supabase.co/functions/v1/make-server-9340b842/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-PROD-ANON-KEY" \
  -d '{
    "email": "admin@authenticfitness.com",
    "password": "SECURE_RANDOM_PASSWORD_HERE",
    "fullName": "System Administrator",
    "role": "admin"
  }'
```

---

## Support

If you continue to have issues:
1. Check Supabase function logs
2. Verify environment variables are set
3. Test API endpoints with Postman
4. Review browser console for errors
5. Check network tab for failed requests

**Happy Testing!** 🚀
