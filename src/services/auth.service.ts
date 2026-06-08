import type { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  // student
  studentId?: string;
  institution?: string;
  // teacher
  department?: string;
  expertise?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });
    if (error) throw error;
    
    // Attempt to fetch profile
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    
    const user: User = {
      id: data.user.id,
      name: profileData?.name || payload.email.split('@')[0],
      email: data.user.email!,
      role: profileData?.role || payload.role, // Fallback if no profile
      createdAt: data.user.created_at,
      ...profileData
    };

    return {
      user,
      token: data.session.access_token,
    };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          name: payload.name,
          role: payload.role,
        }
      }
    });
    if (error) throw error;
    
    if (!data.user) {
      throw new Error('Registration failed, no user returned.');
    }
    
    // Save to profiles table if it exists
    await supabase.from('profiles').insert({
      id: data.user.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      institution: payload.institution,
      studentId: payload.studentId,
      department: payload.department,
      expertise: payload.expertise ? [payload.expertise] : [],
    });

    const newUser: User = {
      id: data.user.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      institution: payload.institution,
      studentId: payload.studentId,
      department: payload.department,
      expertise: payload.expertise ? [payload.expertise] : [],
      createdAt: data.user.created_at,
    };

    return {
      user: newUser,
      token: data.session?.access_token || '',
    };
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { message: `Password reset link sent to ${email}` };
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { message: 'Password reset successfully' };
  },

  async getMe(token?: string): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    return {
      id: user.id,
      name: profileData?.name || user.email?.split('@')[0] || 'Unknown',
      email: user.email!,
      role: profileData?.role || 'student',
      createdAt: user.created_at,
      ...profileData
    };
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');
    
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    return {
      id: user.id,
      name: updated.name,
      email: user.email!,
      role: updated.role,
      createdAt: user.created_at,
      ...updated
    } as User;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { message: 'Password changed successfully' };
  },
};
