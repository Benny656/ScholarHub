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
import { AnnouncementsWidget } from '../../components/dashboard/AnnouncementsWidget';
import { ScheduleWidget } from '../../components/dashboard/ScheduleWidget';

interface DbCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  instructor_id: string;
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

interface Subject {
  id: string;
  name: string;
  instructor: string;
  completion: number;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  subject: string;
}

interface ReportCardRow {
  id: string;
  subject: string;
  grade: string;
  remarks: string;
}

interface TimeSlot {
  time: string;
  subject: string;
  instructor: string;
  isCurrent: boolean;
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
  
  // ── Static hardcoded demo data – renders instantly ──────────────────────
  const subjects: Subject[] = [
    { id: 's1', name: 'Mathematics', instructor: 'Mr. Rajiv Sharma', completion: 82 },
    { id: 's2', name: 'Science', instructor: 'Ms. Priya Nair', completion: 74 },
    { id: 's3', name: 'English Literature', instructor: 'Mrs. Ananya Bose', completion: 91 },
    { id: 's4', name: 'History & Civics', instructor: 'Mr. Suresh Menon', completion: 67 },
    { id: 's5', name: 'Computer Science', instructor: 'Ms. Deepa Iyer', completion: 88 },
  ];

  const assignments: Assignment[] = [
    { id: 'a1', title: 'Algebra Chapter 4 Worksheet', subject: 'Mathematics', dueDate: '2026-06-21', status: 'Pending' },
    { id: 'a2', title: 'Biology Cell Diagram', subject: 'Science', dueDate: '2026-06-18', status: 'Submitted' },
    { id: 'a3', title: 'Shakespeare Essay – Hamlet', subject: 'English Literature', dueDate: '2026-06-15', status: 'Submitted' },
    { id: 'a4', title: 'World War II Timeline', subject: 'History & Civics', dueDate: '2026-06-14', status: 'Pending' },
    { id: 'a5', title: 'Python Basics Mini Project', subject: 'Computer Science', dueDate: '2026-06-25', status: 'Pending' },
  ];

  const reportCard: ReportCardRow[] = [
    { id: 'r1', subject: 'Mathematics', grade: 'A',  remarks: 'Exceptional problem-solving skills. Keep it up!' },
    { id: 'r2', subject: 'Science',     grade: 'B+', remarks: 'Great curiosity and lab work. Focus on theory.' },
    { id: 'r3', subject: 'English Literature', grade: 'A-', remarks: 'Eloquent writing style. Outstanding creativity.' },
    { id: 'r4', subject: 'History & Civics',   grade: 'B+', remarks: 'Strong retention. Excellent class participation.' },
    { id: 'r5', subject: 'Computer Science',   grade: 'A',  remarks: 'Natural aptitude for coding. Star performer!' },
  ];

  const STATIC_GPA = '3.72';

  // Weekly timetable: time on left, subjects per column-day
  const timeSlots = [
    '08:00 AM – 08:45 AM',
    '08:45 AM – 09:30 AM',
    '09:30 AM – 10:15 AM',
    '10:15 AM – 10:30 AM', // short break
    '10:30 AM – 11:15 AM',
    '11:15 AM – 12:00 PM',
    '12:00 PM – 12:45 PM', // lunch
    '12:45 PM – 01:30 PM',
    '01:30 PM – 02:15 PM',
    '02:15 PM – 03:00 PM',
  ];

  const staticTimetable: Record<string, (string | null)[]> = {
    Monday:    ['Mathematics', 'Science', 'English Lit.', null, 'History', 'Comp. Science', null, 'Mathematics', 'Science', 'English Lit.'],
    Tuesday:   ['Science', 'English Lit.', 'History', null, 'Mathematics', 'Comp. Science', null, 'Science', 'History', 'Mathematics'],
    Wednesday: ['English Lit.', 'Mathematics', 'Comp. Science', null, 'Science', 'History', null, 'English Lit.', 'Comp. Science', 'Science'],
    Thursday:  ['History', 'Comp. Science', 'Mathematics', null, 'English Lit.', 'Science', null, 'History', 'Mathematics', 'Comp. Science'],
    Friday:    ['Comp. Science', 'History', 'Science', null, 'Mathematics', 'English Lit.', null, 'Comp. Science', 'Science', 'Mathematics'],
  };

