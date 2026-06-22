import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles, Download, ExternalLink, AlertTriangle, Building, GraduationCap } from 'lucide-react';
import { Button, GlassCard } from '../../components/ui';
import toast from 'react-hot-toast';

export function AdminIssueCertificate() {
  const [templateType, setTemplateType] = useState<'k12' | 'uni'>('k12');
  
  // Shared fields
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  
  // K-12 specific
  const [subjectId, setSubjectId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  
  // Uni specific
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ certificateUrl: string; txHash: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const populateDemoData = () => {
    setStudentId(crypto.randomUUID());
    setStudentName('Alex Mercer');
    if (templateType === 'k12') {
      setSubjectId(crypto.randomUUID());
      setSubjectName('Advanced Mathematics');
      setGradeLevel('10th Grade');
    } else {
      setCourseId(crypto.randomUUID());
      setCourseName('Introduction to AI');
      setDegreeProgram('B.S. Computer Science');
    }
    toast.success('Demo data populated!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setErrorMsg(null);

    // Build the payload expected by the minting API
    const formData = {
      studentId,
      studentName,
      institutionType: templateType,
      courseId: templateType === 'k12' ? subjectId : courseId,
      courseName: templateType === 'k12' ? subjectName : courseName,
      // Extras mapped into a metadata field in case the backend supports extensions
      metadata: templateType === 'k12' ? { gradeLevel } : { degreeProgram }
    };

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
      setErrorMsg(err.message || 'Error minting certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Template Toggle Section */}
      <GlassCard className="p-6 border border-outline-variant/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Award className="text-brand-primary" size={20} /> Certificate Type
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">Select the institutional template to generate.</p>
        </div>
        
        <div className="flex bg-on-surface/5 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => {
              setTemplateType('k12');
              setResult(null);
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              templateType === 'k12'
                ? 'bg-[#FFFCE1] dark:bg-[#412D15] text-brand-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Building size={16} /> K-12 Template
          </button>
          <button
            onClick={() => {
              setTemplateType('uni');
              setResult(null);
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              templateType === 'uni'
                ? 'bg-[#FFFCE1] dark:bg-[#412D15] text-brand-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <GraduationCap size={16} /> University Template
          </button>
        </div>
      </GlassCard>

      {/* Main Issue Form */}
      <GlassCard className="p-6 border border-outline-variant/20 rounded-2xl relative overflow-hidden">
        {/* Subtle background decoration based on type */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${templateType === 'k12' ? 'bg-[#00bae2]' : 'bg-[#9d95ff]'}`} />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Award className={templateType === 'k12' ? 'text-[#00bae2]' : 'text-[#9d95ff]'} size={20} /> 
              Issue {templateType === 'k12' ? 'K-12' : 'University'} Certificate
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">Generate and lock certificates on the Polygon blockchain.</p>
          </div>
          <Button variant="secondary" icon={<Sparkles size={16} />} onClick={populateDemoData}>
            Populate Demo Data
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={templateType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Shared Fields */}
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Student UUID</label>
                <input 
                  type="text" required
                  className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Student Name</label>
                <input 
                  type="text" required
                  className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                />
              </div>

              {/* K-12 Specific Fields */}
              {templateType === 'k12' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Subject UUID</label>
                    <input 
                      type="text" required
                      className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface focus:border-[#00bae2] outline-none transition-colors"
                      value={subjectId}
                      onChange={e => setSubjectId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Subject Name</label>
                    <input 
                      type="text" required
                      className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface focus:border-[#00bae2] outline-none transition-colors"
                      value={subjectName}
                      onChange={e => setSubjectName(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Grade Level</label>
                    <input 
                      type="text" required
                      className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface focus:border-[#00bae2] outline-none transition-colors"
                      value={gradeLevel}
                      onChange={e => setGradeLevel(e.target.value)}
                      placeholder="e.g. 10th Grade"
                    />
                  </div>
                </>
              )}

              {/* University Specific Fields */}
              {templateType === 'uni' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Course UUID</label>
                    <input 
                      type="text" required
                      className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface focus:border-[#9d95ff] outline-none transition-colors"
                      value={courseId}
                      onChange={e => setCourseId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Course Name</label>
                    <input 
                      type="text" required
                      className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface focus:border-[#9d95ff] outline-none transition-colors"
                      value={courseName}
                      onChange={e => setCourseName(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Degree Program</label>
                    <input 
                      type="text" required
                      className="w-full bg-on-surface/5 border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface focus:border-[#9d95ff] outline-none transition-colors"
                      value={degreeProgram}
                      onChange={e => setDegreeProgram(e.target.value)}
                      placeholder="e.g. B.S. Computer Science"
                    />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="pt-4">
            <Button type="submit" variant="primary" loading={loading} className="w-full justify-center">
              Mint {templateType === 'k12' ? 'K-12' : 'University'} Certificate
            </Button>
          </div>
        </form>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl border border-[#00bae2]/30 bg-[#00bae2]/10">
            <h3 className="text-sm font-bold text-[#00bae2] mb-2 flex items-center gap-2">
              <Award size={16} /> Success!
            </h3>
            <div className="flex flex-col gap-2">
              {result.certificateUrl && (
                <a href={result.certificateUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-on-surface hover:text-[#ef4444] transition-colors">
                  <Download size={16} /> Download Generated PDF
                </a>
              )}
              {result.txHash && (
                <a href={`https://amoy.polygonscan.com/tx/${result.txHash}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-on-surface hover:text-[#ef4444] transition-colors">
                  <ExternalLink size={16} /> View Polygonscan Transaction
                </a>
              )}
            </div>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
            <h3 className="text-sm font-bold text-red-500 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> Minting Failed
            </h3>
            <p className="text-sm text-red-500/80">{errorMsg}</p>
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}
