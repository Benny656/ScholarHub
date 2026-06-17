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

  const isK12Student = user?.role === 'student' && user?.gradeLevel?.toLowerCase().startsWith('k12');

  if (user && !isK12Student) {
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
          description: 'Created account',
          icon: '🌱',
          earned: true,
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        },
        {
          id: 'streak-3',
          title: 'Class Regular',
          description: '3+ Days Streak',
          icon: '🔥',
          earned: stats.streak >= 3,
          color: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        },
        {
          id: 'level-5',
          title: 'Super Kid',
          description: 'Reach Level 5',
          icon: '⚡',
          earned: stats.level >= 5,
          color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        },
        {
          id: 'xp-1000',
          title: 'Star Kid',
          description: 'Earn 1000+ XP',
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
    if (hours < 12) return 'Good Morning ☀️';
    if (hours < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  const bounceTransition = {
    type: "spring",
    stiffness: 450,
    damping: 12
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
      <GlassCard tint="red" className="max-w-md mx-auto my-12 text-center p-8 border-4 border-red-500/40 rounded-3xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Failed to Load Dashboard</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <Button variant="primary" onClick={loadDashboardData} icon={<RefreshCw size={14} />}>Retry</Button>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans space-y-8 select-none">
      
      {/* Funky Rainbow Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={bounceTransition}
        className="relative bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 rounded-[36px] p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-2xl border-4 border-white dark:border-neutral-800"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-300 opacity-20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 animate-pulse"></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h1 
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight font-serif text-yellow-300 drop-shadow"
            >
              {getGreetingMessage()}, {firstName}! 🎒
            </motion.h1>
            <p className="text-base sm:text-lg text-white/95 font-semibold max-w-md leading-relaxed">
              Welcome to your cool classroom space! You are doing awesome. Ready to learn something fun today? 🚀
            </p>
          </div>

          <div className="flex flex-wrap gap-4 md:justify-end">
            
            {/* Streak */}
            <motion.div 
              whileHover={{ scale: 1.1, rotate: -2 }}
              transition={bounceTransition}
              className="bg-white/20 backdrop-blur-md rounded-3xl p-4 border-2 border-orange-400 flex items-center gap-4 cursor-default shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Fire Streak</p>
                <p className="text-2xl font-black text-yellow-300">{gamifiedStats.streak} <span className="text-sm font-medium text-white/85">Days</span></p>
              </div>
            </motion.div>

            {/* XP */}
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 2 }}
              transition={bounceTransition}
              className="bg-white/20 backdrop-blur-md rounded-3xl p-4 border-2 border-yellow-300 flex items-center gap-4 cursor-default shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shrink-0 animate-bounce">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Learner XP</p>
                <p className="text-2xl font-black text-yellow-300">{gamifiedStats.xp}</p>
              </div>
            </motion.div>

            {/* Level */}
            <motion.div 
              whileHover={{ scale: 1.1, rotate: -1 }}
              transition={bounceTransition}
              className="bg-white/20 backdrop-blur-md rounded-3xl p-4 border-2 border-cyan-300 flex items-center gap-4 cursor-default shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Rank Level</p>
                <p className="text-2xl font-black text-yellow-300">{gamifiedStats.level}</p>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Bento-box Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Columns (Daily Timetable & Pending Homework) */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* DAILY TIMETABLE CARD */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="border-4 border-dashed border-blue-400/80 rounded-[32px] p-6 bg-white dark:bg-neutral-900/60 shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 tracking-tight">
                <span className="text-2xl">📅</span> Daily Class Timetable
              </h2>
            </div>
            
            <div className="space-y-4">
              {timetable.length === 0 ? (
                <div className="p-8 text-center text-sm font-semibold text-neutral-500 dark:text-neutral-400 bg-blue-50/50 dark:bg-neutral-950/20 rounded-2xl border-2 border-dashed border-blue-200">
                  No classes scheduled for today! Time to play or read a book! 🎨🧩
                </div>
              ) : (
                timetable.map(cls => (
                  <motion.div 
                    key={cls.id} 
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="p-4 bg-blue-500/5 dark:bg-neutral-800/30 rounded-2xl border-2 border-blue-400/20 hover:border-blue-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-205"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex flex-col items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 animate-pulse" />
                        <span className="text-[8px] font-black uppercase mt-0.5">Today</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white leading-tight">{cls.title}</h4>
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                          Subject: {cls.courses?.title || 'General'} • Teacher: {cls.courses?.users?.name || 'Instructor'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/30 px-3 py-1 rounded-xl border border-blue-400/20">
                        {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Link to={`/classroom/${cls.courses?.id || cls.id}`}>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                        >
                          Join Live 🎥
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>

          {/* HOMEWORK CARD */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="border-4 border-dashed border-yellow-400/80 rounded-[32px] p-6 bg-white dark:bg-neutral-900/60 shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 tracking-tight">
                <span className="text-2xl">📝</span> Homework Board
              </h2>
            </div>
            
            <div className="space-y-4">
              {homeworkList.length === 0 ? (
                <div className="p-8 text-center text-sm font-semibold text-neutral-500 dark:text-neutral-400 bg-yellow-50/50 dark:bg-neutral-950/20 rounded-2xl border-2 border-dashed border-yellow-200">
                  No homework left! You are a super scholar! 🏆🌟
                </div>
              ) : (
                homeworkList.map(hw => {
                  const isOverdue = new Date(hw.due_date) < new Date();
                  return (
                    <motion.div 
                      key={hw.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="p-4 bg-yellow-500/5 dark:bg-neutral-800/30 rounded-2xl border-2 border-yellow-400/20 hover:border-yellow-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-205"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          <CheckCircle2 size={20} className="animate-bounce" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white leading-tight">{hw.title}</h4>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1">Subject: {hw.courses?.title || 'Class'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${isOverdue ? 'bg-red-100 text-red-600 border-red-200' : 'bg-yellow-100/60 text-yellow-600 border-yellow-400/20'}`}>
                          Due: {new Date(hw.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        <Link to={`/assignments/${hw.id}`}>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-yellow-400 hover:bg-yellow-500 text-neutral-950 px-5 py-2 rounded-xl text-xs font-black shadow-md shadow-yellow-400/20 transition-all"
                          >
                            Solve! ✏️
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.section>

        </div>

        {/* Right Columns (Attendance, Badges, AI Tutor) */}
        <div className="space-y-6 md:space-y-8">
          
          {/* MY ATTENDANCE CIRCLE */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="border-4 border-dashed border-emerald-400/80 rounded-[32px] p-6 bg-white dark:bg-neutral-900/60 shadow-lg relative text-center"
          >
            <h3 className="font-extrabold text-neutral-900 dark:text-neutral-50 text-sm mb-4">My Attendance</h3>
            <div className="relative w-28 h-28 mx-auto mb-4">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-neutral-100 dark:text-neutral-850"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-emerald-500"
                  strokeWidth="4"
                  strokeDasharray={`${attendancePercent}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${attendancePercent}, 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-neutral-900 dark:text-white leading-none">{attendancePercent}%</span>
                <span className="text-[10px] font-bold text-emerald-500 mt-1">
                  {attendancePercent >= 90 ? '😊 Awesome!' : attendancePercent >= 75 ? '🙂 Nice!' : '😢 Uh oh!'}
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 leading-normal">
              {attendancePercent >= 90 ? 'Outstanding class presence! Keep shining!' : 'Try to join all scheduled live classrooms.'}
            </p>
          </motion.section>

          {/* BADGES & PROGRESS */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15 }}
            className="border-4 border-dashed border-purple-400/80 rounded-[32px] p-6 bg-white dark:bg-neutral-900/60 shadow-lg"
          >
            <h3 className="font-extrabold text-neutral-900 dark:text-neutral-50 text-sm mb-4 flex items-center gap-2 justify-center sm:justify-start">
              🏆 Badges & Trophies
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {badges.map(badge => (
                <motion.div 
                  key={badge.id}
                  whileHover={{ scale: 1.1, rotate: badge.earned ? [0, -5, 5, 0] : 0 }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                    badge.earned 
                      ? badge.color + ' border-purple-400/30'
                      : 'bg-neutral-100/50 dark:bg-neutral-950/20 text-neutral-400 border-neutral-200 dark:border-neutral-850 opacity-50'
                  }`}
                >
                  <span className="text-3xl mb-1.5">{badge.icon}</span>
                  <span className="text-xs font-extrabold truncate max-w-full leading-tight">{badge.title}</span>
                  <span className="text-[9px] font-semibold text-neutral-500 dark:text-slate-400 mt-0.5 line-clamp-1">{badge.description}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* FRIENDLY AI TUTOR COMPANION */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.03 }}
            className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] text-white shadow-xl relative overflow-hidden text-center border-4 border-white dark:border-neutral-800"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-300/10 via-transparent to-transparent pointer-events-none"></div>
            <div className="text-4xl mb-2 animate-bounce">🤖</div>
            <h4 className="text-base font-black text-yellow-300">Need Homework Help?</h4>
            <p className="text-xs font-semibold text-white/90 mt-1 max-w-xs mx-auto leading-relaxed">
              "Hi! I'm your AI Buddy. Click here and let's solve your hard homework questions together!"
            </p>
            <Link to="/ai-tutor">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-white text-purple-700 px-5 py-2 rounded-2xl text-xs font-black shadow-lg shadow-purple-950/20"
              >
                Chat with AI Tutor ✨
              </motion.button>
            </Link>
          </motion.section>

        </div>

      </div>

    </div>
  );
}
