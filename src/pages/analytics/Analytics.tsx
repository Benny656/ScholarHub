import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, CartesianGrid,
} from 'recharts';
import { TrendingUp, Award, Clock, BookOpen, Download, Target, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analytics.service';
import { GlassCard, StatCard, Badge, ProgressBar, PageHeader, Button, SectionHeader } from '../../components/ui/index';

const TOOLTIP = { background: 'var(--color-surface)', border: '1px solid color-mix(in srgb, var(--color-on-surface) 10%, transparent)', borderRadius: 12, color: 'var(--color-on-surface)', fontSize: 12 };

const SUBJECT_DATA = [
  { subject: 'Web Dev', grade: 88, avg: 72, fullMark: 100 },
  { subject: 'DSA', grade: 74, avg: 68, fullMark: 100 },
  { subject: 'ML', grade: 65, avg: 60, fullMark: 100 },
  { subject: 'Design', grade: 92, avg: 78, fullMark: 100 },
  { subject: 'Cloud', grade: 80, avg: 71, fullMark: 100 },
];

const PERFORMANCE_TREND = [
  { month: 'Jan', score: 74, avg: 70 }, { month: 'Feb', score: 76, avg: 71 },
  { month: 'Mar', score: 79, avg: 72 }, { month: 'Apr', score: 73, avg: 70 },
  { month: 'May', score: 82, avg: 73 }, { month: 'Jun', score: 86, avg: 74 },
];

const TIME_DATA = [
  { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 3.8 }, { day: 'Wed', hours: 1.5 },
  { day: 'Thu', hours: 4.2 }, { day: 'Fri', hours: 3.0 }, { day: 'Sat', hours: 5.5 }, { day: 'Sun', hours: 2.0 },
];

export function Analytics() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Awaited<ReturnType<typeof analyticsService.getGrades>>>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'semester'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    analyticsService.getGrades(user.id).then(g => { setGrades(g); setLoading(false); });
  }, [user]);

  const gpa = (SUBJECT_DATA.reduce((s, d) => s + d.grade, 0) / SUBJECT_DATA.length / 100 * 4).toFixed(2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        subtitle="Track your learning performance"
        breadcrumb={[{ label: 'Analytics' }]}
        action={
          <Button variant="secondary" icon={<Download size={15} />} onClick={() => alert('PDF download placeholder')}>
            Export PDF
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'GPA', value: gpa, icon: <Star size={18} />, color: 'amber' as const, trend: '+0.3', trendUp: true },
            { label: 'Avg Grade', value: '81%', icon: <Target size={18} />, color: 'purple' as const, trend: '+8%', trendUp: true },
            { label: 'Time Learned', value: '124h', icon: <Clock size={18} />, color: 'blue' as const, trend: '+12h', trendUp: true },
            { label: 'Completed', value: '3/6', icon: <Award size={18} />, color: 'emerald' as const },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance trend */}
          <GlassCard tint="purple">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader title="Performance Trend" subtitle="Your score vs. class average" />
              <div className="flex gap-1">
                {(['week', 'month', 'semester'] as const).map(p => (
                  <button key={p} onClick={() => setPeriod(p)} className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${period === p ? 'bg-[#06B6D4] text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERFORMANCE_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in srgb, var(--color-on-surface) 5%, transparent)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP} formatter={(v: number, name: string) => [`${v}%`, name === 'score' ? 'Your Score' : 'Class Avg']} />
                  <Line type="monotone" dataKey="score" stroke="#06B6D4" strokeWidth={2.5} dot={{ fill: '#06B6D4', r: 4 }} activeDot={{ r: 6 }} isAnimationActive animationDuration={1200} />
                  <Line type="monotone" dataKey="avg" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#06B6D4] rounded" />Your score</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-0.5 border-b border-dashed border-blue-500" />Class average</span>
            </div>
          </GlassCard>

          {/* Subject radar */}
          <GlassCard tint="blue">
            <SectionHeader title="Subject Breakdown" subtitle="Performance across subjects" />
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={SUBJECT_DATA}>
                  <PolarGrid stroke="color-mix(in srgb, var(--color-on-surface) 8%, transparent)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Your Grade" dataKey="grade" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.25} isAnimationActive animationDuration={1200} />
                  <Radar name="Class Avg" dataKey="avg" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                  <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => [`${v}%`]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Weekly study time */}
        <GlassCard>
          <SectionHeader title="Weekly Study Time" subtitle="Hours per day this week" action={
            <span className="text-sm font-bold text-[#06B6D4]">22.5h total</span>
          } />
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TIME_DATA} barSize={32}>
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}h`} />
                <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => [`${v}h`, 'Study time']} />
                <Bar dataKey="hours" fill="url(#timeGrad)" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1000} />
                <defs>
                  <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Grade table */}
        <GlassCard padding="p-0">
          <div className="p-5 border-b border-outline-variant/10">
            <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>Grade Details</h2>
            <p className="text-sm text-on-surface-variant">Current semester grades per course</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-outline-variant/10">
                {['Course', 'Assignments', 'Quizzes', 'Attendance', 'Final Grade', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[
                  { course: 'Full-Stack Web Dev', assignments: '88%', quizzes: '91%', attendance: '84%', grade: 88, letter: 'B+' },
                  { course: 'Data Structures', assignments: '76%', quizzes: '72%', attendance: '78%', grade: 74, letter: 'C+' },
                  { course: 'Machine Learning', assignments: '68%', quizzes: '62%', attendance: '80%', grade: 65, letter: 'D' },
                  { course: 'UI/UX Design', assignments: '95%', quizzes: '88%', attendance: '96%', grade: 92, letter: 'A' },
                  { course: 'Cloud Computing', assignments: '82%', quizzes: '78%', attendance: '89%', grade: 80, letter: 'B' },
                ].map((r, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-outline-variant/10 hover:bg-on-surface/[0.03] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-on-surface">{r.course}</td>
                    <td className="px-5 py-3.5 text-on-surface-variant">{r.assignments}</td>
                    <td className="px-5 py-3.5 text-on-surface-variant">{r.quizzes}</td>
                    <td className="px-5 py-3.5 text-on-surface-variant">{r.attendance}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={r.grade} color={r.grade >= 80 ? 'emerald' : r.grade >= 70 ? 'blue' : 'amber'} />
                        <span className={`text-sm font-bold w-10 flex-shrink-0 ${r.grade >= 80 ? 'text-emerald-400' : r.grade >= 70 ? 'text-blue-400' : 'text-amber-400'}`}>{r.letter}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={r.grade >= 80 ? 'emerald' : r.grade >= 60 ? 'blue' : 'red'}>
                        {r.grade >= 80 ? 'Excellent' : r.grade >= 70 ? 'Good' : r.grade >= 60 ? 'Average' : 'Needs Work'}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
