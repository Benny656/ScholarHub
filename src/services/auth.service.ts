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
    
    // Fetch profile from public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', userError);
    }
    
    const userDataAny = userData as any;
    const user: User = {
      id: data.user.id,
      name: userDataAny?.name || emailStr.split('@')[0],
      email: data.user.email!,
      role: (userDataAny?.role as UserRole) || 'student',
      avatar: userDataAny?.avatar_url || '',
      createdAt: data.user.created_at,
      user_type: userDataAny?.user_type || 'college',
      school_name: userDataAny?.school_name,
      grade_class: userDataAny?.grade_class,
      roll_number: userDataAny?.roll_number,
      studentId: userDataAny?.student_id,
      institution: userDataAny?.institution,
      department: userDataAny?.department,
      expertise: userDataAny?.expertise,
    };

    return {
      user,
      token: data.session?.access_token || '',
    };
  },

  async register(
    emailOrPayload: string | RegisterPayload,
    password?: string,
    name?: string,
    role?: UserRole
  ): Promise<AuthResponse> {
    let emailStr: string;
    let passwordStr: string;
    let nameStr: string;
    let roleStr: UserRole;
    let avatarUrlStr = '';

    if (typeof emailOrPayload === 'object' && emailOrPayload !== null) {
      emailStr = emailOrPayload.email;
      passwordStr = emailOrPayload.password;
      nameStr = emailOrPayload.name;
      roleStr = emailOrPayload.role;
      avatarUrlStr = emailOrPayload.avatarUrl || '';
    } else {
      emailStr = emailOrPayload;
      passwordStr = password || '';
      nameStr = name || '';
      roleStr = role || 'student';
    }

    const { data, error } = await supabase.auth.signUp({
      email: emailStr,
      password: passwordStr,
      options: {
        data: {
          name: nameStr,
          role: roleStr,
          avatar_url: avatarUrlStr,
          user_type: typeof emailOrPayload === 'object' ? (emailOrPayload.user_type || 'college') : 'college',
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
      name: nameStr,
      email: emailStr,
      role: roleStr,
      avatar_url: avatarUrlStr,
      xp: 0,
      level: 1,
      streak: 0,
      last_login: new Date().toISOString().split('T')[0],
      user_type: typeof emailOrPayload === 'object' ? (emailOrPayload.user_type || 'college') : 'college',
      school_name: typeof emailOrPayload === 'object' ? emailOrPayload.school_name : null,
      grade_class: typeof emailOrPayload === 'object' ? emailOrPayload.grade_class : null,
      roll_number: typeof emailOrPayload === 'object' ? emailOrPayload.roll_number : null,
      institution: typeof emailOrPayload === 'object' ? emailOrPayload.institution : null,
      student_id: typeof emailOrPayload === 'object' ? emailOrPayload.studentId : null,
      department: typeof emailOrPayload === 'object' ? emailOrPayload.department : null,
      expertise: typeof emailOrPayload === 'object' ? emailOrPayload.expertise : null,
    });

    if (insertError) {
      console.error('Error inserting into public.users:', insertError);
    }

    const newUser: User = {
      id: data.user.id,
      name: nameStr,
      email: emailStr,
      role: roleStr,
      avatar: avatarUrlStr,
      createdAt: data.user.created_at,
      user_type: typeof emailOrPayload === 'object' ? (emailOrPayload.user_type || 'college') : 'college',
      school_name: typeof emailOrPayload === 'object' ? emailOrPayload.school_name : undefined,
      grade_class: typeof emailOrPayload === 'object' ? emailOrPayload.grade_class : undefined,
      roll_number: typeof emailOrPayload === 'object' ? emailOrPayload.roll_number : undefined,
      institution: typeof emailOrPayload === 'object' ? emailOrPayload.institution : undefined,
      studentId: typeof emailOrPayload === 'object' ? emailOrPayload.studentId : undefined,
      department: typeof emailOrPayload === 'object' ? emailOrPayload.department : undefined,
      expertise: typeof emailOrPayload === 'object' ? (emailOrPayload.expertise ? [emailOrPayload.expertise] : []) : undefined,
    } as any;

    return {
      user: newUser,
      token: data.session?.access_token || '',
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(emailOrToken: string, password?: string): Promise<{ message: string }> {
    if (password) {
      // original resetPassword(token, password) implementation
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return { message: 'Password reset successfully' };
    } else {
      // resetPassword(email) implementation requested by user
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
  },

  // Keep getMe for compatibility with AuthContext.tsx
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
