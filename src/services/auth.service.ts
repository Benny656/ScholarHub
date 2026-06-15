import type { User, UserRole, TeacherTrack } from '../types';
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
  institution?: string;
  studentId?: string;
  gradeLevel?: string;
  teacherId?: string;
  department?: string;
  expertise?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  institution: string | null;
  student_id: string | null;
  grade_level: string | null;
  teacher_id: string | null;
  department: string | null;
  expertise: string | null;
  created_at: string;
  updated_at: string | null;
};

export const PROFILE_COLUMNS =
  'id,email,full_name,avatar_url,role,institution,student_id,grade_level,teacher_id,department,expertise,created_at,updated_at';

const PROFILE_FIELDS = new Set([
  'id',
  'email',
  'full_name',
  'avatar_url',
  'role',
  'institution',
  'student_id',
  'grade_level',
  'teacher_id',
  'department',
  'expertise',
  'created_at',
  'updated_at',
]);

function sanitizeProfilePayload(payload: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (PROFILE_FIELDS.has(key) && value !== undefined) clean[key] = value;
  }
  return clean;
}

function getAuthName(user: NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>) {
  return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown';
}

function mapProfileToUser(
  authUser: NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>,
  profile: Profile
): User {
  const teacherTrack: TeacherTrack | undefined = profile.role === 'teacher'
    ? profile.grade_level === 'k12' ? 'k12' : 'college'
    : undefined;

  return {
    id: authUser.id,
    name: profile.full_name || getAuthName(authUser),
    email: profile.email || authUser.email || '',
    role: (profile.role as UserRole) || 'student',
    avatar: profile.avatar_url || '',
    createdAt: profile.created_at || authUser.created_at,
    updatedAt: profile.updated_at || undefined,
    studentId: profile.student_id || undefined,
    gradeLevel: profile.grade_level || undefined,
    teacherId: profile.teacher_id || undefined,
    institution: profile.institution || undefined,
    department: profile.department || undefined,
    expertise: profile.expertise ? profile.expertise.split(',').map(item => item.trim()).filter(Boolean) : undefined,
    teacherTrack,
  };
}

export function getDashboardPath(user: Pick<User, 'role' | 'teacherTrack' | 'gradeLevel'> | Pick<Profile, 'role' | 'grade_level'> | null | undefined) {
  if (!user?.role) return '/onboarding/role-selection';
  if (user.role === 'admin') return '/admin/dashboard';
  
  if (user.role === 'teacher') {
    const track = 'teacherTrack' in user && user.teacherTrack ? user.teacherTrack : (user as Pick<Profile, 'grade_level'>).grade_level === 'k12' ? 'k12' : 'college';
    return track === 'k12' ? '/k12-teacher/dashboard' : '/teacher/dashboard';
  }
  
  // Student
  const gradeLevel = 'gradeLevel' in user && user.gradeLevel ? user.gradeLevel : (user as Pick<Profile, 'grade_level'>).grade_level === 'k12' ? 'k12' : 'college';
  return gradeLevel === 'k12' ? '/school-student/dashboard' : '/unistudents/dashboard';
}

