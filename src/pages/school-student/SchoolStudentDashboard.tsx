import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { getDashboardPath } from '../../services/auth.service';
import { 
  Flame, 
  Trophy, 
  Star, 
  PlayCircle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Medal, 
  Video, 
  FileText, 
  BookOpen, 
  Award, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { GlassCard, Button, ProgressBar } from '../../components/ui/index';

interface DbCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  teacher_id: string;
  users: {
    name: string;
  } | null;
}

interface EnrollmentWithCourse {
  progress: number;
  courses: DbCourse | null;
}

interface LiveClass {
  id: string;
  title: string;
  scheduled_at: string;
  room_id: string;
  status: string;
  courses: {
    id: string;
    title: string;
    users: {
      name: string;
    } | null;
  } | null;
}

interface HomeworkItem {
  id: string;
  title: string;
  due_date: string;
  course_id: string;
  courses: {
    title: string;
  } | null;
}

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  color: string;
}

export function SchoolStudentDashboard() {
  const { user } = useAuth();

  if (user && (user.role !== 'student' || user.gradeLevel !== 'k12')) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gamification & User Stats from the 'users' table
  const [gamifiedStats, setGamifiedStats] = useState({
    streak: 0,
    xp: 0,
    level: 1
  });

  const [timetable, setTimetable] = useState<LiveClass[]>([]);
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [attendancePercent, setAttendancePercent] = useState<number>(0);
  const [badges, setBadges] = useState<BadgeItem[]>([]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch user gamification stats directly from public.users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('xp, level, streak')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      
      const stats = {
        streak: Number(userData?.streak || 0),
        xp: Number(userData?.xp || 0),
        level: Number(userData?.level || 1)
      };
      setGamifiedStats(stats);

      // 2. Fetch Enrollments
      const { data: enrollmentsData, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          progress,
          courses (
            id,
            title,
            description,
            category,
            level,
            teacher_id,
            users (
              name
            )
          )
        `)
        .eq('student_id', user.id);

      if (enrollError) throw enrollError;
      const validEnrollments = (enrollmentsData || []) as any[] as EnrollmentWithCourse[];
      setEnrollments(validEnrollments);

      const enrolledCourseIds = validEnrollments
        .map(e => e.courses?.id)
        .filter((id): id is string => !!id);

      // 3. Fetch Timetable / Daily Class Schedule
      let schedule: LiveClass[] = [];
      if (enrolledCourseIds.length > 0) {
        // Fetch classes happening today or in the future
        const { data: classesData, error: classesError } = await supabase
          .from('live_classes')
          .select(`
            id, 
            title, 
            scheduled_at, 
            room_id, 
            status,
            courses (
              id, 
              title,
              users (
                name
              )
            )
          `)
          .in('course_id', enrolledCourseIds)
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(5);

        if (classesError) throw classesError;
        schedule = (classesData || []) as any[] as LiveClass[];
      }
      setTimetable(schedule);

      // 4. Fetch Homework (Pending Assignments)
      let homework: HomeworkItem[] = [];
      if (enrolledCourseIds.length > 0) {
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select(`
            id, 
            title, 
            due_date, 
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
          .select('assignment_id')
          .eq('student_id', user.id);

        if (submissionsError) throw submissionsError;
        const submittedIds = new Set((submissionsData || []).map(s => s.assignment_id));

        homework = ((assignmentsData || []) as any[] as HomeworkItem[])
          .filter(a => !submittedIds.has(a.id))
          .slice(0, 5);
      }
      setHomeworkList(homework);

      // 5. Fetch Attendance
      if (enrolledCourseIds.length > 0) {
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('id, status')
          .eq('student_id', user.id);

        if (attendanceError) throw attendanceError;
        const total = attendanceData?.length || 0;
        const present = (attendanceData || []).filter(a => a.status === 'present' || a.status === 'late').length;
        setAttendancePercent(total > 0 ? Math.round((present / total) * 100) : 100);
      } else {
        setAttendancePercent(100);
      }

      // 6. Generate Gamification Badges dynamically
      const badgesConfig: BadgeItem[] = [
        {
          id: 'newbie',
          title: 'First Step',
          description: 'Unlock by creating an account',
          icon: '🌱',
          earned: true,
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        },
        {
          id: 'streak-3',
          title: 'Class Regular',
          description: 'Keep a daily streak of 3+ days',
          icon: '🔥',
          earned: stats.streak >= 3,
          color: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        },
        {
          id: 'level-5',
          title: 'Super Learner',
          description: 'Reach Level 5 to unlock',
          icon: '⚡',
          earned: stats.level >= 5,
          color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        },
        {
          id: 'xp-1000',
          title: 'Star Scholar',
          description: 'Earn more than 1,000 Total XP',
          icon: '🏆',
          earned: stats.xp >= 1000,
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        }
      ];
      setBadges(badgesConfig);

    } catch (err: any) {
      console.error('[SchoolStudentDashboard] Error loading data:', err);
      setError(err.message || 'Failed to load school dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const getGreetingMessage = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading K-12 Student Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard tint="red" className="max-w-md mx-auto my-12 text-center p-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Failed to Load Dashboard</h3>
        <p className="text-sm text-neutral-500 dark:text-slate-400 mb-6">{error}</p>
        <Button variant="primary" onClick={loadDashboardData} icon={<RefreshCw size={14} />}>Retry</Button>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans space-y-8">
      
      {/* Gamification Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-purple-600 to-indigo-500 rounded-3xl p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight font-serif">
              {getGreetingMessage()}, {firstName}! 🎒
            </h1>
            <p className="text-base sm:text-lg text-white/95 font-medium max-w-md leading-relaxed">
              Keep up the amazing work! You are leveling up fast. Let's check out your timetable for today.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 md:justify-end">
            
            {/* Streak */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-all cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Day Streak</p>
                <p className="text-2xl font-bold">{gamifiedStats.streak} <span className="text-sm font-medium text-white/80">Days</span></p>
              </div>
            </div>

            {/* XP */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-all cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30 shrink-0">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Total XP</p>
                <p className="text-2xl font-bold">{gamifiedStats.xp}</p>
              </div>
            </div>

            {/* Level */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-all cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Level</p>
                <p className="text-2xl font-bold">{gamifiedStats.level}</p>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Timetable & Homework) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TIMETABLE / DAILY CLASS SCHEDULE */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Daily Timetable / Class Schedule
              </h2>
              <Link to="/calendar" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">Full Calendar →</Link>
            </div>
            
            <GlassCard padding="p-0">
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {timetable.length === 0 ? (
                  <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No classes scheduled for today. Rest up or work on your homework! 😴
                  </div>
                ) : (
                  timetable.map(cls => (
                    <div key={cls.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex flex-col items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                          <span className="text-[9px] font-bold mt-0.5">Today</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">{cls.title}</h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Classroom: {cls.courses?.title || 'Subject Group'} • Teacher: {cls.courses?.users?.name || 'Instructor'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-xl">
                          {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Link to={`/classroom/${cls.courses?.id || cls.id}`}>
                          <button className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow hover:opacity-90 active:scale-95 transition-all">
                            Join Live
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.section>

          {/* HOMEWORK (PENDING ASSIGNMENTS) */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                My Homework
              </h2>
              <Link to="/assignments" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">All Homework →</Link>
            </div>
            
            <GlassCard padding="p-0">
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {homeworkList.length === 0 ? (
                  <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No homework due! Excellent job keeping up! 🌟
                  </div>
                ) : (
                  homeworkList.map(hw => {
                    const isOverdue = new Date(hw.due_date) < new Date();
                    return (
                      <div key={hw.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            <CheckCircle2 size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">{hw.title}</h4>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Subject: {hw.courses?.title || 'Classroom'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-slate-300'}`}>
                            Due: {new Date(hw.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          <Link to={`/assignments/${hw.id}`}>
                            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-103 active:scale-97 shadow">
                              Solve
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </motion.section>

        </div>

        {/* Right Columns (Attendance, Badges, Quick Access) */}
        <div className="space-y-8">
          
          {/* MY ATTENDANCE */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <GlassCard className="flex items-center gap-6">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-neutral-200 dark:text-neutral-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    className="text-emerald-500"
                    strokeWidth="3.5"
                    strokeDasharray={`${attendancePercent}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${attendancePercent}, 100` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-neutral-900 dark:text-white">{attendancePercent}%</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-50 text-sm mb-1">My Attendance</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal">
                  {attendancePercent >= 90 ? 'Outstanding class presence! Keep it up!' : 'Try to join all scheduled live classrooms.'}
                </p>
              </div>
            </GlassCard>
          </motion.section>

          {/* PROGRESS BADGES / ACHIEVEMENTS */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-50 text-sm mb-4 flex items-center gap-2">
                <Medal className="w-5 h-5 text-yellow-500" />
                Achievements & Badges
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {badges.map(badge => (
                  <div 
                    key={badge.id}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                      badge.earned 
                        ? badge.color
                        : 'bg-neutral-100/50 dark:bg-neutral-900/40 text-neutral-400 border-neutral-200 dark:border-neutral-800 opacity-50'
                    }`}
                  >
                    <span className="text-2xl mb-1.5">{badge.icon}</span>
                    <span className="text-xs font-bold truncate max-w-full leading-tight">{badge.title}</span>
                    <span className="text-[9px] text-neutral-500 dark:text-slate-400 mt-0.5 line-clamp-2">{badge.description}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.section>

          {/* GAMIFIED QUICK ACTIONS */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Quick Actions</h3>
              <Button variant="ghost" size="sm" onClick={loadDashboardData} icon={<RefreshCw size={11} />} className="text-[10px]" />
            </div>

            <div className="grid grid-cols-1 gap-2">
              
              {timetable[0] && (
                <Link to={`/classroom/${timetable[0].courses?.id || timetable[0].id}`}>
                  <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-600 to-indigo-500 hover:scale-[1.02] active:scale-[0.98] text-white rounded-xl shadow transition-all text-left">
                    <Video size={16} />
                    <div>
                      <p className="text-xs font-bold">Join Next Class</p>
                      <p className="text-[10px] text-white/80 line-clamp-1">{timetable[0].title}</p>
                    </div>
                  </button>
                </Link>
              )}

              {enrollments[0] && (
                <Link to={`/learn/${enrollments[0].courses?.id}/l1`}>
                  <button className="w-full flex items-center gap-3 p-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:scale-[1.02] active:scale-[0.98] rounded-xl shadow transition-all text-left">
                    <PlayCircle size={16} />
                    <div>
                      <p className="text-xs font-bold">Continue Lessons</p>
                      <p className="text-[10px] opacity-80 line-clamp-1">{enrollments[0].courses?.title}</p>
                    </div>
                  </button>
                </Link>
              )}

              {homeworkList[0] && (
                <Link to={`/assignments/${homeworkList[0].id}`}>
                  <button className="w-full flex items-center gap-3 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:scale-[1.02] active:scale-[0.98] text-neutral-800 dark:text-neutral-200 rounded-xl shadow transition-all text-left">
                    <FileText size={16} className="text-amber-500" />
                    <div>
                      <p className="text-xs font-bold">Solve Homework</p>
                      <p className="text-[10px] text-neutral-500 dark:text-slate-400 line-clamp-1">{homeworkList[0].title}</p>
                    </div>
                  </button>
                </Link>
              )}

            </div>
          </motion.section>

        </div>

      </div>

    </div>
  );
}
