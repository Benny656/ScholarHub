import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, BookOpen, FileText, Target, Rocket, Plus, X, Upload, Sparkles } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { coursesService } from '../../services/courses.service';
import { aiService } from '../../services/ai.service';
import { GlassCard, Button, Input, Select, PageHeader } from '../../components/ui/index';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Details', icon: <BookOpen size={16} /> },
  { id: 2, label: 'Materials', icon: <FileText size={16} /> },
  { id: 3, label: 'Outcomes', icon: <Target size={16} /> },
  { id: 4, label: 'Publish', icon: <Rocket size={16} /> },
];

export function CreateCourse() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: 'Web Development', level: 'Beginner', price: '', duration: '',
    objectives: [''], requirements: [''], outcomes: [''],
    sections: [{ title: 'Introduction', lessons: [{ title: 'Welcome', type: 'video' }] }],
  });

  const update = (field: string, val: unknown) => setForm(p => ({ ...p, [field]: val }));

  const addListItem = (field: 'objectives' | 'requirements' | 'outcomes') =>
    update(field, [...form[field], '']);

  const updateListItem = (field: 'objectives' | 'requirements' | 'outcomes', idx: number, val: string) => {
    const arr = [...form[field]]; arr[idx] = val; update(field, arr);
  };

  const removeListItem = (field: 'objectives' | 'requirements' | 'outcomes', idx: number) =>
    update(field, form[field].filter((_, i) => i !== idx));

  const handlePublish = async () => {
    setSaving(true);
    await coursesService.createCourse({ ...form, isPublished: true });
    setSaving(false);
    toast.success('Course published successfully! 🚀');
    navigate('/courses');
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    await coursesService.createCourse({ ...form, isPublished: false });
    setSaving(false);
    toast.success('Draft saved');
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    await aiService.generateQuiz(form.title, form.level, 5);
    setGeneratingQuiz(false);
    toast.success('AI Quiz generated! 🤖', { icon: '✨' });
  };

  const inputStyle = { background: 'rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' };

  return (
    <AppLayout>
      <PageHeader
        title="Create New Course"
        subtitle="Build and publish your course"
        breadcrumb={[{ label: 'Courses', href: '/courses' }, { label: 'Create' }]}
      />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  step === s.id ? 'text-white' :
                  step > s.id ? 'text-emerald-400 hover:bg-white/5' :
                  'text-slate-500'
                }`}
                style={step === s.id ? { background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' } : {}}
              >
                {step > s.id ? <Check size={16} className="text-emerald-400" /> : s.icon}
                <span className="text-sm font-semibold hidden sm:block">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-1 ${step > s.id ? 'bg-emerald-400/50' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard>
                <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'Geist, sans-serif' }}>Course Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Course Title *</label>
                    <input type="text" value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Complete React Development Bootcamp" className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:border-purple-500/60 text-white text-sm outline-none" style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
                    <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} placeholder="Describe what students will learn..." className="w-full px-4 py-2.5 rounded-xl border border-white/10 focus:border-purple-500/60 text-white text-sm outline-none resize-none" style={inputStyle} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Category" value={form.category} onChange={e => update('category', e.target.value)}
                      options={['Web Development','AI & ML','Design','Computer Science','Cloud & DevOps','Security'].map(c => ({ value: c, label: c }))} />
                    <Select label="Level" value={form.level} onChange={e => update('level', e.target.value)}
                      options={[{ value: 'Beginner', label: 'Beginner' }, { value: 'Intermediate', label: 'Intermediate' }, { value: 'Advanced', label: 'Advanced' }]} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Price ($)" type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0 for free" />
                    <Input label="Duration (e.g. 24h 30m)" value={form.duration} onChange={e => update('duration', e.target.value)} placeholder="e.g. 24h 30m" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 2: Materials */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Geist, sans-serif' }}>Course Curriculum</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" icon={<Sparkles size={14} />} size="sm" onClick={handleGenerateQuiz} loading={generatingQuiz}>
                      AI Quiz
                    </Button>
                    <Button variant="primary" size="sm" icon={<Plus size={14} />}
                      onClick={() => update('sections', [...form.sections, { title: 'New Section', lessons: [] }])}>
                      Section
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {form.sections.map((sec, si) => (
                    <div key={si} className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center">{si + 1}</div>
                        <input
                          value={sec.title}
                          onChange={e => {
                            const s = [...form.sections]; s[si] = { ...s[si], title: e.target.value };
                            update('sections', s);
                          }}
                          className="flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder-slate-500"
                          placeholder="Section title..."
                        />
                        <button onClick={() => update('sections', form.sections.filter((_, i) => i !== si))} className="text-slate-600 hover:text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="p-3 space-y-2">
                        {sec.lessons.map((les, li) => (
                          <div key={li} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <select
                              value={les.type}
                              onChange={e => {
                                const s = [...form.sections]; s[si].lessons[li] = { ...les, type: e.target.value };
                                update('sections', s);
                              }}
                              className="text-xs bg-transparent border border-white/10 rounded-lg px-2 py-1 text-slate-400 outline-none"
                              style={{ background: 'rgba(255,255,255,0.05)' }}
                            >
                              {['video','pdf','quiz','assignment'].map(t => <option key={t} value={t} style={{ background: '#0d1421' }}>{t}</option>)}
                            </select>
                            <input
                              value={les.title}
                              onChange={e => {
                                const s = [...form.sections]; s[si].lessons[li] = { ...les, title: e.target.value };
                                update('sections', s);
                              }}
                              className="flex-1 bg-transparent text-sm text-slate-300 outline-none placeholder-slate-500"
                              placeholder="Lesson title..."
                            />
                            <button onClick={() => {
                              const s = [...form.sections]; s[si].lessons = s[si].lessons.filter((_, i) => i !== li);
                              update('sections', s);
                            }} className="text-slate-600 hover:text-red-400 transition-colors"><X size={13} /></button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const s = [...form.sections]; s[si].lessons.push({ title: '', type: 'video' });
                            update('sections', s);
                          }}
                          className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors px-3 py-1.5"
                        >
                          <Plus size={13} /> Add Lesson
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload area */}
                <div className="mt-4 rounded-xl border-2 border-dashed border-white/15 hover:border-purple-500/30 p-8 text-center cursor-pointer transition-all hover:bg-white/3">
                  <Upload size={24} className="text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Drag & drop course materials or <span className="text-purple-400">browse files</span></p>
                  <p className="text-xs text-slate-600 mt-1">PDF, Video, PPT — up to 500MB</p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 3: Outcomes */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard>
                <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'Geist, sans-serif' }}>Learning Outcomes</h2>
                {([
                  { field: 'outcomes' as const, label: 'What students will learn', placeholder: 'e.g. Build full-stack web apps', color: 'emerald' },
                  { field: 'requirements' as const, label: 'Requirements / Prerequisites', placeholder: 'e.g. Basic JavaScript knowledge', color: 'blue' },
                  { field: 'objectives' as const, label: 'Course Objectives', placeholder: 'e.g. Master React ecosystem', color: 'purple' },
                ] as const).map(({ field, label, placeholder, color }) => (
                  <div key={field} className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-300" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</label>
                      <button onClick={() => addListItem(field)} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"><Plus size={13} /> Add</button>
                    </div>
                    <div className="space-y-2">
                      {form[field].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color === 'emerald' ? 'bg-emerald-400' : color === 'blue' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                          <input
                            value={item}
                            onChange={e => updateListItem(field, idx, e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 px-3 py-2 rounded-xl border border-white/10 focus:border-purple-500/60 text-white text-sm outline-none"
                            style={{ background: 'rgba(255,255,255,0.05)', fontFamily: 'Inter, sans-serif' }}
                          />
                          {form[field].length > 1 && (
                            <button onClick={() => removeListItem(field, idx)} className="text-slate-600 hover:text-red-400 transition-colors"><X size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </GlassCard>
            </motion.div>
          )}

          {/* Step 4: Publish */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard tint="purple">
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-purple-500/30"
                  >
                    <Rocket size={36} className="text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Geist, sans-serif' }}>Ready to Launch?</h2>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm">
                    Your course <strong className="text-white">"{form.title || 'Untitled Course'}"</strong> is ready to go live. Students will be able to enroll immediately.
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6 text-left">
                    {[
                      { label: 'Category', val: form.category },
                      { label: 'Level', val: form.level },
                      { label: 'Price', val: form.price ? `$${form.price}` : 'Free' },
                      { label: 'Sections', val: form.sections.length },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                        <p className="text-sm font-semibold text-white">{item.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="secondary" onClick={handleSaveDraft} loading={saving}>Save as Draft</Button>
                    <Button variant="primary" onClick={handlePublish} loading={saving} icon={<Rocket size={16} />}>Publish Course</Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            ← Back
          </Button>
          {step < 4 && (
            <Button variant="primary" onClick={() => setStep(Math.min(4, step + 1))}>
              Continue →
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
