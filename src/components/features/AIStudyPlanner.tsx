import React from 'react';
import { Calendar, BrainCircuit, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Panel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const PanelHeader = ({ title, action }: { title: React.ReactNode, action?: React.ReactNode }) => (
  <div className="px-5 py-4 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">{title}</h3>
    {action && <div className="text-xs">{action}</div>}
  </div>
);

export function AIStudyPlanner() {
  return (
    <Panel>
      <PanelHeader 
        title={<><BrainCircuit size={16} className="text-brand-primary"/> AI Study Planner</>} 
        action={<span className="text-xs font-semibold text-neutral-500">This Week</span>}
      />
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg shrink-0 border ${i === 2 ? 'bg-brand-primary text-white border-brand-primary' : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 text-neutral-500'}`}>
              <span className="text-[10px] font-bold uppercase">{day}</span>
              <span className="text-sm font-semibold">{12 + i}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Today's Recommended Plan</p>
          {[
            { time: '45m', title: 'Review Calculus Ch 4', type: 'reading', completed: false },
            { time: '30m', title: 'Physics Practice Quiz', type: 'quiz', completed: false },
            { time: '20m', title: 'History Notes Sync', type: 'review', completed: true },
          ].map((task, i) => (
            <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${task.completed ? 'opacity-60 bg-neutral-50 border-neutral-100 dark:bg-neutral-800 dark:border-neutral-700' : 'bg-white dark:bg-neutral-900 border-brand-primary/20 hover:border-brand-primary/50'}`}>
              <div className="flex items-center gap-3">
                {task.completed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Clock size={16} className="text-brand-primary" />}
                <div>
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-900 dark:text-neutral-100'}`}>{task.title}</p>
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">{task.time} • AI Suggestion</p>
                </div>
              </div>
              {!task.completed && <button className="text-xs font-bold text-brand-primary hover:underline">Start</button>}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
