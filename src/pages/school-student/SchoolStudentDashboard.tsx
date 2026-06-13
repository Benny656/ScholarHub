import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { LearningStreaks } from '../../components/features/LearningStreaks';
import { AIStudyPlanner } from '../../components/features/AIStudyPlanner';
import { OfflineSync } from '../../components/features/OfflineSync';
import { VoiceAssistantModal } from '../../components/features/VoiceAssistantModal';
import { Mic } from 'lucide-react';
import { 
  Flame, 
  Trophy, 
  Star, 
  PlayCircle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  MessageSquare,
  Sparkles,
  Medal,
  Activity,
  ArrowRight,
  Video,
  FileText,
  FileImage,
  Download,
  Map,
  BookOpen,
  Award,
  GraduationCap,
  Share2,
  Edit3,
  Hand,
  Circle,
  Monitor,
  CheckSquare
} from 'lucide-react';

const MOCK_DATA = {
  streak: 12,
  xp: 4520,
  level: 8,
  weeklyGoalProgress: 82,
  continueLearning: [
    { id: 1, title: 'Algebra I: Quadratic Equations', subject: 'Mathematics', progress: 65, color: 'from-blue-500 to-cyan-400' },
    { id: 2, title: 'Cell Biology: Mitochondria', subject: 'Science', progress: 30, color: 'from-emerald-500 to-green-400' },
    { id: 3, title: 'World History: The Renaissance', subject: 'History', progress: 85, color: 'from-orange-500 to-amber-400' },
  ],
  upcomingClasses: [
    { id: 1, title: 'Advanced Physics', time: '10:00 AM', duration: '45m', instructor: 'Mr. Davis' },
    { id: 2, title: 'English Literature', time: '1:30 PM', duration: '60m', instructor: 'Ms. Smith' },
    { id: 3, title: 'Computer Science', time: '3:00 PM', duration: '45m', instructor: 'Mrs. Johnson' },
  ],
  assignments: {
    dueSoon: 3,
    submitted: 12,
    pendingReview: 2,
  },
  attendance: {
    percentage: 96,
    thisMonth: 'Present 18/19 days'
  },
  achievements: [
    { id: 1, title: 'Math Whiz', icon: '🔢', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { id: 2, title: '7 Day Streak', icon: '🔥', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { id: 3, title: 'Science Fair', icon: '🔬', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { id: 4, title: 'Fast Learner', icon: '⚡', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
  ]
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function SchoolStudentDashboard() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Ben';
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans space-y-8">
      <VoiceAssistantModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
      {/* ─── HERO SECTION ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-brand-primary to-brand-accent rounded-3xl p-6 sm:p-8 md:p-10 text-white overflow-hidden mb-8 shadow-xl"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 right-32 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl translate-y-1/3"></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 font-serif tracking-tight"
            >
              {getGreeting()}, {firstName}! 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-white/90 font-medium max-w-md"
            >
              Keep learning. You're <span className="font-bold text-yellow-300">{MOCK_DATA.weeklyGoalProgress}%</span> ahead of your weekly goal.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 md:justify-end"
          >
            {/* Streak */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-colors cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Daily Streak</p>
                <p className="text-2xl font-bold">{MOCK_DATA.streak} <span className="text-sm font-medium text-white/80">Days</span></p>
              </div>
            </div>

            {/* XP */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-colors cursor-default">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Total XP</p>
                <p className="text-2xl font-bold">{MOCK_DATA.xp}</p>
              </div>
            </div>
            
            {/* Level */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-colors cursor-default w-full sm:w-auto md:hidden lg:flex">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Level</p>
                <p className="text-2xl font-bold">{MOCK_DATA.level}</p>
              </div>
            </div>
            {/* Voice Assistant Trigger */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer" onClick={() => setIsVoiceOpen(true)}>
              <Mic className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* ─── LEFT COLUMN (Main Content) ─── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ─── NEW: LEARNING STREAKS ─── */}
          <motion.div variants={itemVariants}>
            <LearningStreaks />
          </motion.div>

          {/* Continue Learning */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-brand-primary" />
                Continue Learning
              </h2>
              <button className="text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
              {MOCK_DATA.continueLearning.map((course) => (
                <div 
                  key={course.id} 
                  className="min-w-[280px] sm:min-w-[320px] bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all snap-start flex-shrink-0 group cursor-pointer"
                >
                  <div className={`h-24 rounded-xl mb-4 bg-gradient-to-br ${course.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                    <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/20">
                      {course.subject}
                    </div>
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-50 mb-1 group-hover:text-brand-primary transition-colors line-clamp-1">{course.title}</h3>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                      <span>Progress</span>
                      <span className="text-brand-primary font-bold">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-700 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full bg-gradient-to-r ${course.color}`}
                      ></motion.div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Dual Columns: Assignments & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Assignments */}
            <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-700 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <CheckCircle2 className="w-24 h-24" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-6">
                <CheckSquare className="w-5 h-5 text-indigo-500" />
                Assignments
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center font-bold">
                      {MOCK_DATA.assignments.dueSoon}
                    </div>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">Due Soon</span>
                  </div>
                  <button className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full font-medium transition-colors">View</button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg flex items-center justify-center font-bold">
                      {MOCK_DATA.assignments.pendingReview}
                    </div>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">Pending Review</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-100 dark:border-green-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center font-bold">
                      {MOCK_DATA.assignments.submitted}
                    </div>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">Submitted</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Attendance & Stats */}
            <motion.section variants={itemVariants} className="space-y-6">
              
              {/* Attendance */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-700 shadow-sm flex items-center gap-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-neutral-200 dark:text-neutral-700"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <motion.path
                      className="text-emerald-500"
                      strokeWidth="3"
                      strokeDasharray={`${MOCK_DATA.attendance.percentage}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${MOCK_DATA.attendance.percentage}, 100` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-bold text-neutral-900 dark:text-white">{MOCK_DATA.attendance.percentage}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-50 mb-1">Great Attendance!</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{MOCK_DATA.attendance.thisMonth}</p>
                </div>
              </div>

              {/* Achievements Mini */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-700 shadow-sm">
                <h3 className="font-bold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
                  <Medal className="w-5 h-5 text-amber-500" />
                  Recent Badges
                </h3>
                <div className="flex gap-3">
                  {MOCK_DATA.achievements.map(badge => (
                    <div 
                      key={badge.id}
                      className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center text-xl shadow-sm`}
                      title={badge.title}
                    >
                      {badge.icon}
                    </div>
                  ))}
                </div>
              </div>

            </motion.section>

            {/* ─── NEW: AI STUDY PLANNER ─── */}
            <motion.div variants={itemVariants} className="mt-6">
              <AIStudyPlanner />
            </motion.div>

          </div>
        </div>

        {/* ─── RIGHT COLUMN (Sidebar items) ─── */}
        <div className="space-y-8">
          
          {/* Upcoming Classes */}
          <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-blue-500" />
              Upcoming Classes
            </h2>
            <div className="space-y-4">
              {MOCK_DATA.upcomingClasses.map((cls, index) => (
                <div key={cls.id} className="group flex gap-4 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Today</span>
                    <span className="text-sm font-bold">{cls.time.split(' ')[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-neutral-900 dark:text-neutral-50 truncate">{cls.title}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{cls.instructor} • {cls.duration}</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <button className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* AI Tutor Widget */}
          <motion.section variants={itemVariants} className="bg-gradient-to-b from-purple-50 to-white dark:from-brand-primary/10 dark:to-neutral-800 rounded-2xl p-6 border border-brand-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl"></div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              AI Tutor
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Stuck on a problem? Ask your AI tutor for help.</p>
            
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2 flex items-center shadow-inner mb-4">
              <input 
                type="text" 
                placeholder="Ask anything..." 
                className="bg-transparent border-none outline-none w-full px-3 text-sm text-neutral-800 dark:text-neutral-200"
              />
              <button className="bg-brand-primary hover:bg-brand-accent text-white p-2 rounded-lg transition-colors shadow-md">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Suggested</p>
              <button className="w-full text-left text-sm p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all truncate text-neutral-700 dark:text-neutral-300">
                Explain quadratic equations simply
              </button>
              <button className="w-full text-left text-sm p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all truncate text-neutral-700 dark:text-neutral-300">
                Help me practice Spanish verbs
              </button>
            </div>
          </motion.section>

          {/* ─── NEW: QUICK ACCESS CARDS ─── */}
          <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-5">
              <BookOpen className="w-5 h-5 text-brand-primary" />
              Quick Access
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Live Classroom', icon: Video, color: 'from-brand-primary to-brand-accent text-white' },
                { label: 'Resources', icon: BookOpen, color: 'from-blue-500 to-cyan-400 text-white' },
                { label: 'Assignments', icon: FileText, color: 'from-amber-500 to-orange-400 text-white' },
                { label: 'Certificates', icon: Award, color: 'from-emerald-500 to-green-400 text-white' },
              ].map((card, idx) => (
                <button key={idx} className={`bg-gradient-to-br ${card.color} p-4 rounded-2xl flex flex-col items-start gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm`}>
                  <card.icon className="w-5 h-5" />
                  <span className="text-sm font-bold">{card.label}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* ─── NEW: LEARNING RESOURCES ─── */}
          <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-5">
              <PlayCircle className="w-5 h-5 text-blue-500" />
              Learning Resources
            </h2>
            <div className="space-y-3">
              {[
                { title: 'Algebra I: Quadratic Equations', type: 'Video', icon: Video, color: 'bg-red-100 text-red-500 dark:bg-red-500/20' },
                { title: 'Cell Biology: Mitosis Notes', type: 'PDF', icon: FileText, color: 'bg-blue-100 text-blue-500 dark:bg-blue-500/20' },
                { title: 'World History: The Renaissance', type: 'PPT', icon: FileImage, color: 'bg-amber-100 text-amber-500 dark:bg-amber-500/20' },
              ].map((r, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-100 dark:border-neutral-700 group hover:border-brand-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${r.color} flex items-center justify-center shrink-0`}>
                      <r.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-tight line-clamp-1">{r.title}</p>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">{r.type}</span>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">Open</button>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ─── NEW: GRADES & PROGRESS ─── */}
          <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-500" />
                Grades & Progress
              </h2>
              <span className="text-sm font-bold text-brand-primary">GPA 3.8</span>
            </div>
            <div className="space-y-3">
              {[
                { subject: 'Mathematics', grade: 'A', score: 92, color: 'from-blue-500 to-cyan-400' },
                { subject: 'Science', grade: 'A-', score: 88, color: 'from-emerald-500 to-green-400' },
                { subject: 'History', grade: 'B+', score: 82, color: 'from-orange-500 to-amber-400' },
                { subject: 'Computer Science', grade: 'A+', score: 97, color: 'from-purple-500 to-indigo-400' },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 w-20 shrink-0 truncate">{s.subject}</span>
                  <div className="flex-1 h-2.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.score}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${s.color}`}
                    />
                  </div>
                  <span className={`text-xs font-bold w-8 text-right shrink-0 ${s.grade.startsWith('A') ? 'text-emerald-500' : 'text-blue-500'}`}>{s.grade}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ─── NEW: LIVE CLASSROOM FEATURES ─── */}
          <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-brand-primary" />
              Live Classroom
            </h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: 'Video Conferencing', icon: Video },
                { label: 'Screen Sharing', icon: Share2 },
                { label: 'Whiteboard', icon: Edit3 },
                { label: 'Real-Time Chat', icon: MessageSquare },
                { label: 'Raise Hand', icon: Hand },
                { label: 'Recording', icon: Circle },
              ].map((f, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <f.icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 leading-tight">{f.label}</span>
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-accent text-white text-sm font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-primary/20">
              <Monitor className="w-4 h-4" /> Join Live Class
            </button>
          </motion.section>

          {/* ─── NEW: OFFLINE SYNC ─── */}
          <motion.div variants={itemVariants}>
            <OfflineSync />
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
