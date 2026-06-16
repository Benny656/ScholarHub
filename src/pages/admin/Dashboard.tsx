import React, { useState, useEffect } from 'react';
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
  ShieldCheck, Lock, Eye, Key, CreditCard, Building2, UserCog, Settings,
  LogOut, Search, CheckCircle, XCircle, Trash2, Unlock, Star, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminLogs,
  getSystemStats,
  getUsersList,
  updateUserStatus,
  changeUserRole,
  deleteUser,
  getCoursesList,
  updateCourseStatus,
  featureCourse,
  deleteCourse,
  getAnalyticsData,
  getSystemSettings,
  saveSystemSettings,
  logAction
} from '../../services/admin.service';
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
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'analytics' | 'institutions' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  // States
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  // Filtering / Search / Pagination
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 8;

  const [courseSearch, setCourseSearch] = useState('');
  const [courseStatusFilter, setCourseStatusFilter] = useState('all');
  const [coursePage, setCoursePage] = useState(1);

  // Modals / Details Dialogs
  const [selectedCourseAnalytics, setSelectedCourseAnalytics] = useState<any | null>(null);
  const [brandingLogo, setBrandingLogo] = useState('https://scholarhub.io/logo.png');
  const [brandingPrimaryColor, setBrandingPrimaryColor] = useState('#EF4444');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    destructive: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    destructive: false
  });

  const handleExportCSV = () => {
    toast.success('CSV Export started');
  };

  const filteredUsers = users.filter((u: any) => {
    if (userSearch && !u.name?.toLowerCase().includes(userSearch.toLowerCase()) && !u.email?.toLowerCase().includes(userSearch.toLowerCase())) return false;
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userStatusFilter !== 'all' && (userStatusFilter === 'active' ? u.status !== 'suspended' : u.status === 'suspended')) return false;
    return true;
  });
  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);

  const filteredCourses = courses.filter((c: any) => {
    if (courseSearch && !c.title?.toLowerCase().includes(courseSearch.toLowerCase())) return false;
    if (courseStatusFilter !== 'all') {
      if (courseStatusFilter === 'published' && !c.is_published) return false;
      if (courseStatusFilter === 'draft' && c.is_published) return false;
    }
    return true;
  });
  const paginatedCourses = filteredCourses.slice((coursePage - 1) * itemsPerPage, coursePage * itemsPerPage);

  // Load all dashboard data
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, coursesData, analyticsData, logsData] = await Promise.all([
        getSystemStats(),
        getUsersList(),
        getCoursesList(),
        getAnalyticsData(),
        getAdminLogs()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setCourses(coursesData);
      setAnalytics(analyticsData);
      setLogs(logsData);
      setSettings(getSystemSettings());
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerConfirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    destructive = false
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      destructive
    });
  };

  // Admin action execution with auto-refresh
  const handleUserStatusToggle = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    triggerConfirm(
      `${newStatus === 'suspended' ? 'Suspend' : 'Activate'} User Account?`,
      `Are you sure you want to change this user status to ${newStatus}?`,
      async () => {
        try {
          await updateUserStatus(user!.id, userId, newStatus);
          toast.success(`User account ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully.`);
          loadData();
        } catch (err) {
          toast.error('Failed to change user status.');
        }
      },
      newStatus === 'suspended'
    );
  };

  const handleUserRoleChange = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    try {
      await changeUserRole(user!.id, userId, newRole);
      toast.success(`User role updated to ${newRole}.`);
      loadData();
    } catch (err) {
      toast.error('Failed to update user role.');
    }
  };

  const handleUserDelete = (userId: string) => {
    triggerConfirm(
      'Permanently Delete User?',
      'WARNING: Deleting this user is permanent and will remove all their enrollments and submissions.',
      async () => {
        try {
          await deleteUser(user!.id, userId);
          toast.success('User profile deleted.');
          loadData();
        } catch (err) {
          toast.error('Failed to delete user.');
        }
      },
      true
    );
  };

  const handleCourseStatusToggle = (courseId: string, currentPublished: boolean) => {
    const newPublished = !currentPublished;
    triggerConfirm(
      `${newPublished ? 'Approve' : 'Reject'} Course Listing?`,
      `Are you sure you want to ${newPublished ? 'approve and publish' : 'reject and hide'} this course?`,
      async () => {
        try {
          await updateCourseStatus(user!.id, courseId, newPublished);
          toast.success(`Course successfully ${newPublished ? 'published' : 'unpublished'}.`);
          loadData();
        } catch (err) {
          toast.error('Failed to modify course status.');
        }
      },
      !newPublished
    );
  };

  const handleCourseFeatureToggle = async (courseId: string, currentFeatured: boolean) => {
    try {
      await featureCourse(user!.id, courseId, !currentFeatured);
      toast.success(`Course feature state updated.`);
      loadData();
    } catch (err) {
      toast.error('Failed to feature course.');
    }
  };

  const handleCourseDelete = (courseId: string) => {
    triggerConfirm(
      'Permanently Delete Course?',
      'WARNING: This will delete the course listing and remove all students enrolled.',
      async () => {
        try {
          await deleteCourse(user!.id, courseId);
          toast.success('Course deleted successfully.');
          loadData();
        } catch (err) {
          toast.error('Failed to delete course.');
        }
      },
      true
    );
  };

  const handleSettingsSave = () => {
    try {
      saveSystemSettings(user!.id, settings);
      toast.success('System settings saved.');
      loadData();
    } catch (err) {
      toast.error('Failed to save settings.');
    }
  };
  
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

      
      {/* ─── TABS NAVIGATION ─── */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 mt-4 mb-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2 shrink-0 ${
              activeTab === tab.id 
                ? 'border-brand-primary text-brand-primary bg-brand-primary/5' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>


      {activeTab === 'overview' && (
      <div className="space-y-8 animate-fadeIn">
      {/* ─── QUICK STATISTICS ─── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '0', icon: Users, trend: 'Live' },
          { label: 'Active Sessions', value: stats?.activeSessions?.toLocaleString() || '0', icon: Activity, trend: 'Live' },
          { label: 'Active Courses', value: stats?.totalCourses || '0', icon: BookOpen, trend: 'Live' },
          { label: 'Revenue', value: `₹${stats?.revenue?.toLocaleString() || '0'}`, icon: IndianRupee, trend: 'Gross' },
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
      )}

{activeTab === 'users' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">User Directory</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Search, manage roles, suspend, or delete user accounts.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 text-sm font-semibold cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    placeholder="Search users by name or email..."
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#EF4444]/40"
                  />
                </div>

                <div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#EF4444]/40"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => {
                      setUserStatusFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#EF4444]/40"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4 pl-6">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">XP</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-neutral-400 dark:text-neutral-500">No matching user records found.</td>
                        </tr>
                      ) : (
                        paginatedUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="flex flex-col">
                                <span className="font-bold">{u.name || 'Anonymous Learner'}</span>
                                <span className="text-xs text-neutral-400 dark:text-neutral-500">{u.email}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <select
                                value={u.role || 'student'}
                                onChange={(e) => handleUserRoleChange(u.id, e.target.value as any)}
                                className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs rounded px-2 py-1 outline-none text-neutral-900 dark:text-neutral-100 focus:border-[#EF4444]/40"
                              >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <span className="text-xs capitalize font-medium">{u.user_type || 'College'}</span>
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                u.status === 'suspended'
                                  ? 'bg-red-500/10 text-[#EF4444] border-[#EF4444]/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}>
                                {u.status || 'active'}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-xs">{u.xp || 0}</td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleUserStatusToggle(u.id, u.status)}
                                  className={`p-1.5 rounded-lg border hover:scale-105 transition-all cursor-pointer ${
                                    u.status === 'suspended'
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                      : 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20'
                                  }`}
                                  title={u.status === 'suspended' ? 'Activate' : 'Suspend'}
                                >
                                  {u.status === 'suspended' ? <Unlock size={14} /> : <Lock size={14} />}
                                </button>
                                <button
                                  onClick={() => handleUserDelete(u.id)}
                                  className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 hover:scale-105 transition-all cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {filteredUsers.length > itemsPerPage && (
                <div className="flex justify-between items-center text-xs text-neutral-400 dark:text-neutral-500">
                  <span>Showing {(userPage - 1) * itemsPerPage + 1} to {Math.min(userPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</span>
                  <div className="flex gap-2">
                    <button
                      disabled={userPage === 1}
                      onClick={() => setUserPage((p) => p - 1)}
                      className="px-3 py-1.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <button
                      disabled={userPage * itemsPerPage >= filteredUsers.length}
                      onClick={() => setUserPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
{activeTab === 'courses' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Course Catalogue</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Approve, reject, feature, or remove course catalog requests.</p>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => {
                      setCourseSearch(e.target.value);
                      setCoursePage(1);
                    }}
                    placeholder="Search courses by title..."
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#EF4444]/40"
                  />
                </div>

                <div>
                  <select
                    value={courseStatusFilter}
                    onChange={(e) => {
                      setCourseStatusFilter(e.target.value);
                      setCoursePage(1);
                    }}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-3 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#EF4444]/40"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Approved & Published</option>
                    <option value="draft">Draft / Rejected</option>
                  </select>
                </div>
              </div>

              {/* Courses Table */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4 pl-6">Course Thumbnail & Title</th>
                        <th className="p-4">Instructor</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedCourses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-neutral-400 dark:text-neutral-500">No course records found.</td>
                        </tr>
                      ) : (
                        paginatedCourses.map((c) => (
                          <tr key={c.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-8 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 overflow-hidden flex-shrink-0">
                                  {c.thumbnail_url ? (
                                    <img src={c.thumbnail_url} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#EF4444]/20 to-[#8B5CF6]/20" />
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold truncate max-w-[240px]">{c.title || 'Untitled Course'}</span>
                                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{c.category || 'General'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs">{c.users?.name || 'Unknown Instructor'}</span>
                                <span className="text-[10px] text-neutral-900 dark:text-neutral-100/30">{c.users?.email}</span>
                              </div>
                            </td>
                            <td className="p-4 font-bold text-xs font-mono">₹{c.price || 0}</td>
                            <td className="p-4">
                              <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                                c.is_published
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-red-500/10 text-[#EF4444] border-[#EF4444]/20'
                              }`}>
                                {c.is_published ? 'Published' : 'Rejected / Draft'}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setSelectedCourseAnalytics(c)}
                                  className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 hover:scale-105 transition-all cursor-pointer"
                                  title="View Analytics"
                                >
                                  <FileText size={14} />
                                </button>
                                <button
                                  onClick={() => handleCourseFeatureToggle(c.id, false)} // Simulated action
                                  className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 hover:text-amber-400 hover:scale-105 transition-all cursor-pointer"
                                  title="Feature Course"
                                >
                                  <Star size={14} className="fill-transparent" />
                                </button>
                                <button
                                  onClick={() => handleCourseStatusToggle(c.id, c.is_published)}
                                  className={`p-1.5 rounded-lg border hover:scale-105 transition-all cursor-pointer ${
                                    c.is_published
                                      ? 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20'
                                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                  }`}
                                  title={c.is_published ? 'Reject & Unpublish' : 'Approve & Publish'}
                                >
                                  {c.is_published ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                </button>
                                <button
                                  onClick={() => handleCourseDelete(c.id)}
                                  className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 hover:scale-105 transition-all cursor-pointer"
                                  title="Delete Course"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
{activeTab === 'settings' && settings && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">System Settings & Configs</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Configure global announcements, maintenance toggles, and SMTP credentials.</p>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6 max-w-3xl">
                {/* Announcements */}
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase font-bold">System-wide Banner Announcement</label>
                  <input
                    type="text"
                    value={settings.announcement}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#EF4444]/40"
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white/2">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold">System Maintenance Mode</h4>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">Lock down public access to course players and live classrooms.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="w-6 h-6 border-neutral-200 dark:border-neutral-800 rounded outline-none accent-[#EF4444] cursor-pointer"
                  />
                </div>

                {/* Feature flags */}
                <div className="space-y-3">
                  <h4 className="text-xs text-neutral-400 dark:text-neutral-500 uppercase font-bold tracking-wider">Feature Flags</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'aiTutor', label: 'AI Tutor Widget' },
                      { id: 'blockchainCertificates', label: 'Blockchain certificates' },
                      { id: 'liveClassrooms', label: 'Live class integration' },
                    ].map((f) => (
                      <div key={f.id} className="p-3 bg-white/3 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-semibold">{f.label}</span>
                        <input
                          type="checkbox"
                          checked={settings.featureFlags[f.id]}
                          onChange={(e) => setSettings({
                            ...settings,
                            featureFlags: {
                              ...settings.featureFlags,
                              [f.id]: e.target.checked
                            }
                          })}
                          className="w-4 h-4 accent-[#EF4444] cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* SMTP Email Settings */}
                <div className="space-y-3">
                  <h4 className="text-xs text-neutral-400 dark:text-neutral-500 uppercase font-bold tracking-wider">SMTP Email Server Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold">SMTP Server Host</label>
                      <input
                        type="text"
                        value={settings.emailSettings.smtpHost}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailSettings: { ...settings.emailSettings, smtpHost: e.target.value }
                        })}
                        className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#EF4444]/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold">Sender Address</label>
                      <input
                        type="email"
                        value={settings.emailSettings.senderEmail}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailSettings: { ...settings.emailSettings, senderEmail: e.target.value }
                        })}
                        className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#EF4444]/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
                  <button
                    onClick={handleSettingsSave}
                    className="px-6 py-2.5 rounded-xl bg-[#EF4444] text-neutral-900 dark:text-neutral-100 font-bold hover:bg-[#EF4444]/90 transition-colors shadow-lg shadow-[#EF4444]/20 cursor-pointer"
                  >
                    Save Settings Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

</div>
  );
}
