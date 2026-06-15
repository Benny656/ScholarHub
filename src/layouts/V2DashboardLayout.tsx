import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import MobileNavigation from '../components/layout/MobileNavigation';
import { BookOpen, CheckSquare, Settings } from 'lucide-react';
import { getDashboardPath } from '../services/auth.service';

export function V2DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { theme, toggleTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  // Custom user mapped to V2 Role interface
  const activeRole = {
    id: user.role === 'teacher' 
      ? (user.teacherTrack === 'k12' ? 'k12-teacher' : 'teacher')
      : user.role === 'student' 
        ? (user.gradeLevel === 'k12' ? 'school-student' : 'unistudents')
        : 'admin',
    name: user.name,
    badge: user.role === 'teacher' ? (user.teacherTrack === 'k12' ? 'K-12 TEACHER' : 'COLLEGE TEACHER') :
           user.role === 'student' ? (user.gradeLevel === 'k12' ? 'SCHOOL STUDENT' : 'UNIVERSITY STUDENT') : 'ADMIN',
    avatar: user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name),
    roleType: user.role
  };

  // Derive active tab from location pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts.length > 1 ? pathParts[1] : 'dashboard'; // e.g. /student/courses -> 'courses'

  const handleSetActiveTab = (tabId: string) => {
    // If it's a generic settings or help link, navigate to common route or handle it
    if (tabId === 'settings') {
      navigate('/profile');
    } else if (tabId === 'help') {
      navigate('/messages');
    } else if (tabId === 'live') {
      navigate('/classroom/general');
    } else {
      // Navigate based on user role base path
      let basePath = '';
      if (user.role === 'admin') basePath = '/admin';
      else if (user.role === 'teacher') basePath = user.teacherTrack === 'k12' ? '/k12-teacher' : '/teacher';
      else if (user.role === 'student') basePath = user.gradeLevel === 'k12' ? '/school-student' : '/unistudents';
      
      if (tabId === 'dashboard') {
        navigate(`${basePath}/dashboard`);
      } else {
        navigate(`/${tabId}`);
      }
    }
  };

  const handleLogoClick = () => {
    navigate(getDashboardPath(user));
  };

  // Mock notifications
  const unreadNotificationsCount = 2;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 w-full">
      
      {/* Desktop Left navigation Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          activeRole={activeRole as any}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogoClick={handleLogoClick}
        />
      </div>

      {/* Right container workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile top stick header */}
        <MobileNavigation
          activeRole={activeRole as any}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          theme={theme}
          toggleTheme={toggleTheme}
          menuItems={[
            { id: "dashboard", label: "Dashboard", icon: BookOpen },
            { id: "courses", label: "My Courses", icon: BookOpen },
            { id: "assignments", label: "Assignments", icon: CheckSquare },
            ...(user.role === "admin" ? [{ id: "security", label: "Security auditing", icon: Settings }] : [])
          ]}
          notificationCount={unreadNotificationsCount}
          onOpenNotifications={() => setNotificationsOpen(!notificationsOpen)}
          onLogoClick={handleLogoClick}
        />

        {/* Desktop top navbar header */}
        <Navbar
          activeRole={activeRole as any}
          theme={theme}
          toggleTheme={toggleTheme}
          notificationCount={unreadNotificationsCount}
          onOpenNotifications={() => setNotificationsOpen(!notificationsOpen)}
        />

        {/* Dynamic scroll main panel area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-neutral-50/50 dark:bg-neutral-900/40 custom-scrollbar relative">
          
          <AnimatePresence mode="wait">
             <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                {children}
             </motion.div>
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
