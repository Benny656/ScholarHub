import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AIChatbot } from '../components/ai/AIChatbot';
import {
  LayoutDashboard, BookOpen, Users, BarChart3, Calendar,
  MessageSquare, ClipboardList, GraduationCap, Award,
  User, Settings, LogOut, Bell, Menu, X, ChevronDown,
  Mic, Video, Shield, BookMarked, Moon, Sun, Home,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: <Home size={18} />, path: '/', roles: ['student', 'teacher', 'admin'] },
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
  const { toggle } = useTheme();
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

  const currentAccent = location.pathname.includes('/student') ? '#6366F1' :
                        location.pathname.includes('/teacher') ? '#0D9488' :
                        location.pathname.includes('/admin') ? '#F59E0B' : 'var(--color-primary)';

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => { setNotifOpen(false); setProfileOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const sidebarWidth = sidebarOpen ? 240 : 72;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface transition-colors duration-500" style={{ '--sidebar-accent': currentAccent, background: 'var(--color-background)' } as React.CSSProperties}>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col flex-shrink-0 h-full border-r border-outline-variant/10 overflow-hidden"
        style={{ background: 'var(--color-surface)', width: sidebarWidth }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-4 py-5 border-b border-outline-variant/10 hover:bg-on-surface/5 transition-colors cursor-pointer">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <img src="/logo-dark.png" alt="ScholarHub Logo" className="w-full h-full object-contain hidden dark:block" />
            <img src="/logo-light.png" alt="ScholarHub Logo" className="w-full h-full object-contain block dark:hidden" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg text-on-surface whitespace-nowrap"
                style={{ fontFamily: 'Geist, Inter, sans-serif' }}
              >
                ScholarHub
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

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
                    ? ''
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5'
                }`}
                style={isActive ? { background: 'color-mix(in srgb, var(--sidebar-accent) 20%, transparent)', color: 'var(--sidebar-accent)' } : {}}
              >
                <span className={`flex-shrink-0 transition-colors`}>
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
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
                    style={{ background: 'var(--sidebar-accent)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-outline-variant/10">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{user?.name}</p>
                  <p className="text-xs text-on-surface-variant capitalize">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center h-10 border-t border-outline-variant/10 text-on-surface-variant hover:text-on-surface transition-colors"
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
              style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-outline-variant)' }}
            >
              <div className="flex items-center justify-between px-4 py-5 border-b border-outline-variant/10">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img src="/logo-dark.png" alt="ScholarHub Logo" className="w-full h-full object-contain hidden dark:block" />
                    <img src="/logo-light.png" alt="ScholarHub Logo" className="w-full h-full object-contain block dark:hidden" />
                  </div>
                  <span className="font-bold text-lg text-on-surface">ScholarHub</span>
                </Link>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-on-surface-variant hover:text-on-surface">
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
                        isActive ? '' : 'text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5'
                      }`}
                      style={isActive ? { background: 'color-mix(in srgb, var(--sidebar-accent) 20%, transparent)', color: 'var(--sidebar-accent)' } : {}}
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
          className="flex-shrink-0 h-16 flex items-center justify-between px-4 md:px-6 border-b border-outline-variant/10"
          style={{ background: 'color-mix(in srgb, var(--color-surface) 95%, transparent)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-on-surface capitalize" style={{ fontFamily: 'Geist, sans-serif' }}>
                {location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </h2>
              <p className="text-xs text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-all"
              aria-label="Toggle theme"
            >
              <Moon className="w-5 h-5 dark:hidden" />
              <Sun className="w-5 h-5 hidden dark:block" />
            </button>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-all"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-surface" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden z-50 glass"
                    style={{ background: 'var(--color-surface)' }}
                  >
                    <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
                      <h3 className="font-bold text-on-surface">Notifications</h3>
                      <button className="text-xs text-[#6366F1] hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 border-b border-outline-variant/10 hover:bg-on-surface/5 transition-colors cursor-pointer">
                          <p className="text-sm text-on-surface mb-1">New assignment posted in Web Dev</p>
                          <p className="text-xs text-on-surface-variant">2 hours ago</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-on-surface/5 transition-all border border-transparent hover:border-outline-variant/10"
              >
                <span className="text-sm font-medium text-on-surface hidden sm:block">{user?.name?.split(' ')[0]}</span>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user?.name?.[0] || 'U'}
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden z-50 glass"
                    style={{ background: 'var(--color-surface)' }}
                  >
                    <div className="p-4 border-b border-outline-variant/10">
                      <p className="font-bold text-on-surface truncate">{user?.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile" className="flex items-center gap-3 w-full px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 rounded-xl transition-all">
                        <User size={16} /> Profile
                      </Link>
                      <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 rounded-xl transition-all">
                        <Settings size={16} /> Settings
                      </button>
                    </div>
                    <div className="p-2 border-t border-outline-variant/10">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut size={16} /> Sign out
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
