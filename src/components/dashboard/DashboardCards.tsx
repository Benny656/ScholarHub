import React, { useState } from "react";
import { 
  Bell, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  ArrowRight, 
  HelpCircle,
  PlayCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Course } from "../../lib/mockData";

interface DashboardCardsProps {
  roleId: string;
  courses: Course[];
  onJoinLecture: (course: Course) => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardCards({
  roleId,
  courses,
  onJoinLecture,
  setActiveTab,
}: DashboardCardsProps) {
  
  const [tasks, setTasks] = useState([
    { id: 1, text: "Check backpropagation paper metrics", done: false },
    { id: 2, text: "Grade Dr. Vance's physical tutorial", done: true },
    { id: 3, text: "Outline linear matrix notes", done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* CARD 1: Scheduled Live Lecture Shortcut */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[220px]"
      >
        <div className="space-y-2 relative z-10">
          <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full leading-none inline-block">
            Happening Live Now
          </span>
          <h4 className="font-serif font-black text-lg leading-tight text-white mt-2">
            {courses[0]?.title || "Data Science Foundations"}
          </h4>
          <p className="text-xs text-indigo-100 opacity-90">
            Instructor: {courses[0]?.instructor || "Prof. Sarah Jenkins"}
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
          <span className="text-xs font-mono text-indigo-100 font-bold">CS 302 • Video Room</span>
          <button
            onClick={() => onJoinLecture(courses[0] || {} as Course)}
            className="px-4.5 py-2 bg-white text-indigo-600 hover:bg-neutral-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-800/10 transition hover:scale-[1.03]"
          >
            <PlayCircle className="w-4 h-4 text-indigo-600 fill-current" />
            <span>Join Stream</span>
          </button>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
      </motion.div>

      {/* CARD 2: Quick Checklist of Tasks */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl dark:bg-neutral-900 dark:border-neutral-800 flex flex-col justify-between min-h-[220px]"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-black text-sm text-slate-800 dark:text-neutral-50">
              Personal Study Checklist
            </h4>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-50 dark:bg-neutral-850 px-2 py-0.5 rounded-full">Daily Reminders</span>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-3 p-2 bg-slate-50/50 hover:bg-slate-100/50 dark:bg-neutral-800/40 dark:hover:bg-neutral-800/80 rounded-xl transition text-left border border-slate-100 dark:border-neutral-850"
              >
                <span className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                  task.done 
                    ? "bg-indigo-600 border-indigo-600 text-white" 
                    : "border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                }`}>
                  {task.done && <span className="text-[9px] font-bold">✓</span>}
                </span>
                <span className={`text-[11px] font-semibold text-slate-600 dark:text-neutral-300 ${task.done ? "line-through text-slate-400" : ""}`}>
                  {task.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setActiveTab("assignments")}
          className="text-[11px] font-bold text-indigo-600 dark:text-brand-secondary hover:underline flex items-center gap-1 pt-4 border-t border-slate-100 dark:border-neutral-800"
        >
          <span>View Assignment Calendar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* CARD 3: Campus Discussion Board Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl dark:bg-neutral-900 dark:border-neutral-800 flex flex-col justify-between min-h-[220px]"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-black text-sm text-slate-800 dark:text-neutral-50">
              Campus Forum Updates
            </h4>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50/50 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-850 rounded-xl">
              <p className="font-bold text-slate-700 dark:text-neutral-200">#general-announcements</p>
              <p className="text-slate-500 dark:text-neutral-400 text-[11px]">System Maintenance schedule set for Sunday at 02:00 AM UTC.</p>
            </div>
            
            <div className="p-2.5 bg-slate-50/50 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-850 rounded-xl">
              <p className="font-bold text-slate-700 dark:text-neutral-200">#physics-tutorial</p>
              <p className="text-slate-500 dark:text-neutral-400 text-[11px]">Dr. Vance: Submit laboratory worksheet guidelines by tomorrow evening.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("messages")}
          className="text-[11px] font-bold text-indigo-600 dark:text-brand-secondary hover:underline flex items-center gap-1 pt-4 border-t border-slate-100 dark:border-neutral-800"
        >
          <span>Open Discussions board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

    </div>
  );
}
