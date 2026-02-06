import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";
import { registerProgramRoutes } from "./program_routes.tsx";

const app = new Hono();

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Initialize Supabase client with anon key for user token validation
const supabaseAnon = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Initialize storage buckets on startup
const initStorage = async () => {
  const bucketNames = [
    'make-9340b842-journal-media',
    'make-9340b842-exercise-media',
    'make-9340b842-app-assets'
  ];
  
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    
    for (const bucketName of bucketNames) {
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, {
          public: false,
          fileSizeLimit: 52428800 // 50MB
        });
        console.log('Created storage bucket:', bucketName);
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

initStorage();

// Helper function to check if user is admin
async function isAdmin(user: any): Promise<boolean> {
  // First check user_metadata.role (from Supabase Auth)
  if (user.user_metadata?.role === 'admin') {
    return true;
  }
  
  // Fall back to KV store
  const profile = await kv.get(`user:${user.id}`);
  return profile?.role === 'admin';
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9340b842/health", (c) => {
  return c.json({ status: "ok" });
});

// Test endpoint to validate JWT token
app.get("/make-server-9340b842/auth/test-token", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    console.log('=== Token Test ===');
    console.log('Token exists:', !!accessToken);
    console.log('Token length:', accessToken?.length || 0);
    
    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401);
    }

    // Test with anon client
    console.log('Testing with supabaseAnon client...');
    const { data: anonData, error: anonError } = await supabaseAnon.auth.getUser(accessToken);
    console.log('Anon result - User:', anonData?.user?.id);
    console.log('Anon result - Error:', anonError);

    // Test with service role client
    console.log('Testing with supabase (service role) client...');
    const { data: serviceData, error: serviceError } = await supabase.auth.getUser(accessToken);
    console.log('Service role result - User:', serviceData?.user?.id);
    console.log('Service role result - Error:', serviceError);

    if (anonError) {
      return c.json({ 
        error: 'Token validation failed',
        anonError: anonError.message,
        serviceError: serviceError?.message
      }, 401);
    }

    return c.json({ 
      success: true,
      userId: anonData.user.id,
      email: anonData.user.email,
      metadata: anonData.user.user_metadata
    });
  } catch (error) {
    console.error('Token test error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Session validation endpoint for debugging
app.get("/make-server-9340b842/auth/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const { data: { user }, error } = await supabaseAnon.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: error?.message || 'Invalid session' }, 401);
    }

    // Get user profile from KV
    const profile = await kv.get(`user:${user.id}`);

    return c.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || 'unknown',
        fullName: profile?.fullName || user.user_metadata?.name
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Create initial admin user (for setup only)
app.post("/make-server-9340b842/auth/create-admin", async (c) => {
  try {
    const { email, password, fullName } = await c.req.json();
    
    if (!email || !password || !fullName) {
      return c.json({ error: "Missing required fields: email, password, fullName" }, 400);
    }

    console.log('=== Creating Admin User ===');
    console.log('Email:', email);
    console.log('Name:', fullName);

    // Create user in Supabase Auth with admin role
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name: fullName,
        role: 'admin'
      },
      email_confirm: true // Auto-confirm since email server not configured
    });

    if (error) {
      console.error('Create admin error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('Admin user created in auth:', data.user.id);

    // Store admin profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      fullName,
      role: 'admin',
      programs: [],
      assignedCoach: null,
      createdAt: new Date().toISOString()
    });

    console.log('Admin profile stored in KV');
    console.log('=== Admin Creation Complete ===');

    return c.json({ 
      success: true, 
      message: 'Admin user created successfully',
      user: { 
        id: data.user.id, 
        email, 
        fullName, 
        role: 'admin' 
      } 
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Create coach user (admin only)
app.post("/make-server-9340b842/auth/create-coach", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);

    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { email, password, fullName } = await c.req.json();
    
    if (!email || !password || !fullName) {
      return c.json({ error: "Missing required fields: email, password, fullName" }, 400);
    }

    // Create user in Supabase Auth with coach role
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name: fullName,
        role: 'coach'
      },
      email_confirm: true
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    // Store coach profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      fullName,
      role: 'coach',
      programs: [],
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      message: 'Coach user created successfully',
      coach: { 
        id: data.user.id, 
        email, 
        fullName, 
        role: 'coach' 
      } 
    });
  } catch (error) {
    console.error('Create coach error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Sign up - Create new user with role
app.post("/make-server-9340b842/auth/signup", async (c) => {
  try {
    const { email, password, fullName, username, phoneNumber, role = 'athlete' } = await c.req.json();
    
    if (!email || !password || !fullName) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsers = await kv.getByPrefix('user:');
      const usernameTaken = existingUsers.some((user: any) => user.username?.toLowerCase() === username.toLowerCase());
      if (usernameTaken) {
        return c.json({ error: "Username is already taken" }, 400);
      }
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name: fullName,
        role: role // 'athlete' or 'admin'
      },
      email_confirm: true // Auto-confirm since email server not configured
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      fullName,
      username: username || null,
      phoneNumber: phoneNumber || null,
      role,
      programs: [],
      assignedCoach: null,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      user: { 
        id: data.user.id, 
        email, 
        fullName,
        username: username || null,
        phoneNumber: phoneNumber || null,
        role 
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Sign in
app.post("/make-server-9340b842/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Missing email or password" }, 400);
    }

    // Use anon client for signin to get a token valid for Edge Functions
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return c.json({ error: error.message }, 401);
    }

    if (!data.session) {
      console.error('No session created during signin');
      return c.json({ error: 'No session created' }, 401);
    }

    console.log('=== Signin Success ===');
    console.log('User ID:', data.user.id);
    console.log('Token exists:', !!data.session.access_token);
    console.log('Token length:', data.session.access_token?.length || 0);
    console.log('Token first 50 chars:', data.session.access_token?.substring(0, 50) || 'N/A');

    // Get user profile from KV store
    const userProfile = await kv.get(`user:${data.user.id}`);

    return c.json({ 
      success: true, 
      accessToken: data.session.access_token,
      user: userProfile || {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.name,
        role: data.user.user_metadata?.role || 'athlete'
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// Sign out
app.post("/make-server-9340b842/auth/signout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    await supabase.auth.admin.signOut(accessToken);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return c.json({ error: 'Failed to sign out' }, 500);
  }
});

// ============= PROGRAM ROUTES =============

// Get all programs
app.get("/make-server-9340b842/programs", async (c) => {
  try {
    const programs = [
      {
        id: 'bootcamp',
        name: 'Personal Training - Bootcamp',
        description: 'Our Bootcamp Program offers high-energy group training for five or more participants in a fast-paced 45-minute full-body workout. Rooted in Human-First Excellence, we use science-backed methods to build strength, endurance, mobility, and flexibility.',
        duration: '45 minutes',
        type: 'Group',
        minParticipants: 5,
        image: 'bootcamp'
      },
      {
        id: 'sports-performance',
        name: 'Sports Performance: One-on-One',
        description: 'Speed is essential in all sports, and our Track & Field Performance Program builds it with intention and science. Rooted in Human-First Excellence, we develop force, power, explosiveness, tendon stiffness, and efficient sprint mechanics.',
        duration: '60 minutes',
        type: 'Individual',
        packages: [4, 8, 12],
        image: 'sports'
      },
      {
        id: 'athletix-club',
        name: 'Authentikos Athletix Club',
        description: 'Our Track & Field Performance Program is built for athletes who want more than speed—they want strength, confidence, discipline, and long-term growth. Grounded in Human-First Excellence, we use science-backed training and performance psychology to develop the whole athlete.',
        type: 'Comprehensive',
        image: 'track'
      },
      {
        id: 'drop-in',
        name: 'Drop In Sessions',
        description: 'High-impact training sessions designed for athletes looking for flexibility in their schedule.',
        duration: '60-75 minutes',
        type: 'Flexible',
        image: 'training'
      }
    ];

    return c.json({ programs });
  } catch (error) {
    console.error('Get programs error:', error);
    return c.json({ error: 'Failed to get programs' }, 500);
  }
});

// Get program customization options
app.get("/make-server-9340b842/programs/customization-options", async (c) => {
  try {
    const options = {
      inPerson: {
        individual: [
          { sessions: 8, price: 680, description: '8 sessions 1-on-1' },
          { sessions: 12, price: 840, description: '12 sessions 1-on-1' },
          { sessions: 16, price: 1040, description: '16 sessions (includes 4 active recovery sessions)' }
        ],
        group: [
          { sessions: 8, price: 360, description: '8 sessions Group 3-5', groupSize: '3-5' }
        ]
      },
      hybrid: {
        individual: [
          { sessions: 8, price: 500, description: '8 sessions 1-on-1' }
        ],
        group: [
          { sessions: 8, price: 360, description: '8 sessions Group 3-5', groupSize: '3-5' }
        ]
      }
    };

    return c.json({ options });
  } catch (error) {
    console.error('Get customization options error:', error);
    return c.json({ error: 'Failed to get customization options' }, 500);
  }
});

// Enroll in program
app.post("/make-server-9340b842/programs/enroll", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const { programId, customization } = await c.req.json();

    if (!programId) {
      return c.json({ error: 'Program ID required' }, 400);
    }

    // Get user profile
    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Create enrollment
    const enrollment = {
      id: `enrollment:${user.id}:${programId}:${Date.now()}`,
      userId: user.id,
      programId,
      customization,
      enrolledAt: new Date().toISOString(),
      status: 'active'
    };

    await kv.set(enrollment.id, enrollment);

    // Update user profile
    const updatedPrograms = [...(userProfile.programs || []), enrollment];
    await kv.set(`user:${user.id}`, {
      ...userProfile,
      programs: updatedPrograms
    });

    return c.json({ success: true, enrollment });
  } catch (error) {
    console.error('Enrollment error:', error);
    return c.json({ error: 'Failed to enroll in program' }, 500);
  }
});

// Get user enrollments
app.get("/make-server-9340b842/programs/enrollments", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);

    return c.json({ enrollments: userProfile?.programs || [] });
  } catch (error) {
    console.error('Get enrollments error:', error);
    return c.json({ error: 'Failed to get enrollments' }, 500);
  }
});

