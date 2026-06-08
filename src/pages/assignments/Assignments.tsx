import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Upload, X, Sparkles, AlertCircle, CheckCircle, Clock, FileText, ChevronRight, Download, Bot } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { assignmentsService } from '../../services/assignments.service';
import { aiService } from '../../services/ai.service';
import { uploadService } from '../../services/upload.service';
import { useAuth } from '../../context/AuthContext';
import { GlassCard, Badge, PageHeader, Button, SectionHeader, ProgressBar, SearchInput, Select, SkeletonCard } from '../../components/ui/index';
import type { Assignment } from '../../types';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { color: 'amber', label: 'Pending' },
  submitted: { color: 'blue', label: 'Submitted' },
  graded: { color: 'emerald', label: 'Graded' },
  overdue: { color: 'red', label: 'Overdue' },
} as const;

export function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('dueDate');

  useEffect(() => {
    if (!user) return;
    assignmentsService.getAssignments(user.id).then(data => { setAssignments(data); setLoading(false); });
  }, [user]);

  const filtered = assignments
    .filter(a => {
      const s = statusFilter === 'all' || a.status === statusFilter;
      const q = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.courseName.toLowerCase().includes(search.toLowerCase());
      return s && q;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sortBy === 'priority') {
        const p = { high: 0, medium: 1, low: 2 };
        return p[a.priority] - p[b.priority];
      }
      return 0;
    });

  const counts = { all: assignments.length, pending: assignments.filter(a => a.status === 'pending').length, submitted: assignments.filter(a => a.status === 'submitted').length, graded: assignments.filter(a => a.status === 'graded').length, overdue: assignments.filter(a => a.status === 'overdue').length };

  return (
    <AppLayout>
      <PageHeader title="Assignments" subtitle="Track and submit your work" breadcrumb={[{ label: 'Assignments' }]} />
      <div className="p-6 space-y-5">
        {/* Status tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'pending', 'submitted', 'graded', 'overdue'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all border ${statusFilter === s ? 'text-on-surface border-[#EA580C]/50 bg-[#EA580C]/20' : 'text-on-surface-variant border-outline-variant/20 hover:text-on-surface hover:border-outline-variant/40'}`}
            >
              {s}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === s ? 'bg-[#EA580C]/40' : 'bg-on-surface/[0.08]'}`}>{counts[s]}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search assignments..." />
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)} options={[{ value: 'dueDate', label: 'Due Date' }, { value: 'priority', label: 'Priority' }]} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
            <p>No assignments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a, i) => {
              const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);
              const sc = STATUS_CONFIG[a.status];
              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link to={a.type === 'quiz' ? `/assignments/${a.id}/quiz` : `/assignments/${a.id}`}>
                    <div className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] duration-200 cursor-pointer group ${a.status === 'overdue' ? 'border-red-500/20' : 'border-outline-variant/15'}`}
                      style={{ background: a.status === 'overdue' ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
                      <div className="flex items-start gap-4">
                        {/* Priority indicator */}
                        <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${a.priority === 'high' ? 'bg-red-500' : a.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-600'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-base font-semibold text-on-surface group-hover:text-[#EA580C] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{a.title}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant={sc.color as any}>{sc.label}</Badge>
                              <Badge variant={a.priority === 'high' ? 'red' : a.priority === 'medium' ? 'amber' : 'slate'}>{a.priority}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-on-surface-variant mb-3 line-clamp-1" style={{ fontFamily: 'Inter, sans-serif' }}>{a.description}</p>
                          <div className="flex items-center gap-4 flex-wrap text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1.5"><BookOpen size={12} className="text-[#EA580C]" /> {a.courseName}</span>
                            <span className="flex items-center gap-1.5 font-semibold" style={{ color: daysLeft < 0 ? '#f87171' : daysLeft <= 3 ? '#fbbf24' : '#94a3b8' }}>
                              <Clock size={12} /> {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                            </span>
                            <span>{new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            {a.score !== undefined && <span className="text-emerald-400 font-semibold">Score: {a.score}/{a.maxScore}</span>}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-outline group-hover:text-[#EA580C] transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ─── Assignment Detail ─────────────────────────────────────────────────────────
export function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiChecking, setAiChecking] = useState(false);
  const [aiResult, setAiResult] = useState<Awaited<ReturnType<typeof aiService.checkAssignment>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    assignmentsService.getAssignmentById(id).then(a => { setAssignment(a); setSubmitted(a.status === 'submitted' || a.status === 'graded'); setLoading(false); });
  }, [id]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  };

  const handleSubmit = async () => {
    if (!assignment || !user) return;
    setSubmitting(true);
    if (files.length) {
      for (const f of files) await uploadService.uploadAssignmentFile(f, assignment.id);
    }
    await assignmentsService.submitAssignment(assignment.id, { text: textAnswer, files });
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Assignment submitted! ✅');
  };

  const handleAICheck = async () => {
    setAiChecking(true);
    const result = await aiService.checkAssignment(textAnswer, 'Standard rubric');
    setAiResult(result);
    setAiChecking(false);
    toast.success('AI check complete! 🤖');
  };

  if (loading) return <AppLayout><div className="p-6"><SkeletonCard /></div></AppLayout>;
  if (!assignment) return <AppLayout><div className="p-6 text-on-surface-variant">Assignment not found</div></AppLayout>;

  const daysLeft = Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / 86400000);

  return (
    <AppLayout>
      <PageHeader
        title={assignment.title}
        subtitle={assignment.courseName}
        breadcrumb={[{ label: 'Assignments', href: '/assignments' }, { label: assignment.title }]}
      />
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={STATUS_CONFIG[assignment.status].color as any}>{STATUS_CONFIG[assignment.status].label}</Badge>
          <Badge variant={assignment.priority === 'high' ? 'red' : assignment.priority === 'medium' ? 'amber' : 'slate'}>{assignment.priority} priority</Badge>
          <span className="text-sm text-on-surface-variant flex items-center gap-1.5">
            <Clock size={14} /> {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `Due in ${daysLeft} days`}
          </span>
          <span className="text-sm text-on-surface-variant">Max: {assignment.maxScore} pts</span>
        </div>

        {/* Description */}
        <GlassCard>
          <h2 className="text-base font-bold text-on-surface mb-2" style={{ fontFamily: 'Geist, sans-serif' }}>Instructions</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{assignment.description}</p>
        </GlassCard>

        {/* Graded feedback */}
        {assignment.status === 'graded' && assignment.feedback && (
          <GlassCard tint="emerald">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-bold text-on-surface">Graded</h3>
                  <span className="text-2xl font-bold text-emerald-400">{assignment.score}/{assignment.maxScore}</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{assignment.feedback}</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Submission area */}
        {!submitted && assignment.status !== 'graded' && (
          <GlassCard>
            <SectionHeader title="Your Submission" />
            {assignment.type === 'text' && (
              <textarea
                value={textAnswer}
                onChange={e => setTextAnswer(e.target.value)}
                rows={8}
                placeholder="Write your answer here..."
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 focus:border-[#EA580C]/60 text-on-surface text-sm outline-none resize-none mb-4"
                style={{ background: 'color-mix(in srgb, var(--color-on-surface) 5%, transparent)', fontFamily: 'Inter, sans-serif' }}
              />
            )}

            {(assignment.type === 'file' || assignment.type === 'text') && (
              <div
                onDrop={handleFileDrop}
                onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-outline-variant/[0.15] hover:border-[#EA580C]/40 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-on-surface/[0.03] mb-4"
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <Upload size={24} className="text-on-surface-variant mx-auto mb-2" />
                <p className="text-sm text-on-surface-variant">Drag & drop or <span className="text-[#EA580C]">browse files</span></p>
                <input id="fileInput" type="file" multiple className="hidden" onChange={e => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-2 mb-4">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'color-mix(in srgb, var(--color-on-surface) 4%, transparent)' }}>
                    <FileText size={14} className="text-blue-400 flex-shrink-0" />
                    <span className="flex-1 text-sm text-on-surface-variant truncate">{f.name}</span>
                    <span className="text-xs text-on-surface-variant">{uploadService.formatFileSize(f.size)}</span>
                    <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="text-outline hover:text-red-400 transition-colors"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              {textAnswer && (
                <Button variant="secondary" icon={<Bot size={15} />} onClick={handleAICheck} loading={aiChecking}>
                  AI Check
                </Button>
              )}
              <Button variant="primary" onClick={handleSubmit} loading={submitting} icon={<CheckCircle size={15} />} className="ml-auto">
                Submit Assignment
              </Button>
            </div>
          </GlassCard>
        )}

        {/* AI Check result */}
        <AnimatePresence>
          {aiResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard tint="purple">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-[#EA580C]" />
                  <h3 className="text-base font-bold text-on-surface">AI Assignment Review</h3>
                  <span className="ml-auto text-2xl font-bold text-[#EA580C]">{aiResult.score}/100</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">{aiResult.feedback}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-400 mb-2">✓ Strengths</p>
                    {aiResult.strengths.map((s, i) => <p key={i} className="text-xs text-on-surface-variant mb-1">• {s}</p>)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-400 mb-2">↑ Improvements</p>
                    {aiResult.improvements.map((s, i) => <p key={i} className="text-xs text-on-surface-variant mb-1">• {s}</p>)}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant/15">
                  <span className="text-xs text-on-surface-variant">Plagiarism score:</span>
                  <span className={`text-xs font-bold ${aiResult.plagiarismScore < 20 ? 'text-emerald-400' : 'text-red-400'}`}>{aiResult.plagiarismScore}%</span>
                  <Badge variant={aiResult.plagiarismScore < 20 ? 'emerald' : 'red'}>{aiResult.plagiarismScore < 20 ? 'Original' : 'Review needed'}</Badge>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {submitted && assignment.status !== 'graded' && (
          <GlassCard tint="blue">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-on-surface">Submitted successfully</p>
                <p className="text-xs text-on-surface-variant">Awaiting instructor review</p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </AppLayout>
  );
}

// ─── Quiz ──────────────────────────────────────────────────────────────────────
export function Quiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Awaited<ReturnType<typeof assignmentsService.getQuiz>> | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ score: number; total: number; results: Record<string, boolean> } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    assignmentsService.getQuiz(id).then(q => {
      setQuiz(q);
      setTimeLeft(q.timeLimit * 60);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!timeLeft || submitted) return;
    const timer = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleSubmit = async () => {
    if (!quiz) return;
    const r = await assignmentsService.submitQuiz(quiz.id, answers);
    setResults(r);
    setSubmitted(true);
  };

  if (loading) return <AppLayout><div className="p-6"><SkeletonCard /></div></AppLayout>;
  if (!quiz) return <AppLayout><div className="p-6 text-on-surface-variant">Quiz not found</div></AppLayout>;

  const q = quiz.questions[currentQ];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timePercent = (timeLeft / (quiz.timeLimit * 60)) * 100;

  return (
    <AppLayout>
      {submitted && results ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-2xl mx-auto">
          <GlassCard tint="emerald">
            <div className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
                className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-black text-on-surface ${results.score >= results.total * 0.7 ? 'bg-gradient-to-br from-emerald-500 to-blue-500' : 'bg-gradient-to-br from-amber-500 to-red-500'}`}
                style={{ boxShadow: `0 0 40px ${results.score >= results.total * 0.7 ? 'rgba(78,222,163,0.4)' : 'rgba(245,158,11,0.4)'}` }}>
                {Math.round((results.score / results.total) * 100)}%
              </motion.div>
              <h2 className="text-2xl font-bold text-on-surface mb-2" style={{ fontFamily: 'Geist, sans-serif' }}>
                {results.score >= results.total * 0.7 ? 'Great Job! 🎉' : 'Keep Practicing! 📚'}
              </h2>
              <p className="text-on-surface-variant mb-6">Score: <span className="text-on-surface font-bold text-xl">{results.score}/{results.total}</span></p>
              <div className="space-y-3 text-left mb-6">
                {quiz.questions.map((q, i) => (
                  <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl ${results.results[q.id] ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    {results.results[q.id] ? <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" /> : <X size={16} className="text-red-400 flex-shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium text-on-surface mb-1">{q.question}</p>
                      {!results.results[q.id] && q.explanation && <p className="text-xs text-on-surface-variant">{q.explanation}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="primary" onClick={() => navigate('/assignments')}>Back to Assignments</Button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="p-6 max-w-2xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>{quiz.title}</h1>
              <p className="text-sm text-on-surface-variant">Question {currentQ + 1} of {quiz.questions.length}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-lg ${timeLeft < 60 ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-outline-variant/20 text-on-surface'}`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <Clock size={16} />
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>

          {/* Timer bar */}
          <ProgressBar value={timePercent} color={timeLeft < 60 ? 'red' : timeLeft < 300 ? 'amber' : 'blue'} size="md" />

          {/* Question progress dots */}
          <div className="flex gap-1.5">
            {quiz.questions.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < currentQ ? 'bg-emerald-400' : i === currentQ ? 'bg-[#EA580C]' : answers[quiz.questions[i].id] !== undefined ? 'bg-blue-500/60' : 'bg-on-surface/10'}`} />
            ))}
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <GlassCard tint="purple">
                <div className="flex items-start gap-3 mb-6">
                  <span className="w-7 h-7 rounded-xl bg-[#EA580C]/20 text-[#EA580C] text-sm font-bold flex items-center justify-center flex-shrink-0">{currentQ + 1}</span>
                  <h2 className="text-base font-semibold text-on-surface leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{q.question}</h2>
                </div>

                <div className="space-y-3">
                  {q.options.map((option, oi) => {
                    const selected = answers[q.id] === oi;
                    return (
                      <motion.button
                        key={oi}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setAnswers(p => ({ ...p, [q.id]: oi }))}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${selected ? 'border-[#EA580C]/60 bg-[#EA580C]/20 text-on-surface' : 'border-outline-variant/20 hover:border-outline-variant/40 text-on-surface-variant hover:bg-on-surface/5'}`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold mr-3 ${selected ? 'bg-[#EA580C] text-on-surface' : 'bg-on-surface/10 text-on-surface-variant'}`}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {option}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-outline-variant/15">
                  <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-on-surface-variant border border-outline-variant/20 hover:bg-on-surface/5 disabled:opacity-40 transition-all">
                    ← Prev
                  </button>
                  <span className="flex-1 text-center text-xs text-on-surface-variant">{Object.keys(answers).length}/{quiz.questions.length} answered</span>
                  {currentQ < quiz.questions.length - 1 ? (
                    <button onClick={() => setCurrentQ(q => Math.min(quiz.questions.length - 1, q + 1))} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-on-surface border border-[#EA580C]/30 hover:bg-[#EA580C]/15 transition-all">
                      Next →
                    </button>
                  ) : (
                    <Button variant="primary" onClick={handleSubmit}>Submit Quiz</Button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </AppLayout>
  );
}
