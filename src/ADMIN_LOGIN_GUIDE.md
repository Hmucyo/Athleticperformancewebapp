# Admin Login Portal Guide

## Overview

The AFSP platform now has a **dedicated admin portal** accessible at `/admin` with its own secure login page. This provides a professional, separated experience for administrators.

---

## How to Access Admin Portal

### Method 1: Direct URL
Simply navigate to:
```
https://your-app-url.com/admin
```

### Method 2: Footer Link
On the main website, scroll to the bottom footer and click the subtle "Admin" link under the Support section.

---

## Admin Login Page Features

### Visual Design
- **Shield icon** - Professional admin branding
- **Dark theme** - Consistent with AFSP design
- **Gradient accents** - Blue to purple gradient
- **Security notice** - Displays monitoring message
- **Back to main site** - Link to return to public website

### Security Features
- ✅ **Role verification** - Only users with `role: 'admin'` can access
- ✅ **Access denied message** - Athletes attempting admin login see error
- ✅ **Session validation** - Verifies credentials on every request
- ✅ **Separate auth flow** - Admins don't interfere with athlete sessions
- ✅ **Monitored access** - Login attempts tracked (security notice displayed)

### User Experience
- Clean, focused login form
- Clear error messages
- Loading states during authentication
- Auto-redirect to admin dashboard on success
- Stays on `/admin` path throughout session

---

## Creating Admin Accounts

### Option 1: Via API (Recommended)

Open browser console and run:

```javascript
const projectId = 'YOUR_PROJECT_ID';
const publicAnonKey = 'YOUR_ANON_KEY';

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/signup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({
    email: 'admin@afsp.com',
    password: 'SecureAdminPass123!',
    fullName: 'Admin User',
    role: 'admin'  // Important: must be 'admin'
  })
})
.then(r => r.json())
.then(d => console.log('Admin created:', d));
```

### Option 2: Multiple Admin Accounts

You can create multiple admin accounts with different permissions:

```javascript
// Head Coach
{
  email: 'coach@afsp.com',
  password: 'CoachPass123!',
  fullName: 'Head Coach',
  role: 'admin'
}

// Operations Manager
{
  email: 'ops@afsp.com',
  password: 'OpsPass123!',
  fullName: 'Operations Manager',
  role: 'admin'
}

// Owner
{
  email: 'owner@afsp.com',
  password: 'OwnerPass123!',
  fullName: 'Business Owner',
  role: 'admin'
}
```

---

## Login Flow

### Step-by-Step Process

1. **Navigate to `/admin`**
   - User sees admin login page
   - Not logged in yet

2. **Enter Credentials**
   - Email: admin@afsp.com
   - Password: (your admin password)

3. **Click "Sign In to Admin Portal"**
   - Credentials validated
   - Role checked (must be 'admin')

4. **Success → Admin Dashboard**
   - Redirected to admin dashboard
   - Access to all admin features:
     - Dashboard overview
     - Athlete management
     - Exercise assignment
     - Calendar
     - **Contract management** (new!)

5. **Sign Out**
   - Click "Sign Out" in sidebar
   - Redirected back to admin login page
   - Session cleared

---

## Admin vs Athlete Login

### Differences

| Feature | Admin Portal (`/admin`) | Main Site |
|---------|------------------------|-----------|
| **URL** | `/admin` | `/` |
| **Login Page** | Dedicated admin login | Modal popup |
| **Required Role** | `role: 'admin'` | `role: 'athlete'` |
| **Dashboard** | Admin features | Athlete features |
| **Branding** | Shield icon, "Admin Portal" | AFSP logo, public site |
| **Access Control** | Restricted to admins only | Open to athletes |

### What Happens If...

**Athlete tries to log in at `/admin`:**
- ❌ Error: "Access denied. Admin credentials required."
- Athlete must use main site login

**Admin logs in at main site:**
- ✅ Works! Admin sees admin dashboard
- But recommended to use `/admin` for consistency

**Admin tries to access athlete dashboard:**
- ✅ Admin automatically sees admin dashboard
- Role-based routing handles this

---

## Testing the Admin Login

### Quick Test

1. **Create admin account** (if not done):
```javascript
// See "Creating Admin Accounts" section above
```

2. **Navigate to admin portal**:
```
Type in browser: http://localhost:YOUR_PORT/admin
```

3. **Login with admin credentials**:
- Email: admin@afsp.com
- Password: (whatever you set)

4. **Verify you see**:
- Admin dashboard
- Navigation with 5 tabs (Dashboard, Athletes, Exercises, Calendar, Contracts)
- Your admin name in UI

5. **Test Contract Management**:
- Click "Contracts" tab
- See contract statistics
- View any signed contracts

6. **Sign out**:
- Click "Sign Out"
- Should return to admin login page

---

## Admin Portal Features

After logging in, admins have access to:

### 1. Dashboard (Home)
- Total athletes count
- Active programs
- Recent workouts
- Quick stats overview

### 2. Athlete Management
- View all athletes
- Search and filter
- View athlete details
- Monitor progress

### 3. Exercise Assignment
- Assign exercises to athletes
- Set reps, sets, weights
- Schedule workouts
- Track completions

