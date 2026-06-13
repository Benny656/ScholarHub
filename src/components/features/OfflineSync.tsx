import React from 'react';
import { CloudOff, DownloadCloud, RefreshCw, CheckCircle2 } from 'lucide-react';

const Panel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const PanelHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="px-5 py-4 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">{title}</h3>
    {action && <div className="text-xs">{action}</div>}
  </div>
);

export function OfflineSync() {
  return (
    <Panel>
      <PanelHeader 
        title={<><CloudOff size={16} className="text-neutral-400" /> Offline Mode</>} 
        action={<span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase">Synced</span>}
      />
      <div className="p-4 space-y-4">
        <p className="text-xs text-neutral-500">Your downloaded lessons and pending uploads.</p>
        
        <div className="space-y-2">
          {[
            { title: 'Intro to React Video', size: '45 MB', status: 'downloaded' },
            { title: 'Data Structures Notes', size: '2.4 MB', status: 'downloaded' },
            { title: 'Assignment 3 Upload', size: '1.1 MB', status: 'pending_sync' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</p>
                <p className="text-[10px] text-neutral-500">{item.size}</p>
              </div>
              {item.status === 'downloaded' ? (
                <CheckCircle2 size={14} className="text-emerald-500" />
              ) : (
                <RefreshCw size={14} className="text-brand-primary animate-spin" />
              )}
            </div>
          ))}
        </div>
        
        <button className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors">
          <DownloadCloud size={14} /> Manage Downloads
        </button>
      </div>
    </Panel>
  );
}
