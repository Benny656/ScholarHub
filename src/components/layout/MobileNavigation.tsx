import React, { useState } from "react";
import { GraduationCap, Menu, X, Bell, Moon, Sun, ArrowRight, User, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileNavigationProps {
  activeRole: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  menuItems: { id: string; label: string; icon: React.ComponentType<any> }[];
  notificationCount: number;
  onOpenNotifications: () => void;
  onLogoClick?: () => void;
}

export default function MobileNavigation({
  activeRole,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  menuItems,
  notificationCount,
  onOpenNotifications,
  onLogoClick,
}: MobileNavigationProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setDrawerOpen(false);
  };

  return (
    <header className="md:hidden h-16 border-b border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 flex items-center justify-between px-4 z-40 sticky top-0">
      
      {/* Brand logo trigger */}
      <button 
        onClick={onLogoClick}
        className="flex items-center gap-2 active:scale-95 transition-all text-left group"
      >
        <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
          <img 
            src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"} 
            alt="Scholar Hub Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-serif font-bold text-base text-neutral-900 dark:text-neutral-50 leading-none group-hover:text-brand-primary transition-colors duration-200">
          Scholar Hub
        </span>
      </button>

      {/* Control Triggers */}
      <div className="flex items-center gap-2">
        
        {/* Notification indicator */}
        <button
          onClick={onOpenNotifications}
          className="w-8.5 h-8.5 rounded-lg flex items-center justify-center border border-neutral-150 hover:bg-neutral-50 relative dark:border-neutral-800 dark:hover:bg-neutral-800"
        >
          <Bell className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-[9px] text-white font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Hamburger Trigger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-8.5 h-8.5 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
        >
          <Menu className="w-4.5 h-4.5 text-neutral-700 dark:text-neutral-200" />
        </button>
      </div>

      {/* Expanded Animated Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
            
            {/* Close touch panel */}
            <div className="flex-1" onClick={() => setDrawerOpen(false)} />

            {/* Menu container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-72 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 h-full p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Header Close triggers */}
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-200">Navigation Menu</span>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg dark:hover:bg-neutral-800"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>

                {/* Profile Identity info */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleTabClick('settings')}
                  aria-label="View profile settings"
                  className="p-3 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl flex items-center gap-3 cursor-pointer group transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <img
                    src={activeRole.avatar}
                    alt={activeRole.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-brand-primary/20 bg-neutral-100 group-hover:border-brand-primary transition-all duration-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-brand-primary transition-all duration-200">{activeRole.name}</p>
                    <p className="text-[10px] text-neutral-500">{activeRole.badge}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                </div>

                {/* Navigation lists */}
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-neutral-100 text-brand-primary dark:bg-neutral-800 dark:text-brand-primary"
                            : "text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-850"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-brand-secondary" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom utilities */}
              <div className="space-y-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                
                {/* Theme switch bar */}
                <div className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl">
                  <span className="text-[11px] font-bold text-neutral-500">Dark Mode</span>
                  <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 shadow-sm border border-neutral-150 dark:border-neutral-700"
                  >
                    {theme === "light" ? (
                      <Moon className="w-4 h-4 text-neutral-600" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                  </button>
                </div>

                <p className="text-[9px] text-center text-neutral-400">
                  ScholarHub academic platform 
                </p>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
