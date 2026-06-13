import React, { useState } from 'react';
import { Award, UploadCloud, CheckCircle2, QrCode, Globe, ShieldCheck, Loader2 } from 'lucide-react';
import { blockchainService } from '../../services/blockchain.service';

interface BlockchainVerificationProps {
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

export function BlockchainVerification({ role }: BlockchainVerificationProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'verified'>('idle');
  const [hash, setHash] = useState<string | null>(null);

  const handleGenerate = async () => {
    setStatus('processing');
    try {
      // Mock workflow
      const fakeFile = new File([''], 'cert.pdf');
      await blockchainService.uploadCertificate(fakeFile);
      const mockHash = await blockchainService.submitToBlockchain('cert-123');
      
      setTimeout(() => {
        setHash(mockHash);
        setStatus('verified');
      }, 1500);
    } catch (e) {
      setStatus('idle');
    }
  };

  if (role === 'admin') {
    return (
      <Panel>
        <PanelHeader title="Blockchain Verification" action={<Globe className="text-brand-primary" size={14} />} />
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
            <QrCode size={20} className="text-neutral-400" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">QR Verification Scanner</p>
              <p className="text-[10px] text-neutral-500">Scan student certificates</p>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">Open</button>
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Recent Verifications</p>
            {[
              { id: 'CERT-8472', status: 'verified' },
              { id: 'CERT-1093', status: 'processing' },
              { id: 'CERT-5512', status: 'verified' }
            ].map((v, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{v.id}</span>
                <div className="flex items-center gap-1.5">
                  {v.status === 'verified' ? <ShieldCheck size={12} className="text-emerald-500" /> : <Loader2 size={12} className="text-amber-500 animate-spin" />}
                  <span className="text-[10px] font-semibold text-neutral-500 capitalize">{v.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader title="Issue Certificate" action={<Award size={14} className="text-neutral-400" />} />
      <div className="p-4 text-center">
        {status === 'idle' && (
          <div className="py-2">
            <UploadCloud size={24} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-xs text-neutral-500 mb-4 px-2">Generate and submit student certificate to the blockchain for permanent verification.</p>
            <button onClick={handleGenerate} className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
              <Award size={12} /> Generate & Submit
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-6 flex flex-col items-center">
            <Loader2 size={24} className="text-brand-primary animate-spin mb-3" />
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Minting to Blockchain...</p>
            <p className="text-[10px] text-neutral-500 mt-1">Awaiting confirmation</p>
          </div>
        )}

        {status === 'verified' && (
          <div className="py-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={20} className="text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">Successfully Issued</p>
            <p className="text-[10px] text-neutral-500 font-mono break-all px-4 mb-4">{hash}</p>
            <button onClick={() => setStatus('idle')} className="w-full py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
              Issue Another
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
}
