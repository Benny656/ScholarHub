import React, { useState } from "react";
import { GraduationCap, Menu, X, Bell, Moon, Sun, ArrowRight, User, ChevronRight, HelpCircle } from "lucide-react";
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
    <header className="md:hidden h-16 border-b border-[#E1DCC9]/20 bg-[#FFFCE1] dark:bg-[#412D15] dark:border-[#412D15] flex items-center justify-between px-4 z-40 sticky top-0">
      
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
        <span className="font-serif font-bold text-base text-[#0e100f] dark:text-[#E1DCC9] leading-none group-hover:text-brand-primary transition-colors duration-200">
          Scholar Hub
        </span>
      </button>

      {/* Control Triggers */}
      <div className="flex items-center gap-2">
        
        {/* Notification indicator */}
        <button
          onClick={onOpenNotifications}
          className="w-8.5 h-8.5 rounded-lg flex items-center justify-center border border-neutral-150 hover:bg-[#FFFCE1] relative dark:border-[#412D15] dark:hover:bg-[#412D15]"
        >
          <Bell className="w-4 h-4 text-[#7c7c6f] dark:text-[#7c7c6f]" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-[9px] text-[#E1DCC9] font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Hamburger Trigger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-8.5 h-8.5 rounded-lg border border-[#E1DCC9]/20 flex items-center justify-center hover:bg-[#FFFCE1] dark:border-[#412D15] dark:hover:bg-[#412D15]"
        >
          <Menu className="w-4.5 h-4.5 text-[#7c7c6f] dark:text-neutral-200" />
        </button>
      </div>

      {/* Expanded Animated Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 bg-[#1F150C]/50 backdrop-blur-sm flex justify-end">
            
            {/* Close touch panel */}
            <div className="flex-1" onClick={() => setDrawerOpen(false)} />

            {/* Menu container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-72 bg-[#FFFCE1] dark:bg-[#412D15] border-l border-[#E1DCC9]/20 dark:border-[#412D15] h-full p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Header Close triggers */}
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#0e100f] dark:text-neutral-200">Navigation Menu</span>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 hover:bg-[#FFFCE1] rounded-lg dark:hover:bg-[#412D15]"
                  >
                    <X className="w-5 h-5 text-[#7c7c6f]" />
                  </button>
                </div>

                {/* Profile Identity info */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleTabClick('settings')}
                  aria-label="View profile settings"
                  className="p-3 bg-[#FFFCE1] dark:bg-neutral-850 hover:bg-[#FFFCE1] dark:hover:bg-[#412D15] rounded-xl flex items-center gap-3 cursor-pointer group transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <img
                    src={activeRole.avatar}
                    alt={activeRole.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-brand-primary/20 bg-[#FFFCE1] group-hover:border-brand-primary transition-all duration-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#0e100f] dark:text-neutral-200 truncate group-hover:text-brand-primary transition-all duration-200">{activeRole.name}</p>
                    <p className="text-[10px] text-[#7c7c6f]">{activeRole.badge}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7c7c6f] group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
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
                            ? "bg-[#FFFCE1] text-brand-primary dark:bg-[#412D15] dark:text-brand-primary"
                            : "text-[#7c7c6f] hover:bg-[#FFFCE1] dark:text-[#7c7c6f] dark:hover:bg-neutral-850"
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
              <div className="space-y-4 pt-6 border-t border-[#E1DCC9]/20 dark:border-[#412D15]">
                <button
                  onClick={() => handleTabClick('help')}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#7c7c6f] transition hover:bg-[#FFFCE1] hover:text-brand-primary dark:text-[#7c7c6f] dark:hover:bg-[#412D15]"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help Center</span>
                </button>
                
                {/* Theme switch bar */}
                <div className="flex items-center justify-between p-2.5 bg-[#FFFCE1] dark:bg-neutral-850 rounded-xl">
                  <span className="text-[11px] font-bold text-[#7c7c6f]">Dark Mode</span>
                  <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg bg-[#FFFCE1] dark:bg-[#412D15] shadow-sm border border-neutral-150 dark:border-[#412D15]"
                  >
                    {theme === "light" ? (
                      <Moon className="w-4 h-4 text-[#7c7c6f]" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                  </button>
                </div>

                <p className="text-[9px] text-center text-[#7c7c6f]">
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
