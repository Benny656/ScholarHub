import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, CartesianGrid
} from 'recharts';
import { 
  Users, BookOpen, ShieldAlert, Activity, 
  UserPlus, FileText, Download, TrendingUp, CheckCircle2, 
  AlertTriangle, Server, Database, Cloud, FileCode, IndianRupee, Zap, FileSpreadsheet,
  ShieldCheck, Lock, Eye, Key, CreditCard, Building2, UserCog, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProctoringDashboard } from '../../components/features/ProctoringDashboard';
import { BlockchainVerification } from '../../components/features/BlockchainVerification';

// --- Mock Data ---
const STATS = {
  totalStudents: 12450,
  totalTeachers: 480,
  activeCourses: 342,
  attendanceRate: 92,
};

const DEPARTMENTS = [
  { name: 'Computer Science', head: 'Dr. Alan Turing', faculty: 34, courses: 28 },
  { name: 'Mathematics', head: 'Prof. Emmy Noether', faculty: 22, courses: 18 },
  { name: 'Physics', head: 'Dr. Richard Feynman', faculty: 19, courses: 14 },
  { name: 'Business Studies', head: 'Prof. Jane Smith', faculty: 28, courses: 22 },
];

const ROLES = [
  { role: 'Student', count: 12450, permissions: 'View Courses, Submit Assignments, Access Resources', level: 'Standard' },
  { role: 'Teacher', count: 480, permissions: 'Create Courses, Grade, Manage Students, Live Classes', level: 'Elevated' },
  { role: 'Admin', count: 12, permissions: 'Full Platform Access, User Management, Analytics', level: 'Full Access' },
];

const SECURITY_STATUS = [
  { item: 'JWT Token Service', status: 'Active', icon: Key },
  { item: 'Two-Factor Auth', status: 'Enabled', icon: ShieldCheck },
  { item: 'Secure Upload Monitor', status: 'Active', icon: Eye },
  { item: 'Suspicious Logins', status: '2 Alerts', icon: AlertTriangle, alert: true },
];


const PERFORMANCE_TRENDS = [
  { month: 'Jan', avgScore: 78, completion: 82 },
  { month: 'Feb', avgScore: 80, completion: 85 },
  { month: 'Mar', avgScore: 82, completion: 84 },
  { month: 'Apr', avgScore: 79, completion: 88 },
  { month: 'May', avgScore: 85, completion: 91 },
  { month: 'Jun', avgScore: 86, completion: 94 },
];

const ATTENDANCE_TRENDS = [
  { day: 'Mon', rate: 95 },
  { day: 'Tue', rate: 94 },
  { day: 'Wed', rate: 92 },
  { day: 'Thu', rate: 93 },
  { day: 'Fri', rate: 89 },
];

const RECENT_USERS = [
  { id: 'u1', name: 'Emily Chen', role: 'Student', status: 'Pending Approval', date: 'Today, 09:15 AM' },
  { id: 'u2', name: 'Dr. Robert Smith', role: 'Faculty', status: 'Active', date: 'Yesterday, 14:30 PM' },
  { id: 'u3', name: 'Michael Johnson', role: 'Student', status: 'Active', date: 'Yesterday, 11:20 AM' },
];

const POPULAR_COURSES = [
  { id: 'c1', title: 'Intro to Machine Learning', enrollments: 1240, completion: '88%' },
  { id: 'c2', title: 'Advanced React Patterns', enrollments: 980, completion: '92%' },
  { id: 'c3', title: 'Data Structures & Algorithms', enrollments: 850, completion: '76%' },
];

const AI_INSIGHTS = [
  { id: 'i1', type: 'alert', message: 'Attendance in Physics 101 has dropped by 15% this week.', action: 'View Report' },
  { id: 'i2', type: 'insight', message: 'Students engaging with AI Tutor show 22% higher quiz scores.', action: 'Analyze' },
  { id: 'i3', type: 'risk', message: '45 students identified at risk of failing Midterms.', action: 'Notify Faculty' },
];

const SYSTEM_HEALTH = [
  { service: 'API Gateway', status: 'operational', latency: '42ms' },
  { service: 'Database Main', status: 'operational', latency: '12ms' },
  { service: 'Video CDN', status: 'degraded', latency: '145ms' },
];

// --- Components ---

