import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import MobileNavigation from '../components/layout/MobileNavigation';
import { 
  BookOpen, 
  CheckSquare, 
  Settings, 
  LayoutDashboard, 
  Calendar, 
  Mail, 
  User, 
  ShieldCheck, 
  CreditCard, 
  Activity, 
  Users, 
  Video, 
  BrainCircuit, 
  BarChart3,
  Award,
  Volume2
} from 'lucide-react';
import { getDashboardPath } from '../services/auth.service';
import { useNotifications } from '../services/notification.service';

export function V2DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { theme, toggleTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  const isK12Student = user.role === 'student' && user.gradeLevel?.toLowerCase().startsWith('k12');
  const isK12Teacher = user.role === 'teacher' && (user.teacherTrack === 'k12' || user.gradeLevel?.toLowerCase().startsWith('k12'));

  // Custom user mapped to V2 Role interface
  const activeRole = {
    id: user.role === 'teacher' 
      ? (isK12Teacher ? 'k12-teacher' : 'teacher')
      : user.role === 'student' 
        ? (isK12Student ? 'school-student' : 'unistudents')
        : 'admin',
    name: user.name,
    badge: user.role === 'teacher' ? (isK12Teacher ? 'K-12 TEACHER' : 'COLLEGE TEACHER') :
           user.role === 'student' ? (isK12Student ? 'SCHOOL STUDENT' : 'UNIVERSITY STUDENT') : 'ADMIN',
    avatar: user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name),
    roleType: user.role
  };

  // Derive active tab from location pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  let activeTab = 'dashboard';
  if (pathParts.length > 0) {
    if (['admin', 'unistudents', 'school-student', 'teacher', 'k12-teacher'].includes(pathParts[0]) && pathParts.length > 1) {
      activeTab = pathParts[1];
    } else {
      activeTab = pathParts[0];
    }
  }

  const handleSetActiveTab = (tabId: string) => {
    // If it's admin role, navigate within /admin/...
    if (user.role === 'admin') {
      navigate(`/admin/${tabId}`);
      return;
    }

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
      if (user.role === 'teacher') basePath = isK12Teacher ? '/k12-teacher' : '/teacher';
      else if (user.role === 'student') basePath = isK12Student ? '/school-student' : '/unistudents';
      
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

  const getMenuItems = () => {
    switch (activeRole.id) {
      case "admin":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "users", label: "User Management", icon: Users },
          { id: "course-approvals", label: "Course Approvals", icon: CheckSquare },
          { id: "platform-analytics", label: "Platform Analytics", icon: BarChart3 },
          { id: "revenue-analytics", label: "Revenue Analytics", icon: CreditCard },
          { id: "system-settings", label: "System Settings", icon: Settings },
        ];
      case "k12-teacher":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "my-classes", label: "My Classes", icon: Users },
          { id: "daily-attendance", label: "Daily Attendance", icon: Activity },
          { id: "assignments-grading", label: "Assignments & Grading", icon: CheckSquare },
          { id: "report-cards", label: "Report Cards", icon: Award },
          { id: "timetable", label: "Timetable", icon: Calendar },
          { id: "parent-communication", label: "Parent Communication", icon: Mail },
          { id: "announcements", label: "Announcements", icon: Volume2 },
        ];
      case "teacher": // uni teacher
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "course-management", label: "Course Management", icon: BookOpen },
          { id: "student-roster", label: "Student Roster", icon: Users },
          { id: "question-banks", label: "Assignments & Question Banks", icon: CheckSquare },
          { id: "exam-scheduling", label: "Exam Scheduling", icon: Calendar },
          { id: "session-attendance", label: "Session Attendance", icon: Activity },
          { id: "live", label: "Live Classroom", icon: Video },
          { id: "course-analytics", label: "Course Analytics", icon: BarChart3 },
          { id: "issue-certificates", label: "Issue Certificates", icon: ShieldCheck },
        ];
      case "school-student": // k12 student
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "subjects", label: "Subjects", icon: BookOpen },
          { id: "homework", label: "Homework & Assignments", icon: CheckSquare },
          { id: "attendance", label: "Attendance", icon: Activity },
          { id: "timetable", label: "Class Timetable", icon: Calendar },
          { id: "report-card", label: "Report Card", icon: Award },
          { id: "ai-tutor", label: "AI Tutor", icon: BrainCircuit },
          { id: "messages", label: "Messages", icon: Mail },
          { id: "certificates", label: "Certificates", icon: ShieldCheck },
        ];
      default: // uni student
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "courses", label: "Course Catalog", icon: BookOpen },
          { id: "peer-hub", label: "Peer Hub", icon: Users },
          { id: "my-courses", label: "My Courses", icon: BookOpen },
          { id: "assignments", label: "Assignments & Quizzes", icon: CheckSquare },
          { id: "attendance", label: "Attendance", icon: Activity },
          { id: "exam-calendar", label: "Exam Calendar", icon: Calendar },
          { id: "grades-gpa", label: "Grades & GPA", icon: Award },
          { id: "ai-tutor", label: "AI Tutor", icon: BrainCircuit },
          { id: "messages", label: "Messages", icon: Mail },
          { id: "certificates", label: "Certificates", icon: ShieldCheck },
          { id: "live", label: "Live Classroom", icon: Video },
          { id: "progress-analytics", label: "Progress Analytics", icon: BarChart3 },
        ];
    }
  };

  // Real notifications
  const { unreadCount: unreadNotificationsCount } = useNotifications(user?.id);

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
          menuItems={getMenuItems()}
          notificationCount={unreadNotificationsCount}
          onOpenNotifications={() => setNotificationsOpen(!notificationsOpen)}
          onLogoClick={handleLogoClick}
        />

        {/* Desktop top navbar header */}
        <Navbar 
          activeRole={activeRole} 
          theme={theme} 
          toggleTheme={toggleTheme} 
          onHomeClick={handleLogoClick}
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
