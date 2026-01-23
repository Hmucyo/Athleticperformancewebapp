# Quick Admin Portal Test (5 Minutes)

## Step 1: Create Admin Account

Open browser console (F12) and paste:

```javascript
// Get your project credentials from utils/supabase/info.tsx
const projectId = 'YOUR_PROJECT_ID';  // Replace this
const publicAnonKey = 'YOUR_ANON_KEY';  // Replace this

// Create admin account
fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/signup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({
    email: 'admin@afsp.com',
    password: 'AdminPass123!',
    fullName: 'Test Admin',
    role: 'admin'  // Important!
  })
})
.then(r => r.json())
.then(d => console.log('✅ Admin created:', d))
.catch(e => console.error('❌ Error:', e));
```

Expected output:
```
✅ Admin created: { success: true, user: {...} }
```

---

## Step 2: Navigate to Admin Portal

In your browser address bar, type:
```
http://localhost:YOUR_PORT/admin
```

Or scroll to the bottom of the main page and click **"Admin"** in the footer.

---

## Step 3: Login

You should see a professional admin login page with:
- 🛡️ Shield icon
- "Admin Portal" title
- "Authentic Fitness & Sports Performance" subtitle

**Enter credentials:**
- Email: `admin@afsp.com`
- Password: `AdminPass123!`

Click **"Sign In to Admin Portal"**

---

## Step 4: Verify Admin Dashboard

After login, you should see:

✅ **Sidebar navigation** with 5 tabs:
- Dashboard (home icon)
- Athletes (users icon)
- Exercises (dumbbell icon)
- Calendar (calendar icon)
- **Contracts (file icon)** ← NEW!

✅ **AFSP logo** at top of sidebar

✅ **Sign Out button** at bottom of sidebar

---

## Step 5: Test Contract Management

Click **"Contracts"** tab in sidebar.

You should see:
- 📊 Statistics cards (Total, Signed, Pending, This Month)
- 🔍 Filter buttons (All Contracts, Signed, Pending)
- 📋 Contracts table

If you created test contracts in Phase 3, they'll appear here!

---

## Step 6: Sign Out

Click **"Sign Out"** at bottom of sidebar.

You should:
- ✅ Be redirected back to admin login page
- ✅ Still be on `/admin` URL
- ✅ See the login form again

---

## Complete Test Script

Want to test everything at once? Paste this into console:

```javascript
// COMPLETE ADMIN PORTAL TEST
async function testAdminPortal() {
  const projectId = 'YOUR_PROJECT_ID';  // Replace
  const publicAnonKey = 'YOUR_ANON_KEY';  // Replace
  
  console.log('🧪 Testing Admin Portal...\n');
  
  // 1. Create admin (if not exists)
  console.log('1️⃣ Creating admin account...');
  try {
    await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        email: 'admin@afsp.com',
        password: 'AdminPass123!',
        fullName: 'Test Admin',
        role: 'admin'
      })
    }).then(r => r.json());
    console.log('✅ Admin account ready\n');
  } catch (e) {
    console.log('ℹ️ Admin might already exist (this is OK)\n');
  }
  
  // 2. Navigate to admin portal
  console.log('2️⃣ Navigate to /admin to see login page');
  console.log('   Run: window.location.href = "/admin"\n');
  
  // 3. Login test
  console.log('3️⃣ Test login with:');
  console.log('   Email: admin@afsp.com');
  console.log('   Password: AdminPass123!\n');
  
  console.log('4️⃣ After login, check for:');
  console.log('   ✓ Admin Dashboard visible');
  console.log('   ✓ 5 navigation tabs (including Contracts)');
  console.log('   ✓ URL stays at /admin\n');
  
  console.log('5️⃣ Click "Contracts" tab to see contract management\n');
  
  console.log('6️⃣ Click "Sign Out" to return to login page\n');
  
  console.log('🎉 Admin Portal Test Instructions Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testAdminPortal();
```

---

## What You'll See

### Admin Login Page
```
┌─────────────────────────────────────┐
│         🛡️ Shield Icon              │
│                                     │
│        Admin Portal                 │
│  Authentic Fitness & Sports         │
│        Performance                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Email: [input field]       │   │
│  │  Password: [input field]    │   │
│  │                             │   │
│  │  [Sign In to Admin Portal]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ← Back to main site                │
└─────────────────────────────────────┘
```

### Admin Dashboard After Login
```
┌───────────┬──────────────────────────────────┐
│  AFSP     │   DASHBOARD / ATHLETES /         │
│  Logo     │   EXERCISES / CALENDAR /         │
│           │   CONTRACTS                      │
│  Admin    │                                  │
│  Portal   │  ┌────────────────────────┐      │
│           │  │  Statistics Cards      │      │
│ Dashboard │  │  - Total Athletes      │      │
│ Athletes  │  │  - Active Programs     │      │
│ Exercises │  │  - Contracts           │      │
│ Calendar  │  └────────────────────────┘      │
│ Contracts │                                  │
│           │  Content area with tabs          │
│           │                                  │
│ Sign Out  │                                  │
└───────────┴──────────────────────────────────┘
```

---

## Troubleshooting

### Can't find project ID?
Look in `/utils/supabase/info.tsx`:
```typescript
export const projectId = 'abc123xyz';  // This one!
export const publicAnonKey = 'ey...';  // This one!
```

### Admin link not in footer?
Scroll all the way to bottom of main page. Look in "Support" section.

### "Access denied" error?
Make sure you created account with `role: 'admin'` (not 'athlete')

### Page stays at `/` instead of `/admin`?
Manually type `/admin` at end of URL or use the test script.

---

## Success Checklist

After completing all steps, you should have:

- [ ] Created admin account via API
- [ ] Navigated to `/admin` URL
- [ ] Seen professional admin login page
- [ ] Logged in successfully
- [ ] Viewed admin dashboard
- [ ] Clicked all 5 tabs (Dashboard, Athletes, Exercises, Calendar, Contracts)
- [ ] Viewed Contract Management features
- [ ] Signed out successfully
- [ ] Returned to admin login page

---

## Next Steps

Once admin portal works:

1. ✅ **Test athlete login** separately on main site
2. ✅ **Create test contracts** (see PHASE_3_TESTING.md)
3. ✅ **Verify contracts appear** in admin contract management
4. ✅ **Test filtering** (All, Signed, Pending)
5. ✅ **View contract details** modal

---

**Time to complete:** ~5 minutes
**Difficulty:** Easy
**Prerequisites:** Running app, browser console access

Happy testing! 🚀
