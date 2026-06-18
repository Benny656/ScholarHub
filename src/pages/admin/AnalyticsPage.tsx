import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  GraduationCap,
  RefreshCw,
  School,
  Users,
  Video,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminAnnouncementSender } from '../../components/admin/AdminAnnouncementSender';
import { Button, GlassCard, SkeletonCard } from '../../components/ui/index';

type AccountRow = {
  id: string;
  email?: string | null;
  role?: 'student' | 'teacher' | 'admin' | null;
  grade_level?: string | null;
  institution?: string | null;
  created_at?: string | null;
  last_login?: string | null;
  status?: string | null;
};

type CourseRow = {
  id: string;
  title?: string | null;
  institution_type?: string | null;
  total_students?: number | null;
};

type EnrollmentRow = {
  course_id?: string | null;
  progress?: number | null;
};

type AttendanceRow = {
  status?: string | null;
};

type ChartDatum = {
  name: string;
  value: number;
};

const CHART_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#ef4444'];

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function isK12Account(account: AccountRow) {
  const grade = account.grade_level?.toLowerCase() || '';
  const institution = account.institution?.toLowerCase() || '';
  return grade.startsWith('k12') || institution.includes('school') || institution.includes('k-12');
}

function isK12Course(course: CourseRow) {
  return course.institution_type?.toLowerCase() === 'k12';
}

function monthKey(dateValue?: string | null) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