const Panel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const PanelHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="px-5 py-4 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
    {action && <div className="text-xs">{action}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 rounded-lg shadow-lg text-xs">
        <p className="font-semibold mb-1 text-neutral-900 dark:text-neutral-100">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AdminDashboard() {
  const { user } = useAuth();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans space-y-8">
      
      {/* ─── HERO SECTION ─── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-2">
            Institution Overview
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
            Monitor students, faculty, courses, and academic performance from a single centralized platform.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-medium transition-colors border border-transparent dark:border-neutral-700">
            <UserPlus size={14} /> Add User
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-medium transition-colors border border-transparent dark:border-neutral-700">
            <BookOpen size={14} /> Create Course
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium transition-colors">
            <FileSpreadsheet size={14} /> Generate Report
          </button>
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
          { label: 'Total Students', value: STATS.totalStudents.toLocaleString(), icon: Users, trend: '+4.2%' },
          { label: 'Total Teachers', value: STATS.totalTeachers.toLocaleString(), icon: FileText, trend: '+1.1%' },
          { label: 'Active Courses', value: STATS.activeCourses, icon: BookOpen, trend: '+12' },
          { label: 'Global Attendance', value: `${STATS.attendanceRate}%`, icon: Activity, trend: '-2.1%' },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                <stat.icon size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
              </div>
              <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{stat.trend}</span>
            </div>
            <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              {stat.value}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── MAIN GRID ─── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        
        {/* LEFT COLUMN (Main Content) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Academic Analytics */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Academic Analytics" 
                action={<span className="text-xs text-neutral-500 font-medium">Last 6 Months</span>} 
              />
              <div className="p-5 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PERFORMANCE_TRENDS} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-neutral-800" />
                    <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" name="Avg Score" dataKey="avgScore" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorAvg)" />
                    <Area type="monotone" name="Completion Rate" dataKey="completion" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorComp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* User Management Overview */}
            <motion.div variants={itemVariants}>
              <Panel className="h-full">
                <PanelHeader 
                  title="Recent Registrations" 
                  action={<Link to="/admin/users" className="text-brand-primary hover:underline">Manage</Link>}
                />
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {RECENT_USERS.map(u => (
                    <div key={u.id} className="p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{u.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{u.role} • {u.date}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shrink-0 ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                        {u.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            </motion.div>

            {/* Course Overview */}
            <motion.div variants={itemVariants}>
              <Panel className="h-full">
                <PanelHeader 
                  title="Course Overview" 
                  action={<Link to="/admin/courses" className="text-brand-primary hover:underline">Manage</Link>}
                />
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {POPULAR_COURSES.map(c => (
                    <div key={c.id} className="p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate pr-2">{c.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400"><Users size={10} className="inline mr-1"/>{c.enrollments}</span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{c.completion} Completion</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </motion.div>
          </div>

          {/* ─── NEW: ROLE & PERMISSION MANAGEMENT ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader
                title="Role & Permission Management"
                action={<Link to="/admin/roles" className="text-brand-primary hover:underline text-xs flex items-center gap-1"><Settings size={12} /> Manage Roles</Link>}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                      {['Role', 'Users', 'Access Level', 'Permissions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {ROLES.map((r, i) => (
                      <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <UserCog size={14} className="text-neutral-400" />
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{r.role}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-neutral-600 dark:text-neutral-400 font-medium">{r.count.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            r.level === 'Full Access' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                            r.level === 'Elevated' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          }`}>{r.level}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500 dark:text-neutral-400 max-w-xs truncate">{r.permissions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: DEPARTMENT MANAGEMENT ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader
                title="Department Management"
                action={<button className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"><Building2 size={12} /> Add Department</button>}
              />
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {DEPARTMENTS.map((dept, i) => (
                  <div key={i} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{dept.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Head: {dept.head}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{dept.faculty}</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Faculty</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{dept.courses}</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Courses</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: PAYMENT MANAGEMENT ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader title="Payment Management" action={<Link to="/admin/payments" className="text-brand-primary hover:underline text-xs">View Invoices</Link>} />
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'MRR', value: '₹2.84L' },
                    { label: 'Active Subs', value: '1,204' },
                    { label: 'Invoices', value: '342' },
                  ].map((kpi, idx) => (
                    <div key={idx} className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800 text-center">
                      <p className="text-base font-bold text-neutral-900 dark:text-neutral-50">{kpi.value}</p>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">{kpi.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Payment Integrations</p>
                  {[
                    { name: 'Razorpay', status: 'Connected' },
                    { name: 'Stripe', status: 'Connected' },
                  ].map((pg, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{pg.name}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{pg.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </motion.div>

        </div>

        {/* RIGHT COLUMN (Side Content) */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* AI Insights Center */}
          <motion.div variants={itemVariants}>
            <Panel className="bg-gradient-to-b from-brand-primary/5 to-transparent border-brand-primary/20">
              <PanelHeader 
                title="AI Insights Center" 
                action={<Zap size={14} className="text-brand-primary fill-brand-primary" />}
              />
              <div className="p-5 space-y-4">
                {AI_INSIGHTS.map(insight => (
                  <div key={insight.id} className="flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      {insight.type === 'alert' && <AlertTriangle size={16} className="text-amber-500" />}
                      {insight.type === 'insight' && <TrendingUp size={16} className="text-brand-primary" />}
                      {insight.type === 'risk' && <ShieldAlert size={16} className="text-red-500" />}
                    </div>
                    <div>
                      <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-snug mb-1.5">{insight.message}</p>
                      <button className="text-xs font-semibold text-brand-primary hover:underline">{insight.action}</button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* Attendance Intelligence */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader title="Weekly Attendance Trend" />
              <div className="p-5">
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ATTENDANCE_TRENDS} margin={{ top: 5, right: 0, left: -20, bottom: 0 }} barSize={24}>
                      <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                      />
                      <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>
          </motion.div>

          {/* System Health */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="System Health" 
                action={<span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>} 
              />
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {SYSTEM_HEALTH.map((sys, i) => (
                  <div key={i} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {sys.service.includes('API') && <Server size={16} className="text-neutral-500" />}
                      {sys.service.includes('Database') && <Database size={16} className="text-neutral-500" />}
                      {sys.service.includes('CDN') && <Cloud size={16} className="text-neutral-500" />}
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{sys.service}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500">{sys.latency}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${sys.status === 'operational' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' : 'text-amber-600 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                        {sys.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* Financial Overview & Reports */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader title="Quick Reports" />
              <div className="p-4 space-y-2">
                {[
                  { label: 'Financial Revenue Summary', icon: IndianRupee },
                  { label: 'Global Attendance Export', icon: Download },
                  { label: 'Detailed Academic Analytics', icon: FileCode },
                ].map((report, idx) => (
                  <button key={idx} className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-neutral-700 dark:text-neutral-300">
                    <report.icon size={16} className="text-neutral-400" />
                    <span className="text-sm font-medium">{report.label}</span>
                  </button>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: PROCTORING & BLOCKCHAIN ADMIN VIEWS ─── */}
          <motion.div variants={itemVariants}>
            <ProctoringDashboard role="admin" />
          </motion.div>

          <motion.div variants={itemVariants}>
            <BlockchainVerification role="admin" />
          </motion.div>

          {/* ─── NEW: SECURITY OVERVIEW ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader title="Security Overview" action={<Lock size={14} className="text-neutral-400" />} />
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {SECURITY_STATUS.map((item, i) => (
                  <div key={i} className={`p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors ${item.alert ? 'bg-red-50/30 dark:bg-red-500/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      <item.icon size={15} className={item.alert ? 'text-red-500' : 'text-neutral-400'} />
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.item}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.alert ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    }`}>{item.status}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800">
                <Link to="/admin/security" className="text-xs text-brand-primary hover:underline font-medium">View Full Security Logs &rarr;</Link>
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: EXTENDED ANALYTICS ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader title="Platform Analytics" action={<Link to="/admin/analytics" className="text-brand-primary hover:underline text-xs">Full Report</Link>} />
              <div className="p-4 space-y-3">
                {[
                  { label: 'Active Users Today', value: '4,820', change: '+8%', up: true },
                  { label: 'Top Course Enrollments', value: 'Intro to ML · 1,240', change: '+3%', up: true },
                  { label: 'Student Engagement Score', value: '87 / 100', change: '-2pts', up: false },
                  { label: 'Revenue (This Month)', value: '₹2.84L', change: '+18%', up: true },
                  { label: 'Avg. Attendance (Global)', value: '92%', change: '-1.2%', up: false },
                ].map((kpi, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{kpi.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{kpi.value}</span>
                      <span className={`text-[10px] font-bold ${kpi.up ? 'text-emerald-500' : 'text-red-500'}`}>{kpi.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
