import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  BookOpen, Clock, AlertTriangle, Calendar, ChevronRight, 
  MessageSquare, Sparkles, TrendingUp, PlayCircle, FileText, 
  CheckCircle2, Award, ArrowRight, Video, FileImage, 
  Download, Map, Monitor, Share2, Edit3, Hand,
  Circle, GraduationCap, Bell, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PeerReviewCenter } from '../../components/features/PeerReviewCenter';
import { AIStudyPlanner } from '../../components/features/AIStudyPlanner';
import { OfflineSync } from '../../components/features/OfflineSync';
import { VoiceAssistantModal } from '../../components/features/VoiceAssistantModal';
import { Mic } from 'lucide-react';

// --- Mock Data ---
const ACADEMIC_DATA = {
  cgpa: '3.82',
  maxCgpa: '4.0',
  attendance: 92,
  activeCourses: 4,
  pendingAssignments: 3,
  semester: 'Fall 2026',
  creditsCompleted: 45,
  creditsRemaining: 75,
  academicStanding: 'Excellent',
};

const COURSES = [
  { id: 'c1', title: 'Advanced Data Structures', faculty: 'Dr. Alan Turing', progress: 68, nextSession: 'Tomorrow, 10:00 AM', color: 'bg-indigo-500' },
  { id: 'c2', title: 'Machine Learning Fundamentals', faculty: 'Prof. Ada Lovelace', progress: 34, nextSession: 'Wed, 2:00 PM', color: 'bg-emerald-500' },
  { id: 'c3', title: 'Cloud Computing Architecture', faculty: 'Dr. Vint Cerf', progress: 85, nextSession: 'Thu, 1:00 PM', color: 'bg-blue-500' },
  { id: 'c4', title: 'Quantum Computing Intro', faculty: 'Prof. Richard Feynman', progress: 12, nextSession: 'Fri, 9:00 AM', color: 'bg-purple-500' },
];

const ASSIGNMENTS = {
  dueToday: [
    { id: 'a1', title: 'Graph Traversal Implementation', course: 'Adv. Data Structures', time: '11:59 PM', priority: 'high' }
  ],
  upcoming: [
    { id: 'a2', title: 'Neural Network Project', course: 'Machine Learning', date: 'Oct 15', priority: 'medium' },
    { id: 'a3', title: 'AWS Infrastructure Diagram', course: 'Cloud Computing', date: 'Oct 18', priority: 'low' }
  ],
  submitted: [
    { id: 'a4', title: 'Binary Trees Essay', course: 'Adv. Data Structures', grade: 'Pending' }
  ]
};

const PERFORMANCE_DATA = [
  { subject: 'CS101', grade: 95 },
  { subject: 'CS102', grade: 88 },
  { subject: 'MTH201', grade: 92 },
  { subject: 'PHY101', grade: 78 },
  { subject: 'ENG101', grade: 85 },
];

const ATTENDANCE_TREND = [
  { week: 'W1', present: 100 },
  { week: 'W2', present: 95 },
  { week: 'W3', present: 90 },
  { week: 'W4', present: 92 },
  { week: 'W5', present: 88 },
  { week: 'W6', present: 95 },
];

const CALENDAR_EVENTS = [
  { id: 'e1', title: 'Midterm Physics', type: 'exam', time: 'Oct 14, 9:00 AM' },
  { id: 'e2', title: 'Guest Lecture: AI Ethics', type: 'event', time: 'Oct 16, 3:00 PM' },
];

const CERTIFICATES = [
  { id: 'cert1', title: 'AWS Cloud Practitioner', date: 'Sep 2026' },
  { id: 'cert2', title: 'Python Data Analysis', date: 'Aug 2026' },
];

// --- NEW: Learning Resources Data ---
const RESOURCES = {
  Videos: [
    { id: 'v1', title: 'Intro to Neural Networks', course: 'Machine Learning', duration: '32 min' },
    { id: 'v2', title: 'Binary Search Trees Deep Dive', course: 'Data Structures', duration: '45 min' },
    { id: 'v3', title: 'AWS EC2 Setup Guide', course: 'Cloud Computing', duration: '18 min' },
  ],
  PDFs: [
    { id: 'p1', title: 'Graph Algorithms Cheatsheet', course: 'Data Structures', size: '1.2 MB' },
    { id: 'p2', title: 'ML Model Evaluation Notes', course: 'Machine Learning', size: '845 KB' },
    { id: 'p3', title: 'Quantum Gates Reference', course: 'Quantum Computing', size: '2.1 MB' },
  ],
  PPTs: [
    { id: 's1', title: 'Week 8: Recurrent Networks', course: 'Machine Learning', slides: '28 slides' },
    { id: 's2', title: 'Distributed Systems Overview', course: 'Cloud Computing', slides: '42 slides' },
  ],
  Paths: [
    { id: 'lp1', title: 'ML Engineer Learning Path', progress: 38, modules: 12 },
    { id: 'lp2', title: 'Cloud Architecture Roadmap', progress: 65, modules: 8 },
  ],
};

