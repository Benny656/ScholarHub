import React from "react";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
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
  BrainCircuit, 
  ShieldCheck, 
  History,
  Activity,
  ChevronRight,
  User,
  Award,
} from "lucide-react";
import { Role, allRoles } from "../../lib/mockData";

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
    <aside className="h-screen w-72 border-r border-neutral-200/80 bg-white p-6 flex flex-col shrink-0 dark:bg-neutral-900 dark:border-neutral-800 transition-colors duration-200">
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
            <h1 className="font-serif font-bold text-xl tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-brand-primary transition-colors duration-250">
              Scholar <span className="text-brand-primary font-sans font-semibold group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors duration-250">Hub</span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
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
                    ? "text-brand-primary bg-neutral-100/80 dark:bg-neutral-800 dark:text-brand-primary font-semibold"
                    : "text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-primary rounded-r-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 ${isActive ? "text-brand-primary" : "text-neutral-400 dark:text-neutral-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      {/* Footer Options */}
      <div className="space-y-5 pt-6 border-t border-neutral-200/60 dark:border-neutral-800 shrink-0">
        
        {/* Helper Links */}
        <div className="space-y-3">
          <button 
            onClick={() => setActiveTab("help")}
            className="w-full flex items-center gap-3 px-4 text-sm font-medium text-neutral-500 hover:text-brand-primary transition-colors dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <HelpCircle className="w-5 h-5 text-neutral-400" />
            <span>Help Center</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("settings")}
            className="w-full flex items-center gap-3 px-4 text-sm font-medium text-neutral-500 hover:text-brand-primary transition-colors dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <Settings className="w-5 h-5 text-neutral-400" />
            <span>Settings</span>
          </button>
        </div>

        {/* Current Active Persona Card */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('settings')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('settings');
            }
          }}
          aria-label="View profile settings"
          className="p-3 bg-neutral-50 dark:bg-neutral-800/20 hover:bg-neutral-100 dark:hover:bg-neutral-800/40 rounded-xl flex items-center gap-3 cursor-pointer group transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none"
        >
          <img
            src={activeRole.avatar}
            alt={activeRole.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-brand-primary/20 bg-neutral-100 group-hover:border-brand-primary transition-all duration-200"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate leading-tight group-hover:text-brand-primary transition-all duration-200">
              {activeRole.name}
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              {activeRole.badge}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
        </div>

      </div>
    </aside>
  );
}
