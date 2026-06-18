import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { getDashboardPath } from '../../services/auth.service';
import { 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  ChevronRight, 
  PlayCircle, 
  FileText, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Video, 
  Monitor,
  Activity,
  GraduationCap,
  RefreshCw,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { GlassCard, Button, ProgressBar } from '../../components/ui/index';
import { AnnouncementsWidget } from '../../components/dashboard/AnnouncementsWidget';
import { ScheduleWidget } from '../../components/dashboard/ScheduleWidget';

interface DbCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_hours: number;
  total_lessons: number;
  instructor_id: string;
  users: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

interface EnrollmentWithCourse {
  progress: number;
  enrolled_at: string;
  courses: DbCourse | null;
}

interface LiveClass {
  id: string;
  course_id?: string;
  title?: string;
  scheduled_at?: string;
  started_at?: string;
  room_id?: string;
  meeting_room_id?: string;
  status: string;
  courses: {
    id: string;
    title: string;
    users: {
      name?: string;
      full_name?: string;
    } | null;
  } | null;
}

interface PendingAssignment {
  id: string;
  title: string;
  due_date: string;
  max_grade: number;
  course_id: string;
  courses: {
    title: string;
  } | null;
}

interface ActivityItem {
  id: string;
  type: 'enrollment' | 'submission' | 'attendance' | 'certificate';
  title: string;
  timestamp: string;
  badgeText: string;
  badgeVariant: 'blue' | 'emerald' | 'amber' | 'purple';
  icon: any;
}

export function StudentDashboard() {
  const { user } = useAuth();

  const [profileInstitution, setProfileInstitution] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setIsProfileLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('institution')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setProfileInstitution(data.institution);
        }
      } finally {
        setIsProfileLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const isK12 = profileInstitution === 'k12';

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm text-neutral-500">Verifying workspace...</p>
      </div>
    );
  }

  if (user && user.role !== 'student') {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard Data State
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [attendancePercentage, setAttendancePercentage] = useState<number>(0);
  
  // Daily Summary Stats
  const [stats, setStats] = useState({
    classesCountToday: 0,
    pendingAssignmentsCount: 0,
    averageProgress: 0
  });

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Enrollments
      let validEnrollments: EnrollmentWithCourse[] = [];
      let enrolledCourseIds: string[] = [];
      let avgProgress = 0;
      try {
        const { data: enrollmentsData, error: enrollError } = await supabase
          .from('enrollments')
          .select(`
            progress, 
            enrolled_at, 
            courses (
              id, 
              title, 
              description, 
              category, 
              level, 
              duration_hours, 
              total_lessons, 
              instructor_id,
              users (
                name,
                avatar_url
              )
            )
          `)
          .eq('student_id', user.id);

        if (enrollError) throw enrollError;
        validEnrollments = (enrollmentsData || []);
        setEnrollments(validEnrollments);

        enrolledCourseIds = validEnrollments
          .map(e => e.courses?.id)
          .filter((id): id is string => !!id);

        avgProgress = validEnrollments.length > 0
          ? Math.round(validEnrollments.reduce((sum, e) => sum + Number(e.progress), 0) / validEnrollments.length)
          : 0;
      } catch (e) {
        console.error("Dashboard Fetch Error Details (enrollments):", e);
      }

      // 2. Fetch Active Live Classes
      let activeLiveClasses: LiveClass[] = [];
      if (enrolledCourseIds.length > 0) {
        try {
          const { data: liveClassesData, error: liveError } = await supabase
            .from('live_sessions')
            .select(`
              id, 
              course_id,
              meeting_room_id, 
              status,
              started_at,
              courses (
                id, 
                title,
                users (
                  full_name
                )
              )
            `)
            .in('course_id', enrolledCourseIds)
            .eq('status', 'LIVE');

          if (liveError) throw liveError;
          activeLiveClasses = (liveClassesData || []);
        } catch(e) { console.error("Dashboard Fetch Error Details (live_sessions):", e); }
      }
      setUpcomingClasses(activeLiveClasses);

      // 3. Fetch Assignments and Submissions
      let pending: PendingAssignment[] = [];
      let submissionsList: any[] = [];
      if (enrolledCourseIds.length > 0) {
        try {
          const { data: assignmentsData, error: assignmentsError } = await supabase
            .from('assignments')
            .select(`
              id, 
              title, 
              due_date, 
              max_grade, 
              course_id,
              courses (
                title
              )
            `)
            .in('course_id', enrolledCourseIds)
            .order('due_date', { ascending: true });

          if (assignmentsError) throw assignmentsError;

          const { data: submissionsData, error: submissionsError } = await supabase
            .from('submissions')
            .select('assignment_id, submitted_at, grade')
            .eq('student_id', user.id);

          if (submissionsError) throw submissionsError;
          submissionsList = submissionsData || [];

          const submittedIds = new Set(submissionsList.map(s => s.assignment_id));
          pending = (assignmentsData as unknown as PendingAssignment[] || [])
            .filter(a => !submittedIds.has(a.id))
            .slice(0, 5);
        } catch(e) { console.error("Dashboard Fetch Error Details (assignments):", e); }
      }
      setPendingAssignments(pending);

      // 4. Fetch Attendance and calculate percentage
      let attendanceList: any[] = [];
      if (enrolledCourseIds.length > 0) {
        try {
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance')
            .select(`
              id, 
              date, 
              status, 
              marked_at,
              courses (
                title
              )
            `)
            .eq('student_id', user.id);

          if (attendanceError) throw attendanceError;
          attendanceList = attendanceData || [];
          
          const totalClasses = attendanceList.length;
          const presentClasses = attendanceList.filter(a => a.status === 'present' || a.status === 'late').length;
          setAttendancePercentage(totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100);
        } catch(e) { console.error("Dashboard Fetch Error Details (attendance):", e); }
      } else {
        setAttendancePercentage(100);
      }

      // 5. Fetch Certificates
      let certsList: any[] = [];
      try {
        const { data: certificatesData, error: certError } = await supabase
          .from('certificates')
          .select(`
            id, 
            issued_at,
            courses (
              title
            )
          `)
          .eq('student_id', user.id)
          .order('issued_at', { ascending: false })
          .limit(5);
        if (certError) throw certError;
        certsList = certificatesData || [];
      } catch(e) { console.error("Dashboard Fetch Error Details (certificates):", e); }

      // 6. Build Activity Timeline
      const activities: ActivityItem[] = [];
      
      validEnrollments.forEach((e, i) => {
        if (e.enrolled_at) {
          activities.push({
            id: `enroll-${i}-${e.courses?.id}`,
            type: 'enrollment',
            title: `Enrolled in course "${e.courses?.title || 'Unknown course'}"`,
            timestamp: e.enrolled_at,
            badgeText: 'Enrollment',
            badgeVariant: 'blue',
            icon: BookOpen
          });
        }
      });

      // Add submissions to activity
      submissionsList.forEach((s, i) => {
        if (s.submitted_at) {
          activities.push({
            id: `sub-${i}-${s.assignment_id}`,
            type: 'submission',
            title: `Submitted assignment`,
            timestamp: s.submitted_at,
            badgeText: s.grade !== null && s.grade !== undefined ? `Graded: ${s.grade}` : 'Submitted',
            badgeVariant: s.grade !== null && s.grade !== undefined ? 'emerald' : 'purple',
            icon: FileText
          });
        }
      });

      // Add attendance markings to activity
      attendanceList.forEach((a, i) => {
        if (a.marked_at) {
          activities.push({
            id: `att-${i}-${a.id}`,
            type: 'attendance',
            title: `Marked ${a.status} in course "${a.courses?.title || 'Class'}"`,
            timestamp: a.marked_at,
            badgeText: a.status.toUpperCase(),
            badgeVariant: a.status === 'present' ? 'emerald' : (a.status === 'late' ? 'amber' : 'amber'),
            icon: Clock
          });
        }
      });

      // Add certificates to activity
      certsList.forEach((c, i) => {
        if (c.issued_at) {
          activities.push({
            id: `cert-${i}-${c.id}`,
            type: 'certificate',
            title: `Awarded Certificate for "${c.courses?.title || 'Course'}"`,
            timestamp: c.issued_at,
            badgeText: 'Certificate',
            badgeVariant: 'emerald',
            icon: Award
          });
        }
      });

      // Sort and take top 5
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
      
      setRecentActivities(sortedActivities);

      // Save Daily Summary stats
      setStats({
        classesCountToday: activeLiveClasses.length,
        pendingAssignmentsCount: pending.length,
        averageProgress: avgProgress
      });

    } catch (err: any) {
      console.error("Dashboard Fetch Error Details:", err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading your summary dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="max-w-md mx-auto my-12 text-center p-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-sm text-neutral-500 dark:text-slate-400 mb-6">{error}</p>
        <Button variant="primary" onClick={loadDashboardData} icon={<RefreshCw size={14} />}>Retry</Button>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans space-y-8">
      
      {/* ─── SECTION 1: WELCOME + DAILY SUMMARY ─── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-2">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Here is your daily summary: You have <span className="font-semibold text-brand-primary">{stats.classesCountToday} live classes</span> scheduled today, <span className="font-semibold text-brand-primary">{stats.pendingAssignmentsCount} pending assignments</span>, and your average {isK12 ? "subject" : "course"} progress is <span className="font-semibold text-brand-primary">{stats.averageProgress}%</span>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/messages" className="flex items-center gap-2 px-3 py-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl text-sm transition-colors border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900">
            <Bell size={14} />
            <span>Discussion Board</span>
          </Link>
          <Button variant="secondary" size="sm" onClick={loadDashboardData} icon={<RefreshCw size={13} />}>Refresh</Button>
        </div>
      </motion.div>

      {/* Main Grid Layout for Sections 2-5 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Side: Operations */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          <div className="h-[350px]">
            <ScheduleWidget theme="sleek" />
          </div>
          
          {/* ─── SECTION 2: ACTIVE LIVE CLASSES ─── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard padding="p-0">
              <div className="px-5 py-4 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <Video size={16} className="text-red-500" />
                  </div>
                  Live Classes Now
                </h3>
                <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {upcomingClasses.length === 0 ? (
                  <div className="p-6 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                    No live classes right now. Check back later!
                  </div>
                ) : (
                  upcomingClasses.map(cls => (
                    <div key={cls.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors bg-red-50/50 dark:bg-red-900/10">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{cls.courses?.title || 'Live Class'}</h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Teacher: {cls.courses?.users?.full_name || 'Teacher'}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full animate-pulse" />
                            LIVE NOW
                          </p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Started {Math.floor((Date.now() - new Date(cls.started_at || new Date().toISOString()).getTime()) / 60000)}m ago
                          </p>
                        </div>
                        <Link to={`/classroom/${cls.course_id}`}>
                          <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:scale-105 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all">
                            Join Now
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* ─── SECTION 3: PENDING ASSIGNMENTS ─── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard padding="p-0">
              <div className="px-5 py-4 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <FileText size={16} className="text-amber-500" />
                  Pending Assignments
                </h3>
                <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Next 5</span>
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {pendingAssignments.length === 0 ? (
                  <div className="p-6 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                    No pending assignments. You are fully caught up! 🎉
                  </div>
                ) : (
                  pendingAssignments.map(asg => {
                    const isOverdue = new Date(asg.due_date) < new Date();
                    return (
                      <div key={asg.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{asg.title}</h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Course: {asg.courses?.title || 'Unknown Course'}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end w-full sm:w-auto">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Due Date</p>
                            <p className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : 'text-neutral-950 dark:text-neutral-200'}`}>
                              {new Date(asg.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <Link to={`/assignments/${asg.id}`}>
                            <button className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
                              Submit
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </motion.div>

          <div className="h-[350px]">
            <AnnouncementsWidget theme="sleek" />
          </div>
        </div>

        {/* Right Side: Snapshots & Activity */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* ─── SECTION 4: LEARNING PROGRESS SNAPSHOT ─── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <GlassCard>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-4">
                <GraduationCap size={16} className="text-purple-500" />
                Learning Progress
              </h3>
              
              <div className="space-y-4">
                {enrollments.length === 0 ? (
                  <div className="text-center py-4 text-neutral-500 dark:text-neutral-400 text-xs">
                    Not enrolled in any active {isK12 ? "subjects" : "courses"}. Visit the catalog to start!
                  </div>
                ) : (
                  enrollments.map((e, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-neutral-800 dark:text-neutral-300 truncate max-w-[180px]">{e.courses?.title || `Unknown ${isK12 ? "Subject" : "Course"}`}</span>
                        <span className="text-brand-primary font-semibold">{e.progress}%</span>
                      </div>
                      <ProgressBar value={e.progress} color="purple" size="sm" />
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* ─── SECTION 5: RECENT ACTIVITY ─── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-4">
                <Activity size={16} className="text-emerald-500" />
                Recent Activity
              </h3>

              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-4 text-neutral-500 dark:text-neutral-400 text-xs">
                    No recent activities recorded.
                  </div>
                ) : (
                  recentActivities.map(act => {
                    const Icon = act.icon;
                    return (
                      <div key={act.id} className="flex gap-3 text-xs">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          act.badgeVariant === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                          act.badgeVariant === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                          act.badgeVariant === 'amber' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-purple-500/10 text-purple-400'
                        }`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-neutral-800 dark:text-neutral-200 font-medium leading-normal">{act.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                              {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              act.badgeVariant === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                              act.badgeVariant === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                              act.badgeVariant === 'amber' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-purple-500/10 text-purple-400'
                            }`}>
                              {act.badgeText}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </motion.div>

        </div>

      </div>

      {/* ─── SECTION 6: QUICK ACTIONS ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pt-4 border-t border-neutral-200/60 dark:border-neutral-800"
      >
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Join Next Class */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between h-36">
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Live Classroom</p>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                {upcomingClasses[0] ? upcomingClasses[0].title : 'No class scheduled'}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-1">
                {upcomingClasses[0] ? upcomingClasses[0].courses?.title : 'Check again later'}
              </p>
            </div>
            {upcomingClasses[0] ? (
              <Link to={`/classroom/${upcomingClasses[0].courses?.id || upcomingClasses[0].id}`}>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-2 rounded-xl hover:scale-103 active:scale-97 shadow-lg shadow-purple-500/20 transition-all self-start mt-2">
                  <PlayCircle size={14} />
                  <span>Join Class</span>
                </button>
              </Link>
            ) : (
              <button disabled className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-xl cursor-not-allowed self-start mt-2">
                <PlayCircle size={14} />
                <span>Join Class</span>
              </button>
            )}
          </div>

          {/* Continue Course */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between h-36">
            <div>
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Active Progress</p>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                {enrollments[0] ? enrollments[0].courses?.title : 'Not enrolled'}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {enrollments[0] ? `Progress: ${enrollments[0].progress}%` : 'Visit course catalog'}
              </p>
            </div>
            {enrollments[0] ? (
              <Link to={`/learn/${enrollments[0].courses?.id}/l1`}>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl hover:scale-103 active:scale-97 shadow-lg shadow-purple-500/20 transition-all self-start mt-2">
                  <BookOpen size={14} />
                  <span>Continue Course</span>
                </button>
              </Link>
            ) : (
              <Link to="/courses">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded-xl transition-all self-start mt-2">
                  <BookOpen size={14} />
                  <span>Explore Courses</span>
                </button>
              </Link>
            )}
          </div>

          {/* View Next Assignment */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between h-36">
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Upcoming Deadline</p>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                {pendingAssignments[0] ? pendingAssignments[0].title : 'All caught up!'}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {pendingAssignments[0] ? `Due: ${new Date(pendingAssignments[0].due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : 'No upcoming deadlines'}
              </p>
            </div>
            {pendingAssignments[0] ? (
              <Link to={`/assignments/${pendingAssignments[0].id}`}>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl hover:scale-103 active:scale-97 shadow-lg shadow-amber-500/20 transition-all self-start mt-2">
                  <FileText size={14} />
                  <span>View Assignment</span>
                </button>
              </Link>
            ) : (
              <Link to="/assignments">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-xl transition-all self-start mt-2">
                  <FileText size={14} />
                  <span>Assignment Center</span>
                </button>
              </Link>
            )}
          </div>

          {/* Peer-to-Peer Messaging */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between h-36">
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Peer-to-Peer</p>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                Study Groups
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                3 New Messages
              </p>
            </div>
            <Link to="/messages">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-xl transition-all self-start mt-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <Bell size={14} />
                <span>Open Chat</span>
              </button>
            </Link>
          </div>

          {/* GPA Tracking */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between h-36">
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">GPA Tracker</p>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                Current GPA: 3.8
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Top 10% of class
              </p>
            </div>
            <Link to="/progress-analytics">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-xl transition-all self-start mt-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <Activity size={14} />
                <span>View Analytics</span>
              </button>
            </Link>
          </div>

          {/* Breakout Rooms */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between h-36">
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Study Breakout Rooms</p>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                2 Active Rooms
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Join peers in real-time
              </p>
            </div>
            <Link to="/live-classroom">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/20 transition-all self-start mt-2">
                <Video size={14} />
                <span>Join Room</span>
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
