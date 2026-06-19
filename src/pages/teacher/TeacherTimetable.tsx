import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Filter, Printer, Download, MapPin, 
  BookOpen, Compass, Award, Bookmark
} from 'lucide-react';
import { GlassCard, Badge, Button } from '../../components/ui/index';
import toast from 'react-hot-toast';

interface ScheduleSlot {
  subject: string;
  room?: string;
  type: 'class' | 'planning' | 'break' | 'admin';
  duration: string;
}

export default function TeacherTimetable() {
  const [roomFilter, setRoomFilter] = useState('All');

  // Monday - Friday weekly teaching schedule
  const timeSlots = [
    { label: '08:00 AM – 09:30 AM', timeKey: 'slot1' },
    { label: '09:45 AM – 11:15 AM', timeKey: 'slot2' },
    { label: '11:15 AM – 12:00 PM', timeKey: 'slot3' }, // Planning
    { label: '12:00 PM – 01:00 PM', timeKey: 'slot4' }, // Lunch
    { label: '01:00 PM – 02:30 PM', timeKey: 'slot5' },
    { label: '02:30 PM – 03:00 PM', timeKey: 'slot6' }, // Wrap-up
  ];

  const weeklySchedule: Record<string, Record<string, ScheduleSlot>> = {
    Monday: {
      slot1: { subject: 'Grade 8 Science', room: 'Room 104', type: 'class', duration: '90m' },
      slot2: { subject: 'Grade 7 Math', room: 'Room 201', type: 'class', duration: '90m' },
      slot3: { subject: 'Planning Period', type: 'planning', duration: '45m' },
      slot4: { subject: 'Lunch Break', type: 'break', duration: '60m' },
      slot5: { subject: 'Grade 6 Math', room: 'Room 202', type: 'class', duration: '90m' },
      slot6: { subject: 'Student Check-in', type: 'admin', duration: '30m' },
    },
    Tuesday: {
      slot1: { subject: 'Grade 7 Math', room: 'Room 201', type: 'class', duration: '90m' },
      slot2: { subject: 'Grade 8 Science', room: 'Room 104', type: 'class', duration: '90m' },
      slot3: { subject: 'Office Hours', type: 'planning', duration: '45m' },
      slot4: { subject: 'Lunch Break', type: 'break', duration: '60m' },
      slot5: { subject: 'Grade 8 Physics', room: 'Room 104', type: 'class', duration: '90m' },
      slot6: { subject: 'Lesson Planning', type: 'planning', duration: '30m' },
    },
    Wednesday: {
      slot1: { subject: 'Grade 8 Science', room: 'Room 104', type: 'class', duration: '90m' },
      slot2: { subject: 'Grade 6 Math', room: 'Room 202', type: 'class', duration: '90m' },
      slot3: { subject: 'Planning Period', type: 'planning', duration: '45m' },
      slot4: { subject: 'Lunch Break', type: 'break', duration: '60m' },
      slot5: { subject: 'Grade 7 Math', room: 'Room 201', type: 'class', duration: '90m' },
      slot6: { subject: 'Lab Preparation', type: 'planning', duration: '30m' },
    },
    Thursday: {
      slot1: { subject: 'Grade 7 Math', room: 'Room 201', type: 'class', duration: '90m' },
      slot2: { subject: 'Grade 8 Physics', room: 'Room 104', type: 'class', duration: '90m' },
      slot3: { subject: 'Staff Meeting', type: 'admin', duration: '45m' },
      slot4: { subject: 'Lunch Break', type: 'break', duration: '60m' },
      slot5: { subject: 'Grade 6 Math', room: 'Room 202', type: 'class', duration: '90m' },
      slot6: { subject: 'Grading Block', type: 'planning', duration: '30m' },
    },
    Friday: {
      slot1: { subject: 'Grade 6 Math', room: 'Room 202', type: 'class', duration: '90m' },
      slot2: { subject: 'Grade 8 Science', room: 'Room 104', type: 'class', duration: '90m' },
      slot3: { subject: 'Planning Period', type: 'planning', duration: '45m' },
      slot4: { subject: 'Lunch Break', type: 'break', duration: '60m' },
      slot5: { subject: 'Lab Experiments', room: 'Room 104', type: 'class', duration: '90m' },
      slot6: { subject: 'Weekly Wrap-up', type: 'admin', duration: '30m' },
    },
  };

  const handlePrint = () => {
    toast.success('Preparing timetable for print...');
    window.print();
  };

  const handleExport = () => {
    toast.loading('Exporting schedule as iCal...', { id: 'export-toast' });
    setTimeout(() => {
      toast.success('Calendar exported successfully!', { id: 'export-toast' });
    }, 1000);
  };

  // Get color styles for the slots
  const getSlotStyles = (slot: ScheduleSlot) => {
    if (slot.type === 'break') {
      return 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300 dark:bg-amber-500/10 hover:bg-amber-500/10 transition-colors';
    }
    if (slot.type === 'planning') {
      return 'bg-neutral-100/50 dark:bg-neutral-800/40 border-neutral-300/30 dark:border-neutral-700/30 text-neutral-450 border-dashed hover:bg-neutral-100/80 transition-colors';
    }
    if (slot.type === 'admin') {
      return 'bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-300 dark:bg-blue-500/10 hover:bg-blue-500/10 transition-colors';
    }

    // Classes can be colored based on rooms or titles
    if (slot.room === 'Room 104') {
      return 'bg-purple-600/10 dark:bg-purple-600/20 border-purple-500/20 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 hover:border-purple-500/60 transition-all';
    }
    if (slot.room === 'Room 201') {
      return 'bg-indigo-600/10 dark:bg-indigo-600/20 border-indigo-500/20 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 hover:border-indigo-500/60 transition-all';
    }
    return 'bg-teal-600/10 dark:bg-teal-600/20 border-teal-500/20 dark:border-teal-500/40 text-teal-700 dark:text-teal-300 hover:border-teal-500/60 transition-all';
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans space-y-8 px-4 sm:px-6 lg:px-8 pt-6 select-none">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
            <Calendar size={16} /> Educator Workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
            Weekly Teaching Timetable 📅
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-455">
            Manage your daily class lectures, planning periods, and classroom locations.
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handlePrint}
            className="rounded-xl font-bold flex items-center gap-1.5 text-xs py-2 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <Printer size={14} /> Print
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleExport}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md font-bold flex items-center gap-1.5 text-xs py-2"
          >
            <Download size={14} /> Export iCal
          </Button>
        </div>
      </motion.div>

      {/* FILTERS */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between gap-4 flex-wrap bg-neutral-100/50 dark:bg-neutral-900/35 border border-neutral-200/55 dark:border-neutral-850 p-4 rounded-2xl"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-350">
          <Filter size={14} className="text-neutral-450" /> Filter Room:
        </div>
        <div className="flex gap-1.5">
          {['All', 'Room 104', 'Room 201', 'Room 202'].map((room) => (
            <button
              key={room}
              onClick={() => setRoomFilter(room)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                roomFilter === room
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10'
                  : 'bg-white dark:bg-neutral-900 text-neutral-500 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
              }`}
            >
              {room}
            </button>
          ))}
        </div>
      </motion.div>

      {/* SCHEDULE TABLE GRID */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-x-auto"
      >
        <GlassCard padding="p-0" className="overflow-hidden border border-neutral-200 dark:border-neutral-800 min-w-[800px]">
          <table className="w-full text-xs text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                <th className="px-5 py-4 font-black text-neutral-500 dark:text-neutral-400 w-[160px] border-r border-neutral-100 dark:border-neutral-800/80">
                  <span className="flex items-center gap-1"><Clock size={13} /> Time Slot</span>
                </th>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <th 
                    key={day} 
                    className="px-4 py-4 font-black text-neutral-800 dark:text-neutral-250 text-center uppercase tracking-wider"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slotInfo) => {
                const isLunch = slotInfo.timeKey === 'slot4';
                
                return (
                  <tr 
                    key={slotInfo.timeKey} 
                    className="border-b border-neutral-150 dark:border-neutral-800/50 last:border-0"
                  >
                    {/* Time Slot column */}
                    <td className="px-5 py-5 font-semibold text-neutral-600 dark:text-neutral-400 border-r border-neutral-150 dark:border-neutral-800/80 font-mono bg-neutral-50/30 dark:bg-neutral-900/10">
                      {slotInfo.label}
                    </td>

                    {/* Mon-Fri Day slots */}
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                      const slot = weeklySchedule[day][slotInfo.timeKey];
                      
                      // Check room filter
                      const isFilteredOut = slot.type === 'class' && roomFilter !== 'All' && slot.room !== roomFilter;
                      
                      if (isFilteredOut) {
                        return (
                          <td key={day} className="px-2.5 py-2.5 text-center bg-neutral-50/10 dark:bg-neutral-950/10">
                            <span className="text-neutral-300 dark:text-neutral-800 font-extrabold">—</span>
                          </td>
                        );
                      }

                      return (
                        <td key={day} className="px-2.5 py-2.5">
                          <motion.div 
                            whileHover={{ scale: 1.025 }}
                            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center h-[90px] shadow-sm select-none ${getSlotStyles(slot)}`}
                          >
                            <span className="font-extrabold text-xs leading-tight tracking-tight">
                              {slot.subject}
                            </span>
                            
                            {slot.room && (
                              <span className="text-[10px] mt-1.5 font-bold uppercase tracking-wider flex items-center gap-0.5 opacity-80">
                                <MapPin size={10} className="shrink-0" /> {slot.room}
                              </span>
                            )}
                            
                            <span className="text-[9px] mt-1 font-mono tracking-widest uppercase opacity-60">
                              {slot.duration}
                            </span>
                          </motion.div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      </motion.div>

      {/* QUICK GUIDE INFORMATION */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <GlassCard className="border border-neutral-200 dark:border-neutral-800/80 p-5 bg-white dark:bg-neutral-900 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Compass size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-neutral-900 dark:text-white text-sm mb-1">Interactive Views</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Hover over class blocks to inspect course contents. Planning periods can be used to set test materials.
            </p>
          </div>
        </GlassCard>
        
        <GlassCard className="border border-neutral-200 dark:border-neutral-800/80 p-5 bg-white dark:bg-neutral-900 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-neutral-900 dark:text-white text-sm mb-1">Room Allocation</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Timetable room changes are managed by the administrator. Contact support if classroom overlap occurs.
            </p>
          </div>
        </GlassCard>

        <GlassCard className="border border-neutral-200 dark:border-neutral-800/80 p-5 bg-white dark:bg-neutral-900 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Bookmark size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-neutral-900 dark:text-white text-sm mb-1">Lunch &amp; Planning</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              A daily 60-minute lunch slot is automatically allocated for all faculty members.
            </p>
          </div>
        </GlassCard>
      </motion.div>

    </div>
  );
}
