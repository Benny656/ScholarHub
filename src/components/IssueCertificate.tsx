import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles, Download, ExternalLink } from 'lucide-react';
import { Button, GlassCard } from './ui';
import toast from 'react-hot-toast';

export function IssueCertificate() {
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    studentName: '',
    courseName: '',
    institutionType: 'k12'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ certificateUrl: string; txHash: string } | null>(null);

  const populateDemoData = () => {
    setFormData({
      studentId: crypto.randomUUID(),
      courseId: crypto.randomUUID(),
      studentName: 'Alex Mercer',
      courseName: 'Introduction to AI',
      institutionType: 'uni'
    });
    toast.success('Demo data populated!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/certificates/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to mint certificate');
      }

      const data = await response.json();
      setResult({
        certificateUrl: data.certificateUrl,
        txHash: data.txHash
      });
      toast.success('Certificate successfully minted!');
    } catch (err: any) {
      toast.error(err.message || 'Error minting certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6 border border-outline-variant/20 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Award className="text-[#EC4899]" size={20} /> Issue Certificate
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">Generate and lock certificates on the Polygon blockchain.</p>
        </div>
        <Button variant="secondary" icon={<Sparkles size={16} />} onClick={populateDemoData}>
          Populate Demo Data
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Student UUID</label>
            <input 
              type="text" required
              className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface"
              value={formData.studentId}
              onChange={e => setFormData({ ...formData, studentId: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Course UUID</label>
            <input 
              type="text" required
              className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface"
              value={formData.courseId}
              onChange={e => setFormData({ ...formData, courseId: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Student Name</label>
            <input 
              type="text" required
              className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface"
              value={formData.studentName}
              onChange={e => setFormData({ ...formData, studentName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Course Name</label>
            <input 
              type="text" required
              className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface"
              value={formData.courseName}
              onChange={e => setFormData({ ...formData, courseName: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Institution Type</label>
            <select 
              className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface appearance-none"
              value={formData.institutionType}
              onChange={e => setFormData({ ...formData, institutionType: e.target.value })}
            >
              <option value="k12">K-12 School</option>
              <option value="uni">University</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" loading={loading} className="w-full justify-center">
            Mint Certificate
          </Button>
        </div>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10">
          <h3 className="text-sm font-bold text-[#10B981] mb-2 flex items-center gap-2">
            <Award size={16} /> Success!
          </h3>
          <div className="flex flex-col gap-2">
            {result.certificateUrl && (
              <a href={result.certificateUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-on-surface hover:text-[#EC4899] transition-colors">
                <Download size={16} /> Download Generated PDF
              </a>
            )}
            {result.txHash && (
              <a href={`https://amoy.polygonscan.com/tx/${result.txHash}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-on-surface hover:text-[#EC4899] transition-colors">
                <ExternalLink size={16} /> View Polygonscan Transaction
              </a>
            )}
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}