// --- NEW: Grades Data ---
const GRADES = [
  { subject: 'Advanced Data Structures', code: 'CS301', grade: 'A', gpa: 4.0, credits: 4, status: 'In Progress' },
  { subject: 'Machine Learning Fund.', code: 'CS402', grade: 'A-', gpa: 3.7, credits: 3, status: 'In Progress' },
  { subject: 'Cloud Computing Arch.', code: 'CS415', grade: 'B+', gpa: 3.3, credits: 3, status: 'In Progress' },
  { subject: 'Quantum Computing Intro', code: 'CS490', grade: 'A', gpa: 4.0, credits: 3, status: 'In Progress' },
  { subject: 'Technical Writing', code: 'ENG201', grade: 'B+', gpa: 3.3, credits: 2, status: 'Complete' },
];

// --- Components ---

const Panel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const PanelHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="px-5 py-4 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
    {action && <div className="text-xs">{action}</div>}
  </div>
);

export function StudentDashboard() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Ben';
  const [resourceTab, setResourceTab] = useState<'Videos' | 'PDFs' | 'PPTs' | 'Paths'>('Videos');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const resourceTabs = ['Videos', 'PDFs', 'PPTs', 'Paths'] as const;

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
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            You have <span className="font-medium text-neutral-900 dark:text-neutral-200">3 upcoming deadlines</span> and <span className="font-medium text-neutral-900 dark:text-neutral-200">2 live sessions</span> this week.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/messages" className="flex items-center gap-2 px-3 py-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg text-sm transition-colors border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <MessageSquare size={14} />
            <span>Messages</span>
          </Link>
          <Link to="/notifications" className="flex items-center gap-2 px-3 py-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg text-sm transition-colors border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <Bell size={14} />
          </Link>
          <Link to="/classroom/general" className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-medium transition-colors border border-neutral-200 dark:border-neutral-700 hover:scale-102 hover:shadow-sm">
            <PlayCircle size={16} />
            Join Next Class
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium transition-colors">
            <Sparkles size={16} />
            AI Assistant
          </button>
          <button onClick={() => setIsVoiceOpen(true)} className="flex items-center justify-center w-9 h-9 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary/20 transition-colors shadow-sm">
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
          { label: 'Current CGPA', value: `${ACADEMIC_DATA.cgpa} / ${ACADEMIC_DATA.maxCgpa}`, icon: TrendingUp },
          { label: 'Attendance', value: `${ACADEMIC_DATA.attendance}%`, icon: Clock },
          { label: 'Active Courses', value: ACADEMIC_DATA.activeCourses, icon: BookOpen },
          { label: 'Pending Assignments', value: ACADEMIC_DATA.pendingAssignments, icon: AlertTriangle },
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

      {/* ─── QUICK ACCESS CARDS ─── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Live Classroom', icon: Video, to: '/classroom/general', color: 'text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white' },
          { label: 'Resources', icon: BookOpen, to: '/resources', color: 'text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-500/10 dark:text-blue-400' },
          { label: 'Assignments', icon: FileText, to: '/assignments', color: 'text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white dark:bg-amber-500/10 dark:text-amber-400' },
          { label: 'Certificates', icon: Award, to: '/certificates', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400' },
        ].map((card, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Link to={card.to} className={`flex items-center gap-3 p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800 transition-all group ${card.color}`}>
              <card.icon size={18} />
              <span className="text-sm font-medium">{card.label}</span>
              <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
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
          
          {/* Academic Overview & Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Panel className="h-full">
                <PanelHeader title="Academic Overview" />
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-neutral-800/50">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Current Semester</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-200">{ACADEMIC_DATA.semester}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-neutral-800/50">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Credits Completed</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-200">{ACADEMIC_DATA.creditsCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-neutral-800/50">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Credits Remaining</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-200">{ACADEMIC_DATA.creditsRemaining}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Academic Standing</span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{ACADEMIC_DATA.academicStanding}</span>
                  </div>
                </div>
              </Panel>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Panel className="h-full">
                <PanelHeader title="Performance Analytics" />
                <div className="p-5 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={16}>
                      <XAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                      />
                      <Bar dataKey="grade" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </motion.div>
          </div>

          {/* Course Dashboard */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Course Dashboard" 
                action={<Link to="/courses" className="text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1">View All <ArrowRight size={14} /></Link>} 
              />
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {COURSES.map(course => (
                  <div key={course.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{course.title}</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{course.faculty}</p>
                    </div>
                    
                    <div className="w-full sm:w-48 shrink-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Progress</span>
                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className={`h-full ${course.color} rounded-full`} style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                    
                    <div className="sm:text-right shrink-0">
                      <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Next Session</p>
                      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-200">{course.nextSession}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* Assignment Center */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Assignment Center" 
                action={<Link to="/assignments" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">See all</Link>}
              />
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Due Today */}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Due Today
                  </h4>
                  <div className="space-y-3">
                    {ASSIGNMENTS.dueToday.map(task => (
                      <div key={task.id} className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">{task.title}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-600 dark:text-neutral-400">{task.course}</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">{task.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming */}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Upcoming
                  </h4>
                  <div className="space-y-3">
                    {ASSIGNMENTS.upcoming.map(task => (
                      <div key={task.id} className="p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-lg">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1 leading-tight">{task.title}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-500 dark:text-neutral-400 truncate mr-2">{task.course}</span>
                          <span className="font-medium text-neutral-700 dark:text-neutral-300 shrink-0">{task.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submitted */}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Submitted
                  </h4>
                  <div className="space-y-3">
                    {ASSIGNMENTS.submitted.map(task => (
                      <div key={task.id} className="p-3 border border-neutral-200/50 dark:border-neutral-800 rounded-lg flex items-start gap-2 opacity-70">
                        <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 line-through decoration-neutral-300 dark:decoration-neutral-600 mb-1 leading-tight">{task.title}</p>
                          <p className="text-[10px] text-neutral-500">{task.course}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: LEARNING RESOURCES ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Learning Resources" 
                action={<Link to="/resources" className="text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1">Browse All <ArrowRight size={14} /></Link>}
              />
              {/* Tabs */}
              <div className="flex gap-1 px-5 pt-4 border-b border-neutral-100 dark:border-neutral-800">
                {resourceTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setResourceTab(tab)}
                    className={`pb-3 px-3 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                      resourceTab === tab
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {resourceTab === 'Videos' && RESOURCES.Videos.map(r => (
                  <div key={r.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                        <Video size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{r.title}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{r.course} • {r.duration}</p>
                      </div>
                    </div>
                    <button className="text-xs font-medium text-brand-primary hover:underline shrink-0">Watch</button>
                  </div>
                ))}
                {resourceTab === 'PDFs' && RESOURCES.PDFs.map(r => (
                  <div key={r.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <FileText size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{r.title}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{r.course} • {r.size}</p>
                      </div>
                    </div>
                    <button className="text-xs font-medium text-brand-primary hover:underline shrink-0 flex items-center gap-1"><Download size={12} /> Download</button>
                  </div>
                ))}
                {resourceTab === 'PPTs' && RESOURCES.PPTs.map(r => (
                  <div key={r.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <FileImage size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{r.title}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{r.course} • {r.slides}</p>
                      </div>
                    </div>
                    <button className="text-xs font-medium text-brand-primary hover:underline shrink-0">View</button>
                  </div>
                ))}
                {resourceTab === 'Paths' && RESOURCES.Paths.map(r => (
                  <div key={r.id} className="p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                          <Map size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{r.title}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{r.modules} modules</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-brand-primary">{r.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full ml-11">
                      <div className="h-full bg-brand-primary rounded-full" style={{ width: `${r.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: GRADES DASHBOARD ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Grades Dashboard" 
                action={
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">CGPA:</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{ACADEMIC_DATA.cgpa} / {ACADEMIC_DATA.maxCgpa}</span>
                  </span>
                }
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                      {['Subject', 'Code', 'Grade', 'GPA', 'Credits', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {GRADES.map((g, i) => (
                      <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">{g.subject}</td>
                        <td className="px-5 py-3 text-xs text-neutral-500 dark:text-neutral-400 font-mono">{g.code}</td>
                        <td className="px-5 py-3">
                          <span className={`text-sm font-bold ${g.grade.startsWith('A') ? 'text-emerald-600 dark:text-emerald-400' : g.grade.startsWith('B') ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>{g.grade}</span>
                        </td>
                        <td className="px-5 py-3 text-sm text-neutral-700 dark:text-neutral-300 font-medium">{g.gpa.toFixed(1)}</td>
                        <td className="px-5 py-3 text-sm text-neutral-500 dark:text-neutral-400">{g.credits} cr.</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${g.status === 'Complete' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'}`}>{g.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Semester GPA · Fall 2026</span>
                <Link to="/grades" className="text-xs text-brand-primary hover:underline font-medium">Full Transcript →</Link>
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: ADVANCED LEARNING ─── */}
          <motion.div variants={itemVariants}>
            <PeerReviewCenter role="student" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <AIStudyPlanner />
          </motion.div>

        </div>

        {/* RIGHT COLUMN (Side Content) */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* AI Academic Assistant */}
          <motion.div variants={itemVariants}>
            <Panel className="bg-gradient-to-b from-brand-primary/5 to-transparent border-brand-primary/20">
              <PanelHeader 
                title="AI Assistant" 
                action={<Sparkles size={14} className="text-brand-primary" />}
              />
              <div className="p-5">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                  Your academic copilot. Generate practice questions, summarize notes, or plan your study schedule.
                </p>
                <div className="space-y-2 mb-4">
                  <button className="w-full text-left text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-brand-primary/50 hover:bg-white dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 truncate">
                    Summarize recent ML lecture
                  </button>
                  <button className="w-full text-left text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-brand-primary/50 hover:bg-white dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 truncate">
                    Generate Quiz: Quantum Computing
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask a question..." 
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-brand-primary text-white rounded-md hover:bg-brand-accent transition-colors">
                    <MessageSquare size={12} />
                  </button>
                </div>
              </div>
            </Panel>
          </motion.div>

          {/* Attendance Analytics */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader title="Attendance Trend" />
              <div className="p-5">
                <div className="h-[120px] mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ATTENDANCE_TREND} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="week" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 100]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {ACADEMIC_DATA.attendance < 85 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs mt-4">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <p>Attendance dropping in Physics 101. Risk of penalty.</p>
                  </div>
                )}
              </div>
            </Panel>
          </motion.div>

          {/* Calendar & Schedule */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Schedule" 
                action={<Link to="/calendar" className="text-neutral-500 hover:text-neutral-900 transition-colors"><Calendar size={14} /></Link>}
              />
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {CALENDAR_EVENTS.map(event => (
                  <div key={event.id} className="p-4 flex gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-neutral-600 dark:text-neutral-400" />
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

          {/* Certificates */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Recent Credentials" 
                action={<Link to="/certificates" className="text-neutral-500 hover:text-neutral-900 transition-colors"><Award size={14} /></Link>} 
              />
              <div className="p-4 space-y-3">
                {CERTIFICATES.map(cert => (
                  <div key={cert.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={14} className="text-brand-primary shrink-0" />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{cert.title}</span>
                    </div>
                    <span className="text-xs text-neutral-500">{cert.date}</span>
                  </div>
                ))}
                <Link to="/certificates" className="flex items-center justify-center gap-1 text-xs text-brand-primary hover:underline font-medium pt-1">
                  View all certificates <ChevronRight size={12} />
                </Link>
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: LIVE CLASSROOM PREVIEW ─── */}
          <motion.div variants={itemVariants}>
            <Panel>
              <PanelHeader 
                title="Live Classroom" 
                action={<span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
              />
              <div className="p-4">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Supports all live interaction features for your sessions.</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Video Conferencing', icon: Video, active: true },
                    { label: 'Screen Sharing', icon: Share2, active: true },
                    { label: 'Whiteboard', icon: Edit3, active: true },
                    { label: 'Real-Time Chat', icon: MessageSquare, active: true },
                    { label: 'Raise Hand', icon: Hand, active: true },
                    { label: 'Session Recording', icon: Circle, active: true },
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <feat.icon size={12} className="text-emerald-500 shrink-0" />
                      <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-300 leading-tight">{feat.label}</span>
                    </div>
                  ))}
                </div>
                <Link to="/classroom/general" className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-accent transition-colors hover:scale-102 hover:shadow-sm">
                  <Monitor size={12} /> Enter Live Classroom
                </Link>
              </div>
            </Panel>
          </motion.div>

          {/* ─── NEW: OFFLINE SYNC ─── */}
          <motion.div variants={itemVariants}>
            <OfflineSync />
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