// ============= EXERCISE ROUTES =============

// Get exercises for user (daily assignments)
app.get("/make-server-9340b842/exercises/daily", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Get exercises assigned to this user
    const exercises = await kv.getByPrefix(`exercise:${user.id}:`);

    // Filter for today's exercises
    const today = new Date().toISOString().split('T')[0];
    const todayExercises = exercises.filter((ex: any) => 
      ex.assignedDate?.startsWith(today)
    );

    return c.json({ exercises: todayExercises });
  } catch (error) {
    console.error('Get daily exercises error:', error);
    return c.json({ error: 'Failed to get exercises' }, 500);
  }
});

// Mark exercise as complete
app.post("/make-server-9340b842/exercises/complete", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const { exerciseId } = await c.req.json();

    if (!exerciseId) {
      return c.json({ error: 'Exercise ID required' }, 400);
    }

    const exercise = await kv.get(exerciseId);

    if (!exercise) {
      return c.json({ error: 'Exercise not found' }, 404);
    }

    if (exercise.userId !== user.id) {
      return c.json({ error: 'Unauthorized to modify this exercise' }, 403);
    }

    await kv.set(exerciseId, {
      ...exercise,
      completed: true,
      completedAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Complete exercise error:', error);
    return c.json({ error: 'Failed to complete exercise' }, 500);
  }
});

