# Phase 3 Contract Management - Testing Guide

## Quick Start Testing

### Step 1: Create Test Accounts

#### Create Athlete Account (via UI)
1. Open your app
2. Click "Sign In" → "Sign Up"
3. Fill in:
   - Name: `Test Athlete`
   - Email: `athlete@test.com`
   - Password: `TestPass123!`
4. Sign up and you'll be auto-logged in

#### Create Admin Account (via API)
Open browser console (F12) on your app page and run:

```javascript
// Get project info from the page
const projectId = 'YOUR_PROJECT_ID'; // Replace with actual project ID
const publicAnonKey = 'YOUR_ANON_KEY'; // Replace with actual anon key

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
    fullName: 'AFSP Admin',
    role: 'admin'
  })
})
.then(r => r.json())
.then(d => console.log('Admin created:', d))
.catch(e => console.error('Error:', e));
```

---

## Method 1: Test Contract API Directly (Recommended)

This is the fastest way to test the contract system.

### Step A: Sign in as Athlete

```javascript
// Sign in to get access token
const projectId = 'YOUR_PROJECT_ID';
const publicAnonKey = 'YOUR_ANON_KEY';

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/signin`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({
    email: 'athlete@test.com',
    password: 'TestPass123!'
  })
})
.then(r => r.json())
.then(d => {
  console.log('Signed in:', d);
  // Save token for next steps
  localStorage.setItem('testToken', d.accessToken);
  localStorage.setItem('testUserId', d.user.id);
})
```

### Step B: Create a Test Enrollment

```javascript
// Create an enrollment first
const accessToken = localStorage.getItem('testToken');
const projectId = 'YOUR_PROJECT_ID';

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9340b842/programs/enroll`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    programId: 'personal-training-bootcamp',
    programName: 'Personal Training - Bootcamp',
    customization: null
  })
})
.then(r => r.json())
.then(d => {
  console.log('Enrolled:', d);
  // Save enrollment ID for contract signing
  localStorage.setItem('testEnrollmentId', d.enrollment.id);
})
```

### Step C: Sign the Contract

```javascript
// Sign contract for the enrollment
const accessToken = localStorage.getItem('testToken');
const enrollmentId = localStorage.getItem('testEnrollmentId');
const projectId = 'YOUR_PROJECT_ID';

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9340b842/contracts/sign`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    enrollmentId: enrollmentId,
    signature: 'Test Athlete',
    signedAt: new Date().toISOString()
  })
})
.then(r => r.json())
.then(d => console.log('Contract signed:', d))
.catch(e => console.error('Error:', e));
```

### Step D: Verify Contract Was Created

```javascript
// Get user's contracts
const accessToken = localStorage.getItem('testToken');
const projectId = 'YOUR_PROJECT_ID';

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9340b842/contracts`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
.then(r => r.json())
.then(d => console.log('User contracts:', d))
```

### Step E: Check Contract by Enrollment

```javascript
// Check specific contract
const accessToken = localStorage.getItem('testToken');
const enrollmentId = localStorage.getItem('testEnrollmentId');
const projectId = 'YOUR_PROJECT_ID';

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9340b842/contracts/enrollment/${enrollmentId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
.then(r => r.json())
.then(d => console.log('Contract status:', d))
```

---

## Method 2: Test Admin Contract Dashboard (UI Testing)

### Step 1: Add Contract Management to Admin Dashboard

The admin dashboard needs a way to access Contract Management. Let me show you where to add it.

You need to add a "Contracts" tab to the admin dashboard navigation.

### Step 2: Sign in as Admin

1. Click "Sign In"
2. Use credentials:
   - Email: `admin@afsp.com`
   - Password: `AdminPass123!`

### Step 3: Navigate to Contract Management

Once the tab is added (see integration below), you'll be able to:
- View contract statistics
- Filter by status
- Click "View Details" on any contract
- Review signatures and program details

---

## Method 3: Test Contract Modal (UI Testing)

To test the ContractModal component, we need to integrate it into the enrollment flow.

### Quick Integration for Testing

Add this test button to your athlete dashboard to manually trigger the contract modal:

