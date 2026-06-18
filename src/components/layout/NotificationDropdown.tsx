import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { NotificationRow } from '../../types/database';
import { Bell, Check, BookOpen, Video, Award, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!user) return;

    // Initial Fetch
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setNotifications(data as NotificationRow[]);
    };

    fetchNotifications();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationRow, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    if (!user) return;
    
    // Optimistic UI Update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    // Backend Update
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <BookOpen size={16} className="text-blue-500" />;
      case 'live_class': return <Video size={16} className="text-red-500" />;
      case 'grade': return <Award size={16} className="text-emerald-500" />;
      case 'announcement': return <Megaphone size={16} className="text-purple-500" />;
      default: return <Bell size={16} className="text-neutral-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl flex items-center justify-center border border-neutral-200 hover:bg-neutral-50 relative dark:border-neutral-800 dark:hover:bg-neutral-800 transition-all duration-200"
      >
        <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] text-white font-bold rounded-full flex items-center justify-center shadow-sm"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/20">
              <h3 className="font-bold text-neutral-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs flex items-center gap-1 text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                  <Bell size={24} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">You're all caught up!</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((notif) => (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`p-4 border-b border-neutral-100 dark:border-neutral-800/60 transition-colors flex gap-3 ${!notif.is_read ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notif.is_read ? 'bg-white dark:bg-neutral-800 shadow-sm' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                          {getIcon(notif.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className={`text-sm truncate pr-2 ${!notif.is_read ? 'font-bold text-neutral-900 dark:text-white' : 'font-semibold text-neutral-700 dark:text-neutral-300'}`}>
                            {notif.title}
                          </p>
                          {!notif.is_read && <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0 mt-1.5" />}
                        </div>
                        <p className={`text-xs leading-snug line-clamp-2 ${!notif.is_read ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1.5 uppercase font-medium tracking-wider">
                          {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800 text-center">
              <button className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                View all history
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
