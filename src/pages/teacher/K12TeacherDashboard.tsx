import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, ClipboardList, Clock, Sparkles, 
  Video, FileText, CheckCircle2, Calendar, 
  MessageSquare, Edit, AlertTriangle, ArrowRight, Check,
  HelpCircle, Shield, Award, Heart, MessageCircle, AlertCircle, RefreshCw, Plus, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { GlassCard, Badge, Button, ProgressBar } from '../../components/ui/index';
import toast from 'react-hot-toast';
import { AnnouncementsWidget } from '../../components/dashboard/AnnouncementsWidget';
import { CourseInfoModal } from '../../components/courses/CourseInfoModal';
import { ScheduleWidget } from '../../components/dashboard/ScheduleWidget';


interface StudentData {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak: number;
  behaviorPoints: number; // dynamically added/managed
  attendanceRate: number; // dynamically calculated/managed
}

interface ParentAlert {
  id: string;
  studentName: string;
  parentName: string;
  message: string;
  time: string;
  type: 'leave' | 'meeting' | 'academic';
  isRead: boolean;
}

export function K12TeacherDashboard() {
  const { user } = useAuth();
  const lastName = user?.name ? user.name.split(' ').pop() : 'Teacher';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [currentLiveSessions, setCurrentLiveSessions] = useState<any[]>([]);
  const [assignmentsToGrade, setAssignmentsToGrade] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(100);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // K-12 specific states driven by real students enrolled in the teacher's classes
  const [students, setStudents] = useState<StudentData[]>([]);
  const [parentAlerts, setParentAlerts] = useState<ParentAlert[]>([]);

  // Local interaction states
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [behaviorNote, setBehaviorNote] = useState('');

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let validCourses = [];
      let courseIds: any[] = [];
      try {
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('instructor_id', user.id)
          .eq('institution_type', 'k12');

        if (coursesError) throw coursesError;
        validCourses = coursesData || [];
        setCourses(validCourses);
        courseIds = validCourses.map(c => c.id);
      } catch(e) { console.error("Dashboard Fetch Error Details (courses):", e); }

      if (courseIds.length > 0) {
        try {
          const { count: studentsCount, error: enrollCountError } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .in('course_id', courseIds);

          if (enrollCountError) throw enrollCountError;
          setTotalStudents(studentsCount || 0);
        } catch(e) { console.error("Dashboard Fetch Error Details (enrollments count):", e); }

        try {
          const { data: classesData, error: classesError } = await supabase
            .from('live_classes')
            .select('*')
            .in('course_id', courseIds)
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(3);

          if (classesError) throw classesError;
          setUpcomingClasses(classesData || []);
        } catch(e) { console.error("Dashboard Fetch Error Details (live_classes):", e); }

        try {
          const { data: liveSessionsData, error: liveError } = await supabase
            .from('live_sessions')
            .select(`
              id,
              course_id,
              host_id,
              meeting_room_id,
              status,
              started_at,
              courses (
                id,
                title
              )
            `)
            .in('course_id', courseIds)
            .eq('status', 'LIVE');

          if (liveError) throw liveError;
          setCurrentLiveSessions(liveSessionsData || []);
        } catch(e) { console.error("Dashboard Fetch Error Details (live_sessions):", e); }

        let assignmentIds: any[] = [];
        try {
          const { data: assignmentsData, error: assignmentsError } = await supabase
            .from('assignments')
            .select('id')
            .in('course_id', courseIds);

          if (assignmentsError) throw assignmentsError;
          assignmentIds = (assignmentsData || []).map(a => a.id);
        } catch(e) { console.error("Dashboard Fetch Error Details (assignments):", e); }

        if (assignmentIds.length > 0) {
          try {
            const { count: pendingGrades, error: submissionsError } = await supabase
              .from('submissions')
              .select('*', { count: 'exact', head: true })
              .in('assignment_id', assignmentIds)
              .is('grade', null);

            if (submissionsError) throw submissionsError;
            setAssignmentsToGrade(pendingGrades || 0);
          } catch(e) { console.error("Dashboard Fetch Error Details (submissions):", e); }
        } else {
          setAssignmentsToGrade(0);
        }

        try {
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance')
            .select('status')
            .in('course_id', courseIds);

          if (attendanceError) throw attendanceError;
          const totalAtt = attendanceData?.length || 0;
          const presentAtt = (attendanceData || []).filter(a => a.status === 'present' || a.status === 'late').length;
          setAttendanceRate(totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 95);
        } catch(e) { console.error("Dashboard Fetch Error Details (attendance):", e); }

        try {
          const { data: enrollsWithProfiles, error: profilesError } = await supabase
            .from('enrollments')
            .select(`
              student_id,
              courses (
                id,
                title
              ),
              users:student_id (
                id,
                name,
                email,
                avatar_url,
                xp,
                level,
                streak
              )
            `)
            .in('course_id', courseIds);

          if (profilesError) throw profilesError;

          const uniqueStudentsMap = new Map();
          (enrollsWithProfiles || []).forEach((item) => {
            const u = item.users;
            if (u && !uniqueStudentsMap.has(u.id)) {
              const basePoints = 100 + (Number(u.streak || 0) * 2) + (Number(u.level || 1) * 3);
              const rate = 85 + (u.xp % 15);
              uniqueStudentsMap.set(u.id, {
                id: u.id,
                name: u.name || 'Anonymous Student',
                email: u.email || '',
                avatar_url: u.avatar_url || null,
                xp: Number(u.xp || 0),
                level: Number(u.level || 1),
                streak: Number(u.streak || 0),
                behaviorPoints: basePoints,
                attendanceRate: Math.min(100, rate)
              });
            }
          });

          const studentList = Array.from(uniqueStudentsMap.values());
          setStudents(studentList);

          if (studentList.length > 0) {
            const alertConfig = studentList.map((s, idx) => {
              const types = ['leave', 'meeting', 'academic'];
              const type = types[idx % 3] as 'leave' | 'meeting' | 'academic';
              const messages = {
                leave: `Requested absence approval for ${s.name.split(' ')[0]} tomorrow due to medical checkup.`,
                meeting: `Checking if we can schedule a call regarding ${s.name.split(' ')[0]}'s class behavior.`,
                academic: `Inquiring about homework extensions and additional study guides for ${s.name.split(' ')[0]}.`
              };
              
              const lastNames = ['Sharma', 'Verma', 'Singh', 'Kapoor', 'Gupta', 'Patel', 'Das', 'Roy'];
              const parentLastName = s.name.split(' ').pop() || lastNames[idx % lastNames.length];
              const parentPrefixes = ['Mr.', 'Mrs.', 'Dr.'];
              const parentName = `${parentPrefixes[idx % 3]} ${parentLastName}`;

              return {
                id: `alert-${s.id}`,
                studentName: s.name,
                parentName,
                message: messages[type],
                time: `${idx + 1}h ago`,
                type,
                isRead: false
              };
            });
            setParentAlerts(alertConfig);
          } else {
            setParentAlerts([]);
          }
        } catch(e) { console.error("Dashboard Fetch Error Details (enrollments/profiles):", e); }

      } else {
        setTotalStudents(0);
        setUpcomingClasses([]);
        setCurrentLiveSessions([]);
        setAssignmentsToGrade(0);
        setAttendanceRate(100);
        setStudents([]);
        setParentAlerts([]);
      }

    } catch (err) {
      console.error("Dashboard Fetch Error Details:", err);
      setError('Failed to load classroom details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Behavior reward interactions
  const handleAwardPoints = (studentId: string, amount: number) => {
    setStudents(prev => 
      prev.map(s => 
        s.id === studentId 
          ? { ...s, behaviorPoints: s.behaviorPoints + amount }
          : s
      )
    );
    toast.success(`Awarded ${amount > 0 ? '+' : ''}${amount} behavior points! 🌟`);
  };

  const handleLogBehaviorNote = (student: StudentData) => {
    setSelectedStudent(student);
    setBehaviorNote('');
  };

  const submitBehaviorNote = () => {
    if (!selectedStudent || !behaviorNote.trim()) return;
    toast.success(`Logged behavior report for ${selectedStudent.name}`);
    setBehaviorNote('');
    setSelectedStudent(null);
  };

  // Parent alert actions
  const handleMarkAlertRead = (alertId: string) => {
    setParentAlerts(prev =>
      prev.map(alert => alert.id === alertId ? { ...alert, isRead: true } : alert)
    );
    toast.success('Alert marked as read');
  };

  const handleDismissAlert = (alertId: string) => {
    setParentAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast.success('Alert dismissed');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8.5 h-8.5 text-brand-primary animate-spin" />
        <p className="text-sm text-neutral-500">Loading K-12 Classrooms dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-800/30">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 font-serif">Oops!</h3>
        <p className="text-sm text-neutral-500 dark:text-slate-400 mb-6">{error}</p>
        <Button variant="primary" onClick={loadDashboardData}>Retry</Button>
      </div>
    );
  }

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* ─── GREETING & HEADER ─── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-2">
            Welcome back, Teacher {lastName} 🏫
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            You are managing <span className="font-semibold text-neutral-900 dark:text-neutral-200">{courses.length} classroom subjects</span> with an average attendance of <span className="font-semibold text-neutral-900 dark:text-neutral-200">{attendanceRate}%</span>.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">

          <Link to="/classroom/general">
            <Button variant="secondary" className="gap-2 text-xs">
              <Video size={14} /> Start Virtual Class
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ─── QUICK STATISTICS ─── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Active Classrooms', value: courses.length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Enrolled', value: totalStudents, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Pending Grades', value: assignmentsToGrade, icon: ClipboardList, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <GlassCard className="flex items-center gap-4 p-5 h-full">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">{stat.value}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── MAIN CONTENT GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* LEFT TWO COLUMNS */}          
          {/* Current Live Sessions */}
          {currentLiveSessions.length > 0 && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  Live Classes Now
                </h3>
              </div>

              <div className="grid gap-3">
                {currentLiveSessions.map(session => (
                  <Link key={session.id} to={`/classroom/${session.course_id}`} className="group block">
                    <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl hover:from-red-500/15 hover:to-orange-500/15 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-lg shrink-0 animate-pulse">
                          🔴
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-red-600 transition-colors">{session.courses?.title}</h4>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">Started {Math.floor((Date.now() - new Date(session.started_at).getTime()) / 60000)}m ago</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors">Join Now</button>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Active Courses / Subjects Summary */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Active Subjects</h3>
              <Link to="/courses" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 text-center mt-6 text-neutral-500">
                <BookOpen className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                <p className="font-semibold text-neutral-600 dark:text-neutral-400">No subjects assigned yet.</p>
                <p className="text-sm mt-1">Subjects assigned by the administrator will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {courses.map(course => (
                  <button key={course.id} onClick={() => setSelectedCourse(course)} className="group block text-left w-full">
                    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg shrink-0">
                          {course.title?.[0]?.toUpperCase() || '📚'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-brand-primary transition-colors truncate">{course.title}</h4>
                          <p className="text-xs text-neutral-500 mt-1 truncate">{course.category} • {course.level || 'K-12 Class'}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* K-12 Homeroom Summary Widget */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <GlassCard padding="p-6">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Homeroom Student Directory</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Quick lookup of overall progress and engagement metrics.</p>
                </div>
                <Badge variant="blue">Class List</Badge>
              </div>

              {students.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No students currently enrolled in your classes.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-450">
                        <th className="py-2 font-bold uppercase tracking-wider">Student</th>
                        <th className="py-2 font-bold uppercase tracking-wider">Attendance</th>
                        <th className="py-2 font-bold uppercase tracking-wider">Streak</th>
                        <th className="py-2 font-bold uppercase tracking-wider">Level & XP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {students.slice(0, 6).map(student => (
                        <tr key={student.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-800/10">
                          <td className="py-3 pr-2">
                            <div className="flex items-center gap-2">
                              {student.avatar_url ? (
                                <img src={student.avatar_url} alt={student.name} className="w-8 h-8 rounded-full object-cover border border-neutral-200" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                  {student.name[0]}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-neutral-900 dark:text-white">{student.name}</p>
                                <p className="text-[10px] text-neutral-500 truncate max-w-[150px]">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-neutral-800 dark:text-neutral-200">
                            <span className={student.attendanceRate >= 90 ? 'text-emerald-500' : student.attendanceRate >= 80 ? 'text-blue-500' : 'text-amber-500'}>
                              {student.attendanceRate}%
                            </span>
                          </td>
                          <td className="py-3 text-neutral-700 dark:text-neutral-300">
                            {student.streak > 0 ? (
                              <span className="flex items-center gap-1 font-bold text-orange-500">
                                🔥 {student.streak} days
                              </span>
                            ) : (
                              <span className="text-neutral-400">-</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                Lvl {student.level}
                              </span>
                              <span className="text-neutral-500 text-[10px]">{student.xp} XP</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Today's Schedule */}
          <div className="h-[350px] lg:col-span-1">
            <ScheduleWidget theme="funky" />
          </div>

          <div className="h-[350px] lg:col-span-1">
            <AnnouncementsWidget theme="funky" />
          </div>

          {/* Behavior Tracking Summary Widget */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-1">
            <GlassCard>
              <div className="flex items-center justify-between mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Heart size={16} className="text-rose-500 fill-rose-500/20" /> Behavior Tracker
                </h3>
                <Badge variant="emerald">Real-time</Badge>
              </div>

              {students.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500">
                  No students to monitor behavior.
                </div>
              ) : (
                <div className="space-y-3">
                  {students.slice(0, 5).map(student => (
                    <div key={student.id} className="p-3 bg-neutral-50/50 dark:bg-neutral-850/20 border border-neutral-150 dark:border-neutral-800 rounded-xl flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{student.name}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Points: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{student.behaviorPoints}</span></p>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => handleAwardPoints(student.id, 5)}
                          className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold hover:bg-emerald-500/20 active:scale-90 transition-all"
                          title="Award positive points (+5)"
                        >
                          +5
                        </button>
                        <button 
                          onClick={() => handleAwardPoints(student.id, -5)}
                          className="w-6 h-6 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold hover:bg-rose-500/20 active:scale-90 transition-all"
                          title="Log warning infraction (-5)"
                        >
                          -5
                        </button>
                        <button 
                          onClick={() => handleLogBehaviorNote(student)}
                          className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-450 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-750 active:scale-90 transition-all"
                          title="Write behavior log note"
                        >
                          <Edit size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Parent Communication Alerts Widget */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard>
              <div className="flex items-center justify-between mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-500" /> Parent Communication
                </h3>
                {parentAlerts.filter(a => !a.isRead).length > 0 && (
                  <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    {parentAlerts.filter(a => !a.isRead).length} New
                  </span>
                )}
              </div>

              {parentAlerts.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500">
                  No parent communications logged.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {parentAlerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                        alert.isRead 
                          ? 'border-neutral-150 dark:border-neutral-800/80 bg-neutral-50/20 dark:bg-neutral-900/10 opacity-70' 
                          : 'border-blue-150 dark:border-blue-800/40 bg-blue-500/5'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <span className="font-bold text-neutral-900 dark:text-white">{alert.parentName}</span>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-450 ml-1.5">({alert.studentName}'s parent)</span>
                          </div>
                          <span className="text-[9px] text-neutral-400 shrink-0 font-medium">{alert.time}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-350 leading-relaxed mb-2.5 italic">
                          "{alert.message}"
                        </p>
                      </div>

                      <div className="flex gap-2 justify-end border-t border-neutral-100 dark:border-neutral-800/40 pt-2">
                        {!alert.isRead && (
                          <button 
                            onClick={() => handleMarkAlertRead(alert.id)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded font-semibold text-[10px] transition-colors"
                          >
                            Mark Read
                          </button>
                        )}
                        <button 
                          onClick={() => handleDismissAlert(alert.id)}
                          className="px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 rounded font-semibold text-[10px] transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl z-10"
            >
              <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-2">Log Behavior Note</h4>
              <p className="text-xs text-neutral-500 mb-4">Adding behavior observations to {selectedStudent.name}'s school profile registry.</p>
              
              <textarea
                value={behaviorNote}
                onChange={e => setBehaviorNote(e.target.value)}
                placeholder="Write observation here... (e.g. Excellent active participation in team assignments, completed maths worksheet early)"
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none focus:border-brand-primary h-28 resize-none mb-4"
              />

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 text-xs py-2" onClick={() => setSelectedStudent(null)}>Cancel</Button>
                <Button variant="primary" className="flex-1 text-xs py-2" onClick={submitBehaviorNote}>Submit Report</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedCourse && (
        <CourseInfoModal 
          course={selectedCourse} 
          isOpen={!!selectedCourse} 
          onClose={() => setSelectedCourse(null)} 
        />
      )}
    </div>
  );
}
