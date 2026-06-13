import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Video, UserCheck, AlertTriangle, Play, Square, Eye } from 'lucide-react';
import { proctoringService } from '../../services/advanced-features.service';

interface ProctoringDashboardProps {
  role: 'teacher' | 'admin';
}

const Panel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const PanelHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="px-5 py-4 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
    {action && <div className="text-xs">{action}</div>}
  </div>
);

export function ProctoringDashboard({ role }: ProctoringDashboardProps) {
  const [active, setActive] = useState(false);

  const handleStart = async () => {
    await proctoringService.startProctoring('all', 'course-123');
    setActive(true);
  };

  const handleStop = async () => {
    await proctoringService.stopProctoring('session-123');
    setActive(false);
  };

  if (role === 'admin') {
    return (
      <Panel>
        <PanelHeader title="Proctoring Analytics" action={<Shield className="text-brand-primary" size={14} />} />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">1,204</p>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mt-1">Exams Monitored</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-100 dark:border-red-500/20">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">23</p>
              <p className="text-[10px] text-red-800 dark:text-red-300 uppercase tracking-wider mt-1">Violations Flagged</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Recent Violations</p>
            {[
              { type: 'Multiple Faces Detected', course: 'Machine Learning', severity: 'High' },
              { type: 'Tab Switch', course: 'Data Structures', severity: 'Low' },
            ].map((v, i) => (
              <div key={i} className="flex justify-between items-center p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{v.type}</p>
                  <p className="text-[10px] text-neutral-500">{v.course}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${v.severity === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>{v.severity}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader 
        title="Live Exam Proctoring" 
        action={
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${active ? 'bg-red-400' : 'bg-neutral-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${active ? 'bg-red-500' : 'bg-neutral-500'}`}></span>
            </span>
            <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">{active ? 'Monitoring' : 'Offline'}</span>
          </div>
        } 
      />
      <div className="p-4">
        {active ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Alex J.', status: 'Active', flag: false },
                { name: 'Priya S.', status: 'Tab Switch', flag: true },
                { name: 'Jordan L.', status: 'Active', flag: false },
                { name: 'Marcus B.', status: 'No Face', flag: true },
              ].map((s, i) => (
                <div key={i} className={`p-2 rounded-lg border flex items-center justify-between ${s.flag ? 'border-red-200 bg-red-50/50 dark:border-red-500/30 dark:bg-red-500/10' : 'border-neutral-200 dark:border-neutral-800'}`}>
                  <div className="flex items-center gap-2">
                    <Video size={12} className={s.flag ? 'text-red-500' : 'text-neutral-400'} />
                    <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{s.name}</span>
                  </div>
                  {s.flag && <ShieldAlert size={12} className="text-red-500" />}
                </div>
              ))}
            </div>
            <button onClick={handleStop} className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
              <Square size={12} /> Stop Proctoring
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <UserCheck size={24} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-xs text-neutral-500 mb-4">Start an AI-monitored session for your exam.</p>
            <button onClick={handleStart} className="w-full flex items-center justify-center gap-2 py-2 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-accent transition-colors">
              <Play size={12} /> Start Session
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
}
