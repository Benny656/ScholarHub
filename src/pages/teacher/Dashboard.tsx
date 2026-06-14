import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  BookOpen, Users, ClipboardList, Clock, Sparkles, 
  Video, FileText, CheckCircle2, TrendingUp, Calendar, 
  MessageSquare, Edit, AlertTriangle, ArrowRight, Check,
  HelpCircle, LayoutGrid, PenTool, Share2, MicOff, 
  Presentation, UserSquare2, BarChart2, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProctoringDashboard } from '../../components/features/ProctoringDashboard';
import { BlockchainVerification } from '../../components/features/BlockchainVerification';
import { PeerReviewCenter } from '../../components/features/PeerReviewCenter';
import { VoiceAssistantModal } from '../../components/features/VoiceAssistantModal';
import { Mic } from 'lucide-react';

// --- Mock Data ---
const STUDENTS = [
  { name: 'Alex Johnson', course: 'Web Dev', progress: 68, attendance: '84%', status: 'Active' },
  { name: 'Priya Sharma', course: 'Web Dev', progress: 92, attendance: '96%', status: 'Active' },
  { name: 'Jordan Lee', course: 'DSA', progress: 45, attendance: '71%', status: 'At Risk' },
  { name: 'Marcus Brown', course: 'DSA', progress: 78, attendance: '89%', status: 'Active' },
];

const QUESTION_SETS = [
  { id: 'q1', title: 'Graph Algorithms Quiz', category: 'DSA', questions: 20, difficulty: 'Medium' },
  { id: 'q2', title: 'React Hooks Deep Dive', category: 'Web Dev', questions: 15, difficulty: 'Hard' },
  { id: 'q3', title: 'ML Fundamentals Bank', category: 'Machine Learning', questions: 40, difficulty: 'Easy' },
];

const UPCOMING_EXAMS = [
  { id: 'e1', title: 'Midterm Exam: Data Structures', course: 'DSA', date: 'Jun 20, 9:00 AM', students: 189 },
  { id: 'e2', title: 'Final Project Presentation', course: 'Web Dev', date: 'Jun 25, 2:00 PM', students: 247 },
  { id: 'e3', title: 'ML Quiz 3', course: 'Machine Learning', date: 'Jun 18, 11:00 AM', students: 134 },
];


const STATS = {
  activeCourses: 4,
  totalStudents: 847,
  pendingEvaluations: 12,
  attendanceRate: 94,
};

const COURSES = [
  { id: 'c1', title: 'Full-Stack Web Development', students: 247, progress: 68, nextSession: 'Today, 10:00 AM' },
  { id: 'c2', title: 'Data Structures & Algorithms', students: 189, progress: 45, nextSession: 'Today, 2:00 PM' },
  { id: 'c3', title: 'Machine Learning Fundamentals', students: 134, progress: 32, nextSession: 'Tomorrow, 1:00 PM' },
  { id: 'c4', title: 'Advanced React Patterns', students: 277, progress: 85, nextSession: 'Thu, 9:00 AM' },
];

const TODAY_CLASSES = [
  { id: 'l1', title: 'Web Dev: Advanced React', time: '10:00 AM', course: 'Full-Stack Web Development' },
  { id: 'l2', title: 'DSA: Graph Algorithms', time: '2:00 PM', course: 'Data Structures & Algorithms' },
  { id: 'l3', title: 'Office Hours', time: '4:00 PM', course: 'General' },
];

const ASSIGNMENTS = {
  pendingReview: [
    { id: 'a1', title: 'React Component Architecture', course: 'Web Dev', submitted: 45, due: 'Yesterday' },
    { id: 'a2', title: 'Binary Trees Implementation', course: 'DSA', submitted: 18, due: '2 Days Ago' },
  ],
  recentlySubmitted: [
    { id: 'a3', title: 'ML Model Evaluation', course: 'Machine Learning', submitted: 134, due: 'Today' },
  ],
};

const PERFORMANCE_DATA = [
  { range: '90-100', students: 145 },
  { range: '80-89', students: 312 },
  { range: '70-79', students: 256 },
  { range: '60-69', students: 89 },
  { range: '<60', students: 45 },
];

const ATTENDANCE_TREND = [
  { week: 'W1', rate: 98 },
  { week: 'W2', rate: 96 },
  { week: 'W3', rate: 97 },
  { week: 'W4', rate: 94 },
  { week: 'W5', rate: 92 },
  { week: 'W6', rate: 94 },
];

const MESSAGES = [
  { id: 'm1', sender: 'Alex Johnson', subject: 'Question about Assignment 3', time: '1h ago' },
  { id: 'm2', sender: 'Priya Sharma', subject: 'Extension request', time: '3h ago' },
];

const CALENDAR_EVENTS = [
  { id: 'e1', title: 'Department Meeting', type: 'meeting', time: 'Tomorrow, 3:00 PM' },
  { id: 'e2', title: 'Grades Due for Midterms', type: 'deadline', time: 'Fri, 11:59 PM' },
];

// --- Components ---

