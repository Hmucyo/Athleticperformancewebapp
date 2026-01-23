# 📊 Project Overview

## AFSP Platform - Authentic Fitness & Sports Performance

### 🎯 Project Summary

A comprehensive athletic performance web application featuring dual dashboards (athlete & admin), real-time communication, progress tracking, and program management. Built with modern web technologies for a seamless training experience.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │   Landing  │  │   Athlete  │  │   Admin Dashboard  │   │
│  │    Page    │  │  Dashboard │  │                    │   │
│  └────────────┘  └────────────┘  └────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST API
┌────────────────────────▼────────────────────────────────────┐
│                 SUPABASE EDGE FUNCTIONS                      │
│              (Hono Server - index.tsx)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Auth   │ │ Programs │ │ Journal  │ │   Chat   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼────────┐              ┌────────▼────────┐
│   PostgreSQL   │              │  Supabase       │
│   (KV Store)   │              │  Storage        │
│                │              │  (Media Files)  │
└────────────────┘              └─────────────────┘
```

---

## 👥 User Flows

### Athlete Journey
```
Sign Up/Login → Dashboard Home → View Daily Exercises → Track Progress
                      ↓
              Browse Programs → Enroll → Customize (if custom)
                      ↓
              Journal Entry → Add Media → Save
                      ↓
              Chat → Select Channel → Send Messages
                      ↓
              Profile → Update Info → View Progress
```

### Admin Journey
```
Admin Login → Admin Dashboard → View Statistics
                    ↓
            Athlete Management → Search Athletes → View Details
                    ↓
            Exercise Assignment → Select Athlete → Assign Workout
                    ↓
            Chat → Message Athletes → Provide Support
```

---

## 📱 Features by Role

### 🏃 Athlete Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Dashboard** | Daily exercises, progress charts | ✅ Complete |
| **Programs** | Browse & enroll in training programs | ✅ Complete |
| **Custom Programs** | 4-step customization wizard | ✅ Complete |
| **Journal** | Text entries with photo/video uploads | ✅ Complete |
| **Chat** | Real-time messaging with channels | ✅ Complete |
| **Profile** | Personal info and settings | ✅ Complete |
| **Exercise Tracking** | Mark exercises complete | ✅ Complete |
| **Progress Charts** | Weekly completion visualization | ✅ Complete |

### 👨‍💼 Admin Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Dashboard** | Overview statistics | ✅ Complete |
| **Athlete Management** | View all athletes, search | ✅ Complete |
| **Exercise Assignment** | Assign workouts to athletes | ✅ Complete |
| **Chat Access** | Message athletes | ✅ Complete |
| **Calendar** | Booking management | 🔜 Phase 3 |
| **Payments** | Process payments | 🔜 Phase 3 |
| **Contracts** | Digital signatures | 🔜 Phase 3 |
| **Attendance** | Track check-ins | 🔜 Phase 3 |

---

## 🗂️ Database Schema (KV Store)

```
Key Pattern                  Value Structure
─────────────────────────────────────────────────────────
user:{userId}                { id, email, fullName, role, ... }
enrollment:{enrollmentId}    { userId, programId, programName, enrolledAt, customization, ... }
exercise:{exerciseId}        { userId, name, description, sets, reps, assignedDate, completed, ... }
journal:{userId}:{timestamp} { id, userId, title, content, mood, media[], createdAt, ... }
message:{channelId}:{time}   { id, senderId, recipientId, channelId, content, createdAt, ... }
```

---

## 🎨 Tech Stack Details

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 (utility-first)
- **Charts**: Recharts (responsive charts)
- **Icons**: Lucide React (modern icon set)
- **Forms**: React Hook Form
- **Notifications**: Sonner

### Backend
- **Runtime**: Deno (via Supabase Edge Functions)
- **Framework**: Hono (lightweight web framework)
- **Database**: PostgreSQL with KV store
- **Storage**: Supabase Storage (50MB file limit)
- **Auth**: Supabase Auth (JWT-based)

### Deployment
- **Recommended**: Vercel or Netlify
- **Backend**: Supabase (serverless)
- **CDN**: Automatic with deployment platform

---

## 📦 File Structure

```
afsp-platform/
│
├── components/
│   ├── athlete/              # Athlete dashboard components
│   │   ├── AthleteDashboard.tsx
│   │   ├── DashboardHome.tsx
│   │   ├── ProgramsTab.tsx
│   │   ├── JournalTab.tsx
│   │   ├── ChatTab.tsx
│   │   └── ProfileTab.tsx
│   │
│   ├── admin/                # Admin dashboard components
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminHome.tsx
│   │   ├── AthleteManagement.tsx
│   │   └── ExerciseAssignment.tsx
│   │
│   ├── ui/                   # Reusable UI components
│   │   └── [50+ shadcn components]
│   │
│   ├── AuthModal.tsx         # Authentication modal
│   ├── PaymentModal.tsx      # Payment processing
│   └── [Landing components]  # Hero, Features, CTA, etc.
│
├── supabase/functions/server/
│   ├── index.tsx             # Main API server (25KB+)
│   └── kv_store.tsx          # Database utilities
│
├── utils/supabase/
│   └── info.tsx              # Supabase configuration
│
├── styles/
│   └── globals.css           # Global styles + Tailwind
│
├── App.tsx                   # Main app component
├── README.md                 # Full documentation
├── DEPLOYMENT.md             # Deployment guide
├── CHANGELOG.md              # Version history
├── GITHUB_SETUP.md           # GitHub push guide
├── package.json              # Dependencies
└── .gitignore                # Git ignore rules
```

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Protected API routes
- ✅ Private storage buckets
- ✅ Input validation
- ✅ Service role key isolation
- ✅ HTTPS enforcement
- ✅ Session management

---

## 📈 Metrics & Analytics

### Current Stats (v1.0)
- **Total Components**: 60+
- **API Endpoints**: 20+
- **Lines of Code**: ~15,000+
- **File Size**: ~500KB (uncompressed)
- **Load Time**: <2s (typical)
- **Mobile Responsive**: ✅ Yes

### Performance
- **Lighthouse Score**: Target 90+
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Total Blocking Time**: <300ms

---

## 🚀 Deployment Options

### 1. Vercel (Recommended)
```bash
npm install -g vercel
vercel
vercel --prod
```
**Pros**: Automatic, fast, free tier, optimized for React

### 2. Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```
**Pros**: Easy CI/CD, forms, functions

