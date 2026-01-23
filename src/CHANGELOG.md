# Changelog

All notable changes to the AFSP Platform project will be documented in this file.

## [1.0.0] - 2026-01-20

### Phase 1 - Foundation & Athlete Dashboard ✅

#### Added
- **Authentication System**
  - User signup with role selection (athlete/admin)
  - Secure sign-in/sign-out flow
  - Session management with JWT tokens
  - Role-based access control
  
- **Backend Infrastructure**
  - Supabase Edge Function server with Hono framework
  - RESTful API endpoints for all features
  - KV store integration for data persistence
  - Protected routes with authentication middleware

- **Athlete Dashboard**
  - Responsive navigation with mobile hamburger menu
  - Dashboard home with daily exercises and progress charts
  - Exercise tracking with completion status
  - Weekly progress visualization using Recharts
  - Profile management tab

- **Program Management**
  - Browse available training programs
  - Program enrollment system
  - Enrolled programs display
  - Program details and descriptions

#### Landing Page
- Hero section with CTA
- Features showcase
- Metrics display
- Programs overview
- Testimonials section
- Footer with company info

### Phase 2 - Journal, Chat & Admin Dashboard ✅

#### Added
- **Journal System**
  - Create journal entries with title, content, and mood
  - Mood tracking (happy, neutral, sad)
  - Media upload support (images and videos)
  - Supabase Storage integration with private buckets
  - Entry editing and deletion
  - Grid view of all entries
  - Detailed entry view with attachments

- **Chat Functionality**
  - Channel-based messaging system
  - General channel for all athletes
  - Direct messaging with coaches
  - Real-time message polling (3-second intervals)
  - Message history with timestamps
  - Sender name display
  - Responsive chat UI

- **Admin Dashboard**
  - Overview dashboard with key metrics
  - Total athletes count
  - Program enrollments tracking
  - Recent athletes list
  - Growth statistics

- **Athlete Management (Admin)**
  - View all registered athletes
  - Search athletes by name or email
  - View athlete program enrollments
  - Athlete profile details
  - Join date tracking

- **Exercise Assignment (Admin)**
  - Assign exercises to specific athletes
  - Exercise details (sets, reps, duration)
  - Assignment date selection
  - Notes for athletes
  - Template system placeholder

#### Backend Enhancements
- Journal entry CRUD endpoints
- Media upload endpoint with file handling
- Chat message endpoints
- Channel management system
- Admin-only protected routes
- Storage bucket initialization

### Phase 2.5 - Program Management Improvements ✅

#### Changed
- **Program Enrollment Redesign**
  - Separated standard programs from custom programs
  - 4 Standard Programs: Bootcamp, One-on-One, Athletix Club, Drop-In Sessions
  - Each standard program shows full details without customization
  - "View Details" modal for program information
  - Simple enrollment flow for standard programs

- **Custom Program Builder**
  - Dedicated "Create Your Own Program" option
  - 4-step customization wizard:
    - Step 1: Basic info (name, goals, experience level)
    - Step 2: Training schedule (days/week, duration)
    - Step 3: Focus areas (body parts to target)
    - Step 4: Equipment available
  - Program summary before creation
  - Only custom programs use the customization flow

#### Added
- Payment modal component (ready for Square integration)
- Card details form with validation
- Payment success confirmation
- Formatted card number and expiry date inputs

## [Unreleased] - Phase 3 (Planned)

### Planned Features
- [ ] Square payment integration
- [ ] Digital contract management
  - Contract templates
  - E-signature capability
  - Contract viewing and download
- [ ] Calendar and booking system
  - Session scheduling
  - Appointment booking
  - Availability management
- [ ] Attendance tracking
  - Check-in system
  - Attendance history
  - No-show tracking

### Future Enhancements
- [ ] Email notification system
- [ ] Push notifications for chat
- [ ] Video call integration
- [ ] Nutrition tracking
- [ ] Workout video library
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Wearable device integration
- [ ] Social media sharing
- [ ] Achievement badges and gamification

## Technical Details

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **Backend**: Supabase Edge Functions (Hono)
- **Database**: Supabase PostgreSQL + KV Store
- **Storage**: Supabase Storage (private buckets)
- **Auth**: Supabase Auth with JWT
- **Charts**: Recharts
- **Icons**: Lucide React

### Architecture
- Three-tier architecture (Frontend → Server → Database)
- RESTful API design
- Role-based access control (RBAC)
- Secure file storage with signed URLs
- Real-time features via polling
- Responsive mobile-first design

### Security
- JWT authentication
- Role-based authorization
- Protected API routes
- Private storage buckets
- Service role key server-side only
- Input validation and sanitization

## Version History

- **v1.0.0** (2026-01-20): Initial release with Phase 1 & 2 complete
- **v0.1.0** (2026-01-15): Project initialization and setup

---

**Note**: This project follows [Semantic Versioning](https://semver.org/).
