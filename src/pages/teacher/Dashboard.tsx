import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { Plus, Users, BookOpen, TrendingUp, Clock, Edit2, Trash2, Calendar, ClipboardList, Search } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analytics.service';
import { StatCard, GlassCard, Badge, ProgressBar, SectionHeader, SearchInput, Button, Avatar } from '../../components/ui/index';
import toast from 'react-hot-toast';

const COURSES = [
  { id: 'c1', title: 'Full-Stack Web Development', students: 247, lessons: 124, rating: 4.8, status: 'Active', revenue: '$12,400', updated: '2 days ago' },
  { id: 'c4', title: 'Data Structures & Algorithms', students: 189, lessons: 148, rating: 4.6, status: 'Active', revenue: '$9,800', updated: '1 week ago' },
  { id: 'c2', title: 'Machine Learning Fundamentals', students: 134, lessons: 89, rating: 4.7, status: 'Draft', revenue: '$6,700', updated: '3 days ago' },
  { id: 'c7', title: 'Advanced TypeScript Patterns', students: 0, lessons: 28, rating: 0, status: 'Draft', revenue: '$0', updated: 'Today' },
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
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              Teacher Dashboard
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5">Welcome back, {user?.name?.split(' ')[0]}. Here's your classroom overview.</p>
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
            <GlassCard padding="p-0">
              <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
                <div>
                  <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>My Courses</h2>
                  <p className="text-sm text-on-surface-variant">{filteredCourses.length} courses</p>
                </div>
                <div className="flex items-center gap-2">
                  <SearchInput value={courseSearch} onChange={setCourseSearch} placeholder="Search courses..." />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/10">
                      {['Course', 'Students', 'Rating', 'Status', 'Updated', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h}</th>
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
                        className="border-b border-outline-variant/10 hover:bg-on-surface/[0.03] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-medium text-on-surface" style={{ fontFamily: 'Inter, sans-serif' }}>{course.title}</p>
                            <p className="text-xs text-on-surface-variant">{course.lessons} lessons</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Users size={13} className="text-blue-400" />
                            <span className="text-on-surface-variant">{course.students}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-amber-400 font-medium">{course.rating > 0 ? `★ ${course.rating}` : '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={course.status === 'Active' ? 'emerald' : 'slate'}>{course.status}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-on-surface-variant text-xs">{course.updated}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <Link to={`/courses/${course.id}/edit`}>
                              <button className="p-1.5 rounded-lg hover:bg-blue-500/15 text-on-surface-variant hover:text-blue-400 transition-all" title="Edit">
                                <Edit2 size={14} />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/15 text-on-surface-variant hover:text-red-400 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={14} />
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
            <GlassCard padding="p-0">
              <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
                <div>
                  <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>Student Roster</h2>
                  <p className="text-sm text-on-surface-variant">{filteredStudents.length} students</p>
                </div>
                <SearchInput value={studentSearch} onChange={setStudentSearch} placeholder="Search students..." />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/10">
                      {['Student', 'Course', 'Progress', 'Grade', 'Attendance', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h}</th>
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
                        className="border-b border-outline-variant/10 hover:bg-on-surface/[0.03] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={s.name} size="sm" online={s.status === 'Active'} />
                            <div>
                              <p className="font-medium text-on-surface" style={{ fontFamily: 'Inter, sans-serif' }}>{s.name}</p>
                              <p className="text-xs text-on-surface-variant">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-on-surface-variant text-xs">{s.course}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <ProgressBar value={s.progress} color={s.progress >= 80 ? 'emerald' : s.progress >= 60 ? 'blue' : 'amber'} />
                            <span className="text-xs text-on-surface-variant w-8">{s.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-semibold text-sm ${s.grade.startsWith('A') ? 'text-emerald-400' : s.grade.startsWith('B') ? 'text-blue-400' : 'text-amber-400'}`}>{s.grade}</span>
                        </td>
                        <td className="px-5 py-3.5 text-on-surface-variant">{s.attendance}</td>
                        <td className="px-5 py-3.5">
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
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementData.length ? engagementData : [
                    { day: 'Mon', active: 3420 }, { day: 'Tue', active: 3810 }, { day: 'Wed', active: 4230 },
                    { day: 'Thu', active: 3920 }, { day: 'Fri', active: 3650 }, { day: 'Sat', active: 2840 }, { day: 'Sun', active: 2190 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={{ background: 'rgba(13,20,45,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0', fontSize: 12 }} />
                    <Line type="monotone" dataKey="active" stroke="#0D9488" strokeWidth={2.5} dot={{ fill: '#0D9488', r: 4 }} activeDot={{ r: 6 }} isAnimationActive animationDuration={1200} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Quick actions */}
            <GlassCard>
              <SectionHeader title="Quick Actions" />
              <div className="space-y-2">
                {[
                  { label: 'Create Assignment', icon: <ClipboardList size={16} />, link: '/assignments', color: 'text-[#0D9488]' },
                  { label: 'Schedule Class', icon: <Calendar size={16} />, link: '/calendar', color: 'text-blue-400' },
                  { label: 'View Attendance', icon: <Users size={16} />, link: '/attendance', color: 'text-emerald-400' },
                  { label: 'View Analytics', icon: <TrendingUp size={16} />, link: '/analytics', color: 'text-amber-400' },
                ].map((a, i) => (
                  <Link key={i} to={a.link}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-on-surface/5 transition-all group border border-transparent hover:border-outline-variant/15">
                      <span className={a.color}>{a.icon}</span>
                      <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{a.label}</span>
                      <span className="ml-auto text-outline group-hover:text-on-surface-variant transition-colors text-lg">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>

            {/* Assignments overview */}
            <GlassCard>
              <SectionHeader title="Assignment Overview" action={
                <Link to="/assignments" className="text-xs text-[#0D9488] hover:text-[#0D9488]">View all</Link>
              } />
              <div className="space-y-3">
                {ASSIGNMENTS_DATA.map((a, i) => (
                  <div key={i} className="p-3 rounded-xl bg-on-surface/5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-on-surface" style={{ fontFamily: 'Inter, sans-serif' }}>{a.title}</p>
                      <Badge variant={a.status === 'Open' ? 'emerald' : 'slate'}>{a.status}</Badge>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">Due {a.due} · {a.course}</p>
                    <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                      <span>Submitted</span>
                      <span className="font-medium text-on-surface">{a.submitted}/{a.total}</span>
                    </div>
                    <ProgressBar value={a.submitted} max={a.total} color="emerald" />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
