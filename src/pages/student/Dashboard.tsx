import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from 'recharts';
import { BookOpen, Clock, AlertTriangle, Calendar, ChevronRight, Sparkles, Star, Play, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { coursesService } from '../../services/courses.service';
import { analyticsService } from '../../services/analytics.service';
import { aiService, type CourseRecommendation } from '../../services/ai.service';
import { assignmentsService } from '../../services/assignments.service';
import { StatCard, GlassCard, Badge, ProgressBar, SkeletonCard, SectionHeader, Avatar } from '../../components/ui/index';
import type { Assignment } from '../../types';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = { high: 'red', medium: 'amber', low: 'slate' } as const;
const PRIORITY_LABELS = { high: 'High Priority', medium: 'Medium', low: 'Low' };

function HeatmapCell({ count }: { count: number }) {
  const opacity = count === 0 ? 0.05 : count === 1 ? 0.25 : count === 2 ? 0.5 : count === 3 ? 0.75 : 1;
  return (
    <div
      className="w-3 h-3 rounded-sm transition-all hover:scale-125 cursor-pointer bg-brand-primary"
      style={{ opacity: opacity === 0.05 ? 0.1 : opacity }}
      title={`${count} activities`}
    />
  );
}

export function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState<Awaited<ReturnType<typeof coursesService.getEnrolledCourses>>>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [progressData, setProgressData] = useState<{ week: string; hoursSpent: number }[]>([]);
  const [heatmap, setHeatmap] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      coursesService.getEnrolledCourses(user.id),
      assignmentsService.getAssignments(user.id),
      aiService.getCourseRecommendations(user.id, user.enrolledCourses || []),
      analyticsService.getProgressData(user.id),
    ]).then(([e, a, r, p]) => {
      setEnrolled(e);
      setAssignments(a.filter(x => x.status === 'pending' || x.status === 'overdue').slice(0, 4));
      setRecommendations(r);
      setProgressData(p.slice(-8));
      // Mock heatmap
      const cells: { date: string; count: number }[] = [];
      for (let i = 0; i < 63; i++) {
        cells.push({ date: String(i), count: Math.random() > 0.35 ? Math.floor(Math.random() * 4) + 1 : 0 });
      }
      setHeatmap(cells);
      setLoading(false);
    });
  }, [user]);

  const attendanceData = [{ name: 'Present', value: 84, fill: '#4edea3' }, { name: 'Absent', value: 16, fill: 'rgba(200,200,200,0.1)' }];

  const UPCOMING = [
    { time: '10:00 AM', title: 'React Advanced Patterns', course: 'Web Dev', type: 'Live', id: 'cl1' },
    { time: '2:00 PM', title: 'ML Algorithms Review', course: 'Machine Learning', type: 'Recorded', id: 'cl2' },
    { time: 'Tomorrow', title: 'UX Research Critique', course: 'UI/UX Design', type: 'Live', id: 'cl3' },
  ];

  const cardVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
      <div className="space-y-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
              Good evening, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
              You have <span className="text-brand-primary font-bold">{assignments.length} pending</span> assignments. Keep going!
            </p>
          </div>
          <Link to="/calendar">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-brand-primary/30 transition-all shadow-sm">
              <Calendar size={16} className="text-brand-primary" />
              <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={{ show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Enrolled Courses', value: enrolled.length || 3, icon: <BookOpen size={18} />, color: 'purple' as const, trend: '1 new', trendUp: true },
            { label: 'Hours Learned', value: '124h', icon: <Clock size={18} />, color: 'blue' as const, trend: '12h this week', trendUp: true },
            { label: 'Assignments Due', value: assignments.length || 4, icon: <AlertTriangle size={18} />, color: 'amber' as const },
            { label: 'Attendance', value: '84%', icon: <TrendingUp size={18} />, color: 'emerald' as const, trend: '+2%', trendUp: true },
          ].map((s, i) => (
            <motion.div key={i} variants={cardVariants}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Courses + Assignments */}
          <div className="xl:col-span-2 space-y-6">
            {/* Enrolled Courses */}
            <GlassCard>
              <SectionHeader title="My Courses" subtitle={`${enrolled.length || 3} enrolled`} action={
                <Link to="/courses" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 transition-colors">
                  Browse more <ChevronRight size={14} />
                </Link>
              } />
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : (
                <div className="space-y-3">
                  {(enrolled.length ? enrolled : [
                    { course: { id: 'c1', title: 'Full-Stack Web Development', category: 'Web Dev', instructor: 'Dr. Sarah Chen', lessons: 124 }, enrollment: { progress: 68 } },
                    { course: { id: 'c2', title: 'Machine Learning Fundamentals', category: 'AI & ML', instructor: 'Prof. Raj Patel', lessons: 89 }, enrollment: { progress: 34 } },
                    { course: { id: 'c3', title: 'UI/UX Design Masterclass', category: 'Design', instructor: 'Emma Lawson', lessons: 72 }, enrollment: { progress: 91 } },
                  ] as any[]).map((item, i) => (
                    <motion.div
                      key={item.course.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <Link to={`/learn/${item.course.id}/l1`}>
                        <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all group border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700">
                          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl font-black text-white"
                            style={{ background: `linear-gradient(135deg, ${i === 0 ? '#6366F1,#3B82F6' : i === 1 ? '#3B82F6,#4edea3' : '#4edea3,#6366F1'})` }}>
                            {item.course.title[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-brand-primary transition-colors">
                                {item.course.title}
                              </p>
                              <span className="text-xs font-black text-brand-primary ml-2 flex-shrink-0">{item.enrollment.progress}%</span>
                            </div>
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                              {item.course.instructor} · {item.course.lessons} lessons
                            </p>
                            <ProgressBar value={item.enrollment.progress} color={i === 2 ? 'emerald' : i === 1 ? 'blue' : 'purple'} />
                          </div>
                          <Play size={16} className="text-neutral-400 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Assignments */}
            <GlassCard>
              <SectionHeader title="Due Assignments" subtitle="Pending deadlines" action={
                <Link to="/assignments" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">View all <ChevronRight size={14} /></Link>
              } />
              <div className="space-y-2.5">
                {(assignments.length ? assignments : [
                  { id: 'a1', title: 'React Component Architecture', courseName: 'Web Dev', dueDate: '2024-06-15T23:59:00Z', priority: 'high', status: 'pending' },
                  { id: 'a4', title: 'Algorithm Challenge Set', courseName: 'DSA', dueDate: '2024-06-05T23:59:00Z', priority: 'high', status: 'overdue' },
                  { id: 'a5', title: 'AWS Architecture Design', courseName: 'Cloud', dueDate: '2024-06-25T23:59:00Z', priority: 'medium', status: 'pending' },
                ] as any[]).map((a, i) => {
                  const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <Link to={`/assignments/${a.id}`}>
                        <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${a.status === 'overdue' ? 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10' : 'border-neutral-100 dark:border-neutral-800'}`}>
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${a.priority === 'high' ? 'bg-red-500' : a.priority === 'medium' ? 'bg-amber-500' : 'bg-neutral-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">{a.title}</p>
                            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">{a.courseName}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge variant={a.status === 'overdue' ? 'red' : daysLeft <= 3 ? 'amber' : 'slate'}>
                              {a.status === 'overdue' ? 'Overdue' : daysLeft <= 0 ? 'Due today' : `${daysLeft}d left`}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Progress chart */}
            <GlassCard tint="purple">
              <SectionHeader title="Learning Activity" subtitle="Hours studied per week" />
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData.length ? progressData : [
                    { week: 'W1', hoursSpent: 8 }, { week: 'W2', hoursSpent: 12 }, { week: 'W3', hoursSpent: 10 },
                    { week: 'W4', hoursSpent: 15 }, { week: 'W5', hoursSpent: 9 }, { week: 'W6', hoursSpent: 18 },
                    { week: 'W7', hoursSpent: 14 }, { week: 'W8', hoursSpent: 20 },
                  ]} barSize={24}>
                    <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, color: '#0f172a', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: 'rgba(139,92,246,0.05)' }}
                    />
                    <Bar dataKey="hoursSpent" fill="url(#barGrad)" radius={[6, 6, 0, 0]} isAnimationActive />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Heatmap */}
              <div className="mt-4">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Activity heatmap — last 63 days</p>
                <div className="flex flex-wrap gap-1.5">
                  {heatmap.map((cell, i) => <HeatmapCell key={i} count={cell.count} />)}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">Less</span>
                  {[0.05, 0.25, 0.5, 0.75, 1].map((o, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm bg-brand-primary" style={{ opacity: o === 0.05 ? 0.1 : o }} />
                  ))}
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">More</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Attendance ring */}
            <GlassCard tint="emerald">
              <SectionHeader title="Attendance" />
              <div className="flex items-center justify-center">
                <div className="relative">
                  <PieChart width={160} height={160}>
                    <Pie data={attendanceData} innerRadius={55} outerRadius={75} startAngle={90} endAngle={-270} dataKey="value" isAnimationActive animationDuration={1200}>
                      {attendanceData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50">84%</span>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Present</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[{ l: 'Present', v: '38', c: 'text-emerald-500' }, { l: 'Absent', v: '4', c: 'text-red-500' }, { l: 'Late', v: '3', c: 'text-amber-500' }].map(s => (
                  <div key={s.l} className="text-center">
                    <p className={`text-xl font-black ${s.c}`}>{s.v}</p>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{s.l}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Upcoming classes */}
            <GlassCard tint="blue">
              <SectionHeader title="Upcoming Classes" />
              <div className="space-y-3">
                {UPCOMING.map((cls, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <Link to={`/classroom/${cls.id}`}>
                      <div className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 transition-all group shadow-sm bg-white dark:bg-neutral-900">
                        <div className="flex-shrink-0 text-center w-12">
                          <p className="text-xs font-black text-blue-600 dark:text-blue-400">{cls.time}</p>
                        </div>
                        <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-blue-600 transition-colors">{cls.title}</p>
                          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">{cls.course}</p>
                        </div>
                        <Badge variant={cls.type === 'Live' ? 'blue' : 'slate'}>{cls.type}</Badge>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* AI Recommendations */}
            <GlassCard tint="purple">
              <SectionHeader
                title="AI Recommendations"
                subtitle="Personalized for you"
                action={<Sparkles size={16} className="text-brand-primary" />}
              />
              <div className="space-y-3">
                {(recommendations.length ? recommendations : [
                  { courseId: 'c4', title: 'Data Structures & Algorithms', reason: 'Complements your Web Dev skills', matchScore: 96, category: 'CS' },
                  { courseId: 'c5', title: 'Cloud Computing with AWS', reason: 'Next step for full-stack devs', matchScore: 91, category: 'Cloud' },
                ]).map((rec, i) => (
                  <motion.div key={rec.courseId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Link to={`/courses/${rec.courseId}`}>
                      <div className="p-4 rounded-2xl border border-brand-primary/20 hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all group bg-white dark:bg-neutral-900 shadow-sm">
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-brand-primary transition-colors leading-tight">{rec.title}</p>
                          <span className="text-xs font-black text-brand-primary ml-2 flex-shrink-0 bg-brand-primary/10 px-2 py-0.5 rounded-full">{rec.matchScore}%</span>
                        </div>
                        <p className="text-xs font-medium text-neutral-500 mb-3">{rec.reason}</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= 4 ? '#6366F1' : 'none'} className="text-brand-primary" />)}
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">AI matched</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
  );
}
