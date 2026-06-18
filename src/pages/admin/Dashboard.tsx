import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, Activity, UserPlus, IndianRupee, Zap, 
  ArrowRight, ShieldAlert, AlertTriangle, Play, Settings, Clock, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getSystemStats, getAdminLogs, getUsersList } from '../../services/admin.service';
import { ProctoringDashboard } from '../../components/features/ProctoringDashboard';
import { BlockchainVerification } from '../../components/features/BlockchainVerification';
import { AnnouncementsWidget } from '../../components/dashboard/AnnouncementsWidget';

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // States
  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeLiveSessions, setActiveLiveSessions] = useState<any[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, logsData] = await Promise.all([
        getSystemStats(),
        getUsersList(),
        getAdminLogs(),
        supabase
          .from('live_sessions')
          .select(`
            id,
            course_id,
            teacher_id,
            meeting_room_id,
            status,
            started_at,
            courses (
              id,
              title
            ),
            users:teacher_id (
              full_name
            )
          `)
          .eq('status', 'LIVE')
          .then(({ data, error }) => {
            if (!error) setActiveLiveSessions(data || []);
            return data || [];
          })
      ]);
      setStats(statsData);
      setRecentUsers((usersData || []).slice(0, 5));
      setLogs((logsData || []).slice(0, 5));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrative overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // Simulated system health alerts
  const systemAlerts = [
    { id: 1, message: 'JWT Token Service active with 0 security exceptions.', type: 'info' },
    { id: 2, message: 'Supabase DB latency averages 12ms (Operational).', type: 'info' },
    { id: 3, message: 'Jitsi Classroom Video CDN latency: 45ms.', type: 'info' }
  ];

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans space-y-8">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-2">
            Executive Summary
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
            Monitor students, educators, course catalogues, and operational integrity from a unified platform overview.
          </p>
        </div>
        
        {/* Quick Actions Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Link 
            to="/admin/users" 
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-950 dark:text-neutral-100 rounded-lg text-xs font-semibold transition-all border border-transparent dark:border-neutral-700"
          >
            <UserPlus size={13} /> Manage Users
          </Link>
          <Link 
            to="/admin/courses" 
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-950 dark:text-neutral-100 rounded-lg text-xs font-semibold transition-all border border-transparent dark:border-neutral-700"
          >
            <BookOpen size={13} /> Manage Courses
          </Link>
          <Link 
            to="/admin/subject-assignment" 
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-950 dark:text-neutral-100 rounded-lg text-xs font-semibold transition-all border border-transparent dark:border-neutral-700"
          >
            <BookOpen size={13} /> Subject Assignment
          </Link>
          <Link 
            to="/admin/settings" 
            className="flex items-center gap-2 px-3.5 py-2 bg-brand-primary text-neutral-900 dark:text-neutral-100 hover:bg-brand-primary/95 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Settings size={13} /> Platform Settings
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-500">Retrieving platform stats...</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Stats KPI Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Platform Users', value: stats?.totalUsers || '0', icon: Users, subtitle: 'Students & Teachers' },
              { label: 'Active Live Classes', value: stats?.activeSessions || '0', icon: Activity, subtitle: 'Virtual Jitsi classrooms' },
              { label: 'Total Courses Offered', value: stats?.totalCourses || '0', icon: BookOpen, subtitle: 'Curriculum catalog' },
              { label: 'Gross Revenue', value: `₹${stats?.revenue?.toLocaleString() || '0'}`, icon: IndianRupee, subtitle: 'Captured payments' },
            ].map((stat, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants} 
                className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                  <stat.icon size={15} className="text-brand-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mt-1">
                  {stat.value}
                </div>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">{stat.subtitle}</span>
              </motion.div>
            ))}
          </div>

          {/* Quick Nav Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { title: 'User Directory', desc: 'Audit accounts & assign roles', to: '/admin/users', icon: Users },
              { title: 'Course Catalog', desc: 'Publish, Feature or Archive courses', to: '/admin/courses', icon: BookOpen },
              { title: 'Subject Assignment', desc: 'Create & assign K-12 subjects to teachers', to: '/admin/subject-assignment', icon: BookOpen },
              { title: 'Telemetry Analytics', desc: 'Aggregated attendance & completion metrics', to: '/admin/analytics', icon: BarChart3 },
              { title: 'System Settings', desc: 'SMTP, announcements & maintenance mode', to: '/admin/settings', icon: Settings },
            ].map((card, idx) => (
              <Link 
                key={idx} 
                to={card.to}
                className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200/50 hover:border-brand-primary dark:border-neutral-800 dark:hover:border-brand-primary rounded-xl flex flex-col justify-between group transition-all duration-200 hover:shadow-md shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-brand-primary transition-all">
                      {card.title}
                    </span>
                    <card.icon size={16} className="text-neutral-400 group-hover:text-brand-primary transition-all" />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">{card.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-primary mt-4 opacity-75 group-hover:opacity-100 transition-all uppercase tracking-wider">
                  Open Tab <ArrowRight size={10} />
                </div>
              </Link>
            ))}
          </div>

          {/* Main Dashboard Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Workspace Area (2 Columns) */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              
              {/* Active Live Sessions */}
              {activeLiveSessions.length > 0 && (
                <motion.div variants={itemVariants} className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800/50 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-red-200 dark:border-red-800/50 flex items-center justify-between bg-red-100/30 dark:bg-red-900/30">
                    <h3 className="text-xs font-bold text-red-900 dark:text-red-200 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                      Active Live Classes
                    </h3>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded">{activeLiveSessions.length} live</span>
                  </div>
                  <div className="divide-y divide-red-100 dark:divide-red-800/30">
                    {activeLiveSessions.map((session) => (
                      <div key={session.id} className="p-4 flex items-center justify-between gap-3 hover:bg-red-100/20 dark:hover:bg-red-900/10 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{session.courses?.title}</p>
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-0.5">Teacher: {session.users?.full_name || 'Teacher'} • Started {Math.floor((Date.now() - new Date(session.started_at).getTime()) / 60000)}m ago</p>
                        </div>
                        <Link to={`/classroom/${session.course_id}`} className="flex-shrink-0">
                          <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors whitespace-nowrap">
                            Join
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Recent Signups list */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-neutral-150 dark:border-neutral-850 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                  <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Recent Registrations</h3>
                  <Link to="/admin/users" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                    Manage Directory <ArrowRight size={11} />
                  </Link>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-850">
                  {recentUsers.length === 0 ? (
                    <p className="p-6 text-center text-xs text-neutral-500">No recent registrants found.</p>
                  ) : (
                    recentUsers.map((u) => (
                      <div key={u.id} className="p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/30 dark:hover:bg-neutral-800/10 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{u.name || 'Anonymous'}</p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{u.email} • {u.role?.toUpperCase() || 'STUDENT'}</p>
                        </div>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase border ${
                          u.status === 'suspended'
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                        }`}>
                          {u.status || 'active'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Security & Proctoring Widgets */}
              <motion.div variants={itemVariants}>
                <ProctoringDashboard role="admin" />
              </motion.div>

              <motion.div variants={itemVariants}>
                <BlockchainVerification role="admin" />
              </motion.div>

            </div>

            {/* Right Sidebar Area (1 Column) */}
            <div className="space-y-6 lg:space-y-8">
              
              <div className="h-[350px]">
                <AnnouncementsWidget theme="sleek" />
              </div>

              {/* Platform Health and Alerts */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-neutral-150 dark:border-neutral-850 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                  <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">System Health Logs</h3>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="flex gap-2.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-850 border border-neutral-150 dark:border-neutral-800">
                      <Zap size={14} className="text-brand-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-snug">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Admin Activity Log */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-neutral-150 dark:border-neutral-850 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                  <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={13} className="text-neutral-450" /> Admin Audit Logs
                  </h3>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-850">
                  {logs.length === 0 ? (
                    <p className="p-5 text-center text-xs text-neutral-500">No logged administrative actions.</p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="p-4 space-y-1 hover:bg-neutral-50/20 dark:hover:bg-neutral-800/5 transition-colors">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                          {log.action}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1">
                          <span>By: {log.users?.name || 'Admin'}</span>
                          <span>{new Date(log.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