// ============= ADMIN ROUTES =============

// Assign exercise to user (admin only)
app.post("/make-server-9340b842/admin/exercises/assign", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user);
    if (!userIsAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { athleteId, exercise } = await c.req.json();

    if (!athleteId || !exercise) {
      return c.json({ error: 'Athlete ID and exercise details required' }, 400);
    }

    const exerciseId = `exercise:${athleteId}:${Date.now()}`;
    const newExercise = {
      id: exerciseId,
      userId: athleteId,
      ...exercise,
      assignedBy: user.id,
      assignedAt: new Date().toISOString(),
      completed: false
    };

    await kv.set(exerciseId, newExercise);

    return c.json({ success: true, exercise: newExercise });
  } catch (error) {
    console.error('Assign exercise error:', error);
    return c.json({ error: 'Failed to assign exercise' }, 500);
  }
});

// Get all athletes (admin only)
app.get("/make-server-9340b842/admin/athletes", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    console.log('=== Admin Athletes Request ===');
    console.log('Access token present:', !!accessToken);
    console.log('Access token (first 20 chars):', accessToken?.substring(0, 20));
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Use anon client to validate user token
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

    console.log('Auth result - User ID:', user?.id);
    console.log('Auth error:', authError);

    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return c.json({ 
        error: 'Invalid session', 
        details: authError?.message || 'User not found'
      }, 401);
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user);
    if (!userIsAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Get all users
    const users = await kv.getByPrefix('user:');
    const athletes = users.filter((u: any) => u.role === 'athlete');

    console.log('Total users:', users.length);
    console.log('Athletes found:', athletes.length);
    console.log('=== End Admin Athletes Request ===');

    return c.json({ athletes });
  } catch (error) {
    console.error('Get athletes error:', error);
    return c.json({ error: 'Failed to get athletes', details: String(error) }, 500);
  }
});

// ============= JOURNAL ROUTES =============

// Create journal entry
app.post("/make-server-9340b842/journal/entries", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const { title, content, mood, tags } = await c.req.json();

    if (!title || !content) {
      return c.json({ error: 'Title and content required' }, 400);
    }

    const entryId = `journal:${user.id}:${Date.now()}`;
    const entry = {
      id: entryId,
      userId: user.id,
      title,
      content,
      mood,
      tags: tags || [],
      media: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(entryId, entry);

    return c.json({ success: true, entry });
  } catch (error) {
    console.error('Create journal entry error:', error);
    return c.json({ error: 'Failed to create journal entry' }, 500);
  }
});

// Get user's journal entries
app.get("/make-server-9340b842/journal/entries", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const entries = await kv.getByPrefix(`journal:${user.id}:`);
    
    // Sort by creation date descending
    entries.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ entries });
  } catch (error) {
    console.error('Get journal entries error:', error);
    return c.json({ error: 'Failed to get journal entries' }, 500);
  }
});