  const subjectColors: Record<string, string> = {
    'Mathematics':    'bg-violet-500/20 border-violet-500/40 text-violet-700 dark:text-violet-300',
    'Science':        'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
    'English Lit.':   'bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300',
    'History':        'bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300',
    'Comp. Science':  'bg-cyan-500/20 border-cyan-500/40 text-cyan-700 dark:text-cyan-300',
  };

  // ════════════════════════════════════════════════════════════════════════
  // Helper Functions for Mock Data Generation (Hybrid Real + Mock)
  // ════════════════════════════════════════════════════════════════════════

  const generateSubjectsFromCourses = (courses: EnrollmentWithCourse[]): Subject[] => {
    return courses.map((enrollment, idx) => ({
      id: enrollment.courses?.id || `subject-${idx}`,
      name: enrollment.courses?.title || `Subject ${idx + 1}`,
      instructor: enrollment.courses?.users?.name || 'Prof. Smith',
      completion: Math.floor(Math.random() * (95 - 60) + 60) // 60-95% completion
    }));
  };

  const generateAssignmentsFromCourses = (courses: EnrollmentWithCourse[]): Assignment[] => {
    const mockTitles = [
      'Chapter Quiz',
      'Lab Work',
      'Essay Assignment',
      'Project Submission',
      'Problem Set',
      'Research Paper',
      'Presentation',
      'Math Worksheet'
    ];
    const statuses: Array<'Pending' | 'Submitted' | 'Graded'> = ['Pending', 'Submitted', 'Graded'];
    
    const assignments: Assignment[] = [];
    courses.forEach((course, courseIdx) => {
      const numAssignments = Math.random() > 0.5 ? 2 : 1;
      for (let i = 0; i < numAssignments; i++) {
        const daysFromNow = Math.floor(Math.random() * 14) - 3; // -3 to +14 days
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysFromNow);
        
        assignments.push({
          id: `assign-${courseIdx}-${i}`,
          title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
          dueDate: dueDate.toISOString().split('T')[0],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          subject: course.courses?.title || `Subject ${courseIdx + 1}`
        });
      }
    });
    return assignments;
  };

  const generateReportCard = (courses: EnrollmentWithCourse[]): ReportCardRow[] => {
    const grades = ['A', 'A-', 'B+', 'B', 'B-', 'A+'];
    const remarks = [
      'Excellent performance! Keep up the great work.',
      'Outstanding effort and participation.',
      'Strong understanding of the concepts.',
      'Good progress. Keep practicing.',
      'Well done! Your efforts are showing results.',
      'Exceptional! You are a star student.'
    ];

    return courses.map((course, idx) => ({
      id: course.courses?.id || `grade-${idx}`,
      subject: course.courses?.title || `Subject ${idx + 1}`,
      grade: grades[Math.floor(Math.random() * grades.length)],
      remarks: remarks[Math.floor(Math.random() * remarks.length)]
    }));
  };

  const generateWeeklyTimetable = (courses: EnrollmentWithCourse[]): Record<string, TimeSlot[]> => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'];
    const timetable: Record<string, TimeSlot[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDayIndex = now.getDay() - 1; // 0 = Monday, 4 = Friday

    days.forEach((day, dayIdx) => {
      times.forEach((time, timeIdx) => {
        if (Math.random() > 0.3) { // 70% chance of class at this slot
          const courseIdx = (dayIdx + timeIdx) % courses.length;
          const [hour] = time.split(':').map(Number);
          const isCurrent = dayIdx === currentDayIndex && hour === currentHour;

          timetable[day].push({
            time,
            subject: courses[courseIdx]?.courses?.title || `Subject ${courseIdx + 1}`,
            instructor: courses[courseIdx]?.courses?.users?.name || 'Teacher',
            isCurrent
          });
        }
      });
    });

    return timetable;
  };

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let stats = { streak: 0, xp: 0, level: 1 };
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('xp, level, streak')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        stats = {
          streak: Number(userData?.streak || 0),
          xp: Number(userData?.xp || 0),
          level: Number(userData?.level || 1)
        };
      } catch(e) { console.error("Dashboard Fetch Error Details (profiles):", e); }
      setGamifiedStats(stats);

      let validEnrollments: EnrollmentWithCourse[] = [];
      let enrolledCourseIds: string[] = [];
      try {
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
              instructor_id,
              profiles:instructor_id (
                full_name
              )
            )
          `)
          .eq('student_id', user.id);

        if (enrollError) throw enrollError;
        validEnrollments = ((enrollmentsData || []) as any[]) as EnrollmentWithCourse[];
        setEnrollments(validEnrollments);

        enrolledCourseIds = validEnrollments
          .map(e => e.courses?.id)
          .filter((id): id is string => !!id);
      } catch(e) { console.error("Dashboard Fetch Error Details (enrollments):", e); }

      let schedule: LiveClass[] = [];
      if (enrolledCourseIds.length > 0) {
        try {
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
                profiles:instructor_id (
                  full_name
                )
              )
            `)
            .in('course_id', enrolledCourseIds)
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(5);

          if (classesError) throw classesError;
          schedule = ((classesData || []) as any[]) as LiveClass[];
        } catch(e) { console.error("Dashboard Fetch Error Details (live_classes):", e); }
      }
      setTimetable(schedule);

      let homework: HomeworkItem[] = [];
      if (enrolledCourseIds.length > 0) {
        try {
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

          homework = (((assignmentsData || [])
            .filter(a => !submittedIds.has(a.id))
            .slice(0, 5)) as any[]) as HomeworkItem[];
        } catch(e) { console.error("Dashboard Fetch Error Details (assignments):", e); }
      }
      setHomeworkList(homework);

      if (enrolledCourseIds.length > 0) {
        try {
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance')
            .select('id, status')
            .eq('student_id', user.id);

          if (attendanceError) throw attendanceError;
          const total = attendanceData?.length || 0;
          const present = (attendanceData || []).filter(a => a.status === 'present' || a.status === 'late').length;
          setAttendancePercent(total > 0 ? Math.round((present / total) * 100) : 100);
        } catch(e) { console.error("Dashboard Fetch Error Details (attendance):", e); }
      } else {
        setAttendancePercent(100);
      }

      const badgesConfig = [
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

      // Static demo data is initialized inline – no Supabase needed for these sections.

    } catch (err: unknown) {
      console.error("Dashboard Fetch Error Details:", err);
      setError((err as Error).message || 'Failed to load school dashboard data.');
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
    type: "spring" as const,
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
      <GlassCard className="max-w-md mx-auto my-12 text-center p-8 border-4 border-red-500/40 rounded-3xl bg-red-50 dark:bg-red-950/20">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Daily Timetable & Pending Homework) */}
          
          {/* DAILY TIMETABLE CARD */}
          <div className="h-[350px] lg:col-span-2">
            <ScheduleWidget theme="funky" />
          </div>

          {/* HOMEWORK CARD */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 border-4 border-dashed border-yellow-400/80 rounded-[32px] p-6 bg-white dark:bg-neutral-900/60 shadow-lg relative overflow-hidden"
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
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          <CheckCircle2 size={20} className="animate-bounce" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white leading-tight truncate">{hw.title}</h4>
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1 truncate">Subject: {hw.courses?.title || 'Class'}</p>
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

          {/* ANNOUNCEMENTS CARD */}
          <div className="h-[350px] lg:col-span-2">
            <AnnouncementsWidget theme="funky" />
          </div>

        {/* Right Columns (Attendance, Badges, AI Tutor) */}
          
          {/* MY ATTENDANCE CIRCLE */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="lg:col-span-1 border-4 border-dashed border-emerald-400/80 rounded-[32px] p-6 bg-white dark:bg-neutral-900/60 shadow-lg relative text-center"
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
            className="lg:col-span-1 border-4 border-dashed border-purple-400/80 rounded-[32px] p-6 bg-white dark:bg-neutral-900/60 shadow-lg"
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
            className="lg:col-span-1 p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] text-white shadow-xl relative overflow-hidden text-center border-4 border-white dark:border-neutral-800"
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

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* AMETHYST THEME COMPONENTS - REAL DATA WITH MOCK ENHANCEMENT */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 1: SUBJECTS                                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/40 dark:bg-[#161224]/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 dark:border-purple-500/20 shadow-xl"
      >
        <h2 className="text-2xl font-black mb-6 text-neutral-900 dark:text-white flex items-center gap-3">
          <span className="w-9 h-9 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-lg shadow-md">📚</span>
          My Subjects
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {subjects.map((subject, i) => {
            const icons = ['➗', '🔬', '📖', '🏛️', '💻'];
            const gradients = [
              'from-violet-500 to-purple-600',
              'from-emerald-500 to-teal-600',
              'from-rose-500 to-pink-600',
              'from-amber-500 to-orange-600',
              'from-cyan-500 to-blue-600',
            ];
            const bars = [
              'from-violet-500 to-purple-600',
              'from-emerald-500 to-teal-500',
              'from-rose-500 to-pink-500',
              'from-amber-500 to-orange-500',
              'from-cyan-500 to-blue-500',
            ];
            return (
              <motion.div
                key={subject.id}
                whileHover={{ translateY: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative p-5 bg-white dark:bg-neutral-900/60 rounded-2xl border border-neutral-200/60 dark:border-purple-500/20 shadow-md hover:shadow-xl hover:border-purple-400/50 transition-all duration-300 flex flex-col gap-4 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 bg-purple-500 -translate-y-6 translate-x-6" />
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradients[i]} flex items-center justify-center text-xl shadow-lg`}>
                  {icons[i]}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-neutral-900 dark:text-white leading-tight">{subject.name}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">👨‍🏫 {subject.instructor}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-neutral-500 dark:text-neutral-400">Syllabus</span>
                    <span className="text-purple-600 dark:text-purple-400">{subject.completion}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${bars[i]} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.completion}%` }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 2: HOMEWORK & ASSIGNMENTS                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white/40 dark:bg-[#161224]/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 dark:border-purple-500/20 shadow-xl"
      >
        <h2 className="text-2xl font-black mb-6 text-neutral-900 dark:text-white flex items-center gap-3">
          <span className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-lg shadow-md">✏️</span>
          Homework &amp; Assignments
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr className="border-b-2 border-purple-500/20">
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Assignment</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Due Date</th>
                <th className="text-center px-4 py-3 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {assignments.map(a => {
                const isOverdue = a.status === 'Pending' && new Date(a.dueDate) < new Date();
                const effectiveStatus = isOverdue ? 'Overdue' : a.status;
                const statusStyles: Record<string, string> = {
                  Pending:   'bg-amber-100  dark:bg-amber-500/15  text-amber-700  dark:text-amber-300  border border-amber-300/50',
                  Submitted: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50',
                  Overdue:   'bg-red-100    dark:bg-red-500/15    text-red-700    dark:text-red-300    border border-red-300/50',
                  Graded:    'bg-blue-100   dark:bg-blue-500/15   text-blue-700   dark:text-blue-300   border border-blue-300/50',
                };
                const statusDots: Record<string, string> = { Pending: '🟡', Submitted: '🟢', Overdue: '🔴', Graded: '🔵' };
                return (
                  <motion.tr key={a.id} whileHover={{ backgroundColor: 'rgba(168,85,247,0.04)' }} className="transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-neutral-900 dark:text-white">{a.title}</span>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-400">{a.subject}</td>
                    <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-400 font-mono text-xs">
                      {new Date(a.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusStyles[effectiveStatus]}`}>
                        {statusDots[effectiveStatus]} {effectiveStatus}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 3: CLASS TIMETABLE                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/40 dark:bg-[#161224]/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 dark:border-purple-500/20 shadow-xl"
      >
        <h2 className="text-2xl font-black mb-6 text-neutral-900 dark:text-white flex items-center gap-3">
          <span className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-lg shadow-md">📅</span>
          Weekly Class Timetable
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white/80 dark:bg-[#161224]/90 backdrop-blur px-4 py-3 text-left font-black text-neutral-500 dark:text-neutral-400 w-36 border-b-2 border-purple-500/20 z-10">Time</th>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                  <th key={d} className="px-3 py-3 font-black text-neutral-700 dark:text-white text-center border-b-2 border-purple-500/20">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time, i) => {
                const isLunch = time.startsWith('12:00');
                const isBreak = time.startsWith('10:15');
                if (isBreak) return (
                  <tr key={time}>
                    <td className="sticky left-0 bg-neutral-100/80 dark:bg-neutral-800/50 backdrop-blur px-4 py-2 text-neutral-400 font-mono z-10 border-b border-neutral-200/50 dark:border-neutral-700/50">10:15 – 10:30</td>
                    <td colSpan={5} className="px-4 py-2 text-center text-[11px] font-bold text-neutral-400 dark:text-neutral-500 bg-neutral-100/50 dark:bg-neutral-800/30 border-b border-neutral-200/50 dark:border-neutral-700/50 tracking-widest uppercase">☕ Short Break</td>
                  </tr>
                );
                if (isLunch) return (
                  <tr key={time}>
                    <td className="sticky left-0 bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur px-4 py-3 text-amber-600 dark:text-amber-400 font-mono z-10 border-b border-amber-200/40 dark:border-amber-700/30">12:00 – 12:45</td>
                    <td colSpan={5} className="px-4 py-3 text-center text-sm font-black text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-200/40 dark:border-amber-700/30">🍱 Lunch Break</td>
                  </tr>
                );
                return (
                  <tr key={time} className="group">
                    <td className="sticky left-0 bg-white/80 dark:bg-[#161224]/90 backdrop-blur px-4 py-2.5 font-mono text-neutral-500 dark:text-neutral-400 z-10 border-b border-purple-500/10 whitespace-nowrap">{time}</td>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                      const subj = staticTimetable[day][i];
                      const color = subj ? (subjectColors[subj] || 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300') : '';
                      return (
                        <td key={day} className="px-2 py-2 border-b border-purple-500/10 text-center">
                          {subj ? (
                            <motion.div whileHover={{ scale: 1.05 }} className={`rounded-lg px-2 py-1.5 border font-semibold ${color}`}>
                              {subj}
                            </motion.div>
                          ) : (
                            <span className="text-neutral-300 dark:text-neutral-700">–</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 4: REPORT CARD                                     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white/40 dark:bg-[#161224]/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 dark:border-purple-500/20 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-3">
              <span className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center text-lg shadow-md">📋</span>
              Academic Report Card
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 ml-12">Term 2 — Academic Year 2025–26</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="self-start bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-purple-600/30 transition-all"
          >
            📥 Download PDF
          </motion.button>
        </div>

        {/* GPA Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 p-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-purple-600/30"
        >
          <div className="text-white text-center sm:text-left">
            <p className="text-xs font-black uppercase tracking-widest text-white/70 mb-1">Current GPA — Term 2</p>
            <p className="text-4xl font-black text-white drop-shadow">{STATIC_GPA} <span className="text-lg font-semibold text-white/70">/ 4.00</span></p>
          </div>
          <div className="flex gap-4">
            <div className="text-center bg-white/15 rounded-xl px-4 py-2">
              <p className="text-[11px] font-bold text-white/70">Rank</p>
              <p className="text-xl font-black text-yellow-300">#3</p>
            </div>
            <div className="text-center bg-white/15 rounded-xl px-4 py-2">
              <p className="text-[11px] font-bold text-white/70">Attendance</p>
              <p className="text-xl font-black text-emerald-300">{attendancePercent}%</p>
            </div>
            <div className="text-center bg-white/15 rounded-xl px-4 py-2">
              <p className="text-[11px] font-bold text-white/70">Honours</p>
              <p className="text-xl font-black text-pink-300">⭐ Merit</p>
            </div>
          </div>
        </motion.div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-purple-500/20">
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Subject</th>
                <th className="text-center px-4 py-3 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Grade</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {reportCard.map((row, i) => {
                const gradeColor = row.grade.startsWith('A') ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-orange-500';
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.06 }}
                    whileHover={{ backgroundColor: 'rgba(168,85,247,0.04)' }}
                    className="transition-colors"
                  >
                    <td className="px-4 py-3.5 font-semibold text-neutral-900 dark:text-white">{row.subject}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block bg-gradient-to-r ${gradeColor} text-white px-3 py-1 rounded-lg font-black text-sm shadow-sm`}>
                        {row.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-400 italic text-xs leading-relaxed">
                      💬 {row.remarks}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.section>

    </div>
  );
}
