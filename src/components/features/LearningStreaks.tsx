import React from 'react';
import { Flame, Trophy, Star, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

const Panel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm ${className}`}>
    {children}
  </div>
);

export function LearningStreaks() {
  return (
    <Panel className="p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Flame className="w-24 h-24" />
      </div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Learning Streak
        </h2>
        <span className="px-3 py-1 bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 text-xs font-bold rounded-full">Level 4</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20">
          <div className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 mb-1">12<span className="text-sm font-bold ml-1">Days</span></div>
          <p className="text-[10px] text-orange-800 dark:text-orange-300 uppercase tracking-wider font-semibold">Current Streak</p>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-100 dark:border-purple-500/20">
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1"><Star size={20} className="fill-current"/> 1.2k</div>
          <p className="text-[10px] text-purple-800 dark:text-purple-300 uppercase tracking-wider font-semibold">XP Earned</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Recent Badges</p>
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Trophy size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300">Early Bird</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Medal size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300">Quiz Ace</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