// Update journal entry
app.put("/make-server-9340b842/journal/entries/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const entryId = c.req.param('id');
    const { title, content, mood, tags } = await c.req.json();

    const entry = await kv.get(entryId);

    if (!entry) {
      return c.json({ error: 'Entry not found' }, 404);
    }

    if (entry.userId !== user.id) {
      return c.json({ error: 'Unauthorized to modify this entry' }, 403);
    }

    const updatedEntry = {
      ...entry,
      title: title !== undefined ? title : entry.title,
      content: content !== undefined ? content : entry.content,
      mood: mood !== undefined ? mood : entry.mood,
      tags: tags !== undefined ? tags : entry.tags,
      updatedAt: new Date().toISOString()
    };

    await kv.set(entryId, updatedEntry);

    return c.json({ success: true, entry: updatedEntry });
  } catch (error) {
    console.error('Update journal entry error:', error);
    return c.json({ error: 'Failed to update journal entry' }, 500);
  }
});

// Delete journal entry
app.delete("/make-server-9340b842/journal/entries/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const entryId = c.req.param('id');
    const entry = await kv.get(entryId);

    if (!entry) {
      return c.json({ error: 'Entry not found' }, 404);
    }

    if (entry.userId !== user.id) {
      return c.json({ error: 'Unauthorized to delete this entry' }, 403);
    }

    // Delete media files from storage if any
    if (entry.media && entry.media.length > 0) {
      const filePaths = entry.media.map((m: any) => m.path);
      await supabase.storage.from('make-9340b842-journal-media').remove(filePaths);
    }

    await kv.del(entryId);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    return c.json({ error: 'Failed to delete journal entry' }, 500);
  }
});

// Upload media to journal entry
app.post("/make-server-9340b842/journal/entries/:id/media", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const entryId = c.req.param('id');
    const entry = await kv.get(entryId);

    if (!entry) {
      return c.json({ error: 'Entry not found' }, 404);
    }

    if (entry.userId !== user.id) {
      return c.json({ error: 'Unauthorized to modify this entry' }, 403);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from('make-9340b842-journal-media')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Create signed URL
    const { data: signedUrlData } = await supabase.storage
      .from('make-9340b842-journal-media')
      .createSignedUrl(fileName, 31536000); // 1 year expiry

    const mediaItem = {
      path: fileName,
      url: signedUrlData?.signedUrl,
      type: file.type,
      name: file.name,
      uploadedAt: new Date().toISOString()
    };

    // Update entry with media
    const updatedEntry = {
      ...entry,
      media: [...(entry.media || []), mediaItem],
      updatedAt: new Date().toISOString()
    };

    await kv.set(entryId, updatedEntry);

    return c.json({ success: true, media: mediaItem });
  } catch (error) {
    console.error('Upload media error:', error);
    return c.json({ error: 'Failed to upload media' }, 500);
  }
});

// ============= CHAT ROUTES =============

