import { Request, Response } from 'express';
import { supabase, getSupabaseForUser } from '../config/supabase.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { localDB } from '../localDB.js';

export const authController = {
  // POST /api/auth/register
  async register(req: Request, res: Response) {
    try {
      const {
        email, password, name, role, avatarUrl,
        user_type, school_name, grade_class, roll_number,
        institution, studentId, department, expertise
      } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      let authUserId = '';
      let authToken = '';
      let isMocked = false;

      try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: role || 'student',
              avatar_url: avatarUrl || '',
              user_type: user_type || 'college',
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) {
          throw new Error('User registration failed');
        }

        authUserId = authData.user.id;
        authToken = authData.session?.access_token || '';
      } catch (authError: any) {
        console.warn('Supabase Auth signUp failed, falling back to local database signup:', authError.message);
        
        // Generate a random UUID
        authUserId = `da7e${Math.random().toString(36).substring(2, 6)}-0000-0000-0000-${Math.random().toString(36).substring(2, 14).padEnd(12, '0')}`;
        authToken = 'mock-bypass-token';
        isMocked = true;
      }

      // Insert profile in local/Supabase users table
      const profileData = {
        id: authUserId,
        name,
        email,
        role: role || 'student',
        avatar_url: avatarUrl || '',
        xp: 0,
        level: 1,
        streak: 0,
        last_login: new Date().toISOString().split('T')[0],
        user_type: user_type || 'college',
        school_name: school_name || null,
        grade_class: grade_class || null,
        roll_number: roll_number || null,
        institution: institution || null,
        student_id: studentId || null,
        department: department || null,
        expertise: expertise || null,
        status: 'active',
      };

      // Always save to local DB fallback
      localDB.addUser(profileData);

      // Attempt to save to Supabase
      try {
        const { error: profileError } = await supabase.from('users').upsert(profileData);
        if (profileError) throw profileError;
      } catch (dbErr: any) {
        console.warn('Could not insert profile into remote Supabase users table (using local DB fallback):', dbErr.message);
      }

      res.status(201).json({
        user: {
          id: authUserId,
          name,
          email,
          role: role || 'student',
          avatar: avatarUrl || '',
          user_type: user_type || 'college',
        },
        token: authToken,
      });
    } catch (error: any) {
      console.error('Register error:', error.message || error);
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  },

  // POST /api/auth/login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      let userId = '';
      let authToken = '';
      let profile: any = null;

      try {
        // Log in via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        userId = data.user.id;
        authToken = data.session?.access_token || '';
      } catch (loginError: any) {
        console.warn('Supabase Auth signIn failed, trying local DB user lookup:', loginError.message);
        
        // Find in local DB
        const localUser = localDB.getUserByEmail(email);
        if (!localUser) {
          throw new Error('Invalid login credentials or user does not exist');
        }
        
        profile = localUser;
        userId = localUser.id;
        authToken = 'mock-bypass-token';
      }

      // Fetch profile details from Supabase if not already retrieved locally
      if (!profile) {
        try {
          const { data: userProfile, error: profileErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (!profileErr && userProfile) {
            profile = userProfile;
            localDB.addUser(userProfile); // sync locally
          }
        } catch (err) {
          console.warn('Could not fetch user profile from Supabase, checking local DB:', err);
        }
      }

      // Fallback to local DB if fetch failed
      if (!profile) {
        profile = localDB.getUserById(userId);
      }

      if (!profile) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      const profileAny = profile as any;
      res.json({
        user: {
          id: userId,
          name: profileAny?.name || email.split('@')[0],
          email,
          role: profileAny?.role || 'student',
          avatar: profileAny?.avatar_url || '',
          xp: profileAny?.xp || 0,
          level: profileAny?.level || 1,
          streak: profileAny?.streak || 0,
          user_type: profileAny?.user_type || 'college',
          school_name: profileAny?.school_name,
          grade_class: profileAny?.grade_class,
          roll_number: profileAny?.roll_number,
          studentId: profileAny?.student_id,
          institution: profileAny?.institution,
          department: profileAny?.department,
          expertise: profileAny?.expertise,
        },
        token: authToken,
      });
    } catch (error: any) {
      console.error('Login error:', error.message || error);
      res.status(400).json({ error: error.message || 'Login failed' });
    }
  },

  // POST /api/auth/logout
  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user && req.user.token !== 'mock-bypass-token') {
        const userClient = getSupabaseForUser(req.user.token);
        await userClient.auth.signOut();
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      console.error('Logout error:', error.message || error);
      res.status(500).json({ error: 'Logout failed' });
    }
  },

  // GET /api/auth/me
  async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      res.json(req.user);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch user context' });
    }
  }
};
