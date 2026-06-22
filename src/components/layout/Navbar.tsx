import React, { useState, useRef, useEffect } from "react";
import { Search, Sun, Moon, CalendarDays, User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../lib/mockData";
import { NotificationDropdown } from "./NotificationDropdown";

interface NavbarProps {
  activeRole: Role;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onOpenNotifications: () => void;
  notificationCount: number;
  onHomeClick?: () => void;
}

export default function Navbar({
  activeRole,
  theme,
  toggleTheme,
  onHomeClick,
}: NavbarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [timeStr, setTimeStr] = useState<string>("");
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

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 border-b border-[var(--outline-variant)] bg-[var(--surface)] px-8 flex items-center justify-between transition-colors duration-200">
      
      {/* Search Bar - Aesthetic & Functional preview */}
      <div className="relative w-96 hidden md:block">
        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-[#7c7c6f]" />
        </span>
        <input
          type="search"
          placeholder="Look up subjects, quiz materials, rosters..."
          className="w-full h-11 pl-11 pr-4 rounded-xl text-sm bg-[#FFFCE1] border border-[#E1DCC9]/20 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary dark:bg-[#412D15] dark:border-[#412D15] dark:text-neutral-200 transition-all duration-150"
        />
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-5 ml-auto">
        
        {/* Dynamic Clock Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFCE1] dark:bg-[#412D15] rounded-lg text-xs font-mono text-[#7c7c6f] dark:text-[#7c7c6f]">
          <CalendarDays className="w-3.5 h-3.5 text-brand-secondary" />
          <span>{timeStr || "12:00 PM"}</span>
        </div>

        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#E1DCC9]/20 hover:bg-[#FFFCE1] dark:border-[#412D15] dark:hover:bg-[#412D15] transition-all duration-200 overflow-hidden relative"
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "light" ? (
              <motion.span
                key="moon"
                initial={{ rotate: -90, opacity: 0, y: 10 }}
                animate={{ rotate: 0, opacity: 1, y: 0 }}
                exit={{ rotate: 90, opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Moon className="w-4.5 h-4.5 text-[#7c7c6f]" />
              </motion.span>
            ) : (
              <motion.span
                key="sun"
                initial={{ rotate: 90, opacity: 0, y: 10 }}
                animate={{ rotate: 0, opacity: 1, y: 0 }}
                exit={{ rotate: -90, opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Sun className="w-4.5 h-4.5 text-amber-500" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Notification Bell Badge */}
        <NotificationDropdown />

        {/* Platform Indicator */}
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#7c7c6f] bg-[#FFFCE1] dark:bg-[#412D15] dark:text-[#7c7c6f] px-3 py-1.5 rounded-lg border border-[#E1DCC9]/40 dark:border-[#412D15]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00bae2]" />
          {activeRole.badge.split("•")[0]}
        </span>

        {/* Profile Avatar Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            id="navbar-profile-btn"
            onClick={() => setProfileOpen(prev => !prev)}
            aria-label="Open profile menu"
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-[#FFFCE1] dark:hover:bg-[#412D15] transition-all duration-200 border border-transparent hover:border-[#E1DCC9]/20 dark:hover:border-[#412D15] group"
          >
            <img
              src={activeRole.avatar}
              alt={activeRole.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-brand-primary/20 group-hover:border-brand-primary transition-all duration-200"
            />
            <ChevronDown className={`w-3.5 h-3.5 text-[#7c7c6f] transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute top-full right-0 mt-2 w-52 bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-xl shadow-xl overflow-hidden z-50"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#E1DCC9]/20 dark:border-[#412D15]">
                  <p className="text-xs font-bold text-[#0e100f] dark:text-neutral-200 truncate">{activeRole.name}</p>
                  <p className="text-[10px] text-[#7c7c6f] mt-0.5 truncate">{activeRole.badge}</p>
                </div>
                {/* View Profile */}
                <button
                  id="navbar-profile-view-btn"
                  onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#7c7c6f] dark:text-[#7c7c6f] hover:bg-[#FFFCE1] dark:hover:bg-[#412D15] transition-colors"
                >
                  <User className="w-4 h-4 text-[#7c7c6f]" />
                  View Profile
                </button>
                {/* Divider */}
                <div className="border-t border-[#E1DCC9]/20 dark:border-[#412D15]" />
                {/* Logout */}
                <button
                  id="navbar-logout-btn"
                  onClick={async () => { setProfileOpen(false); await logout(); navigate('/login', { replace: true }); }}
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
    </header>
  );
}