// Send message
app.post("/make-server-9340b842/chat/messages", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const { recipientId, content, channelId } = await c.req.json();

    if (!content) {
      return c.json({ error: 'Message content required' }, 400);
    }

    // Determine the correct channelId
    let finalChannelId = channelId || 'general';
    
    // If recipientId is provided but channelId doesn't start with 'dm:', create DM channel ID
    if (recipientId && !finalChannelId.startsWith('dm:')) {
      finalChannelId = `dm:${recipientId}`;
    }

    // Check if General channel is locked (only for General channel)
    if (finalChannelId === 'general') {
      const isLocked = await kv.get('channel:general:locked');
      const userProfile = await kv.get(`user:${user.id}`);
      const isAdmin = userProfile?.role === 'admin' || user?.user_metadata?.role === 'admin';
      
      if (isLocked && !isAdmin) {
        return c.json({ error: 'General channel is locked. Only admins can send messages.' }, 403);
      }
    }

    const messageId = `message:${finalChannelId}:${Date.now()}`;
    const message = {
      id: messageId,
      senderId: user.id,
      recipientId: recipientId || null,
      channelId: finalChannelId,
      content,
      createdAt: new Date().toISOString(),
      read: false
    };

    await kv.set(messageId, message);

    // Get sender info
    const senderProfile = await kv.get(`user:${user.id}`);

    return c.json({ 
      success: true, 
      message: {
        ...message,
        senderName: senderProfile?.fullName || 'Unknown'
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Get messages for a channel
app.get("/make-server-9340b842/chat/messages/:channelId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const channelId = c.req.param('channelId');
    const messages = await kv.getByPrefix(`message:${channelId}:`);

    // Get sender names
    const messagesWithNames = await Promise.all(
      messages.map(async (msg: any) => {
        const senderProfile = await kv.get(`user:${msg.senderId}`);
        return {
          ...msg,
          senderName: senderProfile?.fullName || 'Unknown'
        };
      })
    );

    // Sort by creation date
    messagesWithNames.sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return c.json({ messages: messagesWithNames });
  } catch (error) {
    console.error('Get messages error:', error);
    return c.json({ error: 'Failed to get messages' }, 500);
  }
});

// Get all channels/conversations for user
app.get("/make-server-9340b842/chat/channels", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    
    // Get General channel lock status
    const generalLockStatus = await kv.get('channel:general:locked');
    const isLocked = generalLockStatus === true;
    
    // Default channels - General is always first
    const channels = [
      {
        id: 'general',
        name: 'General',
        description: 'General discussion for all athletes',
        type: 'group',
        locked: isLocked,
        lastMessageAt: null
      }
    ];

    // If athlete, add coach channel
    if (userProfile?.role === 'athlete' && userProfile?.assignedCoach) {
      channels.push({
        id: `coach:${userProfile.assignedCoach.id}`,
        name: `Coach: ${userProfile.assignedCoach.name}`,
        description: 'Direct messages with your coach',
        type: 'direct',
        locked: false,
        lastMessageAt: null
      });
    }

    // If admin, add all athlete channels
    if (userProfile?.role === 'admin') {
      const athletes = await kv.getByPrefix('user:');
      const athleteUsers = athletes.filter((u: any) => u.role === 'athlete');
      
      athleteUsers.forEach((athlete: any) => {
        channels.push({
          id: `athlete:${athlete.id}`,
          name: athlete.fullName,
          description: `Direct messages with ${athlete.fullName}`,
          type: 'direct',
          locked: false,
          lastMessageAt: null
        });
      });
    }

    // Find all direct message conversations by checking messages
    // Get all messages where user is sender or recipient
    const allMessages = await kv.getByPrefix('message:');
    const dmChannelsMap = new Map();
    const channelLastMessages = new Map(); // Track last message time for each channel
    
    for (const message of allMessages) {
      const messageTime = new Date(message.createdAt).getTime();
      
      // Check if this is a DM channel (starts with dm:)
      if (message.channelId && message.channelId.startsWith('dm:')) {
        const recipientId = message.channelId.replace('dm:', '');
        
        // If user is sender or recipient, add this conversation
        if (message.senderId === user.id || message.recipientId === user.id || recipientId === user.id) {
          if (!dmChannelsMap.has(message.channelId)) {
            // Determine the other user in the conversation
            let otherUserId = message.senderId === user.id ? message.recipientId : message.senderId;
            
            // If channelId format is dm:userId, use that
            if (recipientId && recipientId !== user.id) {
              otherUserId = recipientId;
            }
            
            if (otherUserId && otherUserId !== user.id) {
              const otherUser = await kv.get(`user:${otherUserId}`);
              if (otherUser) {
                dmChannelsMap.set(message.channelId, {
                  id: message.channelId,
                  name: otherUser.fullName || 'Unknown User',
                  description: `Direct messages with ${otherUser.fullName || 'Unknown User'}`,
                  type: 'direct',
                  recipientId: otherUserId,
                  locked: false,
                  lastMessageAt: message.createdAt
                });
              }
            }
          }
          
          // Update last message time
          const currentLast = channelLastMessages.get(message.channelId);
          if (!currentLast || messageTime > currentLast) {
            channelLastMessages.set(message.channelId, messageTime);
          }
        }
      } else if (message.recipientId) {
        // Handle messages with recipientId (direct messages)
        // Create a channel ID based on the participants
        const otherUserId = message.senderId === user.id ? message.recipientId : message.senderId;
        
        if (otherUserId && otherUserId !== user.id) {
          const channelId = `dm:${otherUserId}`;
          
          if (!dmChannelsMap.has(channelId)) {
            const otherUser = await kv.get(`user:${otherUserId}`);
            if (otherUser) {
              dmChannelsMap.set(channelId, {
                id: channelId,
                name: otherUser.fullName || 'Unknown User',
                description: `Direct messages with ${otherUser.fullName || 'Unknown User'}`,
                type: 'direct',
                recipientId: otherUserId,
                locked: false,
                lastMessageAt: message.createdAt
              });
            }
          }
          
          // Update last message time
          const currentLast = channelLastMessages.get(channelId);
          if (!currentLast || messageTime > currentLast) {
            channelLastMessages.set(channelId, messageTime);
          }
        }
      } else if (message.channelId === 'general') {
        // Track last message time for General channel
        const currentLast = channelLastMessages.get('general');
        if (!currentLast || messageTime > currentLast) {
          channelLastMessages.set('general', messageTime);
        }
      }
    }
    
    // Add all DM channels to the channels list
    dmChannelsMap.forEach((channel) => {
      // Only add if not already in channels (avoid duplicates)
      if (!channels.find(c => c.id === channel.id)) {
        // Update last message time if we have it
        const lastMsgTime = channelLastMessages.get(channel.id);
        if (lastMsgTime) {
          channel.lastMessageAt = new Date(lastMsgTime).toISOString();
        }
        channels.push(channel);
      }
    });
    
    // Update General channel last message time
    const generalLastMsg = channelLastMessages.get('general');
    if (generalLastMsg) {
      const generalChannel = channels.find(c => c.id === 'general');
      if (generalChannel) {
        generalChannel.lastMessageAt = new Date(generalLastMsg).toISOString();
      }
    }

    // Sort channels by last message time (most recent first)
    // General channel always stays first, then sort the rest
    const generalChannel = channels.find(c => c.id === 'general');
    const otherChannels = channels.filter(c => c.id !== 'general');
    
    otherChannels.sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA; // Most recent first
    });
    
    const sortedChannels = generalChannel ? [generalChannel, ...otherChannels] : otherChannels;

    return c.json({ channels: sortedChannels });
  } catch (error) {
    console.error('Get channels error:', error);
    return c.json({ error: 'Failed to get channels' }, 500);
  }
});

