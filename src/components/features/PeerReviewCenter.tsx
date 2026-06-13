import React from 'react';
import { Users, FileCheck, Clock, CheckCircle2, ChevronRight, Settings } from 'lucide-react';
import { peerReviewService } from '../../services/advanced-features.service';

interface PeerReviewCenterProps {
  role: 'student' | 'teacher';
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

export function PeerReviewCenter({ role }: PeerReviewCenterProps) {
  if (role === 'teacher') {
    return (
      <Panel>
        <PanelHeader title="Peer Review Config" action={<Settings size={14} className="text-neutral-400" />} />
        <div className="p-4 space-y-4">
          <p className="text-xs text-neutral-500">Configure blind peer review rules for assignments.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'React Project', status: 'Active', pairs: 124 },
              { title: 'ML Essay', status: 'Pending Config', pairs: 0 }
            ].map((a, i) => (
              <div key={i} className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate mb-1">{a.title}</p>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${a.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>{a.status}</span>
                  <span className="text-[10px] text-neutral-500">{a.pairs} pairs</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => peerReviewService.assignReviewers('all')} className="w-full py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
            Auto-Assign Reviewers
          </button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader title="Peer Review Queue" action={<Users size={14} className="text-neutral-400" />} />
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {[
          { task: 'Review: React App Architecture', due: 'Today, 11:59 PM', status: 'pending' },
          { task: 'Review: Binary Search Trees', due: 'Oct 15', status: 'completed' },
        ].map((r, i) => (
          <div key={i} className={`p-4 flex items-center justify-between transition-colors ${r.status === 'pending' ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800/20' : 'opacity-60'}`}>
            <div className="flex items-center gap-3">
              {r.status === 'pending' ? <Clock size={16} className="text-amber-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
              <div>
                <p className={`text-sm font-medium ${r.status === 'pending' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 line-through'}`}>{r.task}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold mt-0.5">Due {r.due}</p>
              </div>
            </div>
            {r.status === 'pending' && (
              <button className="text-xs font-semibold text-brand-primary flex items-center gap-1 hover:underline">
                Start <ChevronRight size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
