import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../ui';
import { Calendar, Clock, Sparkles } from 'lucide-react';

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  day_of_week: string;
}

export function ScheduleWidget({ theme = 'sleek' }: { theme?: 'sleek' | 'funky' }) {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      if (!user) return;
      
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .eq('user_id', user.id)
        .eq('day_of_week', today)
        .order('time', { ascending: true }); // Simple string sort; in real app, parse time properly

      if (!error && data) {
        setSchedule(data as ScheduleItem[]);
      }
      setLoading(false);
    }
    
    loadSchedule();
  }, [user]);

  const isFunky = theme === 'funky';

  return (
    <GlassCard className={`flex flex-col h-full ${isFunky ? 'border-pink-200 dark:border-pink-900/50' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isFunky ? 'bg-pink-100 text-pink-600 dark:bg-pink-500/20' : 'bg-emerald-500/10 text-emerald-500'}`}>
            <Calendar size={20} />
          </div>
          <h2 className={`font-bold ${isFunky ? 'text-xl tracking-tight' : 'text-lg'} text-neutral-900 dark:text-white`}>
            Today's Schedule
          </h2>
        </div>
        <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : schedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8 px-4 h-full">
            {isFunky ? (
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mb-4 transform -rotate-6">
                <Sparkles className="w-8 h-8 text-pink-500" />
              </div>
            ) : (
              <div className="w-16 h-16 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
              </div>
            )}
            <h3 className={`font-semibold text-neutral-900 dark:text-white mb-1 ${isFunky ? 'text-lg' : 'text-base'}`}>
              No classes today!
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {isFunky ? "Time to relax or work on some fun projects! 🎉" : "Your schedule is clear for the day."}
            </p>
          </div>
        ) : (
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 dark:before:via-neutral-700 before:to-transparent">
            {schedule.map((item, i) => (
              <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white dark:border-neutral-950 ${isFunky ? 'bg-pink-400 text-white' : 'bg-neutral-200 dark:bg-neutral-800'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                  <div className={`w-2 h-2 rounded-full ${isFunky ? 'bg-white' : 'bg-emerald-500'}`} />
                </div>
                
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">{item.title}</h4>
                    <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                      <Clock size={10} /> {item.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
