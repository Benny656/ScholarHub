import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AIChatbot } from '../components/ai/AIChatbot';
import {
  LayoutDashboard, BookOpen, Users, BarChart3, Calendar,
  MessageSquare, ClipboardList, GraduationCap, Award,
  User, Settings, LogOut, Bell, Menu, X, ChevronDown,
  Mic, Video, Shield, BookMarked,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/student/dashboard', roles: ['student'] },
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/teacher/dashboard', roles: ['teacher'] },
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin/dashboard', roles: ['admin'] },
  { label: 'Courses', icon: <BookOpen size={18} />, path: '/courses', roles: ['student', 'teacher', 'admin'] },
  { label: 'Live Class', icon: <Video size={18} />, path: '/classroom/cl1', roles: ['student', 'teacher'] },
  { label: 'Assignments', icon: <ClipboardList size={18} />, path: '/assignments', roles: ['student', 'teacher'] },
  { label: 'Attendance', icon: <Users size={18} />, path: '/attendance', roles: ['student', 'teacher'] },
  { label: 'Messages', icon: <MessageSquare size={18} />, path: '/messages', roles: ['student', 'teacher', 'admin'] },
  { label: 'Analytics', icon: <BarChart3 size={18} />, path: '/analytics', roles: ['student', 'teacher', 'admin'] },
  { label: 'Calendar', icon: <Calendar size={18} />, path: '/calendar', roles: ['student', 'teacher'] },
  { label: 'Certificates', icon: <Award size={18} />, path: '/certificates', roles: ['student'] },
  { label: 'Users', icon: <Users size={18} />, path: '/admin/users', roles: ['admin'] },
  { label: 'System', icon: <Shield size={18} />, path: '/admin/system', roles: ['admin'] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const role = user?.role ?? 'student';
  const filteredNav = NAV_ITEMS.filter(n => n.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => { setNotifOpen(false); setProfileOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const sidebarWidth = sidebarOpen ? 240 : 72;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0b1326' }}>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col flex-shrink-0 h-full border-r border-white/5 overflow-hidden"
        style={{ background: 'rgba(13,18,40,0.98)', width: sidebarWidth }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <BookMarked size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg text-white whitespace-nowrap"
                style={{ fontFamily: 'Geist, Inter, sans-serif' }}
              >
                NexLearn
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-purple-400' : 'group-hover:text-purple-400'} transition-colors`}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r bg-purple-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/5">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center h-10 border-t border-white/5 text-slate-500 hover:text-white transition-colors"
        >
          <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
            <ChevronDown size={16} className="-rotate-90" />
          </motion.div>
        </button>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden flex flex-col"
              style={{ background: 'rgba(13,18,40,0.99)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <BookMarked size={18} className="text-white" />
                  </div>
                  <span className="font-bold text-lg text-white">NexLearn</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-2">
                {filteredNav.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all ${
                        isActive ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header
          className="flex-shrink-0 h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5"
          style={{ background: 'rgba(11,19,38,0.95)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-white capitalize" style={{ fontFamily: 'Geist, sans-serif' }}>
                {location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </h2>
              <p className="text-xs text-slate-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                    style={{ background: 'rgba(13,20,45,0.98)', backdropFilter: 'blur(20px)' }}
                  >
                    <div className="p-4 border-b border-white/5">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    </div>
                    {[
                      { icon: '✅', title: 'Assignment Graded', msg: 'UX Research: 87/100', time: '30m ago', color: 'text-emerald-400' },
                      { icon: '💬', title: 'New Message', msg: 'Dr. Chen sent you a message', time: '1h ago', color: 'text-blue-400' },
                      { icon: '⚠️', title: 'Due Soon', msg: 'React Assignment due in 3 days', time: '2h ago', color: 'text-yellow-400' },
                      { icon: '🎓', title: 'Certificate Ready', msg: "UI/UX Design Masterclass complete!", time: '5h ago', color: 'text-purple-400' },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors">
                        <span className="text-lg flex-shrink-0">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${n.color}`}>{n.title}</p>
                          <p className="text-xs text-slate-400 truncate">{n.msg}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                    <Link to="/messages" onClick={() => setNotifOpen(false)} className="block p-3 text-center text-xs text-purple-400 hover:text-purple-300 border-t border-white/5 transition-colors">
                      View all notifications
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0] || 'U'}
                </div>
                <span className="hidden sm:block text-sm text-white font-medium">{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                    style={{ background: 'rgba(13,20,45,0.98)', backdropFilter: 'blur(20px)' }}
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm">
                        <User size={15} /> Profile
                      </Link>
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm">
                        <Settings size={15} /> Settings
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm">
                        <LogOut size={15} /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* AI Chatbot floating widget */}
      <AIChatbot />
    </div>
  );
}
