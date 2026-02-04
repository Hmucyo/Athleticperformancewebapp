import type { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Initialize Supabase client with anon key for user token validation
const supabaseAnon = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Helper function to check if user is admin
async function isAdmin(user: any): Promise<boolean> {
  // First check user_metadata.role (from Supabase Auth)
  if (user?.user_metadata?.role === 'admin') {
    return true;
  }
  
  // Fall back to KV store
  const profile = await kv.get(`user:${user.id}`);
  return profile?.role === 'admin';
}

export function registerProgramRoutes(app: Hono) {
  // Admin: Get all coaches (for program assignment)
  app.get("/make-server-9340b842/admin/coaches", async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      
      if (!accessToken) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

      if (authError || !user) {
        return c.json({ error: 'Invalid session' }, 401);
      }

      // Check if user is admin using the helper function
      const userIsAdmin = await isAdmin(user);
      if (!userIsAdmin) {
        return c.json({ error: 'Admin access required' }, 403);
      }

      // Get all users
      const users = await kv.getByPrefix('user:');
      const coaches = users.filter((u: any) => u.role === 'coach');

      return c.json({ coaches });
    } catch (error) {
      console.error('Get coaches error:', error);
      return c.json({ error: 'Failed to get coaches' }, 500);
    }
  });

  // Admin: Create program
  app.post("/make-server-9340b842/admin/programs", async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      
      if (!accessToken) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

      if (authError || !user) {
        return c.json({ error: 'Invalid session' }, 401);
      }

      // Check if user is admin using the helper function
      const userIsAdmin = await isAdmin(user);
      if (!userIsAdmin) {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const { 
        name, 
        description, 
        price, 
        delivery, // 'in-person' or 'online'
        format, // 'individual' or 'group'
        category, // 'sport-performance' or 'fitness-wellness'
        coachId,
        exercises,
        duration,
        maxParticipants
      } = await c.req.json();

      if (!name || !description || !delivery || !format || !category) {
        return c.json({ error: 'Missing required fields' }, 400);
      }

      const programId = `program:${Date.now()}`;
      const program = {
        id: programId,
        name,
        description,
        price: price || null,
        delivery,
        format,
        category,
        coachId: coachId || null,
        exercises: exercises || [],
        duration: duration || null,
        maxParticipants: maxParticipants || null,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      await kv.set(programId, program);

      return c.json({ success: true, program });
    } catch (error) {
      console.error('Create program error:', error);
      return c.json({ error: 'Failed to create program' }, 500);
    }
  });

  // Admin: Get all programs
  app.get("/make-server-9340b842/admin/programs", async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      
      if (!accessToken) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

      if (authError || !user) {
        return c.json({ error: 'Invalid session' }, 401);
      }

      // Check if user is admin using the helper function
      const userIsAdmin = await isAdmin(user);
      if (!userIsAdmin) {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const programs = await kv.getByPrefix('program:');
      
      // Enrich with coach info
      const enrichedPrograms = await Promise.all(
        programs.map(async (program: any) => {
          if (program.coachId) {
            const coach = await kv.get(`user:${program.coachId}`);
            return {
              ...program,
              coachName: coach?.fullName || 'Unknown'
            };
          }
          return program;
        })
      );

      // Sort by creation date (newest first)
      enrichedPrograms.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return c.json({ programs: enrichedPrograms });
    } catch (error) {
      console.error('Get admin programs error:', error);
      return c.json({ error: 'Failed to get programs' }, 500);
    }
  });

  // Admin: Update program
  app.put("/make-server-9340b842/admin/programs/:id", async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      
      if (!accessToken) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

      if (authError || !user) {
        return c.json({ error: 'Invalid session' }, 401);
      }

      // Check if user is admin using the helper function
      const userIsAdmin = await isAdmin(user);
      if (!userIsAdmin) {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const programId = c.req.param('id');
      const updates = await c.req.json();

      const existingProgram = await kv.get(programId);

      if (!existingProgram) {
        return c.json({ error: 'Program not found' }, 404);
      }

      const updatedProgram = {
        ...existingProgram,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await kv.set(programId, updatedProgram);

      return c.json({ success: true, program: updatedProgram });
    } catch (error) {
      console.error('Update program error:', error);
      return c.json({ error: 'Failed to update program' }, 500);
    }
  });

  // Admin: Delete program
  app.delete("/make-server-9340b842/admin/programs/:id", async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      
      if (!accessToken) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

      if (authError || !user) {
        return c.json({ error: 'Invalid session' }, 401);
      }

      // Check if user is admin using the helper function
      const userIsAdmin = await isAdmin(user);
      if (!userIsAdmin) {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const programId = c.req.param('id');
      const program = await kv.get(programId);

      if (!program) {
        return c.json({ error: 'Program not found' }, 404);
      }

      await kv.del(programId);

      return c.json({ success: true });
    } catch (error) {
      console.error('Delete program error:', error);
      return c.json({ error: 'Failed to delete program' }, 500);
    }
  });

  // Coach: Get assigned programs
  app.get("/make-server-9340b842/coach/programs", async (c) => {
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
      
      if (userProfile?.role !== 'coach') {
        return c.json({ error: 'Coach access required' }, 403);
      }

      // Get all programs assigned to this coach
      const allPrograms = await kv.getByPrefix('program:');
      const coachPrograms = allPrograms.filter((p: any) => p.coachId === user.id);

      // For each program, get enrolled athletes
      const programsWithAthletes = await Promise.all(
        coachPrograms.map(async (program: any) => {
          const allEnrollments = await kv.getByPrefix('enrollment:');
          const programEnrollments = allEnrollments.filter((e: any) => e.programId === program.id);
          
          const athletes = await Promise.all(
            programEnrollments.map(async (enrollment: any) => {
              const athlete = await kv.get(`user:${enrollment.userId}`);
              return athlete;
            })
          );

          return {
            ...program,
            enrolledAthletes: athletes.filter(Boolean)
          };
        })
      );

      return c.json({ programs: programsWithAthletes });
    } catch (error) {
      console.error('Get coach programs error:', error);
      return c.json({ error: 'Failed to get programs' }, 500);
    }
  });

  // Coach: Get all exercises (for assignment)
  app.get("/make-server-9340b842/coach/exercises", async (c) => {
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
      
      if (userProfile?.role !== 'coach') {
        return c.json({ error: 'Coach access required' }, 403);
      }

      const exercises = await kv.getByPrefix('exercise-library:');
      
      exercises.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return c.json({ exercises });
    } catch (error) {
      console.error('Get coach exercises error:', error);
      return c.json({ error: 'Failed to get exercises' }, 500);
    }
  });

  // Coach: Assign exercise to athletes
  app.post("/make-server-9340b842/coach/exercises/:exerciseId/assign", async (c) => {
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
      
      if (userProfile?.role !== 'coach') {
        return c.json({ error: 'Coach access required' }, 403);
      }

      const exerciseId = c.req.param('exerciseId');
      const { athleteIds, sets, reps, duration, assignedDate, notes } = await c.req.json();

      if (!athleteIds || athleteIds.length === 0) {
        return c.json({ error: 'At least one athlete ID required' }, 400);
      }

      const exercise = await kv.get(exerciseId);

      if (!exercise) {
        return c.json({ error: 'Exercise not found' }, 404);
      }

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
      console.error('Coach assign exercise error:', error);
      return c.json({ error: 'Failed to assign exercise' }, 500);
    }
  });

  // Update the public programs endpoint to use admin-created programs
  app.get("/make-server-9340b842/programs/public", async (c) => {
    try {
      console.log('=== Public Programs Request ===');
      
      const programs = await kv.getByPrefix('program:');
      console.log('Total programs found:', programs.length);
      
      // Filter only active programs
      const activePrograms = programs.filter((p: any) => p.status === 'active');
      console.log('Active programs:', activePrograms.length);

      // Enrich with coach info but hide sensitive data
      const publicPrograms = await Promise.all(
        activePrograms.map(async (program: any) => {
          let coachName = null;
          if (program.coachId) {
            const coach = await kv.get(`user:${program.coachId}`);
            coachName = coach?.fullName || null;
          }

          return {
            id: program.id,
            name: program.name,
            description: program.description,
            price: program.price,
            delivery: program.delivery,
            format: program.format,
            category: program.category,
            coachName,
            duration: program.duration,
            maxParticipants: program.maxParticipants,
            imageUrl: program.imageUrl || null,
            createdAt: program.createdAt
          };
        })
      );

      // Sort by creation date (newest first)
      publicPrograms.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      console.log('Returning', publicPrograms.length, 'programs');
      console.log('=== End Public Programs Request ===');

      return c.json({ programs: publicPrograms });
    } catch (error) {
      console.error('Get public programs error:', error);
      return c.json({ error: 'Failed to get programs', details: String(error) }, 500);
    }
  });

  // Admin: Upload program image
  app.post("/make-server-9340b842/admin/programs/:id/image", async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      
      if (!accessToken) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(accessToken);

      if (authError || !user) {
        return c.json({ error: 'Invalid session' }, 401);
      }

      // Check if user is admin using the helper function
      const userIsAdmin = await isAdmin(user);
      if (!userIsAdmin) {
        return c.json({ error: 'Admin access required' }, 403);
      }

      const programId = c.req.param('id');
      const formData = await c.req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return c.json({ error: 'No file provided' }, 400);
      }

      const program = await kv.get(programId);
      if (!program) {
        return c.json({ error: 'Program not found' }, 404);
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${programId}-${Date.now()}.${fileExt}`;
      const fileBuffer = await file.arrayBuffer();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('make-9340b842-exercise-media')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return c.json({ error: 'Failed to upload image' }, 500);
      }

      // Get signed URL
      const { data: signedUrlData } = await supabase.storage
        .from('make-9340b842-exercise-media')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10); // 10 years

      const imageUrl = signedUrlData?.signedUrl;

      // Update program with image URL
      await kv.set(programId, {
        ...program,
        imageUrl,
        updatedAt: new Date().toISOString()
      });

      return c.json({ success: true, imageUrl });
    } catch (error) {
      console.error('Upload program image error:', error);
      return c.json({ error: 'Failed to upload image' }, 500);
    }
  });
}