export const authService = {
  async login(emailOrPayload: string | LoginPayload, password?: string): Promise<AuthResponse> {
    const email = typeof emailOrPayload === 'object' ? emailOrPayload.email : emailOrPayload;
    const passwordValue = typeof emailOrPayload === 'object' ? emailOrPayload.password : password || '';

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passwordValue,
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

  async getProfile(userId: string): Promise<Profile | null> {
    console.info('[profiles.select]', { columns: PROFILE_COLUMNS, id: userId });
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[profiles.select.error]', error);
      throw error;
    }

    return data as Profile | null;
  },

  async createProfile(profileData: Partial<Profile> & { id: string }): Promise<Profile> {
    const payload = sanitizeProfilePayload({
      ...profileData,
      updated_at: new Date().toISOString(),
    });
    console.info('[profiles.upsert]', { columns: PROFILE_COLUMNS, payload });

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload as any, { onConflict: 'id' })
      .select(PROFILE_COLUMNS)
      .single();

    if (error) {
      console.error('[profiles.upsert.error]', error);
      throw error;
    }

    return data as Profile;
  },

  async ensureProfileForSession(): Promise<Profile | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;

    const existing = await this.getProfile(session.user.id);
    if (existing) return existing;

    return this.createProfile({
      id: session.user.id,
      email: session.user.email || null,
      full_name: getAuthName(session.user),
      avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
      role: null,
    });
  },

  getRateLimitMessage(error: any): string | null {
    const status = error?.status || error?.statusCode;
    const message = String(error?.message || '').toLowerCase();
    if (status === 429 || message.includes('rate limit') || message.includes('too many requests')) {
      return 'Too many signup attempts. Please wait a few minutes and try again.';
    }
    return null;
  },

  async register(emailOrPayload: string | RegisterPayload, password?: string, name?: string, role?: UserRole): Promise<AuthResponse> {
    const payload: RegisterPayload = typeof emailOrPayload === 'object'
      ? emailOrPayload
      : {
          email: emailOrPayload,
          password: password!,
          name: name || '',
          role: role || 'student',
        };

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.name,
          role: payload.role,
          avatar_url: payload.avatarUrl || null,
          institution: payload.institution || null,
          student_id: payload.studentId || null,
          grade_level: payload.gradeLevel || null,
          teacher_id: payload.teacherId || null,
          department: payload.department || null,
          expertise: payload.expertise || null,
        },
      },
    });

    if (authError) {
      console.error('[auth.signup.error]', authError);
      throw authError;
    }
    if (!authData.user) throw new Error('Signup failed: No user returned');

    // If email confirmation is enabled, session will be null.
    // We cannot query or insert into profiles because auth.uid() is null.
    if (!authData.session) {
      const teacherTrack: TeacherTrack | undefined = payload.role === 'teacher'
        ? payload.gradeLevel === 'k12' ? 'k12' : 'college'
        : undefined;

      const mappedUser: User = {
        id: authData.user.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        avatar: payload.avatarUrl || '',
        createdAt: authData.user.created_at,
        studentId: payload.studentId,
        gradeLevel: payload.gradeLevel,
        teacherId: payload.teacherId,
        institution: payload.institution,
        department: payload.department,
        expertise: payload.expertise ? payload.expertise.split(',').map(item => item.trim()).filter(Boolean) : undefined,
        teacherTrack,
      };
      
      return { user: mappedUser, token: '' };
    }

    const user = await this.getCurrentUser();
    if (!user) {
      const profile = await this.getProfile(authData.user.id);
      if (!profile) throw new Error('Profile creation pending');
      return { user: mapProfileToUser(authData.user, profile), token: authData.session.access_token };
    }

    return { user, token: authData.session.access_token };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async resetPassword(emailOrToken: string, password?: string): Promise<{ message: string }> {
    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return { message: 'Password reset successfully' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailOrToken);
    if (error) throw error;
    return { message: `Password reset link sent to ${emailOrToken}` };
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.resetPassword(email);
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const profile = await this.getProfile(user.id);
    if (!profile) return null;

    return mapProfileToUser(user, profile);
  },

  async getMe(): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Unauthorized');
    return user;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized');

    const dbData = sanitizeProfilePayload({
      full_name: data.name,
      email: data.email,
      avatar_url: data.avatar,
      role: data.role,
      institution: data.institution,
      student_id: data.studentId,
      grade_level: data.gradeLevel,
      teacher_id: data.teacherId,
      department: data.department,
      expertise: Array.isArray(data.expertise) ? data.expertise.join(', ') : data.expertise,
      updated_at: new Date().toISOString(),
    });

    console.info('[profiles.update]', { columns: PROFILE_COLUMNS, payload: dbData, id: user.id });
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update(dbData as any)
      .eq('id', user.id)
      .select(PROFILE_COLUMNS)
      .single();

    if (updateError) {
      console.error('[profiles.update.error]', updateError);
      throw updateError;
    }

    return mapProfileToUser(user, updated as Profile);
  },

  async changePassword(_currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { message: 'Password changed successfully' };
  },
};
