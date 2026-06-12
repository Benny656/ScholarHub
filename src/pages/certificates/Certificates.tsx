import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Share2, QrCode, CheckCircle, Sparkles, Lock, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { certificatesService } from '../../services/certificates.service';
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
          <h3 className="text-sm font-bold text-on-surface mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{cert.courseName}</h3>
          <p className="text-xs text-on-surface-variant mb-2">{cert.instructorName}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">{new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
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
          <h2 className="text-2xl font-bold text-on-surface mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{cert.courseName}</h2>
          <p className="text-on-surface-variant mb-4">Instructed by {cert.instructorName}</p>

          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">Grade</p>
              <p className="text-xl font-black text-[#D97706]">{cert.grade}</p>
            </div>
            <div className="w-px h-10 bg-on-surface/10" />
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">Date</p>
              <p className="text-sm font-semibold text-on-surface">{new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
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
    const cert = await certificatesService.generateCertificate(user.id, 'c1');
    setGenerating(false);
    setCertificates(p => [cert, ...p]);
    toast.success('Certificate generated! 🎓');
    setViewed(cert);
  };

  // Mock certificates if empty
  const MOCK_CERTS: Certificate[] = [
    { id: 'cert1', studentId: 'u1', studentName: 'Alex Johnson', courseId: 'c1', courseName: 'Full-Stack Web Development', instructorName: 'Dr. Sarah Chen', issuedAt: '2024-06-01T00:00:00Z', verificationCode: 'NX-2024-WD-001', grade: 'A-', pdfUrl: '' },
    { id: 'cert2', studentId: 'u1', studentName: 'Alex Johnson', courseId: 'c3', courseName: 'UI/UX Design Masterclass', instructorName: 'Emma Lawson', issuedAt: '2024-03-15T00:00:00Z', verificationCode: 'NX-2024-UX-047', grade: 'A', pdfUrl: '' },
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
  const { certId } = useParams<{ certId: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certId) return;
    certificatesService.verifyCertificate(certId).then(c => { setCert(c); setLoading(false); }).catch(() => setLoading(false));
  }, [certId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
      {loading ? (
        <div className="text-on-surface-variant">Verifying certificate...</div>
      ) : cert ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D97706] to-blue-500 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-[#D97706]/30">
            <CheckCircle size={40} className="text-on-surface" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-2" style={{ fontFamily: 'Geist, sans-serif' }}>Certificate Verified ✓</h1>
          <p className="text-on-surface-variant mb-6">This certificate has been verified as authentic</p>
          <GlassCard tint="emerald">
            <div className="space-y-3 text-left">
              {[
                { label: 'Student', value: cert.studentName },
                { label: 'Course', value: cert.courseName },
                { label: 'Instructor', value: cert.instructorName },
                { label: 'Grade', value: cert.grade },
                { label: 'Issued', value: new Date(cert.issuedAt).toLocaleDateString() },
                { label: 'Certificate ID', value: cert.verificationCode },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">{label}</span>
                  <span className="text-sm font-medium text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Certificate Not Found</h2>
          <p className="text-on-surface-variant">ID: <span className="font-mono">{certId}</span></p>
        </div>
      )}
    </div>
  );
}
