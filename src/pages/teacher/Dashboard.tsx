import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { Plus, Users, BookOpen, TrendingUp, Clock, Edit2, Trash2, Calendar, ClipboardList, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analytics.service';
import { StatCard, GlassCard, Badge, ProgressBar, SectionHeader, SearchInput, Button, Avatar } from '../../components/ui/index';
import toast from 'react-hot-toast';

const COURSES = [
  { id: 'c1', title: 'Full-Stack Web Development', students: 247, lessons: 124, rating: 4.8, status: 'Active', revenue: '₹12,400', updated: '2 days ago' },
  { id: 'c4', title: 'Data Structures & Algorithms', students: 189, lessons: 148, rating: 4.6, status: 'Active', revenue: '₹9,800', updated: '1 week ago' },
  { id: 'c2', title: 'Machine Learning Fundamentals', students: 134, lessons: 89, rating: 4.7, status: 'Draft', revenue: '₹6,700', updated: '3 days ago' },
  { id: 'c7', title: 'Advanced TypeScript Patterns', students: 0, lessons: 28, rating: 0, status: 'Draft', revenue: '₹0', updated: 'Today' },
];

const STUDENTS = [
  { name: 'Alex Johnson', email: 'alex@example.com', course: 'Web Dev', progress: 68, grade: 'B+', attendance: '84%', status: 'Active' },
  { name: 'Priya Sharma', email: 'priya@example.com', course: 'Web Dev', progress: 92, grade: 'A', attendance: '96%', status: 'Active' },
  { name: 'Jordan Lee', email: 'jordan@example.com', course: 'DSA', progress: 45, grade: 'C+', attendance: '71%', status: 'At Risk' },
  { name: 'Marcus Brown', email: 'marcus@example.com', course: 'DSA', progress: 78, grade: 'B', attendance: '89%', status: 'Active' },
  { name: 'Sara Wilson', email: 'sara@example.com', course: 'Web Dev', progress: 55, grade: 'B-', attendance: '80%', status: 'Active' },
];

const ASSIGNMENTS_DATA = [
  { title: 'React Component Architecture', course: 'Web Dev', due: 'Jun 15', submitted: 187, total: 247, status: 'Open' },
  { title: 'Binary Trees Implementation', course: 'DSA', due: 'Jun 18', submitted: 140, total: 189, status: 'Open' },
  { title: 'ML Model Evaluation', course: 'ML', due: 'Jun 10', submitted: 134, total: 134, status: 'Closed' },
];

export function TeacherDashboard() {
  const { user } = useAuth();
  const [courseSearch, setCourseSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [engagementData, setEngagementData] = useState<{ day: string; active: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    analyticsService.getEngagementData().then(d => {
      setEngagementData(d);
      setLoading(false);
    });
  }, []);

  const filteredCourses = COURSES.filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase()));
  const filteredStudents = STUDENTS.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleDelete = (id: string) => {
    toast.success('Course deleted', { icon: '🗑️' });
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
              Teacher Dashboard
            </h1>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">Welcome back, {user?.name?.split(' ')[0]}. Here's your classroom overview.</p>
          </div>
          <Link to="/courses/create">
            <Button variant="primary" icon={<Plus size={16} />}>New Course</Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: '847', icon: <Users size={18} />, color: 'blue' as const, trend: '12%', trendUp: true },
            { label: 'Active Courses', value: '4', icon: <BookOpen size={18} />, color: 'purple' as const },
            { label: 'Avg Rating', value: '4.8', icon: <TrendingUp size={18} />, color: 'emerald' as const, trend: '0.2', trendUp: true },
            { label: 'Avg Completion', value: '73%', icon: <Clock size={18} />, color: 'amber' as const },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Course management + Students */}
          <div className="xl:col-span-2 space-y-6">
            {/* Course Management Table */}
            <GlassCard padding="p-0 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h2 className="text-lg font-serif font-black text-neutral-900 dark:text-neutral-50">My Courses</h2>
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wider">{filteredCourses.length} courses</p>
                </div>
                <div className="flex items-center gap-2">
                  <SearchInput value={courseSearch} onChange={setCourseSearch} placeholder="Search courses..." />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20">
                      {['Course', 'Students', 'Rating', 'Status', 'Updated', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course, i) => (
                      <motion.tr
                        key={course.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-neutral-100">{course.title}</p>
                            <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">{course.lessons} lessons</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Users size={14} className="text-brand-primary" />
                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{course.students}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-amber-500 font-bold flex items-center gap-1">{course.rating > 0 ? <><Star size={12} fill="currentColor"/> {course.rating}</> : '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={course.status === 'Active' ? 'emerald' : 'slate'}>{course.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 text-xs font-medium">{course.updated}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Link to={`/courses/${course.id}/edit`}>
                              <button className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-neutral-400 hover:text-blue-500 transition-all" title="Edit">
                                <Edit2 size={16} />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Student Roster */}
            <GlassCard padding="p-0 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h2 className="text-lg font-serif font-black text-neutral-900 dark:text-neutral-50">Student Roster</h2>
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wider">{filteredStudents.length} students</p>
                </div>
                <SearchInput value={studentSearch} onChange={setStudentSearch} placeholder="Search students..." />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20">
                      {['Student', 'Course', 'Progress', 'Grade', 'Attendance', 'Status'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, i) => (
                      <motion.tr
                        key={s.email}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={s.name} size="sm" online={s.status === 'Active'} />
                            <div>
                              <p className="font-bold text-neutral-900 dark:text-neutral-100">{s.name}</p>
                              <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 text-xs font-semibold">{s.course}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <ProgressBar value={s.progress} color={s.progress >= 80 ? 'emerald' : s.progress >= 60 ? 'blue' : 'amber'} />
                            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 w-8">{s.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-black text-sm ${s.grade.startsWith('A') ? 'text-emerald-500' : s.grade.startsWith('B') ? 'text-blue-500' : 'text-amber-500'}`}>{s.grade}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-neutral-600 dark:text-neutral-300">{s.attendance}</td>
                        <td className="px-6 py-4">
                          <Badge variant={s.status === 'Active' ? 'emerald' : 'red'}>{s.status}</Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Engagement chart */}
            <GlassCard tint="blue">
              <SectionHeader title="Student Engagement" subtitle="This week" />
              <div className="h-44 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementData.length ? engagementData : [
                    { day: 'Mon', active: 3420 }, { day: 'Tue', active: 3810 }, { day: 'Wed', active: 4230 },
                    { day: 'Thu', active: 3920 }, { day: 'Fri', active: 3650 }, { day: 'Sat', active: 2840 }, { day: 'Sun', active: 2190 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-800" />
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, color: '#0f172a', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="active" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 4, strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 6, strokeWidth: 0 }} isAnimationActive animationDuration={1200} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Quick actions */}
            <GlassCard>
              <SectionHeader title="Quick Actions" subtitle="Shortcuts" />
              <div className="space-y-2 mt-4">
                {[
                  { label: 'Create Assignment', icon: <ClipboardList size={16} />, link: '/assignments', color: 'text-brand-primary' },
                  { label: 'Schedule Class', icon: <Calendar size={16} />, link: '/calendar', color: 'text-blue-500' },
                  { label: 'View Attendance', icon: <Users size={16} />, link: '/attendance', color: 'text-emerald-500' },
                  { label: 'View Analytics', icon: <TrendingUp size={16} />, link: '/analytics', color: 'text-amber-500' },
                ].map((a, i) => (
                  <Link key={i} to={a.link}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all group border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700">
                      <div className={`p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 ${a.color} group-hover:scale-110 transition-transform`}>{a.icon}</div>
                      <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">{a.label}</span>
                      <span className="ml-auto text-neutral-300 dark:text-neutral-600 group-hover:text-brand-primary transition-colors text-lg">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>

            {/* Assignments overview */}
            <GlassCard>
              <SectionHeader title="Assignment Overview" subtitle="Status of open tasks" action={
                <Link to="/assignments" className="text-xs font-bold text-brand-primary hover:underline">View all</Link>
              } />
              <div className="space-y-3 mt-4">
                {ASSIGNMENTS_DATA.map((a, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/80 hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate pr-2">{a.title}</p>
                      <Badge variant={a.status === 'Open' ? 'emerald' : 'slate'}>{a.status}</Badge>
                    </div>
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wider">Due {a.due} · {a.course}</p>
                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
                      <span>Submitted</span>
                      <span className="text-neutral-900 dark:text-neutral-100">{a.submitted}/{a.total}</span>
                    </div>
                    <ProgressBar value={a.submitted} max={a.total} color="emerald" />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
  );
}