### 3. Traditional Hosting
```bash
npm run build
# Upload /dist folder to your host
```
**Pros**: Full control, any provider

---

## 🎯 Phase Completion Status

| Phase | Features | Status |
|-------|----------|--------|
| **Phase 1** | Auth, Dashboard, Programs, Exercises | ✅ 100% |
| **Phase 2** | Journal, Chat, Admin Dashboard | ✅ 100% |
| **Phase 2.5** | Program Flow Improvements | ✅ 100% |
| **Phase 3** | Payments, Contracts, Calendar | 🔜 Planned |

---

## 💡 Key Innovations

1. **Dual Dashboard Design** - Separate experiences optimized for each user role
2. **Custom Program Builder** - 4-step wizard for personalized training
3. **Media-Rich Journal** - Upload images/videos with signed URLs
4. **Real-time Chat** - Polling-based messaging without WebSockets
5. **KV Store Architecture** - Flexible data model without migrations
6. **Role-Based Everything** - Consistent RBAC across all features

---

## 📞 Support & Resources

- **Documentation**: README.md (comprehensive)
- **Deployment**: DEPLOYMENT.md (step-by-step)
- **Changes**: CHANGELOG.md (version history)
- **GitHub Setup**: GITHUB_SETUP.md (push guide)

---

## 🎓 Learning Resources

Built with these technologies - check them out:
- **React**: https://react.dev
- **TypeScript**: https://typescriptlang.org
- **Tailwind CSS**: https://tailwindcss.com
- **Supabase**: https://supabase.com/docs
- **Hono**: https://hono.dev

---

**Project Status**: 🟢 Production Ready (Phase 1 & 2)
**Last Updated**: January 20, 2026
**Version**: 1.0.0