const Panel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const PanelHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="px-5 py-4 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
    {action && <div className="text-xs">{action}</div>}
  </div>
);

export function TeacherDashboard() {
  const { user } = useAuth();
  const lastName = user?.name ? user.name.split(' ').pop() : 'Professor';
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  
  const [stats, setStats] = useState(STATS);
  const [coursesList, setCoursesList] = useState(COURSES);
  const [todayClasses, setTodayClasses] = useState(TODAY_CLASSES);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await apiClient.get('/teacher/dashboard');
        if (data.stats) setStats(data.stats);
        if (data.courses && data.courses.length > 0) setCoursesList(data.courses);
        if (data.todayClasses) setTodayClasses(data.todayClasses);
      } catch (err) {
        console.error('Failed to load backend dashboard, using mock fallback:', err);
      }
    }
    loadDashboard();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans space-y-8">
      <VoiceAssistantModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
      
      {/* ─── HERO SECTION ─── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-2">
            Welcome back, Prof. {lastName}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            You have <span className="font-medium text-neutral-900 dark:text-neutral-200">3 classes today</span> and <span className="font-medium text-neutral-900 dark:text-neutral-200">12 assignments</span> awaiting review.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-medium transition-colors border border-transparent dark:border-neutral-700">
            <FileText size={14} /> Create Assignment
          </button>
          <Link to="/classroom/general" className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-medium transition-colors border border-neutral-200 dark:border-neutral-700 hover:scale-102 hover:shadow-sm">
            <Video size={14} /> Start Live Class
          </Link>
          <button className="flex items-center gap-2 px-3 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-lg text-sm font-medium transition-colors">
            <Sparkles size={14} /> Generate Quiz
          </button>
          <button onClick={() => setIsVoiceOpen(true)} className="flex items-center justify-center w-9 h-9 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm">
            <Mic size={16} />
          </button>
        </div>
      </motion.div>

      {/* ─── QUICK STATISTICS ─── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Active Courses', value: stats.activeCourses, icon: BookOpen },
          { label: 'Total Students', value: stats.totalStudents, icon: Users },
          { label: 'Pending Evaluations', value: stats.pendingEvaluations, icon: ClipboardList },
          { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: CheckCircle2 },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <stat.icon size={16} />
              <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              {stat.value}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── MAIN GRID ─── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        
        {/* LEFT COLUMN (Main Content) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Course Management */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Course Management" 
                action={<Link to="/courses" className="text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1">Manage <ArrowRight size={14} /></Link>} 
              />
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {coursesList.map(course => (
                  <div key={course.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{course.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <span className="flex items-center gap-1"><Users size={12}/> {course.students}</span>
                        <span>•</span>
                        <span>{course.progress}% Completed</span>
                      </div>
                    </div>
                    
                    <div className="sm:text-right shrink-0">
                      <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Next Session</p>
                      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-200">{course.nextSession}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                        <button className="p-1.5 text-neutral-400 hover:text-brand-primary transition-colors border border-transparent hover:border-brand-primary/20 hover:bg-brand-primary/5 rounded-md"><Edit size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* Assignment Review Center */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Assignment Review Center" 
                action={<Link to="/assignments" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">See all</Link>}
              />
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pending Review */}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Needs Grading
                  </h4>
                  <div className="space-y-3">
                    {ASSIGNMENTS.pendingReview.map(task => (
                      <div key={task.id} className="p-3 bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{task.title}</p>
                          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 px-1.5 py-0.5 rounded">{task.submitted} left</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-600 dark:text-neutral-400">{task.course}</span>
                          <button className="text-brand-primary hover:underline font-medium">Grade Now</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recently Submitted */}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Recently Submitted
                  </h4>
                  <div className="space-y-3">
                    {ASSIGNMENTS.recentlySubmitted.map(task => (
                      <div key={task.id} className="p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-tight">{task.title}</p>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded">{task.submitted} new</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-500 dark:text-neutral-400 truncate mr-2">{task.course}</span>
                          <span className="font-medium text-neutral-500 shrink-0">Due: {task.due}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Panel>
          </motion.div>

          {/* Performance & Attendance Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Panel className="h-full">
                <PanelHeader title="Grade Distribution" />
                <div className="p-5 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={16}>
                      <XAxis dataKey="range" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                      />
                      <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Panel className="h-full">
                <PanelHeader title="Global Attendance Trend" />
                <div className="p-5 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ATTENDANCE_TREND} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="week" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 100]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </motion.div>
          </div>

          {/* ─── NEW: STUDENT MANAGEMENT ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader
                title="Student Management"
                action={<Link to="/students" className="text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1">Full Directory <ArrowRight size={14} /></Link>}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                      {['Student', 'Course', 'Progress', 'Attendance', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {STUDENTS.map((s, i) => (
                      <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs font-bold shrink-0">{s.name.charAt(0)}</div>
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-500 dark:text-neutral-400">{s.course}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 w-28">
                            <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                              <div className="h-full bg-brand-primary rounded-full" style={{ width: `${s.progress}%` }} />
                            </div>
                            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 shrink-0">{s.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{s.attendance}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            s.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          }`}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: QUESTION BANK ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader
                title="Question Bank"
                action={<button className="flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"><HelpCircle size={12} /> Create Question</button>}
              />
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {QUESTION_SETS.map(q => (
                  <div key={q.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{q.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary">{q.category}</span>
                        <span className="text-xs text-neutral-500">{q.questions} questions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      }`}>{q.difficulty}</span>
                      <button className="text-xs text-brand-primary hover:underline font-medium">Use</button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: PEER REVIEW CENTER ─── */}
          <motion.div variants={itemVariants}>
            <PeerReviewCenter role="teacher" />
          </motion.div>

          {/* ─── NEW: EXAM SCHEDULING ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader
                title="Exam Scheduling"
                action={<button className="flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline">+ Schedule Exam</button>}
              />
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {UPCOMING_EXAMS.map(ex => (
                  <div key={ex.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{ex.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{ex.course} &bull; <span className="text-neutral-700 dark:text-neutral-300 font-medium">{ex.date}</span></p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-neutral-500"><Users size={10} className="inline mr-1"/>{ex.students}</span>
                      <button className="text-xs text-neutral-500 hover:text-brand-primary transition-colors"><Edit size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: PROCTORING & BLOCKCHAIN ─── */}
          <motion.div variants={itemVariants}>
            <ProctoringDashboard role="teacher" />
          </motion.div>

          <motion.div variants={itemVariants}>
            <BlockchainVerification role="teacher" />
          </motion.div>

        </div>

        {/* RIGHT COLUMN (Side Content) */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Today's Classes */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Today's Classes" 
                action={<span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-medium">{todayClasses.length} Sessions</span>}
              />
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {todayClasses.map(cls => (
                  <div key={cls.id} className="p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div>
                      <p className="text-xs font-medium text-brand-primary mb-0.5">{cls.time}</p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-tight mb-1">{cls.title}</p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{cls.course}</p>
                    </div>
                    <button className="shrink-0 p-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors" title="Join Session">
                      <Video size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* AI Teaching Assistant */}
          <motion.div variants={itemVariants}>
            <Panel className="bg-gradient-to-b from-brand-primary/5 to-transparent border-brand-primary/20">
              <PanelHeader 
                title="AI Teaching Assistant" 
                action={<Sparkles size={14} className="text-brand-primary" />}
              />
              <div className="p-5">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                  Automate your workflow. Generate lesson plans, quizzes, and grading rubrics instantly.
                </p>
                <div className="space-y-2 mb-4">
                  <button className="w-full text-left text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-brand-primary/50 hover:bg-white dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 truncate flex items-center gap-2">
                    <FileText size={12} className="text-neutral-400" /> Generate Quiz: Graph Algorithms
                  </button>
                  <button className="w-full text-left text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-brand-primary/50 hover:bg-white dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 truncate flex items-center gap-2">
                    <ClipboardList size={12} className="text-neutral-400" /> Create Lesson Plan: React Hooks
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask the AI Assistant..." 
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-brand-primary text-white rounded-md hover:bg-brand-accent transition-colors">
                    <MessageSquare size={12} />
                  </button>
                </div>
              </div>
            </Panel>
          </motion.div>

          {/* Communication Center */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Messages" 
                action={<Link to="/messages" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"><MessageSquare size={14}/></Link>} 
              />
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {MESSAGES.map(msg => (
                  <div key={msg.id} className="p-4 flex gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 font-semibold text-xs">
                      {msg.sender.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate pr-2">{msg.sender}</p>
                        <span className="text-[10px] text-neutral-500 shrink-0">{msg.time}</span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{msg.subject}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* Calendar & Schedule */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Upcoming Schedule" 
                action={<Link to="/calendar" className="text-neutral-500 hover:text-neutral-900 transition-colors"><Calendar size={14} /></Link>}
              />
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {CALENDAR_EVENTS.map(event => (
                  <div key={event.id} className="p-4 flex gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      {event.type === 'meeting' ? <Users size={16} className="text-blue-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-tight mb-1">{event.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: LIVE CLASSROOM CONTROLS ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader title="Live Classroom Controls" action={<span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>} />
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'Whiteboard', icon: PenTool },
                    { label: 'Screen Share', icon: Share2 },
                    { label: 'Breakout Rooms', icon: LayoutGrid },
                    { label: 'Session Recording', icon: Video },
                    { label: 'Mute All', icon: MicOff },
                    { label: 'Presentation Mode', icon: Presentation },
                  ].map((ctrl, idx) => (
                    <button key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-colors text-left">
                      <ctrl.icon size={13} className="text-neutral-500 shrink-0" />
                      <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 leading-tight">{ctrl.label}</span>
                    </button>
                  ))}
                </div>
                <Link to="/classroom/general" className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors hover:scale-102 hover:shadow-sm">
                  <Video size={12} /> Start Live Session
                </Link>
              </div>
            </Panel>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
