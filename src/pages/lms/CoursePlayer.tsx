import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Volume2, Maximize2, ChevronRight, ChevronLeft,
  CheckCircle, Lock, BookOpen, Download, FileText, Video as VideoIcon,
  Award, ChevronDown, Settings2,
} from 'lucide-react';
import { coursesService } from '../../services/courses.service';
import { GlassCard, Badge, ProgressBar, Avatar } from '../../components/ui/index';
import type { Course } from '../../types';

const RESOURCES = [
  { name: 'React Hooks Cheatsheet.pdf', size: '1.2 MB', type: 'pdf' },
  { name: 'Project Starter Files.zip', size: '4.8 MB', type: 'zip' },
  { name: 'Lesson Notes.docx', size: '340 KB', type: 'docx' },
];

export function CoursePlayer() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>('s1');
  const [currentLesson, setCurrentLesson] = useState({ id: lessonId || 'l1', title: 'React Hooks Deep Dive', type: 'video' });
  const [viewMode, setViewMode] = useState<'video' | 'pdf'>('video');

  useEffect(() => {
    if (courseId) coursesService.getCourseById(courseId).then(setCourse);
  }, [courseId]);

  // Simulate progress
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => setProgress(p => Math.min(100, p + 0.3)), 300);
    return () => clearInterval(interval);
  }, [playing]);

  const ALL_LESSONS = course?.curriculum?.flatMap(s => s.lessons) || [
    { id: 'l1', title: 'Course Overview', type: 'video' as const, duration: '5:30', isCompleted: true },
    { id: 'l2', title: 'Setting Up Environment', type: 'video' as const, duration: '12:00', isCompleted: true },
    { id: 'l3', title: 'React Hooks Deep Dive', type: 'video' as const, duration: '28:00', isCompleted: false },
    { id: 'l4', title: 'State Management', type: 'video' as const, duration: '20:00', isCompleted: false, isLocked: false },
    { id: 'l5', title: 'Chapter Quiz', type: 'quiz' as const, isCompleted: false, isLocked: false },
  ];

  const currentIdx = ALL_LESSONS.findIndex(l => l.id === currentLesson.id);
  const completedCount = ALL_LESSONS.filter(l => l.isCompleted).length;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col border-r border-outline-variant/10 flex-shrink-0 overflow-hidden bg-[#FFFCE1]/95 dark:bg-[#1F150C]/98 backdrop-blur-md"
          >
            {/* Course info */}
            <div className="px-4 py-4 border-b border-outline-variant/10">
              <Link to="/courses" className="text-xs text-[#9d95ff] hover:text-[#9d95ff] flex items-center gap-1 mb-3">
                <ChevronLeft size={13} /> Back to courses
              </Link>
              <h2 className="text-sm font-bold text-on-surface leading-tight mb-2" style={{ fontFamily: 'Geist, sans-serif' }}>
                {course?.title || 'Full-Stack Web Development'}
              </h2>
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
                <span>{completedCount}/{ALL_LESSONS.length} lessons</span>
                <span className="font-medium text-[#9d95ff]">{Math.round((completedCount / ALL_LESSONS.length) * 100)}%</span>
              </div>
              <ProgressBar value={completedCount} max={ALL_LESSONS.length} color="purple" />
            </div>

            {/* Lessons */}
            <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
              {(course?.curriculum?.length ? course.curriculum : [
                { id: 's1', title: 'Getting Started', lessons: ALL_LESSONS.slice(0, 2) },
                { id: 's2', title: 'React Fundamentals', lessons: ALL_LESSONS.slice(2) },
              ]).map(section => (
                <div key={section.id}>
                  <button
                    onClick={() => setActiveSection(s => s === section.id ? null : section.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wide hover:text-on-surface transition-colors"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {section.title}
                    <ChevronDown size={13} className={`transition-transform ${activeSection === section.id ? '' : '-rotate-90'}`} />
                  </button>
                  {activeSection === section.id && section.lessons.map(lesson => (
                    <button
                      key={lesson.id}
                      onClick={() => !lesson.isLocked && setCurrentLesson({ id: lesson.id, title: lesson.title, type: lesson.type })}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${lesson.id === currentLesson.id ? 'bg-[#9d95ff]/15 border-r-2 border-[#9d95ff]' : 'hover:bg-on-surface/5'} ${lesson.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex-shrink-0">
                        {lesson.isCompleted ? <CheckCircle size={14} className="text-[#00bae2]" /> :
                         lesson.isLocked ? <Lock size={13} className="text-slate-600" /> :
                         lesson.type === 'video' ? <Play size={13} className={lesson.id === currentLesson.id ? 'text-[#9d95ff]' : 'text-slate-500'} /> :
                         lesson.type === 'quiz' ? <span className="text-amber-500 text-xs font-bold">Q</span> :
                         <FileText size={13} className="text-[#00bae2]" />}
                      </div>
                      <span className={`text-sm flex-1 min-w-0 truncate ${lesson.id === currentLesson.id ? 'text-brand-primary dark:text-[#9d95ff] font-medium' : 'text-on-surface-variant'}`}>
                        {lesson.title}
                      </span>
                      {lesson.duration && <span className="text-xs text-slate-600 flex-shrink-0">{lesson.duration}</span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/10 bg-[#FFFCE1]/95 dark:bg-[#1F150C]/95 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(o => !o)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-all">
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-on-surface truncate" style={{ fontFamily: 'Geist, sans-serif' }}>{currentLesson.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(v => v === 'video' ? 'pdf' : 'video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${viewMode === 'pdf' ? 'border-[#00bae2]/40 bg-[#00bae2]/10 text-[#00bae2]' : 'border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5'}`}
            >
              <FileText size={13} /> PDF View
            </button>
          </div>
        </div>

        {/* Video / PDF Player */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {viewMode === 'video' ? (
              <div className="relative rounded-2xl overflow-hidden" style={{ background: '#000', aspectRatio: '16/9' }}>
                {/* Fake video player */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))' }}>
                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPlaying(p => !p)}
                      className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all"
                      style={{ background: 'rgba(139,92,246,0.8)', boxShadow: '0 0 40px rgba(139,92,246,0.5)' }}
                    >
                      {playing ? <Pause size={32} className="text-[#E1DCC9]" /> : <Play size={32} className="text-[#E1DCC9] ml-1" />}
                    </motion.button>
                    <p className="text-slate-300 text-sm mt-4">{currentLesson.title}</p>
                  </div>
                </div>

                {/* Progress bar overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                  <div className="relative w-full h-1 bg-[#FFFCE1]/20 rounded-full cursor-pointer mb-3" onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setProgress(((e.clientX - rect.left) / rect.width) * 100);
                  }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #9d95ff, #00bae2)' }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FFFCE1] shadow-lg transition-all" style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPlaying(p => !p)} className="text-[#E1DCC9] hover:text-[#9d95ff] transition-colors">
                      {playing ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <div className="flex items-center gap-2">
                      <Volume2 size={15} className="text-[#7c7c6f]" />
                      <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(+e.target.value)} className="w-20 accent-[#9d95ff]" />
                    </div>
                    <span className="text-xs text-[#7c7c6f] flex-1 text-center" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {Math.round(progress * 0.28)}:00 / 28:00
                    </span>
                    <button className="text-[#7c7c6f] hover:text-[#E1DCC9] transition-colors"><Maximize2 size={16} /></button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-outline-variant/20 overflow-hidden bg-[#FFFCE1]/30 dark:bg-[#412D15]/40" style={{ minHeight: 480 }}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10">
                  <span className="text-sm font-semibold text-on-surface">React Hooks Cheatsheet.pdf</span>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span>Page 1 / 12</span>
                    <Settings2 size={14} />
                  </div>
                </div>
                <div className="flex items-center justify-center h-80 text-slate-500">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto mb-3 text-slate-600" />
                    <p className="text-sm">PDF Viewer Placeholder</p>
                    <p className="text-xs text-slate-600 mt-1">In production: Embed PDF.js or react-pdf</p>
                  </div>
                </div>
              </div>
            )}

             {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (currentIdx > 0) setCurrentLesson({ id: ALL_LESSONS[currentIdx - 1].id, title: ALL_LESSONS[currentIdx - 1].title, type: ALL_LESSONS[currentIdx - 1].type });
                }}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-on-surface-variant border border-outline-variant/30 hover:bg-on-surface/5 disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <span className="text-xs text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Lesson {currentIdx + 1} / {ALL_LESSONS.length}
              </span>
              <button
                onClick={() => {
                  if (currentIdx < ALL_LESSONS.length - 1) setCurrentLesson({ id: ALL_LESSONS[currentIdx + 1].id, title: ALL_LESSONS[currentIdx + 1].title, type: ALL_LESSONS[currentIdx + 1].type });
                }}
                disabled={currentIdx === ALL_LESSONS.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-on-surface border border-outline-variant/30 hover:bg-[#9d95ff]/15 disabled:opacity-40 transition-all"
                style={{ borderColor: 'rgba(139,92,246,0.3)' }}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>

            {/* Downloads */}
            <GlassCard>
              <h3 className="text-sm font-bold text-on-surface mb-3" style={{ fontFamily: 'Geist, sans-serif' }}>Lesson Resources</h3>
              <div className="space-y-2">
                {RESOURCES.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-on-surface/5 transition-all cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-[#00bae2]/15 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-[#00bae2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-on-surface truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{r.name}</p>
                      <p className="text-xs text-on-surface-variant">{r.size}</p>
                    </div>
                    <Download size={14} className="text-slate-600 group-hover:text-[#9d95ff] transition-colors" />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
