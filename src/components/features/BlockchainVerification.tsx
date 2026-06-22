import React, { useState } from 'react';
import { Award, UploadCloud, CheckCircle2, QrCode, Globe, ShieldCheck, Loader2 } from 'lucide-react';
import { blockchainService } from '../../services/blockchain.service';

interface BlockchainVerificationProps {
  role: 'teacher' | 'admin';
}

const Panel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/60 dark:border-[#412D15] rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const PanelHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="px-5 py-4 border-b border-[#E1DCC9]/60 dark:border-[#412D15] flex items-center justify-between">
    <h3 className="text-sm font-semibold text-[#0e100f] dark:text-[#E1DCC9]">{title}</h3>
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
          <div className="flex items-center gap-3 p-3 bg-[#FFFCE1] dark:bg-[#412D15]/50 rounded-lg border border-[#E1DCC9]/20 dark:border-[#412D15]">
            <QrCode size={20} className="text-[#7c7c6f]" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#0e100f] dark:text-[#E1DCC9]">QR Verification Scanner</p>
              <p className="text-[10px] text-[#7c7c6f]">Scan student certificates</p>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-[#7c7c6f] dark:text-[#7c7c6f] rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">Open</button>
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] text-[#7c7c6f] uppercase tracking-wider font-semibold">Recent Verifications</p>
            {[
              { id: 'CERT-8472', status: 'verified' },
              { id: 'CERT-1093', status: 'processing' },
              { id: 'CERT-5512', status: 'verified' }
            ].map((v, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-[#E1DCC9]/20 dark:border-[#412D15] last:border-0">
                <span className="text-xs font-medium text-[#7c7c6f] dark:text-[#7c7c6f]">{v.id}</span>
                <div className="flex items-center gap-1.5">
                  {v.status === 'verified' ? <ShieldCheck size={12} className="text-[#00bae2]" /> : <Loader2 size={12} className="text-amber-500 animate-spin" />}
                  <span className="text-[10px] font-semibold text-[#7c7c6f] capitalize">{v.status}</span>
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
      <PanelHeader title="Issue Certificate" action={<Award size={14} className="text-[#7c7c6f]" />} />
      <div className="p-4 text-center">
        {status === 'idle' && (
          <div className="py-2">
            <UploadCloud size={24} className="text-[#7c7c6f] mx-auto mb-2" />
            <p className="text-xs text-[#7c7c6f] mb-4 px-2">Generate and submit student certificate to the blockchain for permanent verification.</p>
            <button onClick={handleGenerate} className="w-full flex items-center justify-center gap-2 py-2 bg-[#412D15] dark:bg-[#FFFCE1] text-[#E1DCC9] dark:text-[#0e100f] text-xs font-semibold rounded-lg hover:bg-[#412D15] dark:hover:bg-neutral-200 transition-colors">
              <Award size={12} /> Generate & Submit
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-6 flex flex-col items-center">
            <Loader2 size={24} className="text-brand-primary animate-spin mb-3" />
            <p className="text-xs font-medium text-[#7c7c6f] dark:text-[#7c7c6f]">Minting to Blockchain...</p>
            <p className="text-[10px] text-[#7c7c6f] mt-1">Awaiting confirmation</p>
          </div>
        )}

        {status === 'verified' && (
          <div className="py-2">
            <div className="w-10 h-10 rounded-full bg-[#00bae2] dark:bg-[#00bae2]/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={20} className="text-[#00bae2]" />
            </div>
            <p className="text-sm font-bold text-[#0e100f] dark:text-[#E1DCC9] mb-1">Successfully Issued</p>
            <p className="text-[10px] text-[#7c7c6f] font-mono break-all px-4 mb-4">{hash}</p>
            <button onClick={() => setStatus('idle')} className="w-full py-2 bg-[#FFFCE1] dark:bg-[#412D15] text-[#7c7c6f] dark:text-[#7c7c6f] text-xs font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
              Issue Another
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
}
