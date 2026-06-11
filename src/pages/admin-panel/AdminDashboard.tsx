import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Shield,
  LogOut,
  Search,
  Download,
  AlertOctagon,
  Settings,
  PieChart as PieIcon,
  HelpCircle,
  Building,
  Bell,
  CheckCircle,
  XCircle,
  Trash2,
  Lock,
  Unlock,
  Star,
  Activity,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout().then(() => {
      toast.success('Logged out from admin console.');
      navigate('/scholar-hub-admin-panel/login');
    });
  };

  // CSV Export for Users
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'User Type', 'Institution/School', 'Status', 'Joined At'];
    const rows = users.map((u) => [
      u.id,
      u.name || '',
      u.email || '',
      u.role || '',
      u.user_type || '',
      u.school_name || u.institution || '',
      u.status || 'active',
      u.created_at || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scholarhub_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction(user!.id, 'Exported users table to CSV');
  };

  // Filtering Computations
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus =
      userStatusFilter === 'all' ||
      (userStatusFilter === 'active' && u.status !== 'suspended') ||
      (userStatusFilter === 'suspended' && u.status === 'suspended');
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage
  );

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title && c.title.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesStatus =
      courseStatusFilter === 'all' ||
      (courseStatusFilter === 'published' && c.is_published) ||
      (courseStatusFilter === 'draft' && !c.is_published);
    return matchesSearch && matchesStatus;
  });

  const paginatedCourses = filteredCourses.slice(
    (coursePage - 1) * itemsPerPage,
    coursePage * itemsPerPage
  );

  const COLORS = ['#EF4444', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'];

  if (loading && !stats) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#151315]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EF4444]/20 border-t-[#EF4444]" />
          <p className="text-sm font-semibold tracking-wide text-white/60">Configuring Admin Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#151315] text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.015] font-black text-[22vw] select-none text-[#EF4444] z-0">
        ADMIN
      </div>

      {/* Admin header */}
      <header className="h-16 border-b border-[#EF4444]/20 bg-surface/80 backdrop-blur-xl px-6 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/35 flex items-center justify-center text-[#EF4444]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide flex items-center gap-2">
              ScholarHub <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20">Console</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold">{user?.name}</span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest">Master Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20 hover:scale-105 transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Body Layout */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 border-r border-[#EF4444]/10 bg-surface/30 p-4 flex flex-col justify-between flex-shrink-0">
          <nav className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-white/40 px-3 mb-2">Management</p>
            {[
              { id: 'overview', label: 'Console Overview', icon: <TrendingUp size={16} /> },
              { id: 'users', label: 'User Directory', icon: <Users size={16} /> },
              { id: 'courses', label: 'Course Catalog', icon: <BookOpen size={16} /> },
              { id: 'analytics', label: 'Data Analytics', icon: <PieIcon size={16} /> },
              { id: 'institutions', label: 'Branding & Institutions', icon: <Building size={16} /> },
              { id: 'settings', label: 'Settings & Configs', icon: <Settings size={16} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#EF4444] text-white shadow-lg shadow-[#EF4444]/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* System details */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-xs font-bold text-white/60 mb-1">
              <Activity className="w-3.5 h-3.5 text-[#EF4444]" />
              System Status
            </div>
            <p className="text-[10px] text-white/40 leading-normal">
              Nodes: Active <br />
              Environment: Production <br />
              MFA Enforcement: Active
            </p>
          </div>
        </aside>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-8 relative min-w-0">
          {activeTab === 'overview' && stats && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Console Overview</h2>
                  <p className="text-sm text-white/60">Live metrics and snapshots of current platform status.</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: <Users size={20} />, change: 'Updated Live' },
                  { label: 'Active Sessions', value: stats.activeSessions, icon: <Activity size={20} />, change: 'Approx. Users' },
                  { label: 'Courses Created', value: stats.totalCourses, icon: <BookOpen size={20} />, change: 'Total catalog' },
                  { label: 'Revenue Generated', value: `₹${stats.revenue.toLocaleString()}`, icon: <DollarSign size={20} />, change: 'Gross Sales' },
                  { label: 'Registrations Today', value: stats.newRegsToday, icon: <Users size={20} />, change: 'Today count' },
                ].map((s, i) => (
                  <div key={i} className="glass rounded-[1.5rem] p-5 border border-white/10 flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-white/50 font-bold uppercase tracking-wider">{s.label}</span>
                      <div className="text-[#EF4444] bg-[#EF4444]/10 p-1.5 rounded-lg border border-[#EF4444]/20">{s.icon}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold tracking-tight text-white mt-1">{s.value}</div>
                      <div className="text-[10px] text-white/40 mt-1">{s.change}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Graph Snapshot */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass rounded-[2rem] border border-white/10 p-6 flex flex-col justify-between h-96">
                  <h3 className="font-bold text-sm text-white/60 mb-4 uppercase tracking-wider">Weekly Revenue Growth</h3>
                  <div className="flex-1 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics?.revenueByDay || []}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                        <Tooltip contentStyle={{ background: '#1c1b1c', border: '1px solid rgba(239,68,68,0.2)', color: '#fff' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass rounded-[2rem] border border-white/10 p-6 flex flex-col justify-between h-96">
                  <h3 className="font-bold text-sm text-white/60 mb-4 uppercase tracking-wider">User Type Distribution</h3>
                  <div className="flex-1 w-full h-full flex justify-center items-center">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'School', value: analytics?.schoolCount || 2 },
                            { name: 'College/Pro', value: analytics?.collegeCount || 5 },
                          ]}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#EF4444" />
                          <Cell fill="#8B5CF6" />
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1c1b1c', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 text-xs font-semibold">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#EF4444] rounded-full" /> School ({analytics?.schoolCount})</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-[#8B5CF6] rounded-full" /> College ({analytics?.collegeCount})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">User Directory</h2>
                  <p className="text-sm text-white/60">Search, manage roles, suspend, or delete user accounts.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    placeholder="Search users by name or email..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-[#EF4444]/40"
                  />
                </div>

                <div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full bg-[#1c1b1c] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none focus:border-[#EF4444]/40"
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
                    className="w-full bg-[#1c1b1c] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none focus:border-[#EF4444]/40"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider">
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
                          <td colSpan={6} className="p-8 text-center text-white/40">No matching user records found.</td>
                        </tr>
                      ) : (
                        paginatedUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="flex flex-col">
                                <span className="font-bold">{u.name || 'Anonymous Learner'}</span>
                                <span className="text-xs text-white/40">{u.email}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <select
                                value={u.role || 'student'}
                                onChange={(e) => handleUserRoleChange(u.id, e.target.value as any)}
                                className="bg-[#1c1b1c] border border-white/10 text-xs rounded px-2 py-1 outline-none text-white focus:border-[#EF4444]/40"
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
                                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 hover:scale-105 transition-all cursor-pointer"
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
                <div className="flex justify-between items-center text-xs text-white/50">
                  <span>Showing {(userPage - 1) * itemsPerPage + 1} to {Math.min(userPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</span>
                  <div className="flex gap-2">
                    <button
                      disabled={userPage === 1}
                      onClick={() => setUserPage((p) => p - 1)}
                      className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <button
                      disabled={userPage * itemsPerPage >= filteredUsers.length}
                      onClick={() => setUserPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
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
                <p className="text-sm text-white/60">Approve, reject, feature, or remove course catalog requests.</p>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => {
                      setCourseSearch(e.target.value);
                      setCoursePage(1);
                    }}
                    placeholder="Search courses by title..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-[#EF4444]/40"
                  />
                </div>

                <div>
                  <select
                    value={courseStatusFilter}
                    onChange={(e) => {
                      setCourseStatusFilter(e.target.value);
                      setCoursePage(1);
                    }}
                    className="w-full bg-[#1c1b1c] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none focus:border-[#EF4444]/40"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Approved & Published</option>
                    <option value="draft">Draft / Rejected</option>
                  </select>
                </div>
              </div>

              {/* Courses Table */}
              <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider">
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
                          <td colSpan={5} className="p-8 text-center text-white/40">No course records found.</td>
                        </tr>
                      ) : (
                        paginatedCourses.map((c) => (
                          <tr key={c.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-8 rounded bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                  {c.thumbnail_url ? (
                                    <img src={c.thumbnail_url} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#EF4444]/20 to-[#8B5CF6]/20" />
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold truncate max-w-[240px]">{c.title || 'Untitled Course'}</span>
                                  <span className="text-[10px] text-white/40 uppercase tracking-widest">{c.category || 'General'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs">{c.users?.name || 'Unknown Instructor'}</span>
                                <span className="text-[10px] text-white/30">{c.users?.email}</span>
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
                                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all cursor-pointer"
                                  title="View Analytics"
                                >
                                  <FileText size={14} />
                                </button>
                                <button
                                  onClick={() => handleCourseFeatureToggle(c.id, false)} // Simulated action
                                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-amber-400 hover:scale-105 transition-all cursor-pointer"
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
                                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 hover:scale-105 transition-all cursor-pointer"
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

          {activeTab === 'analytics' && analytics && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Data Analytics</h2>
                <p className="text-sm text-white/60">Platform-wide traffic, engagement, and revenue charts.</p>
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Users Breakdown */}
                <div className="glass rounded-[2rem] border border-white/10 p-6 h-96 flex flex-col justify-between">
                  <h3 className="font-bold text-sm text-white/60 mb-4 uppercase tracking-wider">Active Users (DAU/WAU/MAU)</h3>
                  <div className="flex-1 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'DAU', count: analytics.dau },
                        { name: 'WAU', count: analytics.wau },
                        { name: 'MAU', count: analytics.mau }
                      ]}>
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                        <Tooltip contentStyle={{ background: '#1c1b1c', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          <Cell fill="#EF4444" />
                          <Cell fill="#8B5CF6" />
                          <Cell fill="#3B82F6" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Course Completion Rate */}
                <div className="glass rounded-[2rem] border border-white/10 p-6 h-96 flex flex-col justify-between">
                  <h3 className="font-bold text-sm text-white/60 mb-4 uppercase tracking-wider">Course Completion Rates (%)</h3>
                  <div className="flex-1 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.completionRates}>
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: '#1c1b1c', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                        <Line type="monotone" dataKey="rate" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'institutions' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Institution Management</h2>
                <p className="text-sm text-white/60">Approve institution tier requests and configure custom branding settings.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Branding controls */}
                <div className="lg:col-span-2 glass rounded-[2rem] border border-white/10 p-6 space-y-4">
                  <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider mb-4">Portal Custom Branding</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-white/50 uppercase font-bold">Portal Logo URL</label>
                      <input
                        type="text"
                        value={brandingLogo}
                        onChange={(e) => setBrandingLogo(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-[#EF4444]/40"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-white/50 uppercase font-bold">Primary Theme Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={brandingPrimaryColor}
                            onChange={(e) => setBrandingPrimaryColor(e.target.value)}
                            className="bg-transparent border-none cursor-pointer w-8 h-8 rounded"
                          />
                          <input
                            type="text"
                            value={brandingPrimaryColor}
                            onChange={(e) => setBrandingPrimaryColor(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white outline-none flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-1 flex flex-col justify-end">
                        <button
                          onClick={() => {
                            logAction(user!.id, 'Updated portal custom branding metadata');
                            toast.success('Custom branding details saved.');
                          }}
                          className="py-2.5 rounded-xl bg-[#EF4444] text-white text-xs font-bold hover:bg-[#EF4444]/90 transition-colors shadow-lg shadow-[#EF4444]/15 cursor-pointer"
                        >
                          Save Branding Config
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Branding Preview */}
                <div className="glass rounded-[2rem] border border-white/10 p-6 flex flex-col justify-between">
                  <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider mb-4">Portal Branding Live Preview</h3>
                  <div className="flex-1 border border-white/10 bg-[#1c1b1c] rounded-2xl p-4 flex flex-col items-center justify-center gap-3">
                    <img src={brandingLogo} alt="Logo" className="h-10 object-contain" onError={(e) => {
                      (e.target as any).src = 'https://scholarhub.io/logo-dark.png';
                    }} />
                    <div className="px-5 py-2 rounded-full text-xs font-bold text-white transition-all shadow-md" style={{ background: brandingPrimaryColor }}>
                      Preview Accent Color
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && settings && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">System Settings & Configs</h2>
                <p className="text-sm text-white/60">Configure global announcements, maintenance toggles, and SMTP credentials.</p>
              </div>

              <div className="glass rounded-[2rem] border border-white/10 p-6 space-y-6 max-w-3xl">
                {/* Announcements */}
                <div className="space-y-1">
                  <label className="text-xs text-white/50 uppercase font-bold">System-wide Banner Announcement</label>
                  <input
                    type="text"
                    value={settings.announcement}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-[#EF4444]/40"
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/2">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold">System Maintenance Mode</h4>
                    <p className="text-xs text-white/40">Lock down public access to course players and live classrooms.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="w-6 h-6 border-white/10 rounded outline-none accent-[#EF4444] cursor-pointer"
                  />
                </div>

                {/* Feature flags */}
                <div className="space-y-3">
                  <h4 className="text-xs text-white/50 uppercase font-bold tracking-wider">Feature Flags</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'aiTutor', label: 'AI Tutor Widget' },
                      { id: 'blockchainCertificates', label: 'Blockchain certificates' },
                      { id: 'liveClassrooms', label: 'Live class integration' },
                    ].map((f) => (
                      <div key={f.id} className="p-3 bg-white/3 border border-white/10 rounded-xl flex items-center justify-between">
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
                  <h4 className="text-xs text-white/50 uppercase font-bold tracking-wider">SMTP Email Server Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">SMTP Server Host</label>
                      <input
                        type="text"
                        value={settings.emailSettings.smtpHost}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailSettings: { ...settings.emailSettings, smtpHost: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-[#EF4444]/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Sender Address</label>
                      <input
                        type="email"
                        value={settings.emailSettings.senderEmail}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailSettings: { ...settings.emailSettings, senderEmail: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-[#EF4444]/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    onClick={handleSettingsSave}
                    className="px-6 py-2.5 rounded-xl bg-[#EF4444] text-white font-bold hover:bg-[#EF4444]/90 transition-colors shadow-lg shadow-[#EF4444]/20 cursor-pointer"
                  >
                    Save Settings Configuration
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Audit Trail Sidebar (Right-side) */}
        <aside className="w-80 border-l border-[#EF4444]/10 bg-surface/30 p-4 flex flex-col overflow-hidden flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-white/60 mb-4 uppercase tracking-wider flex-shrink-0">
            <Activity className="w-4 h-4 text-[#EF4444]" />
            System Audit Trail
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide text-xs">
            {logs.length === 0 ? (
              <p className="text-white/40 text-center py-8">No audit logs logged in current context.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 bg-white/3 border border-white/5 rounded-xl flex flex-col gap-1 hover:border-[#EF4444]/25 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white/80">{log.users?.name || 'Administrator'}</span>
                    <span className="text-[9px] text-white/40">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p className="text-white/60 text-[11px] leading-relaxed">{log.action}</p>
                  {log.target_type && (
                    <span className="text-[9px] text-[#EF4444]/70 mt-1 uppercase font-semibold">
                      Target: {log.target_type} ({log.target_id?.slice(0, 8)})
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 bg-[#151315] border border-white/10 rounded-[2rem] shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] mx-auto border border-[#EF4444]/25">
              <AlertOctagon className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{confirmDialog.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed mt-2">{confirmDialog.description}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`flex-1 py-2 rounded-xl text-white text-xs font-bold cursor-pointer ${
                  confirmDialog.destructive
                    ? 'bg-[#EF4444] hover:bg-[#EF4444]/90'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-Course Analytics Dialog Modal */}
      {selectedCourseAnalytics && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-[#151315] border border-white/10 rounded-[2rem] shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{selectedCourseAnalytics.title}</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Course Analytics Overview</p>
              </div>
              <button
                onClick={() => setSelectedCourseAnalytics(null)}
                className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                <span className="text-[10px] text-white/40 uppercase font-bold">Total Enrollments</span>
                <p className="text-lg font-bold font-mono text-[#EF4444] mt-1">{selectedCourseAnalytics.total_students || 0}</p>
              </div>
              <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                <span className="text-[10px] text-white/40 uppercase font-bold">Course Rating</span>
                <p className="text-lg font-bold font-mono text-emerald-400 mt-1">{selectedCourseAnalytics.rating || 0} ★</p>
              </div>
              <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                <span className="text-[10px] text-white/40 uppercase font-bold">Total Lessons</span>
                <p className="text-lg font-bold font-mono text-indigo-400 mt-1">{selectedCourseAnalytics.total_lessons || 0}</p>
              </div>
              <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                <span className="text-[10px] text-white/40 uppercase font-bold">Estimated Revenue</span>
                <p className="text-lg font-bold font-mono text-amber-500 mt-1">₹{(selectedCourseAnalytics.price * (selectedCourseAnalytics.total_students || 0)).toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedCourseAnalytics(null)}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
