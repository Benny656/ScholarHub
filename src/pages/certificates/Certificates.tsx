import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Share2, QrCode, CheckCircle, Sparkles, Lock, Eye, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { certificatesService } from '../../services/certificates.service';
import { supabase } from '../../lib/supabase';
import { GlassCard, Badge, PageHeader, Button } from '../../components/ui/index';
import type { Certificate } from '../../types';
import toast from 'react-hot-toast';

function CertificateCard({ cert, onView }: { cert: Certificate; onView: (c: Certificate) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="cursor-pointer group" onClick={() => onView(cert)}>
      <div className="rounded-2xl overflow-hidden border border-outline-variant/15 hover:border-[#D97706]/30 transition-all duration-300"
        style={{ background: 'color-mix(in srgb, var(--color-on-surface) 4%, transparent)', backdropFilter: 'blur(12px)' }}>
        {/* Certificate preview */}
        <div className="h-44 relative flex items-center justify-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-bg) 80%, transparent), rgba(59,130,246,0.1))' }}>
          <div className="text-center">
            <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2"
              style={{ background: 'linear-gradient(135deg, #D97706, #3B82F6)', boxShadow: '0 8px 32px rgba(217,119,6,0.3)' }}>
              <Award size={32} className="text-on-surface" />
            </motion.div>
            <p className="text-xs font-bold text-[#D97706] uppercase tracking-wider">Certificate</p>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="emerald">Verified</Badge>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'color-mix(in srgb, var(--color-bg) 40%, transparent)', backdropFilter: 'blur(4px)' }}>
            <div className="flex gap-2">
              <div className="w-9 h-9 rounded-xl bg-on-surface/20 flex items-center justify-center text-on-surface"><Eye size={16} /></div>
              <div className="w-9 h-9 rounded-xl bg-on-surface/20 flex items-center justify-center text-on-surface"><Download size={16} /></div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-bold text-on-surface mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{cert.courseTitle}</h3>
          <p className="text-xs text-on-surface-variant mb-2">{cert.instructorName}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">{new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            <p className="text-xs font-bold text-[#D97706]">Grade: {cert.grade}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CertificateViewer({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    await certificatesService.downloadCertificate(cert.id);
    setDownloading(false);
    toast.success('Certificate downloaded!');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--color-bg) 80%, transparent)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl">
        {/* Certificate document */}
        <div className="rounded-3xl p-10 border border-[#D97706]/20 mb-4 text-center relative overflow-hidden"
          style={{ background: 'var(--color-surface)', boxShadow: '0 0 60px rgba(217,119,6,0.15)' }}>
          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#D97706]/40 rounded-tl-xl" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#D97706]/40 rounded-tr-xl" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#D97706]/40 rounded-bl-xl" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#D97706]/40 rounded-br-xl" />

          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #D97706, #3B82F6)', boxShadow: '0 0 40px rgba(217,119,6,0.4)' }}>
            <Award size={40} className="text-on-surface" />
          </motion.div>

          <p className="text-xs font-bold text-[#D97706] uppercase tracking-[0.3em] mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Certificate of Completion</p>
          <p className="text-lg text-on-surface-variant mb-2">This certifies that</p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-4xl font-black text-on-surface mb-4"
            style={{ fontFamily: 'Geist, sans-serif', textShadow: '0 0 30px rgba(217,119,6,0.3)' }}>
            {cert.studentName}
          </motion.h1>
          <p className="text-lg text-on-surface-variant mb-1">has successfully completed</p>
          <h2 className="text-2xl font-bold text-on-surface mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{cert.courseTitle}</h2>
          <p className="text-on-surface-variant mb-4">Instructed by {cert.instructorName}</p>

          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">Grade</p>
              <p className="text-xl font-black text-[#D97706]">{cert.grade}</p>
            </div>
            <div className="w-px h-10 bg-on-surface/10" />
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">Date</p>
              <p className="text-sm font-semibold text-on-surface">{new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="w-px h-10 bg-on-surface/10" />
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">ID</p>
              <p className="text-xs font-mono text-on-surface-variant">{cert.verificationCode}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#D97706]">
            <CheckCircle size={14} />
            <span>Verified on ScholarHub Platform</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" icon={<Share2 size={15} />} onClick={() => toast.success('Link copied!')}>Share</Button>
          <Button variant="primary" icon={<Download size={15} />} loading={downloading} onClick={handleDownload}>Download PDF</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewed, setViewed] = useState<Certificate | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    certificatesService.getCertificates(user.id).then(c => { setCertificates(c); setLoading(false); });
  }, [user]);

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      // Mock course details for the demo
      const courseId = 'c1';
      const courseName = 'Full-Stack Web Development';
      const institutionType = user.role === 'school-student' ? 'k12' : 'uni';
      
      const cert = await certificatesService.generateCertificate(
        user.id,
        courseId,
        user.name || 'Demo Student',
        courseName,
        institutionType
      );
      
      setCertificates(p => [cert, ...p]);
      toast.success('Certificate minted on blockchain! 🎓');
      setViewed(cert);
    } catch (err: any) {
      toast.error(err.message || 'Failed to mint certificate');
    } finally {
      setGenerating(false);
    }
  };

  // Mock certificates if empty
  const MOCK_CERTS: Certificate[] = [
    { id: 'cert1', studentId: 'u1', studentName: 'Alex Johnson', courseId: 'c1', courseTitle: 'Full-Stack Web Development', instructorName: 'Dr. Sarah Chen', issueDate: '2024-06-01T00:00:00Z', verificationCode: 'NX-2024-WD-001', grade: 'A-', pdfUrl: '' },
    { id: 'cert2', studentId: 'u1', studentName: 'Alex Johnson', courseId: 'c3', courseTitle: 'UI/UX Design Masterclass', instructorName: 'Emma Lawson', issueDate: '2024-03-15T00:00:00Z', verificationCode: 'NX-2024-UX-047', grade: 'A', pdfUrl: '' },
  ];

  const displayCerts = certificates.length ? certificates : MOCK_CERTS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        subtitle={`${displayCerts.length} certificates earned`}
        breadcrumb={[{ label: 'Certificates' }]}
        action={
          <Button variant="primary" icon={<Sparkles size={15} />} onClick={handleGenerate} loading={generating}>
            Generate Demo Cert
          </Button>
        }
      />
      <div className="p-6">
        {displayCerts.length === 0 ? (
          <div className="text-center py-20">
            <Lock size={48} className="text-outline mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-on-surface mb-2">No certificates yet</h3>
            <p className="text-sm text-on-surface-variant mb-6">Complete a course to earn your first certificate</p>
            <Button variant="primary" onClick={handleGenerate} loading={generating}>Generate Demo</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayCerts.map((cert, i) => (
              <CertificateCard key={cert.id} cert={cert} onView={setViewed} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewed && <CertificateViewer cert={viewed} onClose={() => setViewed(null)} />}
      </AnimatePresence>
    </div>
  );
}

// Certificate Verification Page (public)
export function CertificateVerify() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cryptoResult, setCryptoResult] = useState<{ authentic: boolean; hash?: string; certData?: any } | null>(null);
  const [visionResult, setVisionResult] = useState<{ studentName: string; courseName: string; date: string } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsVerifying(true);
    setCryptoResult(null);
    setVisionResult(null);

    try {
      // 1. Local Cryptographic Hash via Web Crypto API
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Query Supabase for this hash
      const { data: certMatch, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_hash', hashHex)
        .single();
      
      if (certMatch) {
        setCryptoResult({ authentic: true, hash: hashHex, certData: certMatch });
      } else {
        setCryptoResult({ authentic: false, hash: hashHex });
      }

      // 2. Gemini Vision Parsing Layer
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const visionRes = await fetch(`${API_URL}/api/verify/analyze-vision`, {
        method: 'POST',
        body: formData
      });

      if (visionRes.ok) {
        const parsed = await visionRes.json();
        setVisionResult(parsed);
      }

    } catch (err) {
      console.error('Verification error:', err);
      toast.error('An error occurred during verification.');
      if (!cryptoResult) setCryptoResult({ authentic: false });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Certificate Verification Gateway</h1>
          <p className="text-on-surface-variant max-w-xl mx-auto">Upload a certificate document to cryptographically verify its authenticity on the Polygon blockchain and parse its contents via Gemini Vision.</p>
        </div>

        {/* Upload Zone */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
            isDragging 
              ? 'border-brand-primary bg-brand-primary/5' 
              : 'border-outline-variant/30 bg-on-surface/5 hover:border-brand-primary/50 hover:bg-on-surface/10'
          }`}
        >
          <input 
            type="file" 
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-on-surface/10 flex items-center justify-center text-on-surface-variant">
              <Download size={28} />
            </div>
            <div>
              <p className="text-lg font-bold text-on-surface">Drag & Drop Certificate Here</p>
              <p className="text-sm text-on-surface-variant mt-1">Supports PDF, PNG, JPG</p>
            </div>
            <Button variant="secondary" className="mt-2 relative z-10 pointer-events-none">Select File</Button>
          </div>
        </div>

        {/* Verification Loading State */}
        {isVerifying && (
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant font-medium animate-pulse">Running cryptographic hash & Gemini Vision analysis...</p>
          </div>
        )}

        {/* Results Panel */}
        {!isVerifying && cryptoResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cryptographic Result */}
            <GlassCard className="p-6 relative overflow-hidden">
              {cryptoResult.authentic ? (
                <>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle size={100} className="text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2 mb-2">
                    <CheckCircle size={20} /> Authentic Credentials Verified
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-4">This document's SHA-256 hash perfectly matches a locked record on the Polygon Blockchain.</p>
                  
                  <div className="space-y-3 mt-6">
                    <div className="text-xs">
                      <p className="text-on-surface-variant mb-1 uppercase tracking-wider font-bold">SHA-256 Hash</p>
                      <p className="font-mono bg-on-surface/5 p-2 rounded-lg text-emerald-600 dark:text-emerald-400 break-all">{cryptoResult.hash}</p>
                    </div>
                    {cryptoResult.certData?.blockchain_tx_hash && (
                      <div className="pt-2">
                        <a href={`https://amoy.polygonscan.com/tx/${cryptoResult.certData.blockchain_tx_hash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:underline">
                          View on Polygonscan <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertTriangle size={100} className="text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} /> Verification Failed
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-4">Invalid or Altered Certificate File. The hash does not match any official records in our ledger.</p>
                  <div className="text-xs mt-6">
                    <p className="text-on-surface-variant mb-1 uppercase tracking-wider font-bold">Computed Hash</p>
                    <p className="font-mono bg-red-500/10 text-red-600 dark:text-red-400 p-2 rounded-lg break-all">{cryptoResult.hash}</p>
                  </div>
                </>
              )}
            </GlassCard>

            {/* Gemini Vision Parsing */}
            <GlassCard className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles size={100} className="text-[#EC4899]" />
              </div>
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-[#EC4899]" /> Scanned Document Details
              </h3>
              <p className="text-sm text-on-surface-variant mb-6">Metrics extracted via Gemini Vision.</p>
              
              {visionResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Student Name</span>
                    <span className="text-sm font-semibold text-on-surface">{visionResult.studentName || 'Not found'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Course Name</span>
                    <span className="text-sm font-semibold text-on-surface">{visionResult.courseName || 'Not found'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Issue Date</span>
                    <span className="text-sm font-semibold text-on-surface">{visionResult.date || 'Not found'}</span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-on-surface-variant">
                  No visual data could be extracted.
                </div>
              )}
            </GlassCard>

          </motion.div>
        )}
      </div>
    </div>
  );
}
