# 🚀 Deployment & Fix Instructions

## ⚠️ Current Issue: "Invalid JWT" Error

The "Invalid JWT" error occurs because the Edge Function needs to be **redeployed** with the updated authentication code, and you need to **log out and log back in** to get a fresh access token.

---

## 📋 Step-by-Step Fix

### **Step 1: Redeploy the Supabase Edge Function**

You need to deploy the updated `/supabase/functions/server/index.tsx` file to your Supabase project.

**Option A: Deploy via Supabase CLI (Recommended)**

```bash
# Navigate to your project directory
cd /path/to/your/project

# Login to Supabase (if not already logged in)
npx supabase login

# Link to your project
npx supabase link --project-ref kelawywzkwtpiqpdgzmh

# Deploy the Edge Function
npx supabase functions deploy server

# Verify deployment
npx supabase functions list
```

**Option B: Deploy via Supabase Dashboard**

1. Go to https://supabase.com/dashboard/project/kelawywzkwtpiqpdgzmh
2. Navigate to **Edge Functions** in the left sidebar
3. Find the `server` function (or create if it doesn't exist)
4. Copy the entire contents of `/supabase/functions/server/index.tsx`
5. Paste it into the editor
6. Click **Deploy**
7. Wait for deployment to complete

---

### **Step 2: Create Admin Account (If Not Already Created)**

Open your browser console (F12) on your app and run:

```javascript
const projectId = 'kelawywzkwtpiqpdgzmh';
const publicAnonKey = 'YOUR_ANON_KEY'; // Get from Supabase dashboard

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/create-admin`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({
    email: 'admin@afsp.com',
    password: 'YourSecurePassword123!',
    fullName: 'Admin User'
  })
})
.then(res => res.json())
.then(data => console.log('✅ Admin created:', data))
.catch(err => console.error('❌ Error:', err));
```

**Replace these values:**
- `email`: Your admin email
- `password`: A strong password (save this!)
- `fullName`: Your name

**Expected response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "user": {
    "id": "uuid-here",
    "email": "admin@afsp.com",
    "fullName": "Admin User",
    "role": "admin"
  }
}
```

---

### **Step 3: Clear Browser Storage and Login**

1. **Clear localStorage:**
   - Open browser console (F12)
   - Run: `localStorage.clear()`
   - Or manually remove: `localStorage.removeItem('accessToken')` and `localStorage.removeItem('adminUser')`

2. **Refresh the page:**
   - Press `Ctrl+R` (or `Cmd+R` on Mac)
   - Or close and reopen the tab

3. **Log in with admin credentials:**
   - Navigate to `/admin`
   - Use the email and password you created in Step 2
   - You should now be logged in with a fresh token

---

### **Step 4: Verify the Fix**

1. Navigate to the **Debug** tab in the admin panel
2. Click **"Run Diagnostics"**
3. All checks should now show ✅ **PASS**

Expected results:
- ✅ Access Token in localStorage
- ✅ Admin User in localStorage
- ✅ Supabase Configuration
- ✅ Edge Function Connectivity
- ✅ Token Validation
- ✅ Admin Athletes Endpoint
- ✅ Admin Exercises Endpoint

---

## 🧪 Testing the Exercise System

Once logged in successfully:

1. **Navigate to Exercises Tab**
2. **Click "Create Exercise"**
3. **Fill in the form:**
   - Name: "Squats"
   - Category: "Strength"
   - Description: "Basic squat exercise"
   - URL: https://youtube.com/watch?v=example (optional)
   - Upload media: Select an image or video (optional)

4. **Click "Create Exercise"**
5. **Verify:** The exercise should appear in the library grid

6. **Assign to Athletes:**
   - Click on the exercise card
   - Click "Assign to Athletes"
   - Select athletes and fill in sets/reps
   - Click "Assign"

---

## 🔍 Troubleshooting

### If you still get "Invalid JWT" errors:

**Check 1: Is the Edge Function deployed?**
```bash
npx supabase functions list
# Should show "server" as deployed
```

**Check 2: Test the health endpoint:**
```javascript
fetch('https://kelawywzkwtpiqpdgzmh.supabase.co/functions/v1/make-server-9340b842/health')
  .then(res => res.json())
  .then(data => console.log(data)); // Should return: { status: "ok" }
```

**Check 3: Test token validation:**
```javascript
const accessToken = localStorage.getItem('accessToken');

fetch('https://kelawywzkwtpiqpdgzmh.supabase.co/functions/v1/make-server-9340b842/auth/test-token', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
})
  .then(res => res.json())
  .then(data => console.log('Token test:', data));
```

**Check 4: View Edge Function logs:**
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** → **server**
3. Click **Logs**
4. Look for authentication errors

### If admin creation fails:

**Error: "User already exists"**
- The admin account is already created
- Try logging in with your existing credentials
- Or use a different email address

**Error: "Network error" or "Failed to fetch"**
- Edge Function is not deployed
- Check your internet connection
- Verify the project ID is correct

### If exercises don't appear:

1. Open browser console (F12)
2. Look for detailed debug logs starting with `=== ATHLETE FETCH DEBUG ===`
3. Check the response status and error messages
4. Verify your admin role: `localStorage.getItem('adminUser')`

---

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the browser console** (F12) for error messages
2. **Check Supabase Edge Function logs**
3. **Run the System Diagnostics** in the Debug tab
4. **Provide the following information:**
   - Browser console errors
   - Edge Function deployment status
   - Diagnostic test results
   - Network tab responses (from DevTools)

---

## ✅ Success Checklist

- [ ] Edge Function deployed successfully
- [ ] Admin account created
- [ ] Browser localStorage cleared
- [ ] Logged in with admin credentials
- [ ] System Diagnostics show all ✅ green
- [ ] Can view Athletes tab without errors
- [ ] Can view Exercises tab without errors
- [ ] Can create new exercises
- [ ] Exercises appear in the library

Once all items are checked, the system is fully operational! 🎉
