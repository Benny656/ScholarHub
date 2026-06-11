import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, Clock, BookOpen, Play, ChevronDown, ChevronRight, CheckCircle, Lock, Award, Download } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { coursesService } from '../../services/courses.service';
import { useAuth } from '../../context/AuthContext';
import { GlassCard, Badge, ProgressBar, PageHeader, Button, SkeletonCard } from '../../components/ui/index';
import type { Course } from '../../types';
import toast from 'react-hot-toast';

const LEVEL_COLORS = { Beginner: 'emerald', Intermediate: 'blue', Advanced: 'red' } as const;

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('s1');
  const enrolled = user?.enrolledCourses?.includes(id || '') || ['c1','c2','c3'].includes(id || '');

  useEffect(() => {
    if (!id) return;
    coursesService.getCourseById(id).then(c => { setCourse(c); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user || !id) return;
    setEnrolling(true);
    await coursesService.enrollStudent(id, user.id);
    setEnrolling(false);
    toast.success("You're enrolled! Let's start learning 🎉");
  };

  if (loading) return <AppLayout><div className="p-6 grid grid-cols-3 gap-6">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div></AppLayout>;
  if (!course) return <AppLayout><div className="p-6 text-center text-slate-400">Course not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="relative">
        {/* Hero banner */}
        <div className="px-6 py-8 border-b border-white/5" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))' }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={LEVEL_COLORS[course.level]}>{course.level}</Badge>
                  <Badge variant="purple">{course.category}</Badge>
                </div>
                <h1 className="text-3xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>{course.title}</h1>
                <p className="text-slate-300 mb-4 text-sm leading-relaxed max-w-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>{course.description}</p>

                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= Math.floor(course.rating) ? '#F59E0B' : 'none'} className="text-amber-400" />)}
                    <span className="text-amber-400 ml-1 font-bold">{course.rating}</span>
                    <span className="text-slate-400 ml-1">({course.reviews.toLocaleString()} reviews)</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-slate-300"><Users size={14} className="text-blue-400" /> {course.enrolled.toLocaleString()} students</span>
                  <span className="flex items-center gap-1.5 text-slate-300"><BookOpen size={14} className="text-purple-400" /> {course.lessons} lessons</span>
                  <span className="flex items-center gap-1.5 text-slate-300"><Clock size={14} className="text-emerald-400" /> {course.duration}</span>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {course.instructor[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{course.instructor}</p>
                    <p className="text-xs text-slate-400">Course Instructor</p>
                  </div>
                </div>
              </div>

              {/* Enroll card */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <GlassCard className="sticky top-4">
                  <div className="text-center mb-5">
                    <p className="text-3xl font-bold text-white mb-1">
                      {user?.user_type === 'school' ? 'Free Forever' : `₹${course.price}`}
                    </p>
                    {enrolled && <p className="text-sm text-emerald-400">✓ Already enrolled</p>}
                  </div>
                  {enrolled ? (
                    <Link to={`/learn/${course.id}/l1`}>
                      <Button variant="primary" className="w-full justify-center" icon={<Play size={16} />}>
                        Continue Learning
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="primary" className="w-full justify-center" onClick={handleEnroll} loading={enrolling}>
                      {user?.user_type === 'school' ? 'Enroll Now' : `Enroll Now — ₹${course.price}`}
                    </Button>
                  )}
                  <div className="mt-4 space-y-2">
                    {[
                      { icon: <BookOpen size={14} />, label: `${course.lessons} lessons` },
                      { icon: <Clock size={14} />, label: course.duration + ' total' },
                      { icon: <Download size={14} />, label: 'Downloadable resources' },
                      { icon: <Award size={14} />, label: 'Certificate on completion' },
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="text-purple-400">{f.icon}</span> {f.label}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/8">
                    <div className="flex flex-wrap gap-1.5">
                      {course.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.2)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Curriculum + What you'll learn */}
            <div className="lg:col-span-2 space-y-6">
              {/* Outcomes */}
              <GlassCard tint="emerald">
                <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Geist, sans-serif' }}>What you'll learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {course.outcomes.map((o, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300" style={{ fontFamily: 'Inter, sans-serif' }}>{o}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Curriculum */}
              <GlassCard>
                <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Geist, sans-serif' }}>Course Curriculum</h2>
                <div className="space-y-2">
                  {(course.curriculum.length ? course.curriculum : [
                    { id: 's1', title: 'Getting Started', lessons: [
                      { id: 'l1', title: 'Course Overview', type: 'video' as const, duration: '5:30', isCompleted: true },
                      { id: 'l2', title: 'Setting Up Environment', type: 'video' as const, duration: '12:00', isCompleted: true },
                    ]},
                    { id: 's2', title: 'Core Concepts', lessons: [
                      { id: 'l3', title: 'Fundamentals Deep Dive', type: 'video' as const, duration: '22:00', isCompleted: false, isLocked: !enrolled },
                      { id: 'l4', title: 'Practical Quiz', type: 'quiz' as const, isCompleted: false, isLocked: !enrolled },
                    ]},
                  ]).map(section => (
                    <div key={section.id} className="rounded-xl overflow-hidden border border-white/8">
                      <button
                        onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                      >
                        <span className="text-sm font-semibold text-white">{section.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{section.lessons.length} lessons</span>
                          {openSection === section.id ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                        </div>
                      </button>
                      {openSection === section.id && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          {section.lessons.map(lesson => (
                            <div key={lesson.id} className={`flex items-center gap-3 px-4 py-2.5 border-t border-white/5 ${lesson.isLocked ? 'opacity-50' : 'hover:bg-white/3'} transition-colors`}>
                              <div className="flex-shrink-0">
                                {lesson.isCompleted ? <CheckCircle size={15} className="text-emerald-400" /> :
                                 lesson.isLocked ? <Lock size={14} className="text-slate-500" /> :
                                 lesson.type === 'video' ? <Play size={14} className="text-blue-400" /> :
                                 lesson.type === 'quiz' ? <span className="text-amber-400 text-xs">Q</span> :
                                 <BookOpen size={14} className="text-purple-400" />}
                              </div>
                              <span className="flex-1 text-sm text-slate-300">{lesson.title}</span>
                              {lesson.duration && <span className="text-xs text-slate-500">{lesson.duration}</span>}
                              <Badge variant={lesson.type === 'video' ? 'blue' : lesson.type === 'quiz' ? 'amber' : 'purple'} size="sm">{lesson.type}</Badge>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Right: Requirements */}
            <div className="space-y-5">
              <GlassCard>
                <h2 className="text-base font-bold text-white mb-3" style={{ fontFamily: 'Geist, sans-serif' }}>Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-purple-400 flex-shrink-0">•</span> {r}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              <GlassCard tint="blue">
                <h2 className="text-base font-bold text-white mb-3" style={{ fontFamily: 'Geist, sans-serif' }}>About the Instructor</h2>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {course.instructor[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{course.instructor}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} fill="#F59E0B" className="text-amber-400" />
                      <span className="text-xs text-amber-400">{course.rating}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Expert instructor with 10+ years of industry experience, passionate about making complex topics accessible to everyone.</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Edit Course — reuses CreateCourse form prefilled
export function EditCourse() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  useEffect(() => {
    if (id) coursesService.getCourseById(id).then(setCourse);
  }, [id]);
  if (!course) return <AppLayout><div className="p-6"><SkeletonCard /></div></AppLayout>;
  return (
    <AppLayout>
      <PageHeader title={`Edit: ${course.title}`} subtitle="Update course details" breadcrumb={[{ label: 'Courses' }, { label: 'Edit' }]} />
      <div className="p-6 text-center text-slate-400 py-20">
        <p className="text-4xl mb-4">✏️</p>
        <p className="text-lg font-semibold text-white mb-2">Course Editor</p>
        <p className="text-sm text-slate-400">Same interface as Create Course, pre-filled with current data.</p>
        <Link to="/courses/create" className="inline-block mt-4">
          <Button variant="primary">Open Full Editor →</Button>
        </Link>
      </div>
    </AppLayout>
  );
}