// Search users (for starting direct messages)
app.get("/make-server-9340b842/chat/search-users", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const query = c.req.query('q')?.toLowerCase() || '';

    if (!query || query.length < 2) {
      return c.json({ users: [] });
    }

    // Get all users
    const allUsers = await kv.getByPrefix('user:');
    
    // Filter users based on search query (exclude current user)
    const searchResults = allUsers.filter((u: any) => {
      if (u.id === user.id) return false; // Don't show current user
      
      const fullNameMatch = u.fullName?.toLowerCase().includes(query);
      const emailMatch = u.email?.toLowerCase().includes(query);
      
      return fullNameMatch || emailMatch;
    }).map((u: any) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role
    }));

    // Limit to 10 results
    return c.json({ users: searchResults.slice(0, 10) });
  } catch (error) {
    console.error('Search users error:', error);
    return c.json({ error: 'Failed to search users' }, 500);
  }
});

// Create or get direct message channel
app.post("/make-server-9340b842/chat/dm-channel", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const { recipientId } = await c.req.json();

    if (!recipientId) {
      return c.json({ error: 'Recipient ID required' }, 400);
    }

    // Get recipient profile
    const recipient = await kv.get(`user:${recipientId}`);

    if (!recipient) {
      return c.json({ error: 'Recipient not found' }, 404);
    }

    // Create channel object
    const channel = {
      id: `dm:${recipientId}`,
      name: recipient.fullName,
      description: `Direct messages with ${recipient.fullName}`,
      type: 'direct',
      recipientId: recipientId
    };

    return c.json({ success: true, channel });
  } catch (error) {
    console.error('Create DM channel error:', error);
    return c.json({ error: 'Failed to create DM channel' }, 500);
  }
});

// Admin: Lock General channel
app.post("/make-server-9340b842/chat/general/lock", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    const isAdmin = userProfile?.role === 'admin' || user?.user_metadata?.role === 'admin';
    
    if (!isAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Lock the General channel
    await kv.set('channel:general:locked', true);

    return c.json({ success: true, locked: true });
  } catch (error) {
    console.error('Lock channel error:', error);
    return c.json({ error: 'Failed to lock channel' }, 500);
  }
});

// Admin: Unlock General channel
app.post("/make-server-9340b842/chat/general/unlock", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    const isAdmin = userProfile?.role === 'admin' || user?.user_metadata?.role === 'admin';
    
    if (!isAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Unlock the General channel
    await kv.set('channel:general:locked', false);

    return c.json({ success: true, locked: false });
  } catch (error) {
    console.error('Unlock channel error:', error);
    return c.json({ error: 'Failed to unlock channel' }, 500);
  }
});

// Get General channel lock status
app.get("/make-server-9340b842/chat/general/status", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const isLocked = await kv.get('channel:general:locked');
    
    return c.json({ locked: isLocked === true });
  } catch (error) {
    console.error('Get channel status error:', error);
    return c.json({ error: 'Failed to get channel status' }, 500);
  }
});

// ============= CONTRACT ROUTES =============

// Sign contract for enrollment
app.post("/make-server-9340b842/contracts/sign", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const { enrollmentId, signature, signedAt } = await c.req.json();

    if (!enrollmentId || !signature) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get enrollment
    const enrollment = await kv.get(enrollmentId);

    if (!enrollment) {
      return c.json({ error: 'Enrollment not found' }, 404);
    }

    if (enrollment.userId !== user.id) {
      return c.json({ error: 'Unauthorized to sign this contract' }, 403);
    }

    // Create contract record
    const contract = {
      id: `contract:${enrollmentId}`,
      enrollmentId,
      userId: user.id,
      programId: enrollment.programId,
      programName: enrollment.programName || enrollment.programId,
      customization: enrollment.customization,
      signature,
      signedAt: signedAt || new Date().toISOString(),
      status: 'signed',
      version: '1.0'
    };

    await kv.set(contract.id, contract);

    // Update enrollment with contract reference
    await kv.set(enrollmentId, {
      ...enrollment,
      contractId: contract.id,
      contractStatus: 'signed',
      contractSignedAt: contract.signedAt
    });

    return c.json({ success: true, contract });
  } catch (error) {
    console.error('Contract signing error:', error);
    return c.json({ error: 'Failed to sign contract' }, 500);
  }
});

