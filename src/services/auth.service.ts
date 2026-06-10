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
  avatarUrl?: string;
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
    
    // Fetch profile from public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', userError);
    }
    
    const user: User = {
      id: data.user.id,
      name: userData?.name || payload.email.split('@')[0],
      email: data.user.email!,
      role: (userData?.role as UserRole) || payload.role,
      avatar: userData?.avatar_url || '',
      createdAt: data.user.created_at,
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
          avatar_url: payload.avatarUrl || '',
        }
      }
    });
    if (error) throw error;
    
    if (!data.user) {
      throw new Error('Registration failed, no user returned.');
    }
    
    // Save to users table
    const { error: insertError } = await supabase.from('users').insert({
      id: data.user.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      avatar_url: payload.avatarUrl || '',
      xp: 0,
      level: 1,
      streak: 0,
      last_login: new Date().toISOString().split('T')[0],
    });

    if (insertError) {
      console.error('Error inserting into public.users:', insertError);
    }

    const newUser: User = {
      id: data.user.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      avatar: payload.avatarUrl || '',
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

  async getMe(): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      name: userData?.name || user.email?.split('@')[0] || 'Unknown',
      email: user.email!,
      role: (userData?.role as UserRole) || 'student',
      avatar: userData?.avatar_url || '',
      createdAt: user.created_at,
      xp: userData?.xp ?? 0,
      level: userData?.level ?? 1,
      streak: userData?.streak ?? 0,
    } as any;
  },

  // Alias for getCurrentUser requested by Part 2
  async getCurrentUser(): Promise<User> {
    return this.getMe();
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');
    
    // Map model fields to database columns
    const dbData: Record<string, any> = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.avatar !== undefined) dbData.avatar_url = data.avatar;
    if (data.role !== undefined) dbData.role = data.role;
    
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update(dbData)
      .eq('id', user.id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    return {
      id: user.id,
      name: updated.name,
      email: user.email!,
      role: updated.role,
      avatar: updated.avatar_url,
      createdAt: user.created_at,
      xp: updated.xp,
      level: updated.level,
      streak: updated.streak,
    } as any;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { message: 'Password changed successfully' };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
