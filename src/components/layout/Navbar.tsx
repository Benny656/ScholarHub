import React, { useState, useEffect } from "react";
import { Search, Sun, Moon, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [timeStr, setTimeStr] = useState<string>("");

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
    <header className="h-20 border-b border-neutral-200/80 bg-white px-8 flex items-center justify-between dark:bg-neutral-900 dark:border-neutral-800 transition-colors duration-200">
      
      {/* Search Bar - Aesthetic & Functional preview */}
      <div className="relative w-96 hidden md:block">
        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-neutral-400" />
        </span>
        <input
          type="search"
          placeholder="Look up subjects, quiz materials, rosters..."
          className="w-full h-11 pl-11 pr-4 rounded-xl text-sm bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 transition-all duration-150"
        />
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-5 ml-auto">
        
        {/* Dynamic Clock Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-mono text-neutral-600 dark:text-neutral-300">
          <CalendarDays className="w-3.5 h-3.5 text-brand-secondary" />
          <span>{timeStr || "12:00 PM"}</span>
        </div>

        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800 transition-all duration-200 overflow-hidden relative"
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
                <Moon className="w-4.5 h-4.5 text-neutral-600" />
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
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 px-3 py-1.5 rounded-lg border border-neutral-200/40 dark:border-neutral-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {activeRole.badge.split("•")[0]}
        </span>

      </div>
    </header>
  );
}