### 4. Calendar
- Schedule overview
- Session bookings
- (Coming soon)

### 5. **Contracts** (NEW!)
- View all signed contracts
- Filter by status (All, Signed, Pending)
- See athlete details
- Review signatures
- Track contract dates
- Export capabilities (future)

---

## Security Best Practices

### For Admins

✅ **Use strong passwords** - Minimum 12 characters with mix of letters, numbers, symbols
✅ **Don't share credentials** - Each admin should have their own account
✅ **Log out when done** - Especially on shared computers
✅ **Use `/admin` exclusively** - Keep admin and athlete experiences separate
✅ **Monitor access logs** - Check for unauthorized attempts (future feature)

### For Developers

✅ **Role verification on every request** - Backend checks user role
✅ **Session validation** - Tokens expire and are verified
✅ **Separate routing** - `/admin` path is protected
✅ **Error messages** - Don't reveal system details
✅ **HTTPS only** - Use SSL in production

---

## Troubleshooting

### "Access denied. Admin credentials required."

**Problem:** You're trying to log in with an athlete account

**Solution:** 
- Make sure account has `role: 'admin'`
- Create new admin account if needed
- Athletes should use main site login

### "Invalid admin credentials"

**Problem:** Email or password is incorrect

**Solution:**
- Double-check spelling
- Passwords are case-sensitive
- Reset password if forgotten (future feature)

### Admin login page doesn't show

**Problem:** Not navigating to correct URL

**Solution:**
- Type `/admin` at end of your URL
- Click "Admin" link in footer
- Make sure app is running

### Can't access contract management

**Problem:** Tab not showing

**Solution:**
- Verify you're logged in as admin
- Check that ContractManagement component imported
- Refresh the page

### Sign out redirects to wrong page

**Problem:** Not returning to admin login

**Solution:**
- This is handled automatically
- Should return to `/admin` login page
- Clear browser cache if issue persists

---

## URL Structure

```
Main Site (Athletes)
https://your-app.com/
  ↓
  Login Modal → Athlete Dashboard

Admin Portal
https://your-app.com/admin
  ↓
  Admin Login Page → Admin Dashboard
```

---

## Code Architecture

### Components

```
/components/admin/
├── AdminLogin.tsx          ← New dedicated login page
├── AdminDashboard.tsx      ← Updated with Contracts tab
├── AdminHome.tsx
├── AthleteManagement.tsx
├── ExerciseAssignment.tsx
└── ContractManagement.tsx  ← New contract features
```

### Routing Logic (App.tsx)

```typescript
// Check current path
if (currentPath === '/admin') {
  if (user && user.role === 'admin') {
    return <AdminDashboard />    // Logged in admin
  } else {
    return <AdminLogin />         // Not logged in
  }
}

// Default: main site
return <LandingPage />
```

### Authentication Flow

```
1. User enters credentials on AdminLogin
2. POST /auth/signin with email/password
3. Server validates credentials
4. Server returns user object with role
5. AdminLogin checks: user.role === 'admin'
6. If yes: store token, redirect to dashboard
7. If no: show error "Access denied"
```

---

## Future Enhancements

### Recommended Features

1. **Password Reset**
   - Forgot password link
   - Email reset flow
   - Secure token generation

2. **Two-Factor Authentication**
   - SMS or authenticator app
   - Extra security for sensitive admin access

3. **Admin Permissions**
   - Different admin levels (super admin, coach, staff)
   - Granular permissions per feature
   - Role-based access control

4. **Activity Logs**
   - Track all admin actions
   - Login history
   - Audit trail for compliance

5. **IP Whitelisting**
   - Restrict admin login to specific IPs
   - Office-only access option

6. **Session Management**
   - View active admin sessions
   - Force logout capabilities
   - Session timeout settings

---

## Quick Reference

### Default Admin Credentials (After Setup)
```
Email: admin@afsp.com
Password: (whatever you set during creation)
```

### Admin Portal URL
```
Development: http://localhost:YOUR_PORT/admin
Production: https://your-domain.com/admin
```

### Footer Link Location
```
Main Site → Scroll to Bottom → Support Section → "Admin" link
```

### Required Role
```
role: 'admin'
```

### API Endpoints Used
```
POST /auth/signup    - Create admin account
POST /auth/signin    - Admin login
POST /auth/signout   - Admin logout
GET  /auth/session   - Validate session
```

---

## Support

For additional help:

- **Testing Guide**: See `/TESTING_GUIDE.md`
- **Phase 3 Testing**: See `/PHASE_3_TESTING.md`
- **Contract Management**: See `/PHASE_3_SUMMARY.md`

---

## Summary

✅ **Dedicated admin portal** at `/admin`
✅ **Secure login page** with role verification
✅ **Separated experience** from athlete login
✅ **Professional design** with AFSP branding
✅ **Contract management** fully integrated
✅ **Easy access** via footer link or direct URL

The admin portal provides a professional, secure way for AFSP administrators to manage their platform without mixing with the athlete experience.

---

**Admin Portal Status:** ✅ COMPLETE AND READY TO USE
