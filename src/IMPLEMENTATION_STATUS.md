# Program Management System - Implementation Status

## ✅ COMPLETED - Backend (Phase 1)

### Authentication & User Management
- ✅ Create Coach user endpoint (`POST /auth/create-coach`)
- ✅ Existing Admin and Athlete auth endpoints

### Admin Program Management Endpoints
- ✅ `GET /admin/coaches` - Get all coaches for assignment
- ✅ `POST /admin/programs` - Create new program with categories and coach assignment
- ✅ `GET /admin/programs` - Get all admin-created programs
- ✅ `PUT /admin/programs/:id` - Update program
- ✅ `DELETE /admin/programs/:id` - Delete program

### Coach Portal Endpoints
- ✅ `GET /coach/programs` - Get coach's assigned programs with enrolled athletes
- ✅ `GET /coach/exercises` - Access exercise library
- ✅ `POST /coach/exercises/:exerciseId/assign` - Assign exercises to athletes

### Public & Athlete Endpoints
- ✅ `GET /programs/public` - Get public program listings (for landing page & athlete portal)

## 📋 TODO - Frontend Implementation

### Phase 2: Admin Portal - Programs Tab
**Location:** `/components/admin/ProgramManagement.tsx`

**Features Needed:**
1. Programs list view with:
   - Program name, description, price
   - Categories (Delivery, Format, Category)
   - Assigned coach name
   - Exercise count
   - Edit/Delete buttons

2. Create Program Modal with:
   - Basic Info: Name, Description, Price, Duration
   - Category Selection (3 dropdowns):
     - Delivery: In Person / Online
     - Format: Individual / Group  
     - Category: Sport Performance / Fitness & Wellness
   - Coach Assignment dropdown (from `/admin/coaches`)
   - Exercise Selection (multi-select from exercise library)
   - Max Participants (for group programs)

3. Edit Program functionality
4. Delete Program confirmation

**Add to:** `/components/admin/AdminDashboard.tsx`
- New "Programs" tab navigation

---

### Phase 3: Coach Portal
**Location:** `/coach/*` routes (new)

**Files to Create:**
1. `/components/coach/CoachLogin.tsx` - Separate coach login
2. `/components/coach/CoachDashboard.tsx` - Main coach interface
3. `/components/coach/ProgramsView.tsx` - View assigned programs
4. `/components/coach/AthletesView.tsx` - View athletes in programs
5. `/components/coach/ExerciseAssignment.tsx` - Assign exercises
6. `/components/coach/MessagingView.tsx` - Chat with athletes

**Features:**
- Coach login (similar to admin login at `/coach`)
- Dashboard showing:
  - Assigned programs list
  - Athletes per program
  - Exercise library access
  - Exercise assignment tool
  - Messaging interface

**Routing:**
Add coach routes to `/routes.ts`:
```typescript
{
  path: "/coach",
  Component: CoachLogin,
},
{
  path: "/coach/dashboard",
  Component: CoachDashboard,
}
```

---

### Phase 4: Athlete Portal Updates
**Location:** `/components/athlete/ProgramsTab.tsx`

**Changes Needed:**
1. Replace hardcoded programs with API call to `/programs/public`
2. Display program overview cards showing:
   - Name, Description, Price
   - Categories (badges): Delivery, Format, Category
   - Coach name
   - Duration, Max participants

3. "View Details" shows overview ONLY (no exercises) until enrolled

4. After enrollment:
   - Show assigned exercises from program
   - Access to full program details

---

### Phase 5: Landing Page Updates
**Location:** `/App.tsx` (Programs Section)

**Changes Needed:**
1. Fetch programs from `/programs/public` instead of hardcoded data
2. Display program cards with:
   - Name, Description
   - Price
   - Categories (visual badges)
   - Coach name
   - "Learn More" button

3. Responsive grid layout
4. Filter by categories (optional enhancement)

---

## Data Models

### Program Object
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number | null;
  delivery: 'in-person' | 'online';
  format: 'individual' | 'group';
  category: 'sport-performance' | 'fitness-wellness';
  coachId: string | null;
  coachName?: string; // Added by backend
  exercises: string[]; // Array of exercise IDs
  duration: string | null;
  maxParticipants: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}
```

### Coach Object
```typescript
{
  id: string;
  email: string;
  fullName: string;
  role: 'coach';
  programs: string[];
  createdAt: string;
}
```

---

## Implementation Priority

### HIGH PRIORITY (Core Functionality)
1. ✅ Backend program routes
2. 🔲 Admin Programs Tab (create/edit/delete)
3. 🔲 Update landing page to use admin programs
4. 🔲 Update athlete portal to use admin programs

### MEDIUM PRIORITY (Coach Features)
5. 🔲 Coach login & routing
6. 🔲 Coach dashboard
7. 🔲 Coach program view
8. 🔲 Coach exercise assignment

### LOW PRIORITY (Enhancements)
9. 🔲 Coach messaging
10. 🔲 Program filtering
11. 🔲 Enrollment analytics

---

## Next Steps

1. **Create Admin Programs Tab** - This is the foundation
2. **Update Landing Page** - Show admin-created programs
3. **Update Athlete Portal** - Replace hardcoded with real data
4. **Build Coach Portal** - Complete coach experience
5. **Testing & Refinement** - End-to-end testing

---

## API Endpoints Reference

### Admin
- `POST /auth/create-coach` - Create coach user
- `GET /admin/coaches` - List all coaches
- `GET /admin/programs` - List all programs  
- `POST /admin/programs` - Create program
- `PUT /admin/programs/:id` - Update program
- `DELETE /admin/programs/:id` - Delete program
- `GET /admin/exercises` - Exercise library

### Coach
- `GET /coach/programs` - My assigned programs + athletes
- `GET /coach/exercises` - Exercise library
- `POST /coach/exercises/:id/assign` - Assign to athletes

### Public/Athlete
- `GET /programs/public` - Public program listings
- `POST /programs/enroll` - Enroll in program (existing)

