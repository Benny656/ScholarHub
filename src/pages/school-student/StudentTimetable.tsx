import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { GlassCard } from '../../components/ui/index';

export default function StudentTimetable() {
  const timeSlots = [
    '08:00 AM – 08:45 AM',
    '08:45 AM – 09:30 AM',
    '09:30 AM – 10:15 AM',
    '10:15 AM – 10:30 AM', // short break
    '10:30 AM – 11:15 AM',
    '11:15 AM – 12:00 PM',
    '12:00 PM – 12:45 PM', // lunch
    '12:45 PM – 01:30 PM',
    '01:30 PM – 02:15 PM',
    '02:15 PM – 03:00 PM',
  ];

  const staticTimetable: Record<string, (string | null)[]> = {
    Monday:    ['Mathematics', 'Science', 'English Lit.', null, 'History', 'Comp. Science', null, 'Mathematics', 'Science', 'English Lit.'],
    Tuesday:   ['Science', 'English Lit.', 'History', null, 'Mathematics', 'Comp. Science', null, 'Science', 'History', 'Mathematics'],
    Wednesday: ['English Lit.', 'Mathematics', 'Comp. Science', null, 'Science', 'History', null, 'English Lit.', 'Comp. Science', 'Science'],
    Thursday:  ['History', 'Comp. Science', 'Mathematics', null, 'English Lit.', 'Science', null, 'History', 'Mathematics', 'Comp. Science'],
    Friday:    ['Comp. Science', 'History', 'Science', null, 'Mathematics', 'English Lit.', null, 'Comp. Science', 'Science', 'Mathematics'],
  };

  const subjectColors: Record<string, string> = {
    'Mathematics':    'bg-violet-500/20 border-violet-500/40 text-violet-700 dark:text-violet-300',
    'Science':        'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
    'English Lit.':   'bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300',
    'History':        'bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300',
    'Comp. Science':  'bg-cyan-500/20 border-cyan-500/40 text-cyan-700 dark:text-cyan-300',
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans space-y-8 px-4 sm:px-6 lg:px-8 pt-6 select-none">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/35 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shadow-inner shrink-0">
          <Calendar size={20} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
            Class Weekly Timetable 📅
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-455">
            Your daily lectures, breaks, and classroom locations for this term.
          </p>
        </div>
      </motion.div>

      {/* TIMETABLE TABLE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <GlassCard padding="p-6 md:p-8" className="border border-neutral-200 dark:border-purple-500/20 bg-white/40 dark:bg-[#161224]/60 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[640px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white/85 dark:bg-[#161224]/95 backdrop-blur px-4 py-3 text-left font-black text-neutral-500 dark:text-neutral-400 w-36 border-b-2 border-purple-500/20 z-10">Time</th>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                    <th key={d} className="px-3 py-3 font-black text-neutral-700 dark:text-white text-center border-b-2 border-purple-500/20">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time, i) => {
                  const isLunch = time.startsWith('12:00');
                  const isBreak = time.startsWith('10:15');
                  
                  if (isBreak) {
                    return (
                      <tr key={time}>
                        <td className="sticky left-0 bg-neutral-100/80 dark:bg-neutral-800/50 backdrop-blur px-4 py-2 text-neutral-400 font-mono z-10 border-b border-neutral-200/50 dark:border-neutral-700/50">10:15 – 10:30</td>
                        <td colSpan={5} className="px-4 py-2 text-center text-[11px] font-bold text-neutral-400 dark:text-neutral-500 bg-neutral-100/50 dark:bg-neutral-800/30 border-b border-neutral-200/50 dark:border-neutral-700/50 tracking-widest uppercase">☕ Short Break</td>
                      </tr>
                    );
                  }
                  
                  if (isLunch) {
                    return (
                      <tr key={time}>
                        <td className="sticky left-0 bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur px-4 py-3 text-amber-600 dark:text-amber-400 font-mono z-10 border-b border-amber-200/40 dark:border-amber-700/30">12:00 – 12:45</td>
                        <td colSpan={5} className="px-4 py-3 text-center text-sm font-black text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-200/40 dark:border-amber-700/30">🍱 Lunch Break</td>
                      </tr>
                    );
                  }
                  
                  return (
                    <tr key={time} className="group">
                      <td className="sticky left-0 bg-white/85 dark:bg-[#161224]/95 backdrop-blur px-4 py-2.5 font-mono text-neutral-500 dark:text-neutral-400 z-10 border-b border-purple-500/10 whitespace-nowrap">{time}</td>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                        const subj = staticTimetable[day][i];
                        const color = subj ? (subjectColors[subj] || 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300') : '';
                        
                        return (
                          <td key={day} className="px-2 py-2 border-b border-purple-500/10 text-center">
                            {subj ? (
                              <motion.div whileHover={{ scale: 1.05 }} className={`rounded-lg px-2 py-1.5 border font-semibold ${color}`}>
                                {subj}
                              </motion.div>
                            ) : (
                              <span className="text-neutral-300 dark:text-neutral-700">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

    </div>
  );
}
