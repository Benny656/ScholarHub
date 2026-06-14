import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    name: string;
    token: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    
    // For demo/bypass cases
    if (token === 'mock-bypass-token') {
      // Decode or retrieve bypass user based on some header or default
      const bypassRole = (req.headers['x-bypass-role'] as 'student' | 'teacher' | 'admin') || 'teacher';
      req.user = {
        id: bypassRole === 'teacher' ? 'da7eb000-0000-0000-0000-000000000001' : bypassRole === 'admin' ? 'da7eb000-0000-0000-0000-000000000000' : 'da7eb000-0000-0000-0000-000000000002',
        email: `${bypassRole}@nexlearn.com`,
        role: bypassRole,
        name: bypassRole === 'teacher' ? 'Professor Smith' : bypassRole === 'admin' ? 'Benny Manuel' : 'Ben',
        token,
      };
      return next();
    }

    // Call Supabase Auth API to get the user corresponding to the JWT
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Session expired or invalid token' });
    }

    // Retrieve user role from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: (profile.role as 'student' | 'teacher' | 'admin') || 'student',
      name: profile.name || 'User',
      token,
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
