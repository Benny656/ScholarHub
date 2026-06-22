import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  CheckSquare, 
  Video, 
  Calendar, 
  Mail, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  ShieldCheck, 
  Activity,
  ChevronRight,
  User,
  LogOut,
  Award,
} from "lucide-react";
import { Role } from "../../lib/mockData";

interface SidebarProps {
  activeRole: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onLogoClick?: () => void;
}

export default function Sidebar({
  activeRole,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  onLogoClick,
}: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [profileOpen]);

  const handleSettingsClick = () => {
    if (activeRole.id === 'admin') {
      navigate('/admin/settings');
    } else {
      navigate('/settings/notifications');
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleViewProfile = () => {
    setProfileOpen(false);
    navigate('/profile');
  };

  // Role-specific main sections
  const getSidebarItems = () => {
    switch (activeRole.id) {
      case "admin":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "users", label: "User Management", icon: Users },
          { id: "subject-assignment", label: "Subject Assignment", icon: BookOpen },
          { id: "analytics", label: "Platform Analytics", icon: BarChart3 },
          { id: "issue-certificates", label: "Issue Certificates", icon: ShieldCheck },
          { id: "verify-certificates", label: "Certificate Verification", icon: CheckSquare },
          { id: "settings", label: "System Settings", icon: Settings },
        ];
      case "k12-teacher":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "my-classes", label: "My Classes", icon: Users },
          { id: "attendance", label: "Daily Attendance", icon: Activity },
          { id: "assignments-grading", label: "Assignments & Grading", icon: CheckSquare },
          { id: "report-cards", label: "Report Cards", icon: Award },
          { id: "timetable", label: "Timetable", icon: Calendar },
          { id: "issue-certificates", label: "Issue Certificates", icon: ShieldCheck },
          { id: "verify-certificates", label: "Certificate Verification", icon: CheckSquare },
        ];
      case "teacher": // uni teacher
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "course-management", label: "Course Management", icon: BookOpen },
          { id: "student-roster", label: "Student Roster", icon: Users },
          { id: "question-banks", label: "Assignments & Question Banks", icon: CheckSquare },
          { id: "exam-scheduling", label: "Exam Scheduling", icon: Calendar },
          { id: "attendance", label: "Session Attendance", icon: Activity },
          { id: "live", label: "Live Classroom", icon: Video },
          { id: "issue-certificates", label: "Issue Certificates", icon: ShieldCheck },
          { id: "verify-certificates", label: "Certificate Verification", icon: CheckSquare },
        ];
      case "school-student": // k12 student
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "subjects", label: "Subjects", icon: BookOpen },
          { id: "homework", label: "Homework & Assignments", icon: CheckSquare },
          { id: "attendance", label: "Attendance", icon: Activity },
          { id: "timetable", label: "Class Timetable", icon: Calendar },
          { id: "report-card", label: "Report Card", icon: Award },
          { id: "messages", label: "Messages", icon: Mail },
          { id: "certificates", label: "Certificates", icon: ShieldCheck },
        ];
      default: // uni student
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "courses", label: "Course Catalog", icon: BookOpen },
          { id: "my-courses", label: "My Courses", icon: BookOpen },
          { id: "assignments", label: "Assignments & Quizzes", icon: CheckSquare },
          { id: "attendance", label: "Attendance", icon: Activity },
          { id: "exam-calendar", label: "Exam Calendar", icon: Calendar },
          { id: "grades-gpa", label: "Grades & GPA", icon: Award },
          { id: "messages", label: "Messages", icon: Mail },
          { id: "certificates", label: "Certificates", icon: ShieldCheck },
          { id: "live", label: "Live Classroom", icon: Video },
        ];
    }
  };

  const menuItems = getSidebarItems();

  return (
    <aside className="h-screen w-72 border-r border-[var(--outline-variant)] bg-[var(--surface)] p-6 flex flex-col shrink-0 transition-colors duration-200">
      {/* Brand Header */}
      <div className="shrink-0 mb-8">
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-3 text-left w-full hover:opacity-80 active:scale-98 transition-all group"
        >
          <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-250">
            <img 
              src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"} 
              alt="Scholar Hub Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl tracking-tight text-[#0e100f] dark:text-[#E1DCC9] group-hover:text-brand-primary transition-colors duration-250">
              Scholar <span className="text-brand-primary font-sans font-semibold group-hover:text-[#0e100f] dark:group-hover:text-[#E1DCC9] transition-colors duration-250">Hub</span>
            </h1>
            <p className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] capitalize">
              {activeRole.id === "admin" ? "Admin Management" : (activeRole.id === "teacher" || activeRole.id === "k12-teacher") ? "Educator Workspace" : "University Platform"}
            </p>
          </div>
        </button>
      </div>

      {/* Dynamic Navigation Menu */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? "text-brand-primary bg-[#FFFCE1]/80 dark:bg-[#412D15] dark:text-brand-primary font-semibold"
                    : "text-[#7c7c6f] hover:bg-[#FFFCE1] dark:text-[#7c7c6f] dark:hover:bg-[#412D15]/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-primary rounded-r-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 ${isActive ? "text-brand-primary" : "text-[#7c7c6f] dark:text-[#7c7c6f]"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      {/* Footer Options */}
      <div className="space-y-5 pt-6 border-t border-[#E1DCC9]/60 dark:border-[#412D15] shrink-0">
        
        {/* Helper Links */}
        <div className="space-y-3">
          <button 
            onClick={() => setActiveTab("help")}
            className="w-full flex items-center gap-3 px-4 text-sm font-medium text-[#7c7c6f] hover:text-brand-primary transition-colors dark:text-[#7c7c6f] dark:hover:text-neutral-200"
          >
            <HelpCircle className="w-5 h-5 text-[#7c7c6f]" />
            <span>Help Center</span>
          </button>
          
          <button 
            onClick={handleSettingsClick}
            className="w-full flex items-center gap-3 px-4 text-sm font-medium text-[#7c7c6f] hover:text-brand-primary transition-colors dark:text-[#7c7c6f] dark:hover:text-neutral-200"
          >
            <Settings className="w-5 h-5 text-[#7c7c6f]" />
            <span>Settings</span>
          </button>
        </div>

        {/* Current Active Persona Card — opens profile dropdown */}
        <div ref={profileRef} className="relative">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setProfileOpen(prev => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setProfileOpen(prev => !prev);
              }
            }}
            aria-label="Open profile menu"
            className="p-3 bg-[#FFFCE1] dark:bg-[#412D15]/20 hover:bg-[#FFFCE1] dark:hover:bg-[#412D15]/40 rounded-xl flex items-center gap-3 cursor-pointer group transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none"
          >
            <img
              src={activeRole.avatar}
              alt={activeRole.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-brand-primary/20 bg-[#FFFCE1] group-hover:border-brand-primary transition-all duration-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#0e100f] dark:text-neutral-200 truncate leading-tight group-hover:text-brand-primary transition-all duration-200">
                {activeRole.name}
              </p>
              <p className="text-[10px] text-[#7c7c6f] dark:text-[#7c7c6f] truncate mt-0.5">
                {activeRole.badge}
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 text-[#7c7c6f] group-hover:text-brand-primary transition-all duration-200 shrink-0 ${profileOpen ? 'rotate-90' : ''}`} />
          </div>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-xl shadow-xl overflow-hidden z-50"
              >
                {/* Dropdown Header */}
                <div className="px-4 py-3 border-b border-[#E1DCC9]/20 dark:border-[#412D15]">
                  <p className="text-xs font-bold text-[#0e100f] dark:text-neutral-200 truncate">{activeRole.name}</p>
                  <p className="text-[10px] text-[#7c7c6f] mt-0.5 truncate">{activeRole.badge}</p>
                </div>
                {/* View Profile */}
                <button
                  onClick={handleViewProfile}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#7c7c6f] dark:text-[#7c7c6f] hover:bg-[#FFFCE1] dark:hover:bg-[#412D15] transition-colors"
                >
                  <User className="w-4 h-4 text-[#7c7c6f]" />
                  View Profile
                </button>
                {/* Divider */}
                <div className="border-t border-[#E1DCC9]/20 dark:border-[#412D15]" />
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 dark:text-red-500 hover:bg-red-500 dark:hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </aside>
  );
}
