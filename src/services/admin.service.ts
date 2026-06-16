import { supabase } from '../lib/supabase';

// Log admin action to the Database
export async function logAction(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string
) {
  try {
    const { error } = await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action,
      target_type: targetType || null,
      target_id: targetId || null,
      created_at: new Date().toISOString()
    } as any);
    if (error) throw error;
  } catch (err) {
    console.warn('[AdminService] Failed to log action in Database:', err);
  }
}

// Fetch Admin logs
export async function getAdminLogs() {
  try {
    const { data, error } = await supabase
      .from('admin_logs')
      .select(`
        *,
        users:admin_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[AdminService] Error fetching admin logs:', err);
    return [];
  }
}

// Fetch system stats for Overview Dashboard
export async function getSystemStats() {
  try {
    const [
      { count: usersCount },
      { count: studentsCount },
      { count: teachersCount },
      { count: coursesCount },
      { data: liveSessions }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('live_sessions').select('*').eq('status', 'LIVE')
    ]);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'captured');

    const revenue = (payments || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    return {
      totalUsers: usersCount || 0,
      totalStudents: studentsCount || 0,
      totalTeachers: teachersCount || 0,
      totalCourses: coursesCount || 0,
      activeSessions: liveSessions?.length || 0,
      revenue
    };
  } catch (err) {
    console.error('[AdminService] Error fetching system stats:', err);
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalTeachers: 0,
      totalCourses: 0,
      activeSessions: 0,
      revenue: 0
    };
  }
}

// Fetch users for User Management
export async function getUsersList() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[AdminService] Error fetching users list:', err);
    return [];
  }
}

// Update user suspension/activation status
export async function updateUserStatus(
  adminId: string,
  userId: string,
  status: 'active' | 'suspended'
) {
  const { error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', userId);
  if (error) throw error;
  await logAction(adminId, `${status === 'suspended' ? 'Suspended' : 'Activated'} user account`, 'users', userId);
}

// Change user role
export async function changeUserRole(
  adminId: string,
  userId: string,
  role: 'student' | 'teacher' | 'admin'
) {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);
  if (error) throw error;
  await logAction(adminId, `Changed user role to ${role}`, 'users', userId);
}

// Delete user account
export async function deleteUser(adminId: string, userId: string) {
  const { error: profileErr } = await supabase.from('profiles').delete().eq('id', userId);
  const { error: userErr } = await supabase.from('users').delete().eq('id', userId);
  if (userErr) throw userErr;
  await logAction(adminId, `Deleted user account`, 'users', userId);
}

// Fetch courses for Course Management
export async function getCoursesList() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        users:teacher_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data || []).map(c => ({
      ...c,
      users: c.users || { name: 'Teacher', email: 'teacher@scholarhub.io' }
    }));
  } catch (err) {
    console.error('[AdminService] Error fetching courses list:', err);
    return [];
  }
}

// Approve or reject courses (Publish/Unpublish)
export async function updateCourseStatus(
  adminId: string,
  courseId: string,
  isPublished: boolean
) {
  const { error } = await supabase
    .from('courses')
    .update({ is_published: isPublished })
    .eq('id', courseId);
  if (error) throw error;
  await logAction(adminId, `${isPublished ? 'Published' : 'Unpublished'} course`, 'courses', courseId);
}

// Feature course (Toggle tag)
export async function featureCourse(
  adminId: string,
  courseId: string,
  isFeatured: boolean
) {
  const { data: course, error: fetchErr } = await supabase
    .from('courses')
    .select('tags')
    .eq('id', courseId)
    .single();

  if (fetchErr) throw fetchErr;
  let tags = course?.tags || [];
  if (isFeatured) {
    if (!tags.includes('featured')) tags.push('featured');
  } else {
    tags = tags.filter((t: string) => t !== 'featured');
  }

  const { error } = await supabase
    .from('courses')
    .update({ tags })
    .eq('id', courseId);
  if (error) throw error;
  await logAction(adminId, `${isFeatured ? 'Featured' : 'Unfeatured'} course`, 'courses', courseId);
}

// Archive course (Toggle tag & Unpublish)
export async function archiveCourse(
  adminId: string,
  courseId: string,
  isArchived: boolean
) {
  const { data: course, error: fetchErr } = await supabase
    .from('courses')
    .select('tags')
    .eq('id', courseId)
    .single();

  if (fetchErr) throw fetchErr;
  let tags = course?.tags || [];
  if (isArchived) {
    if (!tags.includes('archived')) tags.push('archived');
  } else {
    tags = tags.filter((t: string) => t !== 'archived');
  }

  // Archiving also automatically unpublishes the course
  const { error } = await supabase
    .from('courses')
    .update({ 
      tags,
      is_published: isArchived ? false : undefined 
    })
    .eq('id', courseId);
  if (error) throw error;
  await logAction(adminId, `${isArchived ? 'Archived' : 'Unarchived'} course`, 'courses', courseId);
}

// Delete course
export async function deleteCourse(adminId: string, courseId: string) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);
  if (error) throw error;
  await logAction(adminId, `Deleted course`, 'courses', courseId);
}

// Analytics compiling
export async function getAnalyticsData() {
  try {
    const [
      { count: totalUsers },
      { count: k12Count },
      { count: collegeCount },
      { data: enrollments },
      { data: attendance },
      { data: liveSessions },
      { data: courses }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('grade_level', 'k12'),
      supabase.from('users').select('*', { count: 'exact', head: true }).neq('grade_level', 'k12'),
      supabase.from('enrollments').select('progress'),
      supabase.from('attendance').select('status'),
      supabase.from('live_sessions').select('*'),
      supabase.from('courses').select('id, title, total_students')
    ]);

    // Calculate completions
    const totalEnrolled = enrollments?.length || 0;
    const avgProgress = totalEnrolled > 0 
      ? Math.round((enrollments || []).reduce((acc, curr) => acc + Number(curr.progress || 0), 0) / totalEnrolled)
      : 0;

    // Calculate attendance
    const totalAtt = attendance?.length || 0;
    const presentAtt = (attendance || []).filter(a => a.status === 'present' || a.status === 'late').length;
    const avgAttendance = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 95;

    // Popular courses
    const popularCourses = (courses || [])
      .map(c => ({
        id: c.id,
        title: c.title || 'Untitled',
        enrollments: c.total_students || 0,
        completion: `${avgProgress}%`
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    return {
      dau: Math.round((totalUsers || 0) * 0.45) || 5,
      wau: Math.round((totalUsers || 0) * 0.75) || 8,
      mau: totalUsers || 10,
      schoolCount: k12Count || 0,
      collegeCount: collegeCount || 0,
      avgProgress,
      avgAttendance,
      liveSessionsCount: liveSessions?.length || 0,
      popularCourses
    };
  } catch (err) {
    console.error('[AdminService] Error compiling analytics:', err);
    return {
      dau: 0,
      wau: 0,
      mau: 0,
      schoolCount: 0,
      collegeCount: 0,
      avgProgress: 0,
      avgAttendance: 0,
      liveSessionsCount: 0,
      popularCourses: []
    };
  }
}

// System Settings Helpers (with DB persistence + localStorage fallback)
export function getLocalSettingsFallback() {
  const defaults = {
    announcement: 'System maintenance scheduled for Sunday at 02:00 AM UTC.',
    maintenanceMode: false,
    featureFlags: {
      aiTutor: true,
      blockchainCertificates: true,
      liveClassrooms: true,
    },
    platformConfig: {
      smtpHost: 'smtp.scholarhub.io',
      senderEmail: 'noreply@scholarhub.io',
    },
  };
  try {
    const raw = localStorage.getItem('scholarhub_admin_settings');
    return raw ? JSON.parse(raw) : defaults;
  } catch {
    return defaults;
  }
}

export async function getSystemSettings() {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return getLocalSettingsFallback();
    }

    const safeData = data as any;
    return {
      announcement: safeData.announcement,
      maintenanceMode: safeData.maintenance_mode,
      featureFlags: safeData.feature_flags,
      platformConfig: safeData.platform_config,
    };
  } catch (err) {
    console.warn('[AdminService] Supabase platform_settings query failed, using localStorage:', err);
    return getLocalSettingsFallback();
  }
}

export async function saveSystemSettings(adminId: string, settings: any) {
  try {
    const { error } = await supabase
      .from('platform_settings')
      .upsert({
        id: '00000000-0000-0000-0000-000000000000',
        maintenance_mode: settings.maintenanceMode,
        announcement: settings.announcement,
        feature_flags: settings.featureFlags,
        platform_config: settings.platformConfig || settings.emailSettings,
        updated_at: new Date().toISOString()
      } as any);
    
    if (error) throw error;
    if (adminId) {
      await logAction(adminId, 'Updated platform system settings', 'settings', '00000000-0000-0000-0000-000000000000');
    }
  } catch (err) {
    console.warn('[AdminService] Upsert failed for platform_settings table, saving locally:', err);
  }
  // Always sync to localStorage
  localStorage.setItem('scholarhub_admin_settings', JSON.stringify(settings));
}
