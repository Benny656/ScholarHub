import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, Clock, Video, Calendar,
  ArrowRight, Activity, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { GlassCard, PageHeader, Badge, Button } from '../../components/ui/index';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export function CollegeDashboard() {
  const { user } = useAuth();
  const lastName = user?.name ? user.name.split(' ').pop() : 'Professor';
  
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [assignmentsToGrade, setAssignmentsToGrade] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch courses for this teacher
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('teacher_id', user.id);
          
        if (coursesError) throw coursesError;
        setCourses(coursesData || []);

        const courseIds = (coursesData || []).map(c => c.id);

        if (courseIds.length > 0) {
          // Fetch enrolled students count
          const { count: studentsCount } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .in('course_id', courseIds);
          setTotalStudents(studentsCount || 0);

          // Fetch upcoming live classes
          const { data: classesData } = await supabase
            .from('live_classes')
            .select('*')
            .in('course_id', courseIds)
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(5);
          setUpcomingClasses(classesData || []);

          // Fetch pending assignment submissions (grade is null)
          const { data: assignmentsData } = await supabase
            .from('assignments')
            .select('id')
            .in('course_id', courseIds);
            
          const assignmentIds = (assignmentsData || []).map(a => a.id);
          
          if (assignmentIds.length > 0) {
            const { count: pendingGrades } = await supabase
              .from('submissions')
              .select('*', { count: 'exact', head: true })
              .in('assignment_id', assignmentIds)
              .is('grade', null);
            setAssignmentsToGrade(pendingGrades || 0);
          }
        }
      } catch (err: any) {
        console.error('Failed to load college dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm text-neutral-500">Loading your college dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/30">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 font-serif">Oops!</h3>
        <p className="text-sm text-neutral-500 dark:text-slate-400 mb-6">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-2">
            Welcome back, Prof. {lastName}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            You have <span className="font-medium text-neutral-900 dark:text-neutral-200">{upcomingClasses.length} upcoming classes</span> and <span className="font-medium text-neutral-900 dark:text-neutral-200">{assignmentsToGrade} pending evaluations</span>.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/courses/create">
            <Button variant="primary" className="gap-2 text-xs">
              <BookOpen size={14} /> New Course
            </Button>
          </Link>
          <Link to="/classroom/general">
            <Button variant="outline" className="gap-2 text-xs">
              <Video size={14} /> Start Office Hours
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Active Courses', value: courses.length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Pending Evaluations', value: assignmentsToGrade, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Upcoming Classes', value: upcomingClasses.length, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
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

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">My Active Courses</h3>
                <Link to="/courses" className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 transition-colors">
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              
              {courses.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                  <p className="text-sm text-neutral-500">You don't have any active courses yet.</p>
                  <Link to="/courses/create" className="text-xs text-purple-600 font-semibold hover:underline mt-2 inline-block">Create your first course</Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {courses.slice(0, 5).map(course => (
                    <Link key={course.id} to={`/courses/${course.id}`} className="group">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/80 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl shrink-0">
                            {course.icon || '📚'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{course.title}</h4>
                            <p className="text-xs text-neutral-500 mt-0.5">{course.category} • {course.level}</p>
                          </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-neutral-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Upcoming Classes</h3>
                <Link to="/calendar" className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 transition-colors">
                  Schedule <ArrowRight size={14} />
                </Link>
              </div>

              {upcomingClasses.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-500">No upcoming live classes scheduled.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingClasses.map(cls => {
                    const course = courses.find(c => c.id === cls.course_id);
                    return (
                      <div key={cls.id} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800/80 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                        <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                          {new Date(cls.scheduled_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-0.5 line-clamp-1">{cls.title}</p>
                        <p className="text-[10px] text-neutral-500 line-clamp-1">{course?.title || 'Unknown Course'}</p>
                        
                        <div className="mt-3">
                          <Link to={`/classroom/${course?.id || 'general'}`}>
                            <button className="w-full py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold rounded-lg hover:scale-102 transition-transform">
                              Join Room
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