// Get user contracts
app.get("/make-server-9340b842/contracts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Get all contracts
    const allContracts = await kv.getByPrefix('contract:');
    
    // Filter user's contracts
    const userContracts = allContracts.filter((contract: any) => 
      contract.userId === user.id
    );

    // Sort by signed date (newest first)
    userContracts.sort((a: any, b: any) => 
      new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime()
    );

    return c.json({ contracts: userContracts });
  } catch (error) {
    console.error('Get contracts error:', error);
    return c.json({ error: 'Failed to get contracts' }, 500);
  }
});

// Get contract by enrollment ID
app.get("/make-server-9340b842/contracts/enrollment/:enrollmentId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const enrollmentId = c.req.param('enrollmentId');
    const contractId = `contract:${enrollmentId}`;
    
    const contract = await kv.get(contractId);

    if (!contract) {
      return c.json({ error: 'Contract not found', signed: false });
    }

    if (contract.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({ contract, signed: true });
  } catch (error) {
    console.error('Get contract error:', error);
    return c.json({ error: 'Failed to get contract' }, 500);
  }
});

// Admin: Get all contracts
app.get("/make-server-9340b842/admin/contracts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user);
    if (!userIsAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Get all contracts
    const contracts = await kv.getByPrefix('contract:');
    
    // Enrich with user info
    const enrichedContracts = await Promise.all(
      contracts.map(async (contract: any) => {
        const userProfile = await kv.get(`user:${contract.userId}`);
        return {
          ...contract,
          userName: userProfile?.fullName || 'Unknown',
          userEmail: userProfile?.email || 'Unknown'
        };
      })
    );

    // Sort by signed date (newest first)
    enrichedContracts.sort((a: any, b: any) => 
      new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime()
    );

    return c.json({ contracts: enrichedContracts });
  } catch (error) {
    console.error('Get admin contracts error:', error);
    return c.json({ error: 'Failed to get contracts' }, 500);
  }
});

// ============= EXERCISE LIBRARY MANAGEMENT =============

// Get exercise categories (admin only)
app.get("/make-server-9340b842/admin/exercises/categories", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    console.log('=== Categories Request ===');
    console.log('Token exists:', !!accessToken);
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Use anon client to validate user token
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

    console.log('User ID:', user?.id);
    console.log('Auth error:', authError);

    if (authError || !user) {
      console.error('Auth failed:', authError?.message);
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user);
    if (!userIsAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Get all categories
    const categories = await kv.getByPrefix('exercise-category:');
    
    // If no categories exist, create default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { id: 'exercise-category:strength', name: 'Strength' },
        { id: 'exercise-category:cardio', name: 'Cardio' },
        { id: 'exercise-category:flexibility', name: 'Flexibility' },
        { id: 'exercise-category:mobility', name: 'Mobility' },
        { id: 'exercise-category:plyometrics', name: 'Plyometrics' },
        { id: 'exercise-category:core', name: 'Core' },
      ];

      for (const cat of defaultCategories) {
        await kv.set(cat.id, cat);
        categories.push(cat);
      }
    }

    return c.json({ categories });
  } catch (error) {
    console.error('Get exercise categories error:', error);
    return c.json({ error: 'Failed to get categories' }, 500);
  }
});

// Get all exercises from library (admin only)
app.get("/make-server-9340b842/admin/exercises", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    console.log('=== Get Exercises Request ===');
    console.log('Token exists:', !!accessToken);
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Use anon client to validate user token
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

    console.log('User ID:', user?.id);
    console.log('Auth error:', authError);

    if (authError || !user) {
      console.error('Auth failed:', authError?.message);
      return c.json({ error: 'Invalid session', details: authError?.message }, 401);
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user);
    if (!userIsAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Get all exercises from library
    const exercises = await kv.getByPrefix('exercise-library:');
    
    console.log('Exercises found:', exercises.length);
    
    // Sort by creation date (newest first)
    exercises.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ exercises });
  } catch (error) {
    console.error('Get exercises error:', error);
    return c.json({ error: 'Failed to get exercises' }, 500);
  }
});

// Create new exercise in library (admin only)
app.post("/make-server-9340b842/admin/exercises", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    console.log('=== Create Exercise Request ===');
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Use anon client to validate user token
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Auth failed:', authError?.message);
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user);
    if (!userIsAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { name, description, category, url, mediaUrl, mediaType } = await c.req.json();

    console.log('Creating exercise:', { name, category });

    if (!name || !category) {
      return c.json({ error: 'Name and category required' }, 400);
    }

    // Check if category exists, if not create it
    const categoryId = `exercise-category:${category.toLowerCase().replace(/\s+/g, '-')}`;
    const existingCategory = await kv.get(categoryId);
    
    if (!existingCategory) {
      await kv.set(categoryId, {
        id: categoryId,
        name: category
      });
      console.log('Created new category:', category);
    }

    const exerciseId = `exercise-library:${Date.now()}`;
    const exercise = {
      id: exerciseId,
      name,
      description,
      category,
      url,
      mediaUrl,
      mediaType,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(exerciseId, exercise);
    console.log('Exercise created:', exerciseId);

    return c.json({ success: true, exercise });
  } catch (error) {
    console.error('Create exercise error:', error);
    return c.json({ error: 'Failed to create exercise' }, 500);
  }
});

