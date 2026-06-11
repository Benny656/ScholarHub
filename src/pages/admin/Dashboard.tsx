import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, CartesianGrid,
} from 'recharts';
import { Users, BookOpen, TrendingUp, IndianRupee, Shield, AlertCircle, CheckCircle, Activity, Edit2, Trash2, UserCog } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { analyticsService } from '../../services/analytics.service';
import { StatCard, GlassCard, Badge, ProgressBar, SectionHeader, SearchInput, Button } from '../../components/ui/index';
import toast from 'react-hot-toast';

const USERS_DATA = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex@example.com', role: 'student', joined: 'Jan 20, 2024', status: 'Active', courses: 3 },
  { id: 'u2', name: 'Dr. Sarah Chen', email: 'sarah@example.com', role: 'teacher', joined: 'Mar 10, 2022', status: 'Active', courses: 4 },
  { id: 'u8', name: 'Jordan Lee', email: 'jordan@example.com', role: 'student', joined: 'Feb 15, 2024', status: 'Suspended', courses: 2 },
  { id: 'u9', name: 'Priya Sharma', email: 'priya@example.com', role: 'student', joined: 'Mar 5, 2024', status: 'Active', courses: 5 },
  { id: 'u4', name: 'Prof. Raj Patel', email: 'raj@example.com', role: 'teacher', joined: 'Jan 5, 2023', status: 'Active', courses: 2 },
  { id: 'u10', name: 'Marcus Brown', email: 'marcus@example.com', role: 'student', joined: 'Apr 1, 2024', status: 'Active', courses: 1 },
];

const HEALTH_INDICATORS = [
  { name: 'API Server', status: 'healthy', uptime: '99.97%', latency: '42ms' },
  { name: 'Database', status: 'healthy', uptime: '99.99%', latency: '8ms' },
  { name: 'CDN / Storage', status: 'healthy', uptime: '100%', latency: '12ms' },
  { name: 'WebSocket Server', status: 'warning', uptime: '98.2%', latency: '89ms' },
  { name: 'AI Services', status: 'healthy', uptime: '99.5%', latency: '210ms' },
  { name: 'Email Service', status: 'healthy', uptime: '99.8%', latency: '35ms' },
];

export function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; enrollments: number }[]>([]);
  const [engagementData, setEngagementData] = useState<{ day: string; active: number; new: number }[]>([]);
  const [stats, setStats] = useState<{ totalUsers: number; activeUsers: number; totalCourses: number; revenue: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getRevenueData(),
      analyticsService.getEngagementData(),
      analyticsService.getPlatformStats(),
    ]).then(([rev, eng, st]) => {
      setRevenueData(rev);
      setEngagementData(eng);
      setStats(st);
      setLoading(false);
    });
  }, []);

  const filtered = USERS_DATA.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    toast.success(`Role updated to ${newRole}`, { icon: '👤' });
  };

  const handleSuspend = (userId: string) => {
    toast.success('User suspended', { icon: '⚠️' });
  };

  const TOOLTIP_STYLE = { background: 'rgba(13,20,45,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0', fontSize: 12 };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>Admin Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Platform overview and management center</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats?.totalUsers.toLocaleString() ?? '12,847', icon: <Users size={18} />, color: 'blue' as const, trend: '8.3%', trendUp: true },
            { label: 'Active Users', value: stats?.activeUsers.toLocaleString() ?? '4,231', icon: <Activity size={18} />, color: 'purple' as const, trend: '12%', trendUp: true },
            { label: 'Total Courses', value: stats?.totalCourses ?? 248, icon: <BookOpen size={18} />, color: 'emerald' as const, trend: '5 new', trendUp: true },
            { label: 'Monthly Revenue', value: `₹${((stats?.revenue ?? 284750) / 1000).toFixed(0)}K`, icon: <IndianRupee size={18} />, color: 'amber' as const, trend: '18%', trendUp: true },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard tint="purple">
            <SectionHeader title="Revenue" subtitle="Monthly revenue & enrollments" />
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.length ? revenueData : [
                  { month: 'Jan', revenue: 18200 }, { month: 'Feb', revenue: 21500 },
                  { month: 'Mar', revenue: 19800 }, { month: 'Apr', revenue: 24300 },
                  { month: 'May', revenue: 28900 }, { month: 'Jun', revenue: 31200 },
                ]}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#F59E0B" fill="url(#revGrad)" strokeWidth={2.5} isAnimationActive animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard tint="blue">
            <SectionHeader title="Daily Active Users" subtitle="New vs returning" />
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData.length ? engagementData : [
                  { day: 'Mon', active: 3420, new: 124 }, { day: 'Tue', active: 3810, new: 156 },
                  { day: 'Wed', active: 4230, new: 189 }, { day: 'Thu', active: 3920, new: 143 },
                  { day: 'Fri', active: 3650, new: 131 }, { day: 'Sat', active: 2840, new: 98 }, { day: 'Sun', active: 2190, new: 76 },
                ]} barSize={20} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="active" fill="#F59E0B" opacity={0.8} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="new" fill="#4edea3" opacity={0.8} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* User Management */}
        <GlassCard padding="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-outline-variant/10">
            <div>
              <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>User Management</h2>
              <p className="text-sm text-on-surface-variant">{filtered.length} users</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex rounded-xl overflow-hidden border border-outline-variant/20">
                {(['all', 'student', 'teacher'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3.5 py-1.5 text-xs font-medium capitalize transition-all ${roleFilter === r ? 'bg-[#F59E0B] text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <SearchInput value={search} onChange={setSearch} placeholder="Search users..." />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  {['User', 'Role', 'Joined', 'Courses', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase bg-on-surface/5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-outline-variant/10 hover:bg-on-surface/[0.03] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-on-surface text-xs font-bold flex-shrink-0">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{u.name}</p>
                          <p className="text-xs text-on-surface-variant">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={u.role === 'teacher' ? 'blue' : u.role === 'admin' ? 'purple' : 'slate'} size="md">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-on-surface-variant text-xs">{u.joined}</td>
                    <td className="px-5 py-3.5 text-on-surface-variant">{u.courses}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={u.status === 'Active' ? 'emerald' : 'red'}>{u.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleRoleChange(u.id, 'teacher')} className="p-1.5 rounded-lg hover:bg-blue-500/15 text-on-surface-variant hover:text-blue-400 transition-all" title="Change role">
                          <UserCog size={14} />
                        </button>
                        <button onClick={() => handleSuspend(u.id)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-on-surface-variant hover:text-red-400 transition-all" title="Suspend">
                          <Shield size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* System Health */}
        <GlassCard>
          <SectionHeader title="System Health" subtitle="Real-time infrastructure status" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {HEALTH_INDICATORS.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3.5 rounded-xl border"
                style={{ background: 'color-mix(in srgb, var(--color-on-surface) 3%, transparent)', borderColor: h.status === 'warning' ? 'rgba(251,191,36,0.2)' : 'color-mix(in srgb, var(--color-on-surface) 5%, transparent)' }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${h.status === 'healthy' ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                  {h.status === 'healthy' ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-amber-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface" style={{ fontFamily: 'Inter, sans-serif' }}>{h.name}</p>
                  <p className="text-xs text-on-surface-variant">{h.uptime} uptime · {h.latency}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${h.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