```typescript
// In ProgramsTab.tsx or DashboardHome.tsx for testing
import { ContractModal } from '../ContractModal';

// Add this in your component
const [showTestContract, setShowTestContract] = useState(false);

// Add test button in your UI
<button
  onClick={() => {
    setPendingEnrollment({
      enrollmentId: 'test-enrollment-123',
      programName: 'Personal Training - Bootcamp',
      customization: null
    });
    setShowContractModal(true);
  }}
  className="px-4 py-2 bg-blue-600 text-white rounded"
>
  Test Contract Modal
</button>

// Add modal at bottom
{showContractModal && (
  <ContractModal
    isOpen={showContractModal}
    onClose={() => setShowContractModal(false)}
    enrollment={pendingEnrollment}
    onSigned={() => {
      console.log('Contract signed!');
      setShowContractModal(false);
    }}
  />
)}
```

---

## Complete End-to-End Test Script

Here's a complete script you can run in browser console to test everything:

```javascript
// ============================================
// COMPLETE CONTRACT SYSTEM TEST
// ============================================
// Replace these with your actual values
const CONFIG = {
  projectId: 'YOUR_PROJECT_ID',
  publicAnonKey: 'YOUR_ANON_KEY'
};

const API_BASE = `https://${CONFIG.projectId}.supabase.co/functions/v1/make-server-9340b842`;

// Helper function
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await response.json();
  console.log(`${options.method || 'GET'} ${endpoint}:`, data);
  return data;
}

// Test Flow
async function testContractSystem() {
  console.log('🚀 Starting Contract System Test...\n');
  
  try {
    // 1. Sign in as athlete
    console.log('1️⃣ Signing in as athlete...');
    const signIn = await apiCall('/auth/signin', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${CONFIG.publicAnonKey}` },
      body: JSON.stringify({
        email: 'athlete@test.com',
        password: 'TestPass123!'
      })
    });
    
    if (!signIn.accessToken) {
      console.error('❌ Sign in failed. Create athlete account first!');
      return;
    }
    
    const athleteToken = signIn.accessToken;
    console.log('✅ Signed in successfully\n');
    
    // 2. Enroll in program
    console.log('2️⃣ Enrolling in program...');
    const enrollment = await apiCall('/programs/enroll', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${athleteToken}` },
      body: JSON.stringify({
        programId: 'sports-performance-one-on-one',
        programName: 'Sports Performance One-on-One',
        customization: {
          sessions: 8,
          sessionType: 'Individual'
        }
      })
    });
    
    if (!enrollment.enrollment) {
      console.error('❌ Enrollment failed');
      return;
    }
    
    const enrollmentId = enrollment.enrollment.id;
    console.log('✅ Enrolled successfully\n');
    
    // 3. Sign contract
    console.log('3️⃣ Signing contract...');
    const contract = await apiCall('/contracts/sign', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${athleteToken}` },
      body: JSON.stringify({
        enrollmentId: enrollmentId,
        signature: 'Test Athlete',
        signedAt: new Date().toISOString()
      })
    });
    
    if (!contract.success) {
      console.error('❌ Contract signing failed');
      return;
    }
    
    console.log('✅ Contract signed successfully\n');
    
    // 4. Verify contracts
    console.log('4️⃣ Fetching user contracts...');
    const contracts = await apiCall('/contracts', {
      headers: { 'Authorization': `Bearer ${athleteToken}` }
    });
    
    console.log('✅ Found', contracts.contracts?.length || 0, 'contracts\n');
    
    // 5. Check specific contract
    console.log('5️⃣ Checking contract status...');
    const contractCheck = await apiCall(`/contracts/enrollment/${enrollmentId}`, {
      headers: { 'Authorization': `Bearer ${athleteToken}` }
    });
    
    console.log('✅ Contract status:', contractCheck.signed ? 'SIGNED' : 'PENDING', '\n');
    
    // 6. Admin view (if admin account exists)
    console.log('6️⃣ Testing admin view...');
    try {
      const adminSignIn = await apiCall('/auth/signin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${CONFIG.publicAnonKey}` },
        body: JSON.stringify({
          email: 'admin@afsp.com',
          password: 'AdminPass123!'
        })
      });
      
      if (adminSignIn.accessToken) {
        const adminContracts = await apiCall('/admin/contracts', {
          headers: { 'Authorization': `Bearer ${adminSignIn.accessToken}` }
        });
        
        console.log('✅ Admin can see', adminContracts.contracts?.length || 0, 'total contracts\n');
      }
    } catch (e) {
      console.log('⚠️ Admin account not found. Create one to test admin features.\n');
    }
    
    console.log('🎉 CONTRACT SYSTEM TEST COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Summary:');
    console.log('✅ Authentication working');
    console.log('✅ Program enrollment working');
    console.log('✅ Contract signing working');
    console.log('✅ Contract retrieval working');
    console.log('✅ Contract status checking working');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testContractSystem();
