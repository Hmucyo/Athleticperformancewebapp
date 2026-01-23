# Authentic Fitness & Sports Performance Platform

A comprehensive athletic performance web application built with React, TypeScript, and Supabase, featuring separate athlete and admin experiences with real-time chat, journal entries, exercise tracking, and program management.

## 🚀 Features

### Athlete Features
- **Dashboard**: View daily exercises, track progress with interactive charts
- **Programs**: Browse and enroll in training programs or create custom programs
- **Journal**: Document training journey with text and media uploads (images/videos)
- **Chat**: Real-time messaging with coaches and community channels
- **Profile**: Manage personal information and view enrolled programs
- **Exercise Tracking**: Mark exercises as complete with progress visualization

### Admin Features
- **Dashboard**: Overview of athlete statistics and recent activity
- **Athlete Management**: View all athletes, search, and track enrollments
- **Exercise Assignment**: Assign workouts to specific athletes with details
- **Calendar**: Schedule management (placeholder for Phase 3 expansion)
- **Real-time Updates**: Track athlete progress and engagement

### Core Functionality
- **Authentication**: Secure sign-up/sign-in with role-based access (athlete/admin)
- **Program Management**: 
  - 4 Standard Programs (Bootcamp, One-on-One, Athletix Club, Drop-In Sessions)
  - Custom Program Builder with 4-step customization wizard
- **Media Storage**: Supabase Storage integration for journal media
- **Real-time Chat**: Auto-polling message system with channel support
- **Payment Integration**: Payment modal ready for Square integration

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Edge Functions with Hono)
- **Database**: Supabase PostgreSQL with KV Store
- **Storage**: Supabase Storage (private buckets)
- **Authentication**: Supabase Auth with role management
- **Icons**: Lucide React
- **Charts**: Recharts

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account and project
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/afsp-platform.git
   cd afsp-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and keys

4. **Configure environment variables**
   
   Update `/utils/supabase/info.tsx` with your Supabase credentials:
   ```typescript
   export const projectId = 'your-project-id';
   export const publicAnonKey = 'your-anon-key';
   ```

   Set up Supabase secrets (in Supabase dashboard):
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `SUPABASE_DB_URL`: Your Supabase database URL

5. **Deploy Supabase Edge Function**
   ```bash
   supabase functions deploy server
   ```

## 🚀 Running the Application

```bash
npm run dev
```

The application will start at `http://localhost:3000`

## 👥 User Accounts

### Creating Admin Account
Use the signup endpoint to create an admin user:
```bash
POST https://your-project.supabase.co/functions/v1/make-server-9340b842/auth/signup
{
  "email": "admin@example.com",
  "password": "securepassword",
  "fullName": "Admin Name",
  "role": "admin"
}
```

### Creating Athlete Account
Athletes can sign up through the UI or via API with `role: "athlete"`

## 📁 Project Structure

```
/
├── App.tsx                          # Main app component with routing
├── components/
│   ├── athlete/                     # Athlete dashboard components
│   │   ├── AthleteDashboard.tsx
│   │   ├── DashboardHome.tsx
│   │   ├── ProgramsTab.tsx
│   │   ├── JournalTab.tsx
│   │   ├── ChatTab.tsx
│   │   └── ProfileTab.tsx
│   ├── admin/                       # Admin dashboard components
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminHome.tsx
│   │   ├── AthleteManagement.tsx
│   │   └── ExerciseAssignment.tsx
│   ├── AuthModal.tsx                # Authentication modal
│   ├── PaymentModal.tsx             # Payment processing modal
│   └── [Landing page components]
├── supabase/functions/server/
│   ├── index.tsx                    # Main server with all API routes
│   └── kv_store.tsx                 # Key-value store utilities
├── utils/supabase/
│   └── info.tsx                     # Supabase configuration
└── styles/
    └── globals.css                  # Global styles and Tailwind config
```

## 🔑 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Sign in user
- `POST /auth/signout` - Sign out user
- `GET /auth/session` - Get current session

### Programs
- `GET /programs/enrolled` - Get user's enrolled programs
- `POST /programs/enroll` - Enroll in a program

### Exercises
- `GET /exercises` - Get user's exercises
- `PUT /exercises/:id/complete` - Mark exercise as complete
- `POST /admin/exercises/assign` - Assign exercise to athlete (admin)

### Journal
- `GET /journal/entries` - Get user's journal entries
- `POST /journal/entries` - Create journal entry
- `PUT /journal/entries/:id` - Update journal entry
- `DELETE /journal/entries/:id` - Delete journal entry
- `POST /journal/entries/:id/media` - Upload media to entry

### Chat
- `GET /chat/channels` - Get available channels
- `GET /chat/messages/:channelId` - Get messages for channel
- `POST /chat/messages` - Send message

### Admin
- `GET /admin/athletes` - Get all athletes (admin only)

## 🎨 Design Philosophy

The platform follows the "Human-First Excellence" philosophy with:
- **Tailored Holistic Coaching**: Customizable training programs
- **Passion and Purpose**: Motivation through progress tracking
- **Inclusive Community**: Chat and social features
- **Built to Last**: Sustainable training approaches

## 🔒 Security

- Role-based access control (athlete/admin)
- JWT authentication via Supabase
- Protected routes with session validation
- Private storage buckets for user media
- Service role key secured server-side

## 📱 Responsive Design

- Mobile-first approach
- Hamburger menus on mobile
- Responsive grids and layouts
- Touch-friendly UI elements

## 🚧 Roadmap / Future Enhancements

- [ ] Square payment integration (Phase 3)
- [ ] Digital contract management (Phase 3)
- [ ] Calendar/booking system (Phase 3)
- [ ] Attendance tracking (Phase 3)
- [ ] Email notifications
- [ ] Push notifications for chat
- [ ] Video call integration
- [ ] Nutrition tracking
- [ ] Workout video library
- [ ] Performance analytics dashboard
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Authentic Fitness & Sports Performance.

## 👨‍💻 Development Team

Built with ❤️ for Authentic Fitness & Sports Performance

## 📞 Support

For support, email support@authenticfitness.com or open an issue in the repository.

## 🙏 Acknowledgments

- Design inspiration from boom-athletics.com
- Built with Figma Make
- Powered by Supabase
- Icons by Lucide