// Upload media for exercise (admin only)
app.post("/make-server-9340b842/admin/exercises/upload", async (c) => {
  try {
    // Debug logging for Authorization header
    const authHeader = c.req.header('Authorization');
    console.log('=== Upload Request Debug ===');
    console.log('Authorization header received:', authHeader ? 'YES' : 'NO');
    console.log('Full header value:', authHeader);
    
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    console.log('Extracted token exists:', !!accessToken);
    console.log('Token length:', accessToken?.length || 0);
    console.log('Token first 20 chars:', accessToken?.substring(0, 20) || 'N/A');
    
    if (!accessToken) {
      console.log('ERROR: No access token found in request');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Use anon client to validate user token
    console.log('Validating token with Supabase...');
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);
    
    console.log('Token validation result:');
    console.log('- User ID:', user?.id || 'NONE');
    console.log('- Auth error:', authError?.message || 'NONE');
    console.log('- Auth error code:', authError?.status || 'NONE');

    if (authError || !user) {
      console.log('ERROR: Token validation failed');
      return c.json({ error: 'Invalid session' }, 401);
    }
    
    console.log('Token validated successfully for user:', user.id);

    // Check if user is admin
    const userIsAdmin = await isAdmin(user);
    if (!userIsAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from('make-9340b842-exercise-media')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Create signed URL
    const { data: signedUrlData } = await supabase.storage
      .from('make-9340b842-exercise-media')
      .createSignedUrl(fileName, 31536000); // 1 year expiry

    return c.json({ 
      success: true, 
      url: signedUrlData?.signedUrl,
      path: fileName
    });
  } catch (error) {
    console.error('Upload media error:', error);
    return c.json({ error: 'Failed to upload media' }, 500);
  }
});

// Assign exercise from library to athletes (admin only)
app.post("/make-server-9340b842/admin/exercises/:exerciseId/assign", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Use anon client to validate user token
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(user);
    if (!userIsAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const exerciseId = c.req.param('exerciseId');
    const { athleteIds, sets, reps, duration, assignedDate, notes } = await c.req.json();

    if (!athleteIds || athleteIds.length === 0) {
      return c.json({ error: 'At least one athlete ID required' }, 400);
    }

    // Get exercise from library
    const exercise = await kv.get(exerciseId);

    if (!exercise) {
      return c.json({ error: 'Exercise not found' }, 404);
    }

    // Assign to each athlete
    const assignments = [];
    for (const athleteId of athleteIds) {
      const assignmentId = `exercise:${athleteId}:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const assignment = {
        id: assignmentId,
        userId: athleteId,
        exerciseLibraryId: exerciseId,
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        url: exercise.url,
        mediaUrl: exercise.mediaUrl,
        mediaType: exercise.mediaType,
        sets,
        reps,
        duration,
        assignedDate: assignedDate || new Date().toISOString().split('T')[0],
        notes,
        assignedBy: user.id,
        assignedAt: new Date().toISOString(),
        completed: false
      };

      await kv.set(assignmentId, assignment);
      assignments.push(assignment);
    }

    return c.json({ success: true, assignments });
  } catch (error) {
    console.error('Assign exercise error:', error);
    return c.json({ error: 'Failed to assign exercise' }, 500);
  }
});

// Register program and coach routes
registerProgramRoutes(app);

// ============= APP SETTINGS / LOGO ROUTES =============

// Upload app logo (admin only)
app.post("/make-server-9340b842/admin/upload-logo", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400);
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const fileBuffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('make-9340b842-app-assets')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload logo' }, 500);
    }

    // Get signed URL with long expiry (10 years)
    const { data: signedUrlData } = await supabase.storage
      .from('make-9340b842-app-assets')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10); // 10 years

    const logoUrl = signedUrlData?.signedUrl;

    // Store logo URL in KV
    await kv.set('app:logo', {
      url: logoUrl,
      fileName: fileName,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.id
    });

    return c.json({ success: true, logoUrl });
  } catch (error) {
    console.error('Upload logo error:', error);
    return c.json({ error: 'Failed to upload logo' }, 500);
  }
});

// Get app logo (public endpoint)
app.get("/make-server-9340b842/logo", async (c) => {
  try {
    const logoData = await kv.get('app:logo');
    
    if (!logoData || !logoData.url) {
      return c.json({ logoUrl: null });
    }

    return c.json({ logoUrl: logoData.url });
  } catch (error) {
    console.error('Get logo error:', error);
    return c.json({ error: 'Failed to get logo' }, 500);
  }
});

Deno.serve(app.fetch);