```

---

## What You Should See

### After Running the Test Script:

1. **Sign in success** - Access token received
2. **Enrollment created** - Enrollment ID generated
3. **Contract signed** - Contract ID returned with signature
4. **Contracts retrieved** - Array of user's contracts
5. **Contract verified** - Status shows "signed: true"
6. **Admin view** - All contracts visible with user details

### In the Console:

```
🚀 Starting Contract System Test...

1️⃣ Signing in as athlete...
POST /auth/signin: { accessToken: "...", user: {...} }
✅ Signed in successfully

2️⃣ Enrolling in program...
POST /programs/enroll: { success: true, enrollment: {...} }
✅ Enrolled successfully

3️⃣ Signing contract...
POST /contracts/sign: { success: true, contract: {...} }
✅ Contract signed successfully

4️⃣ Fetching user contracts...
GET /contracts: { contracts: [...] }
✅ Found 1 contracts

5️⃣ Checking contract status...
GET /contracts/enrollment/...: { contract: {...}, signed: true }
✅ Contract status: SIGNED

6️⃣ Testing admin view...
GET /admin/contracts: { contracts: [...] }
✅ Admin can see 1 total contracts

🎉 CONTRACT SYSTEM TEST COMPLETE!
```

---

## Visual UI Testing Checklist

### Contract Modal
- [ ] Opens with contract content visible
- [ ] Scrollable contract area
- [ ] All 9 sections displayed correctly
- [ ] Signature input field works
- [ ] Agreement checkbox works
- [ ] "Sign Agreement" button disabled until both filled
- [ ] Success message after signing
- [ ] Modal closes after signing

### Admin Dashboard
- [ ] Statistics cards show correct counts
- [ ] Filter buttons work (All, Signed, Pending)
- [ ] Contracts table displays all data
- [ ] "View Details" opens modal
- [ ] Detail modal shows complete info
- [ ] Signature displayed in serif font
- [ ] Status badges color-coded correctly

---

## Troubleshooting

### "Unauthorized" Error
- Make sure you're signed in
- Check that access token is valid
- Verify token is included in Authorization header

### "Enrollment not found"
- Create an enrollment first before signing contract
- Verify enrollmentId is correct
- Check that enrollment belongs to the signed-in user

### "Admin access required"
- Make sure admin account has role: 'admin'
- Sign in with admin credentials
- Verify admin user exists in database

### Contract Modal Not Showing
- Check browser console for errors
- Verify ContractModal is imported
- Ensure modal state is set to true
- Check that enrollment prop is passed

---

## Next Steps After Testing

Once you've verified everything works:

1. **Integrate into enrollment flow** - Show contract modal after enrollment
2. **Add contract status to UI** - Display "Contract Signed" badge
3. **Add admin tab** - Include Contract Management in admin navigation
4. **Test with real users** - Get feedback on contract terms
5. **Legal review** - Have contract reviewed by legal counsel
6. **Add Square payment** - Connect payment to signed contracts

---

## Quick Reference

### Test Credentials

**Athlete:**
- Email: `athlete@test.com`
- Password: `TestPass123!`

**Admin:**
- Email: `admin@afsp.com`
- Password: `AdminPass123!`

### API Endpoints

- `POST /auth/signin` - Sign in
- `POST /programs/enroll` - Enroll in program
- `POST /contracts/sign` - Sign contract
- `GET /contracts` - Get user contracts
- `GET /contracts/enrollment/:id` - Check contract status
- `GET /admin/contracts` - Admin: view all contracts

### Sample Enrollment Object for Testing

```javascript
{
  enrollmentId: 'enrollment:userId:programId:timestamp',
  programName: 'Personal Training - Bootcamp',
  customization: null
}
```

---

Happy Testing! 🚀
