import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Users, Clock, BookOpen, Play, ChevronDown, ChevronRight, 
  CheckCircle, Lock, Award, Download, Calendar, BarChart3, 
  QrCode, Scan, AlertCircle, RefreshCw, Check, CheckSquare, Plus, Edit2, Sparkles, CheckCircle2
} from 'lucide-react';
import { coursesService } from '../../services/courses.service';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { GlassCard, Badge, PageHeader, Button, ProgressBar } from '../../components/ui/index';
import { certificatesService } from '../../services/certificates.service';
import { TeacherGradebook } from '../../components/assignments/TeacherGradebook';
import { BulkAttendance } from '../../components/attendance/BulkAttendance';
import { AIQuizGenerator } from '../../components/courses/AIQuizGenerator';
import { CourseAITutor } from '../../components/courses/CourseAITutor';
import { InsightsDashboard } from '../../components/courses/InsightsDashboard';
import toast from 'react-hot-toast';

const LEVEL_COLORS = { Beginner: 'emerald', Intermediate: 'blue', Advanced: 'red' } as const;
const courseDetailDb = supabase as any;

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  
  // Tab Navigation state
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'assignments' | 'attendance' | 'live' | 'progress' | 'certificates' | 'students' | 'analytics' | 'gradebook'>('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);

  // Operational states
  const [lessons, setLessons] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [activeLiveSession, setActiveLiveSession] = useState<any | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [certificate, setCertificate] = useState<any>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);

  // Tab curriculum toggle
  const [openSection, setOpenSection] = useState<string | null>('s1');

  // Attendance scanner simulation states
  const [scanning, setScanning] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  // Assignment submission states
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Certificate claim states
  const [claiming, setClaiming] = useState(false);

  // Teacher Creation Forms
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'pdf' | 'ppt' | 'quiz'>('video');
  const [newLessonDuration, setNewLessonDuration] = useState(10);
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgDesc, setNewAsgDesc] = useState('');
  const [newAsgDueDate, setNewAsgDueDate] = useState('');
  const [newAsgMaxGrade, setNewAsgMaxGrade] = useState(100);
  const [isAddingAsg, setIsAddingAsg] = useState(false);

  const [newLiveTitle, setNewLiveTitle] = useState('');
  const [newLiveDate, setNewLiveDate] = useState('');
  const [isAddingLive, setIsAddingLive] = useState(false);

  // Teacher Grading States
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(100);
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const loadCourseData = async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      // 1. Fetch course details
      const courseObj = await coursesService.getCourseById(id);
      setCourse(courseObj);

      const isTeacher = user.role === 'teacher';

      // 2. Check enrollment (for students only)
      if (isTeacher) {
        setIsEnrolled(false);
        setEnrollmentProgress(0);
      } else {
        const { data: enrollData, error: enrollError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', user.id)
          .eq('course_id', id)
          .maybeSingle();

        if (enrollError) throw enrollError;

        if (enrollData) {
          setIsEnrolled(true);
          setEnrollmentProgress(Number(enrollData.progress) || 0);
        } else {
          setIsEnrolled(false);
          setEnrollmentProgress(0);
        }
      }

      // 3. Fetch assignments
      const { data: asgData } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', id)
        .order('due_date', { ascending: true });
      setAssignments(asgData || []);

      const assignmentIds = (asgData || []).map(a => a.id);

      // 4. Fetch submissions (Teacher gets all, Student gets own)
      let subData: any[] = [];
      if (isTeacher) {
        if (assignmentIds.length > 0) {
          const { data: allSubmissions } = await supabase
            .from('submissions')
            .select(`
              *,
              users:student_id (
                id,
                name,
                email
              )
            `)
            .in('assignment_id', assignmentIds)
            .order('submitted_at', { ascending: false });
          subData = allSubmissions || [];
        }
      } else {
        const { data: ownSubmissions } = await supabase
          .from('submissions')
          .select('*')
          .eq('student_id', user.id);
        subData = ownSubmissions || [];
      }
      setSubmissions(subData || []);

      // 5. Fetch lessons
      const { data: lesData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index', { ascending: true });
      setLessons(lesData || []);

      // 6. Fetch live classes
      const { data: liveData } = await supabase
        .from('live_classes')
        .select('*')
        .eq('course_id', id)
        .order('scheduled_at', { ascending: true });
      setLiveClasses(liveData || []);

      const { data: liveSessionData } = await courseDetailDb
        .from('live_sessions')
        .select('*')
        .eq('classroom_id', id)
        .eq('status', 'LIVE')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setActiveLiveSession(liveSessionData || null);

      // 7. Fetch attendance (Teacher gets all, Student gets own)
      let attData: any[] = [];
      if (isTeacher) {
        const { data: allAttendance } = await supabase
          .from('attendance')
          .select(`
            *,
            users:student_id (
              name
            )
          `)
          .eq('course_id', id)
          .order('marked_at', { ascending: false });
        attData = allAttendance || [];
      } else {
        const { data: ownAttendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', user.id)
          .eq('course_id', id);
        attData = ownAttendance || [];
      }
      setAttendanceRecords(attData || []);

      // 8. Fetch certificate or enrolled students list
      if (!isTeacher) {
        const { data: certData } = await supabase
          .from('certificates')
          .select('*')
          .eq('student_id', user.id)
          .eq('course_id', id)
          .maybeSingle();
        setCertificate(certData || null);
      } else {
        const { data: enrolls } = await supabase
          .from('enrollments')
          .select(`
            enrolled_at,
            progress,
            users:student_id (
              id,
              name,
              email,
              avatar_url
            )
          `)
          .eq('course_id', id);
        setEnrolledStudents(enrolls || []);
      }

    } catch (err) {
      console.error('Error loading course tabs data:', err);
      toast.error('Failed to load course details from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [id, user]);

  useEffect(() => {
    if (!id || !user) return;

    const channel = supabase
      .channel(`course-live-session-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_sessions',
          filter: `classroom_id=eq.${id}`,
        },
        async () => {
          const { data } = await courseDetailDb
            .from('live_sessions')
            .select('*')
            .eq('classroom_id', id)
            .eq('status', 'LIVE')
            .order('started_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          setActiveLiveSession(data || null);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user || !id || !course) return;
    setEnrolling(true);
    try {
      await coursesService.enrollStudent(id, user.id);
      toast.success("Successfully enrolled in course! Let's start learning 🎉", { icon: '🎓' });
      await loadCourseData();
    } catch (err: any) {
      console.error('Enrollment error:', err);
      toast.error(err.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  // ─── TEACHER ACTIONS ───
  const handleCreateLesson = async () => {
    if (!newLessonTitle.trim()) {
      toast.error('Please enter lesson title');
      return;
    }
    setIsAddingLesson(true);
    try {
      const { error } = await supabase.from('lessons').insert({
        course_id: id,
        title: newLessonTitle,
        type: newLessonType,
        duration_minutes: newLessonDuration,
        order_index: lessons.length + 1
      });
      if (error) throw error;
      toast.success('Lesson created successfully! 📚');
      setNewLessonTitle('');
      await loadCourseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create lesson.');
    } finally {
      setIsAddingLesson(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!newAsgTitle.trim() || !newAsgDueDate) {
      toast.error('Please enter assignment title and due date');
      return;
    }
    setIsAddingAsg(true);
    try {
      const { error } = await supabase.from('assignments').insert({
        course_id: id,
        teacher_id: user?.id,
        title: newAsgTitle,
        description: newAsgDesc,
        due_date: new Date(newAsgDueDate).toISOString(),
        max_grade: newAsgMaxGrade
      });
      if (error) throw error;
      toast.success('Assignment created successfully! 📝');
      setNewAsgTitle('');
      setNewAsgDesc('');
      setNewAsgDueDate('');
      await loadCourseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create assignment.');
    } finally {
      setIsAddingAsg(false);
    }
  };

  const handleScheduleLiveClass = async () => {
    if (!newLiveTitle.trim() || !newLiveDate) {
      toast.error('Please enter live class title and scheduled time');
      return;
    }
    setIsAddingLive(true);
    try {
      const roomId = Math.random().toString(36).substring(7);
      const { error } = await supabase.from('live_classes').insert({
        course_id: id,
        teacher_id: user?.id,
        title: newLiveTitle,
        scheduled_at: new Date(newLiveDate).toISOString(),
        room_id: roomId,
        status: 'scheduled'
      });
      if (error) throw error;
      toast.success('Live class scheduled successfully! 🎥');
      setNewLiveTitle('');
      setNewLiveDate('');
      await loadCourseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to schedule live class.');
    } finally {
      setIsAddingLive(false);
    }
  };

  const handleOpenGradeDialog = (sub: any) => {
    setGradingSubmissionId(sub.id);
    setGradingScore(sub.grade || 100);
    setGradingFeedback(sub.feedback || '');
  };

  const handleSubmitGrade = async (submissionId: string) => {
    setIsSubmittingGrade(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          grade: gradingScore,
          feedback: gradingFeedback
        })
        .eq('id', submissionId);
      if (error) throw error;
      toast.success('Submission graded successfully! 🎓');
      setGradingSubmissionId(null);
      setGradingFeedback('');
      await loadCourseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update grade.');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  // ─── STUDENT ACTIONS ───
  const handleSubmitAssignment = async (asgId: string) => {
    if (!submissionText.trim()) {
      toast.error('Please enter submission details!');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('submissions').insert({
        assignment_id: asgId,
        student_id: user?.id,
        file_url: submissionText,
        grade: null,
        feedback: null
      });

      if (error) throw error;
      toast.success('Assignment submitted successfully! ✅');
      setSubmissionText('');
      setSubmittingAssignmentId(null);
      await loadCourseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!user || !id) return;
    setScanning(true);
    try {
      const { error } = await supabase.from('attendance').insert({
        student_id: user.id,
        course_id: id,
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        marked_at: new Date().toISOString()
      } as any);

      if (error) throw error;
      toast.success('Attendance marked! Present ✅');
      await loadCourseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to mark attendance.');
    } finally {
      setScanning(false);
    }
  };

  const handleGenerateQR = async () => {
    setGeneratingQR(true);
    setTimeout(() => {
      setQrCodeData(`nexlearn://attendance/${id}/${Math.random().toString(36).substring(7)}`);
      setGeneratingQR(false);
      toast.success('Attendance class session QR generated!');
    }, 1000);
  };

  const handleToggleLesson = async (lessonId: string, currentCompleted: boolean) => {
    if (!isEnrolled || !user || !id) return;
    try {
      const total = lessons.length || 5;
      const step = Math.round(100 / total);
      let newProgress = currentCompleted 
        ? Math.max(0, enrollmentProgress - step)
        : Math.min(100, enrollmentProgress + step);
      
      if (newProgress > 95) newProgress = 100;

      const { error } = await supabase
        .from('enrollments')
        .update({ progress: newProgress })
        .eq('student_id', user.id)
        .eq('course_id', id);

      if (error) throw error;
      setEnrollmentProgress(newProgress);
      toast.success(`Lesson marked as ${currentCompleted ? 'incomplete' : 'completed'}!`);
      await loadCourseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update progress.');
    }
  };

  const handleClaimCertificate = async () => {
    if (!user || !id) return;
    setClaiming(true);
    try {
      const cert = await certificatesService.generateCertificate(user.id, id);
      setCertificate(cert);
      toast.success('Congratulations! Your verified Certificate of Completion has been generated. 🎓');
      await loadCourseData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to claim certificate.');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading course detail hub...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <GlassCard className="max-w-md mx-auto my-12 text-center p-8 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 font-serif">Course Not Found</h3>
        <p className="text-sm text-neutral-500 dark:text-slate-400 mb-6">This course is not in the system registry.</p>
        <Link to="/courses">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </GlassCard>
    );
  }

  // Define tabs dynamically based on user role
  const tabs = user?.role === 'teacher' 
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'content', label: 'Lessons' },
        { id: 'assignments', label: 'Assignments' },
        { id: 'gradebook', label: 'Gradebook' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'live', label: 'Live Classes' },
        { id: 'students', label: 'Student Management' },
        { id: 'analytics', label: 'Analytics' }
      ]
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'content', label: 'Lessons' },
        { id: 'assignments', label: 'Assignments' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'live', label: 'Live Classes' },
        { id: 'progress', label: 'My Progress' },
        { id: 'certificates', label: 'Certificates' }
      ];

  return (
    <div className="space-y-6">
      
      {/* Course Header Banner */}
      <div className="relative">
        <div className="px-6 py-8 border-b border-neutral-200 dark:border-white/5" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.05))' }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={(LEVEL_COLORS as Record<string, 'purple' | 'blue' | 'emerald' | 'amber' | 'red' | 'slate'>)[course.level] || 'blue'}>{course.level}</Badge>
                  <Badge variant="purple">{course.category}</Badge>
                  {isEnrolled && <Badge variant="emerald">Enrolled</Badge>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-3 leading-tight" style={{ fontFamily: 'Geist, sans-serif' }}>
                  {course.title}
                </h1>
                <p className="text-neutral-600 dark:text-slate-350 mb-4 text-sm leading-relaxed max-w-2xl">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Users size={13} className="text-blue-500" /> {user?.role === 'teacher' ? enrolledStudents.length : course.enrolled || 0} students</span>
                  <span className="flex items-center gap-1"><BookOpen size={13} className="text-purple-500" /> {lessons.length} lessons</span>
                  <span className="flex items-center gap-1"><Clock size={13} className="text-emerald-500" /> {course.duration}</span>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm">
                    {course.instructor?.[0] || 'T'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-950 dark:text-white">{course.instructor || 'Instructor'}</p>
                    <p className="text-xs text-neutral-500 dark:text-slate-400">Course TA & advisor</p>
                  </div>
                </div>
              </div>

              {/* Enrollment / Call to Action Card */}
              <div className="w-full lg:w-80 shrink-0">
                <GlassCard>
                  {user?.role === 'teacher' ? (
                    <div className="space-y-4 text-center">
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-450 uppercase">Instructor Workspace</p>
                        <p className="text-lg font-bold text-neutral-955 dark:text-white mt-1">
                          {course.is_published || course.isPublished ? '✓ Published' : '⚙ Draft'}
                        </p>
                      </div>
                      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 text-xs text-neutral-600 dark:text-slate-400 space-y-1">
                        <p>Total Enrolled: <span className="font-bold text-neutral-900 dark:text-white">{enrolledStudents.length} Students</span></p>
                        <p>Lessons: <span className="font-bold text-neutral-900 dark:text-white">{lessons.length}</span></p>
                      </div>
                      <Link to={`/courses/${id}/edit`} className="block">
                        <Button variant="secondary" className="w-full text-xs">
                          Edit Course Details
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-4">
                        <p className="text-2xl font-black text-neutral-955 dark:text-white">
                          ₹{course.price}
                        </p>
                        {isEnrolled ? (
                          <p className="text-xs font-semibold text-emerald-500 mt-1">✓ Enrolled with {enrollmentProgress}% progress</p>
                        ) : (
                          <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1">Life-time access, self-paced learning</p>
                        )}
                      </div>

                      {isEnrolled ? (
                        <div className="space-y-3">
                          <ProgressBar value={enrollmentProgress} color="purple" size="sm" />
                          <button 
                            onClick={() => setActiveTab('content')} 
                            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-xl text-xs font-bold hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20"
                          >
                            <Play size={12} fill="white" />
                            <span>Continue Lessons</span>
                          </button>
                        </div>
                      ) : (
                        <Button variant="primary" className="w-full justify-center" onClick={handleEnroll} loading={enrolling}>
                          Enroll Now
                        </Button>
                      )}
                    </>
                  )}
                </GlassCard>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-800">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'text-white bg-purple-600 shadow'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="py-6">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <GlassCard>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4">What you will learn</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed text-neutral-600 dark:text-slate-350">
                      {course.outcomes && course.outcomes.length > 0 ? (
                        course.outcomes.map((out: string, idx: number) => (
                          <div key={idx} className="flex gap-2 items-start">
                            <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{out}</span>
                          </div>
                        ))
                      ) : (
                        <p>No outcomes listed.</p>
                      )}
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3">Requirements</h3>
                    <ul className="list-disc pl-5 text-xs text-neutral-600 dark:text-slate-350 space-y-2">
                      {course.requirements && course.requirements.length > 0 ? (
                        course.requirements.map((req: string, idx: number) => (
                          <li key={idx}>{req}</li>
                        ))
                      ) : (
                        <li>No requirements listed.</li>
                      )}
                    </ul>
                  </GlassCard>
                </div>

                <div>
                  <GlassCard>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3">About the Instructor</h3>
                    <p className="text-xs text-neutral-600 dark:text-slate-350 leading-relaxed">
                      Instructed by <span className="font-bold text-neutral-900 dark:text-white">{course.instructor || 'Educator'}</span>. Expert educator focused on practical hands-on application and interactive development.
                    </p>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* CURRICULUM LESSONS TAB */}
            {activeTab === 'content' && (
              <motion.div key="content" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Syllabus List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Curriculum Map</h3>
                  <div className="space-y-2">
                    {lessons.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
                        No lessons uploaded for this curriculum yet.
                      </div>
                    ) : (
                      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">
                        <button
                          onClick={() => setOpenSection(openSection === 's1' ? null : 's1')}
                          className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
                        >
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">General Syllabus Section</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase">{lessons.length} lessons</span>
                            {openSection === 's1' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </button>

                        {openSection === 's1' && (
                          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {lessons.map((lesson) => {
                              return (
                                <div key={lesson.id} className="flex items-center justify-between p-3.5 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                                      {lesson.type === 'video' ? <Play size={14} fill="currentColor" /> : <BookOpen size={14} />}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-neutral-950 dark:text-neutral-200">{lesson.title}</p>
                                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 capitalize">{lesson.type} • {lesson.duration_minutes || 10}m</p>
                                    </div>
                                  </div>
                                  {(isEnrolled || user?.role === 'teacher') ? (
                                    <Link to={`/learn/${id}/${lesson.id}`}>
                                      <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition-all">
                                        {user?.role === 'teacher' ? 'Preview' : 'Start'}
                                      </button>
                                    </Link>
                                  ) : (
                                    <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                                      <Lock size={12} />
                                      <span>Locked</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Teacher Add Lesson panel */}
                {user?.role === 'teacher' && (
                  <div className="space-y-4">
                    <GlassCard>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Add Syllabus Lesson</h4>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-neutral-500 mb-1">Lesson Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Introduction to Variables"
                            value={newLessonTitle}
                            onChange={e => setNewLessonTitle(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50/50 dark:bg-neutral-850 outline-none text-neutral-950 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-500 mb-1">Content Type</label>
                          <select 
                            value={newLessonType}
                            onChange={e => setNewLessonType(e.target.value as any)}
                            className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50/50 dark:bg-neutral-850 outline-none text-neutral-950 dark:text-white"
                          >
                            <option value="video">🎥 Video Session</option>
                            <option value="pdf">📄 PDF Document</option>
                            <option value="ppt">📊 Presentation Slide</option>
                            <option value="quiz">📝 Practice Quiz</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-500 mb-1">Duration (minutes)</label>
                          <input 
                            type="number"
                            value={newLessonDuration}
                            onChange={e => setNewLessonDuration(Number(e.target.value))}
                            className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50/50 dark:bg-neutral-850 outline-none text-neutral-955 dark:text-white"
                          />
                        </div>

                        <button 
                          onClick={handleCreateLesson}
                          disabled={isAddingLesson}
                          className="w-full py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-xl font-bold transition-all mt-2"
                        >
                          {isAddingLesson ? 'Creating...' : 'Upload Lesson'}
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                )}
              </motion.div>
            )}

            {/* ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
              <motion.div key="assignments" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Assignments List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Assignments & Evaluations</h3>
                  {assignments.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                      No assignments scheduled for this course.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignments.map(asg => {
                        const submission = submissions.find(s => s.assignment_id === asg.id);
                        const isSubmitted = !!submission;
                        const isGraded = isSubmitted && submission.grade !== null;

                        return (
                          <GlassCard key={asg.id} className="flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">{asg.title}</h4>
                                {user?.role === 'teacher' ? (
                                  <Badge variant="purple">Teacher Mode</Badge>
                                ) : isGraded ? (
                                  <Badge variant="emerald">Graded: {submission.grade} / {asg.max_grade}</Badge>
                                ) : isSubmitted ? (
                                  <Badge variant="blue">Submitted</Badge>
                                ) : (
                                  <Badge variant="amber">Pending</Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                                {asg.description}
                              </p>
                              
                              <div className="text-[10px] font-bold text-neutral-500 space-y-1 mb-4 border-t border-neutral-100 dark:border-neutral-800 pt-2">
                                <p>Max Grade: {asg.max_grade} points</p>
                                <p>Due Date: {new Date(asg.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>

                            {/* Render Student submit or Teacher Submissions evaluator panel */}
                            {user?.role === 'teacher' ? (
                              <div className="border-t border-neutral-100 dark:border-neutral-800/80 pt-3 mt-2 space-y-2">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase">Enrolled Submissions:</p>
                                {submissions.filter(s => s.assignment_id === asg.id).length === 0 ? (
                                  <p className="text-[10px] text-neutral-450 italic">No submissions yet.</p>
                                ) : (
                                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                    {submissions.filter(s => s.assignment_id === asg.id).map(sub => (
                                      <div key={sub.id} className="p-2 bg-neutral-50/50 dark:bg-neutral-850/20 border border-neutral-150 dark:border-neutral-850 rounded-lg text-[10px] flex items-center justify-between">
                                        <div className="min-w-0">
                                          <p className="font-bold truncate text-neutral-900 dark:text-white">{sub.users?.name || 'Student'}</p>
                                          <p className="text-neutral-500 truncate mt-0.5">{sub.file_url}</p>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-1.5">
                                          {sub.grade !== null ? (
                                            <span className="font-semibold text-emerald-500">{sub.grade} / {asg.max_grade}</span>
                                          ) : (
                                            <button 
                                              onClick={() => handleOpenGradeDialog(sub)}
                                              className="px-2 py-1 bg-purple-600 text-white rounded text-[9px] font-bold hover:scale-103 transition-transform"
                                            >
                                              Grade
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              isEnrolled && (
                                <div>
                                  {isGraded ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-[10px] text-neutral-700 dark:text-slate-350">
                                      <p className="font-bold text-emerald-400">Feedback:</p>
                                      <p className="mt-1 leading-normal italic">"{submission.feedback || 'Excellent submission!'}"</p>
                                    </div>
                                  ) : isSubmitted ? (
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl text-[10px] text-blue-400 font-semibold text-center">
                                      Waiting for teacher evaluation...
                                    </div>
                                  ) : submittingAssignmentId === asg.id ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={submissionText}
                                        onChange={e => setSubmissionText(e.target.value)}
                                        placeholder="Enter your solution text or URL link..."
                                        rows={3}
                                        className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-white/5 outline-none focus:border-purple-500 text-neutral-900 dark:text-white"
                                      />
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => setSubmittingAssignmentId(null)} 
                                          className="flex-1 py-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg text-[10px] font-bold"
                                        >
                                          Cancel
                                        </button>
                                        <button 
                                          onClick={() => handleSubmitAssignment(asg.id)}
                                          disabled={submitting}
                                          className="flex-1 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-bold"
                                        >
                                          {submitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => setSubmittingAssignmentId(asg.id)}
                                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow transition-all hover:scale-102 active:scale-98"
                                    >
                                      Submit Assignment
                                    </button>
                                  )}
                                </div>
                              )
                            )}
                          </GlassCard>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Teacher Add Assignment panel */}
                {user?.role === 'teacher' && (
                  <div className="space-y-4">
                    <AIQuizGenerator courseId={id!} onSuccess={loadCourseData} />
                    <GlassCard>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Add Evaluation Assignment</h4>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-neutral-500 mb-1">Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Midterm Programming Quiz"
                            value={newAsgTitle}
                            onChange={e => setNewAsgTitle(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50/50 dark:bg-neutral-850 outline-none text-neutral-950 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-500 mb-1">Instructions</label>
                          <textarea 
                            placeholder="Write grading tasks or details here..."
                            rows={3}
                            value={newAsgDesc}
                            onChange={e => setNewAsgDesc(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50/50 dark:bg-neutral-850 outline-none text-neutral-950 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-neutral-500 mb-1">Max Score</label>
                            <input 
                              type="number"
                              value={newAsgMaxGrade}
                              onChange={e => setNewAsgMaxGrade(Number(e.target.value))}
                              className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50/50 dark:bg-neutral-850 outline-none text-neutral-950 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-neutral-500 mb-1">Due Date</label>
                            <input 
                              type="datetime-local"
                              value={newAsgDueDate}
                              onChange={e => setNewAsgDueDate(e.target.value)}
                              className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50/50 dark:bg-neutral-850 outline-none text-neutral-950 dark:text-white"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={handleCreateAssignment}
                          disabled={isAddingAsg}
                          className="w-full py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-xl font-bold transition-all mt-2"
                        >
                          {isAddingAsg ? 'Creating...' : 'Create Assignment'}
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                )}
              </motion.div>
            )}

            {/* GRADEBOOK TAB (Teacher Only) */}
            {activeTab === 'gradebook' && user?.role === 'teacher' && (
              <motion.div key="gradebook" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TeacherGradebook courseId={id!} />
              </motion.div>
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <motion.div key="attendance" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Stats & Controls */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {user?.role === 'teacher' ? (
                      <>
                        <GlassCard>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-1 font-semibold uppercase tracking-wider">Total Students</p>
                          <p className="text-2xl font-bold">{enrolledStudents.length}</p>
                        </GlassCard>
                        <GlassCard>
                          <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mb-1 font-semibold uppercase tracking-wider">Present</p>
                          <p className="text-2xl font-bold text-emerald-500">{attendanceRecords.filter(r => r.status === 'present').length}</p>
                        </GlassCard>
                        <GlassCard>
                          <p className="text-[10px] text-amber-500 dark:text-amber-400 mb-1 font-semibold uppercase tracking-wider">Late</p>
                          <p className="text-2xl font-bold text-amber-500">{attendanceRecords.filter(r => r.status === 'late').length}</p>
                        </GlassCard>
                        <GlassCard>
                          <p className="text-[10px] text-red-500 dark:text-red-400 mb-1 font-semibold uppercase tracking-wider">Absent</p>
                          <p className="text-2xl font-bold text-red-500">{attendanceRecords.filter(r => r.status === 'absent').length}</p>
                        </GlassCard>
                      </>
                    ) : (
                      <>
                        <GlassCard>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-1 font-semibold uppercase tracking-wider">Present %</p>
                          <p className="text-2xl font-bold text-brand-primary">
                            {attendanceRecords.length > 0 
                              ? `${Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)}%`
                              : '0%'}
                          </p>
                        </GlassCard>
                        <GlassCard>
                          <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mb-1 font-semibold uppercase tracking-wider">Present Days</p>
                          <p className="text-2xl font-bold text-emerald-500">{attendanceRecords.filter(r => r.status === 'present').length}</p>
                        </GlassCard>
                        <GlassCard>
                          <p className="text-[10px] text-amber-500 dark:text-amber-400 mb-1 font-semibold uppercase tracking-wider">Late Days</p>
                          <p className="text-2xl font-bold text-amber-500">{attendanceRecords.filter(r => r.status === 'late').length}</p>
                        </GlassCard>
                        <GlassCard>
                          <p className="text-[10px] text-red-500 dark:text-red-400 mb-1 font-semibold uppercase tracking-wider">Absent Days</p>
                          <p className="text-2xl font-bold text-red-500">{attendanceRecords.filter(r => r.status === 'absent').length}</p>
                        </GlassCard>
                      </>
                    )}
                  </div>

                  {user?.role === 'teacher' && (
                    <BulkAttendance courseId={id!} />
                  )}
                </div>

                {/* History tracker */}
                <div>
                  <GlassCard>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Attendance History Log</h3>
                    <div className="space-y-3.5 max-h-96 overflow-y-auto custom-scrollbar">
                      {attendanceRecords.length === 0 ? (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">No attendance registered yet.</p>
                      ) : (
                        attendanceRecords.map(rec => (
                          <div key={rec.id} className="flex justify-between items-center text-xs border-b border-neutral-100 dark:border-neutral-800 pb-2">
                            <div>
                              <p className="font-bold text-neutral-800 dark:text-slate-200">
                                {user?.role === 'teacher' ? rec.users?.name : 'Me'}
                              </p>
                              <p className="text-[9px] text-neutral-450 mt-0.5">
                                {new Date(rec.marked_at || rec.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className={`font-bold uppercase tracking-wider text-[10px] ${
                              rec.status === 'present' ? 'text-emerald-500' :
                              rec.status === 'late' ? 'text-amber-500' :
                              rec.status === 'absent' ? 'text-red-500' : 'text-neutral-500'
                            }`}>
                              {rec.status || 'unknown'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </GlassCard>
                </div>

              </motion.div>
            )}

            {/* LIVE CLASSES TAB */}
            {activeTab === 'live' && (
              <motion.div key="live" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Scheduled list */}
                <div className="lg:col-span-2 space-y-4">
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    activeLiveSession
                      ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-850'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${activeLiveSession ? 'bg-red-500 animate-pulse' : 'bg-neutral-350 dark:bg-neutral-650'}`} />
                        <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                          {activeLiveSession ? 'Live Now' : user?.role === 'teacher' ? 'Live Classroom Ready' : 'No Live Class Active'}
                        </h3>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-350">
                        {activeLiveSession
                          ? `Started ${new Date(activeLiveSession.started_at || activeLiveSession.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : user?.role === 'teacher'
                            ? 'Start the course room when you are ready to teach.'
                            : 'This area updates automatically when your teacher starts class.'}
                      </p>
                    </div>
                    {(isEnrolled || user?.role === 'teacher' || user?.role === 'admin') ? (
                      <Link to={`/classroom/${id}`}>
                        <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                          activeLiveSession
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}>
                          {activeLiveSession ? 'Join Class' : user?.role === 'teacher' ? 'Start Live Class' : 'Open Classroom'}
                        </button>
                      </Link>
                    ) : (
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Join Locked</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Scheduled Live Sessions</h3>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-850 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
                    {liveClasses.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
                        No live classroom sessions scheduled for this course.
                      </div>
                    ) : (
                      liveClasses.map(cls => (
                        <div key={cls.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/30 dark:bg-neutral-900/30 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 transition-colors">
                          <div>
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">{cls.title}</h4>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
                              Scheduled: {new Date(cls.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {(isEnrolled || user?.role === 'teacher') ? (
                            <Link to={`/classroom/${id}`}>
                              <button className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-xl text-[10px] font-bold transition-all shadow hover:opacity-90">
                                {user?.role === 'teacher' ? 'Start Classroom Jitsi' : 'Join Classroom Jitsi'}
                              </button>
                            </Link>
                          ) : (
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Join Locked</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Teacher Schedule Form */}
                {user?.role === 'teacher' && (
                  <div className="space-y-4">
                    <GlassCard>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Schedule Live Virtual Class</h4>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-neutral-500 mb-1">Classroom Subject Topic</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Graph Algorithms Lab Session"
                            value={newLiveTitle}
                            onChange={e => setNewLiveTitle(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50/50 dark:bg-neutral-850 outline-none text-neutral-950 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-500 mb-1">Date & Time</label>
                          <input 
                            type="datetime-local"
                            value={newLiveDate}
                            onChange={e => setNewLiveDate(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-neutral-50/50 dark:bg-neutral-850 outline-none text-neutral-950 dark:text-white"
                          />
                        </div>

                        <button 
                          onClick={handleScheduleLiveClass}
                          disabled={isAddingLive}
                          className="w-full py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-xl font-bold transition-all mt-2"
                        >
                          {isAddingLive ? 'Scheduling...' : 'Schedule Live Room'}
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                )}
              </motion.div>
            )}

            {/* ANALYTICS TAB (Teacher Only) */}
            {activeTab === 'analytics' && user?.role === 'teacher' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <InsightsDashboard courseId={id!} />
              </motion.div>
            )}

            {/* PROGRESS CHECKLIST TAB (Student Only) */}
            {activeTab === 'progress' && user?.role !== 'teacher' && (
              <motion.div key="progress" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                <GlassCard>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3">Overall Progress Status</h3>
                  <div className="flex justify-between items-center text-xs font-semibold mb-2">
                    <span className="text-neutral-500 dark:text-neutral-400">Syllabus Completion</span>
                    <span className="text-brand-primary">{enrollmentProgress}%</span>
                  </div>
                  <ProgressBar value={enrollmentProgress} color="purple" size="md" />
                </GlassCard>

                <GlassCard>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Lessons Checklist</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 leading-normal">
                    Manually track completed elements by checking them off as you read through.
                  </p>
                  
                  <div className="space-y-2">
                    {lessons.length === 0 ? (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">No lessons listed.</p>
                    ) : (
                      lessons.map((lesson, idx) => {
                        const threshold = Math.round(100 / lessons.length);
                        const isCompleted = enrollmentProgress >= (idx + 1) * threshold;
                        
                        return (
                          <div 
                            key={lesson.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all ${
                              isCompleted 
                                ? 'bg-emerald-500/5 border-emerald-500/10 text-neutral-900 dark:text-slate-200' 
                                : 'border-neutral-200 dark:border-neutral-800/80 text-neutral-600 dark:text-slate-400 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/10'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isCompleted}
                              onChange={() => handleToggleLesson(lesson.id, isCompleted)}
                              disabled={!isEnrolled}
                              className="w-4 h-4 rounded text-purple-600 border-neutral-300 dark:border-neutral-700 outline-none cursor-pointer shrink-0 disabled:cursor-not-allowed"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold truncate">{lesson.title}</p>
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize mt-0.5">{lesson.type}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </GlassCard>

              </motion.div>
            )}

            {/* CERTIFICATES TAB (Student Only) */}
            {activeTab === 'certificates' && user?.role !== 'teacher' && (
              <motion.div key="certificates" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-xl mx-auto text-center">
                {certificate ? (
                  <GlassCard className="p-8 border border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-transparent relative overflow-hidden">
                    <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-yellow-500/40 rounded-tl" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-yellow-500/40 rounded-tr" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-yellow-500/40 rounded-bl" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-yellow-500/40 rounded-br" />

                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
                      <Award size={32} className="text-white" />
                    </div>

                    <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.25em] mb-2">Verified Certificate of Completion</p>
                    <h4 className="text-xl font-bold text-neutral-955 dark:text-white leading-tight font-serif mb-2">
                      {certificate.studentName || user?.name}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-slate-400 mb-6">
                      For completing course: <span className="font-semibold text-neutral-800 dark:text-slate-200">"{course.title}"</span>
                    </p>

                    <div className="flex items-center justify-center gap-4 text-left max-w-xs mx-auto text-[10px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-4 mb-6">
                      <div>
                        <p>Issued Date</p>
                        <p className="font-bold text-neutral-900 dark:text-white mt-0.5">{new Date(certificate.issuedDate || certificate.issued_at).toLocaleDateString()}</p>
                      </div>
                      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800" />
                      <div>
                        <p>Verification Code</p>
                        <p className="font-bold text-neutral-900 dark:text-white mt-0.5 font-mono">{certificate.verificationCode || certificate.id.slice(0, 8)}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Link to={`/verify/${certificate.id}`}>
                        <Button variant="secondary" size="sm">
                          Verify Page
                        </Button>
                      </Link>
                      <button 
                        onClick={() => toast.success('Downloaded Certificate PDF! 📜')}
                        className="py-1.5 px-4 bg-purple-600 text-white rounded-xl text-xs font-bold transition-all hover:scale-102 flex items-center gap-1"
                      >
                        <Download size={12} />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </GlassCard>
                ) : enrollmentProgress >= 100 ? (
                  <GlassCard className="p-8">
                    <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">Course Completed! 🌟</h3>
                    <p className="text-xs text-neutral-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                      Congratulations on completing the curriculum! Claim your verified digital certificate of completion.
                    </p>
                    <button 
                      onClick={handleClaimCertificate}
                      disabled={claiming}
                      className="py-2.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-xl text-xs font-bold transition-all hover:scale-103 active:scale-97 shadow shadow-purple-500/20"
                    >
                      {claiming ? 'Generating...' : 'Claim Certificate'}
                    </button>
                  </GlassCard>
                ) : (
                  <GlassCard className="p-8 opacity-75">
                    <Lock className="w-10 h-10 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">Certificate Locked</h3>
                    <p className="text-xs text-neutral-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Complete all syllabus material (100% progress) to unlock your verified digital certificate of completion. Current progress: <span className="font-bold text-purple-500">{enrollmentProgress}%</span>.
                    </p>
                  </GlassCard>
                )}
              </motion.div>
            )}

            {/* STUDENT MANAGEMENT TAB (Teacher Only) */}
            {activeTab === 'students' && user?.role === 'teacher' && (
              <motion.div key="students" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Enrolled Students Directory</h3>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold px-2.5 py-1 rounded-full">
                    {enrolledStudents.length} Active Students
                  </span>
                </div>

                <GlassCard padding="p-0">
                  <div className="overflow-x-auto">
                    {enrolledStudents.length === 0 ? (
                      <div className="p-8 text-center text-xs text-neutral-500">
                        No students are currently enrolled in this subject class.
                      </div>
                    ) : (
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-450">
                            <th className="px-6 py-3 font-bold uppercase tracking-wider">Student Profile</th>
                            <th className="px-6 py-3 font-bold uppercase tracking-wider">Enrolled Date</th>
                            <th className="px-6 py-3 font-bold uppercase tracking-wider">Course Progress</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {enrolledStudents.map(studentItem => {
                            const u = studentItem.users;
                            if (!u) return null;
                            return (
                              <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {u.avatar_url ? (
                                      <img src={u.avatar_url} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-neutral-250" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                                        {u.name?.[0] || 'S'}
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-bold text-neutral-900 dark:text-white">{u.name}</p>
                                      <p className="text-[10px] text-neutral-500">{u.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-neutral-700 dark:text-neutral-350">
                                  {new Date(studentItem.enrolled_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 max-w-xs">
                                    <div className="flex-1">
                                      <ProgressBar value={studentItem.progress} color="purple" size="sm" />
                                    </div>
                                    <span className="font-bold text-neutral-800 dark:text-neutral-300">{Math.round(studentItem.progress)}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )}



          </AnimatePresence>
        </div>
      </div>

      {/* Teacher Grading Dialog Modal */}
      <AnimatePresence>
        {gradingSubmissionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGradingSubmissionId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl z-10"
            >
              <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-2">Grade Assignment Submission</h4>
              <p className="text-xs text-neutral-500 mb-4">Evaluate the student's solution, provide marks, and log written feedback comments.</p>
              
              <div className="space-y-3.5 text-xs mb-4">
                <div>
                  <label className="block font-semibold text-neutral-500 mb-1">Marks Obtained (out of 100)</label>
                  <input 
                    type="number"
                    value={gradingScore}
                    onChange={e => setGradingScore(Number(e.target.value))}
                    max={100}
                    min={0}
                    className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-500 mb-1">Feedback Comments</label>
                  <textarea
                    value={gradingFeedback}
                    onChange={e => setGradingFeedback(e.target.value)}
                    placeholder="Enter grader feedback comment observations..."
                    rows={3}
                    className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none focus:border-brand-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 text-xs py-2" onClick={() => setGradingSubmissionId(null)}>Cancel</Button>
                <Button variant="primary" className="flex-1 text-xs py-2" onClick={() => handleSubmitGrade(gradingSubmissionId)} disabled={isSubmittingGrade}>
                  {isSubmittingGrade ? 'Saving...' : 'Submit Grade'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
