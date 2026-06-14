import type { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/apiClient';

export interface LoginPayload {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
  user_type?: 'school' | 'college';
  school_name?: string;
  grade_class?: string;
  roll_number?: string;
  institution?: string;
  studentId?: string;
  department?: string;
  expertise?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(
    emailOrPayload: string | LoginPayload,
    password?: string
  ): Promise<AuthResponse> {
    let emailStr: string;
    let passwordStr: string;

    if (typeof emailOrPayload === 'object' && emailOrPayload !== null) {
      emailStr = emailOrPayload.email;
      passwordStr = emailOrPayload.password;
    } else {
      emailStr = emailOrPayload;
      passwordStr = password || '';
    }

    // Call Express login route
    const data = await apiClient.post<any>('/auth/login', { email: emailStr, password: passwordStr });
    
    // Set session in client-side Supabase client
    if (data.token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.token,
        refresh_token: '',
      });
      if (sessionError) console.error('Error setting client-side session:', sessionError);
    }
    
    return data;
  },

  async loginWithOAuth(provider: 'google' | 'github'): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw error;
  },

  async getProfile(userId: string): Promise<any> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }
    return data;
  },

  async createProfile(profileData: any): Promise<void> {
    const { error } = await supabase.from('profiles').insert([profileData]);
    if (error) throw error;
  },

  async register(
    emailOrPayload: string | RegisterPayload,
    password?: string,
    name?: string,
    role?: UserRole
  ): Promise<AuthResponse> {
    let payload: any = {};
    if (typeof emailOrPayload === 'object' && emailOrPayload !== null) {
      payload = {
        email: emailOrPayload.email,
        password: emailOrPayload.password,
        name: emailOrPayload.name,
        role: emailOrPayload.role,
        avatarUrl: emailOrPayload.avatarUrl,
        user_type: emailOrPayload.user_type,
        school_name: emailOrPayload.school_name,
        grade_class: emailOrPayload.grade_class,
        roll_number: emailOrPayload.roll_number,
        institution: emailOrPayload.institution,
        studentId: emailOrPayload.studentId,
        department: emailOrPayload.department,
        expertise: emailOrPayload.expertise,
      };
    } else {
      payload = {
        email: emailOrPayload,
        password: password,
        name: name,
        role: role || 'student',
      };
    }

    // Call Express register route
    const data = await apiClient.post<any>('/auth/register', payload);

    // Set session in client-side Supabase client
    if (data.token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.token,
        refresh_token: '',
      });
      if (sessionError) console.error('Error setting client-side session:', sessionError);
    }

    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Express backend logout failed:', err);
    }
    await supabase.auth.signOut();
  },

  async resetPassword(emailOrToken: string, password?: string): Promise<{ message: string }> {
    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return { message: 'Password reset successfully' };
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(emailOrToken);
      if (error) throw error;
      return { message: `Password reset link sent to ${emailOrToken}` };
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.resetPassword(email);
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // Get current user context from backend
      const data = await apiClient.get<any>('/auth/me');
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar || '',
        createdAt: new Date().toISOString(),
      } as any;
    } catch (err) {
      console.warn('Backend getCurrentUser failed, trying client-side Supabase fallback:', err);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      const userDataAny = userData as any;
      return {
        id: user.id,
        name: userDataAny?.name || user.email?.split('@')[0] || 'Unknown',
        email: user.email!,
        role: (userDataAny?.role as UserRole) || 'student',
        avatar: userDataAny?.avatar_url || '',
        createdAt: user.created_at,
        xp: userDataAny?.xp ?? 0,
        level: userDataAny?.level ?? 1,
        streak: userDataAny?.streak ?? 0,
        user_type: userDataAny?.user_type || 'college',
        school_name: userDataAny?.school_name,
        grade_class: userDataAny?.grade_class,
        roll_number: userDataAny?.roll_number,
        studentId: userDataAny?.student_id,
        institution: userDataAny?.institution,
        department: userDataAny?.department,
        expertise: userDataAny?.expertise,
      } as any;
    }
  },

  async getMe(): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Unauthorized');
    return user;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');
    
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
    
    const updatedAny = updated as any;
    return {
      id: user.id,
      name: updatedAny.name,
      email: user.email!,
      role: updatedAny.role,
      avatar: updatedAny.avatar_url,
      createdAt: user.created_at,
      xp: updatedAny.xp,
      level: updatedAny.level,
      streak: updatedAny.streak,
      user_type: updatedAny.user_type || 'college',
      school_name: updatedAny.school_name,
      grade_class: updatedAny.grade_class,
      roll_number: updatedAny.roll_number,
      studentId: updatedAny.student_id,
      institution: updatedAny.institution,
      department: updatedAny.department,
      expertise: updatedAny.expertise,
    } as any;
  },

  async changePassword(_currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { message: 'Password changed successfully' };
  }
};