function mergeAccounts(profiles: AccountRow[], users: AccountRow[]) {
  const merged = new Map<string, AccountRow>();

  users.forEach((user) => {
    if (user.id) merged.set(user.id, user);
  });

  profiles.forEach((profile) => {
    if (!profile.id) return;
    merged.set(profile.id, {
      ...merged.get(profile.id),
      ...profile,
    });
  });

  return Array.from(merged.values());
}

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [liveSessions, setLiveSessions] = useState<number>(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profilesResult, usersResult, coursesResult, enrollmentsResult, attendanceResult, liveSessionsResult] =
        await Promise.all([
          supabase.from('profiles').select('id,email,role,grade_level,institution,created_at'),
          supabase.from('users').select('id,email,role,grade_level,institution,created_at,last_login,status'),
          supabase.from('courses').select('id,title,institution_type,total_students'),
          supabase.from('enrollments').select('course_id,progress'),
          supabase.from('attendance').select('status'),
          supabase.from('live_sessions').select('id', { count: 'exact', head: true }).eq('status', 'LIVE'),
        ]);

      const realProfiles = profilesResult.error ? [] : asArray(profilesResult.data as AccountRow[]);
      const realUsers = usersResult.error ? [] : asArray(usersResult.data as AccountRow[]);

      if (profilesResult.error && usersResult.error) {
        throw profilesResult.error;
      }

      setAccounts(mergeAccounts(realProfiles, realUsers));
      setCourses(coursesResult.error ? [] : asArray(coursesResult.data as CourseRow[]));
      setEnrollments(enrollmentsResult.error ? [] : asArray(enrollmentsResult.data as EnrollmentRow[]));
      setAttendance(attendanceResult.error ? [] : asArray(attendanceResult.data as AttendanceRow[]));
      setLiveSessions(liveSessionsResult.count || 0);
    } catch (err: any) {
      console.error('Supabase analytics fetch error:', err);
      setError(err.message || 'Failed to load platform analytics');
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const activeAccounts = accounts.filter((account) => account.status !== 'suspended');
    const students = accounts.filter((account) => account.role === 'student').length;
    const teachers = accounts.filter((account) => account.role === 'teacher').length;
    const admins = accounts.filter((account) => account.role === 'admin').length;
    const loggedInAccounts = accounts.filter((account) => Boolean(account.last_login)).length;

    const k12Accounts = accounts.filter(isK12Account).length;
    const universityAccounts = accounts.filter((account) => account.role !== 'admin' && !isK12Account(account)).length;
    const k12Courses = courses.filter(isK12Course).length;
    const universityCourses = courses.filter((course) => !isK12Course(course)).length;

    const completedEnrollments = enrollments.filter((enrollment) => Number(enrollment.progress || 0) >= 100).length;
    const avgProgress = enrollments.length
      ? Math.round(enrollments.reduce((sum, enrollment) => sum + Number(enrollment.progress || 0), 0) / enrollments.length)
      : 0;
    const presentAttendance = attendance.filter((row) => row.status === 'present' || row.status === 'late').length;
    const attendanceRate = attendance.length ? Math.round((presentAttendance / attendance.length) * 100) : 0;

    const roleData: ChartDatum[] = [
      { name: 'Students', value: students },
      { name: 'Teachers', value: teachers },
      { name: 'Admins', value: admins },
    ].filter((item) => item.value > 0);

    const institutionData: ChartDatum[] = [
      { name: 'K-12 Accounts', value: k12Accounts },
      { name: 'University Accounts', value: universityAccounts },
    ];

    const courseData: ChartDatum[] = [
      { name: 'K-12 Courses', value: k12Courses },
      { name: 'University Courses', value: universityCourses },
    ];

    const lastSixMonths = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    });
    const accountTrend = lastSixMonths.map((name) => ({
      name,
      accounts: accounts.filter((account) => monthKey(account.created_at) === name).length,
    }));

    const courseEnrollmentCounts = enrollments.reduce<Record<string, number>>((acc, enrollment) => {
      if (!enrollment.course_id) return acc;
      acc[enrollment.course_id] = (acc[enrollment.course_id] || 0) + 1;
      return acc;
    }, {});

    const popularCourses = courses
      .map((course) => ({
        id: course.id,
        title: course.title || 'Untitled course',
        type: isK12Course(course) ? 'K-12' : 'University',
        enrolled: courseEnrollmentCounts[course.id] || Number(course.total_students || 0),
      }))
      .sort((a, b) => b.enrolled - a.enrolled)
      .slice(0, 5);

    const engagementData = [
      { name: 'Avg Progress', value: avgProgress },
      { name: 'Attendance', value: attendanceRate },
      { name: 'Completed', value: completedEnrollments },
      { name: 'Live Now', value: liveSessions },
    ];

    return {
      totalAccounts: accounts.length,
      activeAccounts: activeAccounts.length,
      loggedInAccounts,
      students,
      teachers,
      admins,
      totalCourses: courses.length,
      k12Accounts,
      universityAccounts,
      k12Courses,
      universityCourses,
      avgProgress,
      attendanceRate,
      completedEnrollments,
      roleData,
      institutionData,
      courseData,
      accountTrend,
      engagementData,
      popularCourses,
    };
  }, [accounts, attendance, courses, enrollments, liveSessions]);

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto p-8 space-y-8">
        <div className="h-32">
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <SkeletonCard />
          </div>
          <div className="h-80">
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto p-8 mt-12 text-center">
        <GlassCard className="inline-block p-8 border-4 border-red-500/30 rounded-3xl max-w-lg w-full bg-red-500/5 dark:bg-red-900/10">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Error Loading Analytics</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{error}</p>
          <Button variant="primary" onClick={loadDashboardData} icon={<RefreshCw size={14} />}>
            Retry
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12 font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-2">
            Platform Analytics
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl">
            Live account, course, K-12, university, enrollment, attendance, and classroom activity from the platform database.
          </p>
        </div>
        <Button variant="secondary" onClick={loadDashboardData} icon={<RefreshCw size={14} />}>
          Refresh
        </Button>
      </div>

      <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.08 }} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <MetricCard icon={<Users size={18} />} label="Created Accounts" value={analytics.totalAccounts} helper={`${analytics.activeAccounts} active`} color="blue" />
          <MetricCard icon={<CheckCircle size={18} />} label="Logged In Users" value={analytics.loggedInAccounts} helper="Accounts with last login" color="emerald" />
          <MetricCard icon={<School size={18} />} label="K-12 / Uni Users" value={`${analytics.k12Accounts}/${analytics.universityAccounts}`} helper="Learner and educator split" color="amber" />
          <MetricCard icon={<GraduationCap size={18} />} label="Courses" value={analytics.totalCourses} helper={`${analytics.k12Courses} K-12, ${analytics.universityCourses} university`} color="purple" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <ChartCard title="Account Creation Trend" icon={<BarChart3 size={18} className="text-blue-600" />}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.accountTrend} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accountsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="accounts" stroke="#2563eb" fill="url(#accountsGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChartCard title="Role Mix" icon={<Users size={18} className="text-emerald-600" />}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={analytics.roleData.length ? analytics.roleData : [{ name: 'No Accounts', value: 1 }]} dataKey="value" nameKey="name" innerRadius={64} outerRadius={100} paddingAngle={3}>
                    {(analytics.roleData.length ? analytics.roleData : [{ name: 'No Accounts', value: 1 }]).map((_, index) => (
                      <Cell key={index} fill={analytics.roleData.length ? CHART_COLORS[index % CHART_COLORS.length] : '#d1d5db'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <ChartCard title="K-12 vs University Accounts" icon={<School size={18} className="text-amber-600" />}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.institutionData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {analytics.institutionData.map((_, index) => (
                      <Cell key={index} fill={index === 0 ? '#16a34a' : '#7c3aed'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChartCard title="Course Distribution" icon={<GraduationCap size={18} className="text-purple-600" />}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.courseData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {analytics.courseData.map((_, index) => (
                      <Cell key={index} fill={index === 0 ? '#0f766e' : '#2563eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <ChartCard title="Engagement Snapshot" icon={<Activity size={18} className="text-emerald-600" />}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.engagementData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard className="h-full">
              <div className="flex items-center gap-2 mb-5">
                <Video size={18} className="text-red-600" />
                <h3 className="font-bold text-neutral-900 dark:text-white">Live Platform Health</h3>
              </div>
              <div className="space-y-4">
                <HealthRow label="Average progress" value={`${analytics.avgProgress}%`} />
                <HealthRow label="Attendance rate" value={`${analytics.attendanceRate}%`} />
                <HealthRow label="Completed enrollments" value={analytics.completedEnrollments.toLocaleString()} />
                <HealthRow label="Live classrooms now" value={liveSessions.toLocaleString()} />
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
              <GraduationCap className="text-blue-600" size={18} />
              <h3 className="font-bold text-neutral-900 dark:text-white">Top Courses by Enrollment</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
                <thead className="bg-neutral-50/70 dark:bg-neutral-900 text-xs uppercase font-semibold border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="px-5 py-3">Course</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3 text-right">Enrollments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {analytics.popularCourses.length ? (
                    analytics.popularCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="px-5 py-4 font-semibold text-neutral-900 dark:text-white">{course.title}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                            course.type === 'K-12'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-700 border-blue-500/20'
                          }`}>
                            {course.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-neutral-900 dark:text-white">
                          {course.enrolled.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-5 py-6 text-center text-neutral-500" colSpan={3}>
                        No courses found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="max-w-2xl">
            <AdminAnnouncementSender />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  helper: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <GlassCard className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{label}</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-2">{helper}</p>
        </div>
        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <GlassCard className="h-full">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h3 className="font-bold text-neutral-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </GlassCard>
  );
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 px-4 py-3">
      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{label}</span>
      <span className="text-sm font-bold text-neutral-900 dark:text-white">{value}</span>
    </div>
  );
}
