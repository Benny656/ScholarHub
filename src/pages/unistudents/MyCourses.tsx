import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const COURSES = [
  {
    id: 'cs101',
    code: 'CS101',
    title: 'Introduction to Artificial Intelligence',
    professor: 'Dr. Arjun Kapoor',
    credits: 4,
    progress: 62,
    semester: 'Semester 1 · 2025–26',
    students: 84,
    totalHours: 48,
    tag: 'Core',
    tagColor: 'bg-[#9d95ff]/15 text-[#9d95ff] dark:text-[#9d95ff] border-[#9d95ff]/30',
    gradient: 'from-[#9d95ff] to-[#9d95ff]',
    accent: 'bg-[#9d95ff]/10 border-[#9d95ff]/30',
    bar: 'from-[#9d95ff] to-[#9d95ff]',
    icon: '🤖',
  },
  {
    id: 'cs102',
    code: 'CS102',
    title: 'Data Structures & Algorithms',
    professor: 'Prof. Meera Krishnan',
    credits: 4,
    progress: 75,
    semester: 'Semester 1 · 2025–26',
    students: 91,
    totalHours: 52,
    tag: 'Core',
    tagColor: 'bg-[#00bae2]/15 text-[#00bae2] dark:text-[#00bae2] border-[#00bae2]/30',
    gradient: 'from-[#00bae2] to-[#00bae2]',
    accent: 'bg-[#00bae2]/10 border-[#00bae2]/30',
    bar: 'from-[#00bae2] to-[#00bae2]',
    icon: '🧩',
  },
  {
    id: 'ma201',
    code: 'MA201',
    title: 'Linear Algebra for Computing',
    professor: 'Dr. Sneha Pillai',
    credits: 3,
    progress: 55,
    semester: 'Semester 1 · 2025–26',
    students: 76,
    totalHours: 36,
    tag: 'Math',
    tagColor: 'bg-[#00bae2]/15 text-[#00bae2] dark:text-[#00bae2] border-[#00bae2]/30',
    gradient: 'from-[#00bae2] to-[#00bae2]',
    accent: 'bg-[#00bae2]/10 border-[#00bae2]/30',
    bar: 'from-[#00bae2] to-[#00bae2]',
    icon: '📐',
  },
  {
    id: 'cs103',
    code: 'CS103',
    title: 'Advanced Python Programming',
    professor: 'Prof. Rahul Desai',
    credits: 3,
    progress: 88,
    semester: 'Semester 1 · 2025–26',
    students: 68,
    totalHours: 40,
    tag: 'Lab',
    tagColor: 'bg-amber-500/15 text-amber-500 dark:text-amber-500 border-amber-500/30',
    gradient: 'from-amber-500 to-amber-500',
    accent: 'bg-amber-500/10 border-amber-500/30',
    bar: 'from-amber-500 to-amber-500',
    icon: '🐍',
  },
];

export function MyCourses() {
  return (
    <div className="max-w-[1200px] mx-auto pb-12 space-y-8 font-sans">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0e100f] dark:text-[#E1DCC9] tracking-tight">
          My Courses
        </h1>
        <p className="text-sm text-[#7c7c6f] dark:text-[#7c7c6f] mt-1">
          B.Tech CSE (AI & ML) · Semester 1 · 4 Active Courses
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: 'Enrolled Courses', value: '4', color: 'text-[#9d95ff] dark:text-[#9d95ff]' },
          { label: 'Total Credits', value: '14', color: 'text-[#00bae2] dark:text-[#00bae2]' },
          { label: 'Avg. Progress', value: `${Math.round(COURSES.reduce((s, c) => s + c.progress, 0) / COURSES.length)}%`, color: 'text-[#00bae2] dark:text-[#00bae2]' },
          { label: 'Study Hours Left', value: '67h', color: 'text-amber-500 dark:text-amber-500' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05 }}
            className="bg-[#FFFCE1]/50 dark:bg-[#FFFCE1]/5 backdrop-blur-xl border border-[#E1DCC9]/60 dark:border-[#E1DCC9]/10 rounded-2xl p-4 text-center shadow-sm"
          >
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] mt-1 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COURSES.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            whileHover={{ translateY: -4 }}
            className="relative bg-[#FFFCE1] dark:bg-[#412D15]/70 border border-[#E1DCC9]/70 dark:border-[#E1DCC9]/10 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Top gradient bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${course.bar}`} />

            <div className="p-6 flex flex-col gap-4 flex-1">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center text-2xl shadow-lg shrink-0`}>
                  {course.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-black text-[#7c7c6f] dark:text-[#7c7c6f] font-mono">{course.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${course.tagColor}`}>{course.tag}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0e100f] dark:text-[#E1DCC9] leading-snug">{course.title}</h3>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#7c7c6f] dark:text-[#7c7c6f]">
                <span className="flex items-center gap-1"><BookOpen size={11} /> {course.professor}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {course.totalHours}h total</span>
                <span className="flex items-center gap-1"><Users size={11} /> {course.students} students</span>
                <span className="font-semibold text-[#7c7c6f] dark:text-[#7c7c6f]">{course.credits} credits</span>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 mt-auto">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#7c7c6f] dark:text-[#7c7c6f]">Semester Progress</span>
                  <span className="text-[#0e100f] dark:text-[#E1DCC9]">{course.progress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${course.bar} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3 pt-1">
                <Link to={`/learn/${course.id}/l1`} className="flex-1">
                  <button className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#E1DCC9] bg-gradient-to-r ${course.gradient} rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all`}>
                    <Play size={12} /> Continue Learning
                  </button>
                </Link>
                <Link to={`/courses/${course.id}`}>
                  <button className="p-2 border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-xl text-[#7c7c6f] hover:text-[#0e100f] dark:hover:text-[#E1DCC9] hover:bg-[#FFFCE1] dark:hover:bg-[#412D15] transition-all">
                    <ChevronRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
