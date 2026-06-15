import type { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailStr,
      password: passwordStr,
    });
    
    if (error) throw error;
    if (!data.session) throw new Error('No session returned');

    const user = await this.getCurrentUser();
    if (!user) throw new Error('User profile not found');

    return { user, token: data.session.access_token };
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
    let payload: RegisterPayload;
    if (typeof emailOrPayload === 'object' && emailOrPayload !== null) {
      payload = emailOrPayload;
    } else {
      payload = {
        email: emailOrPayload as string,
        password: password!,
        name: name || '',
        role: role || 'student',
      };
    }

    // 1. Create Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Signup failed: No user returned');

    // 2. Insert matching profile row into public.profiles
    const profileData = {
      id: authData.user.id,
      email: payload.email,
      full_name: payload.name,
      role: payload.role,
      avatar_url: payload.avatarUrl,
      user_type: payload.user_type,
      school_name: payload.school_name,
      grade_class: payload.grade_class,
      roll_number: payload.roll_number,
      institution: payload.institution,
      student_id: payload.studentId,
      department: payload.department,
      expertise: payload.expertise,
    };

    await this.createProfile(profileData);

    const user = await this.getCurrentUser();
    // If auto sign-in is disabled or requires email confirmation, user might be null here
    return { user: user as any, token: authData.session?.access_token || '' };
  },

  async logout(): Promise<void> {
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
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const profile = await this.getProfile(user.id);
    if (!profile) return null;

    return {
      id: user.id,
      name: profile.full_name || user.email?.split('@')[0] || 'Unknown',
      email: user.email!,
      role: (profile.role as UserRole) || 'student',
      avatar: profile.avatar_url || '',
      createdAt: profile.created_at || user.created_at,
      xp: profile.xp ?? 0,
      level: profile.level ?? 1,
      streak: profile.streak ?? 0,
      user_type: profile.user_type || 'college',
      school_name: profile.school_name,
      grade_class: profile.grade_class,
      roll_number: profile.roll_number,
      studentId: profile.student_id,
      institution: profile.institution,
      department: profile.department,
      expertise: profile.expertise,
    } as any;
  },

  async getMe(): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Unauthorized');
    return user;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');
    
    const dbData: any = {};
    if (data.name !== undefined) dbData.full_name = data.name;
    if (data.avatar !== undefined) dbData.avatar_url = data.avatar;
    if (data.role !== undefined) dbData.role = data.role;
    
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update(dbData)
      .eq('id', user.id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    const updatedAny = updated as any;
    return {
      id: user.id,
      name: updatedAny.full_name,
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
