import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle } from 'lucide-react';

const EXAMS = [
  {
    id: 'e1',
    course: 'Introduction to Artificial Intelligence',
    code: 'CS101',
    type: 'Midterm Theory',
    date: '2026-07-08',
    time: '10:00 AM – 1:00 PM',
    venue: 'Main CS Block, Hall A',
    syllabus: 'Unit 1–3: Search, Knowledge Repr., Logic',
    daysLeft: 19,
    urgency: 'normal',
    gradient: 'from-[#9d95ff] to-[#9d95ff]',
    icon: '🤖',
    typeBadge: 'bg-[#9d95ff]/15 text-[#9d95ff] dark:text-[#9d95ff] border-[#9d95ff]/30',
  },
  {
    id: 'e2',
    course: 'Data Structures & Algorithms',
    code: 'CS102',
    type: 'Lab Practical',
    date: '2026-07-03',
    time: '2:00 PM – 4:00 PM',
    venue: 'CS Lab 2, Room 204',
    syllabus: 'Sorting Algorithms, Trees, Graphs (BFS/DFS)',
    daysLeft: 14,
    urgency: 'soon',
    gradient: 'from-[#00bae2] to-[#00bae2]',
    icon: '🧩',
    typeBadge: 'bg-[#00bae2]/15 text-[#00bae2] dark:text-[#00bae2] border-[#00bae2]/30',
  },
  {
    id: 'e3',
    course: 'Linear Algebra for Computing',
    code: 'MA201',
    type: 'Midterm Theory',
    date: '2026-07-15',
    time: '9:00 AM – 11:30 AM',
    venue: 'Math Block, Seminar Hall',
    syllabus: 'Vectors, Matrices, Eigen Decomposition',
    daysLeft: 26,
    urgency: 'normal',
    gradient: 'from-[#00bae2] to-[#00bae2]',
    icon: '📐',
    typeBadge: 'bg-[#00bae2]/15 text-[#00bae2] dark:text-[#00bae2] border-[#00bae2]/30',
  },
  {
    id: 'e4',
    course: 'Advanced Python Programming',
    code: 'CS103',
    type: 'Lab Practical',
    date: '2026-06-27',
    time: '11:00 AM – 1:00 PM',
    venue: 'CS Lab 1, Room 101',
    syllabus: 'OOP, Decorators, NumPy / Pandas',
    daysLeft: 8,
    urgency: 'urgent',
    gradient: 'from-amber-500 to-amber-500',
    icon: '🐍',
    typeBadge: 'bg-amber-500/15 text-amber-500 dark:text-amber-500 border-amber-500/30',
  },
];

const urgencyConfig: Record<string, { label: string; classes: string; dotColor: string }> = {
  urgent: { label: 'Coming up soon!', classes: 'bg-red-500/10 text-red-500 dark:text-red-500 border-red-500/30', dotColor: 'bg-red-500' },
  soon:   { label: '2 weeks away',    classes: 'bg-amber-500/10 text-amber-500 dark:text-amber-500 border-amber-500/30', dotColor: 'bg-amber-500' },
  normal: { label: 'On schedule',     classes: 'bg-[#00bae2]/10 text-[#00bae2] dark:text-[#00bae2] border-[#00bae2]/30', dotColor: 'bg-[#00bae2]' },
};

export function ExamCalendar() {
  const sorted = [...EXAMS].sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="max-w-[1100px] mx-auto pb-12 space-y-8 font-sans">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0e100f] dark:text-[#E1DCC9] tracking-tight">
          Exam Calendar
        </h1>
        <p className="text-sm text-[#7c7c6f] dark:text-[#7c7c6f] mt-1">
          Upcoming midterms and practicals · Semester 1 · 2025–26
        </p>
      </motion.div>

      {/* Urgency legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-4 text-xs"
      >
        {Object.entries(urgencyConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
            <span className="text-[#7c7c6f] dark:text-[#7c7c6f] capitalize">{key === 'urgent' ? '≤ 10 days' : key === 'soon' ? '11–20 days' : '20+ days'}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[#7c7c6f] dark:text-[#7c7c6f]">
          <AlertCircle size={12} />
          <span>All times in IST</span>
        </div>
      </motion.div>

      {/* Timeline / Cards */}
      <div className="space-y-4">
        {sorted.map((exam, i) => {
          const urg = urgencyConfig[exam.urgency];
          const dateObj = new Date(exam.date);
          const monthStr = dateObj.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
          const dayStr = dateObj.getDate();
          const weekday = dateObj.toLocaleString('en-IN', { weekday: 'long' });

          return (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex gap-4 group"
            >
              {/* Date column */}
              <div className="flex flex-col items-center gap-1 shrink-0 w-14">
                <div className={`w-12 h-14 rounded-2xl bg-gradient-to-br ${exam.gradient} flex flex-col items-center justify-center text-[#E1DCC9] shadow-md`}>
                  <span className="text-[10px] font-black tracking-widest opacity-80">{monthStr}</span>
                  <span className="text-xl font-black leading-none">{dayStr}</span>
                </div>
                {i < sorted.length - 1 && (
                  <div className="w-0.5 flex-1 min-h-[24px] bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                )}
              </div>

              {/* Card */}
              <div className="flex-1 bg-[#FFFCE1] dark:bg-[#412D15]/70 border border-[#E1DCC9]/70 dark:border-[#E1DCC9]/10 rounded-2xl p-5 shadow-sm group-hover:shadow-lg group-hover:border-[#9d95ff]/30 transition-all duration-300 overflow-hidden relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${exam.gradient}`} />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${exam.gradient} flex items-center justify-center text-xl shadow shrink-0`}>
                      {exam.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-black text-[#7c7c6f] dark:text-[#7c7c6f] font-mono">{exam.code}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${exam.typeBadge}`}>{exam.type}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#0e100f] dark:text-[#E1DCC9] leading-snug truncate">{exam.course}</h3>
                      <p className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] mt-1 italic">{exam.syllabus}</p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${urg.classes}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${urg.dotColor}`} />
                      {exam.daysLeft}d left
                    </span>
                    <p className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f]">{weekday}</p>
                  </div>
                </div>

                {/* Details row */}
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-[#7c7c6f] dark:text-[#7c7c6f] border-t border-[#E1DCC9]/20 dark:border-[#412D15] pt-3">
                  <span className="flex items-center gap-1.5"><Clock size={11} /> {exam.time}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={11} /> {exam.venue}</span>
                  <span className="flex items-center gap-1.5"><BookOpen size={11} /> {exam.syllabus.split(':')[0]}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-[#9d95ff]/10 border border-[#9d95ff]/20 rounded-2xl p-4 text-sm text-[#9d95ff] dark:text-[#9d95ff] flex items-center gap-3"
      >
        <Calendar size={16} className="shrink-0" />
        <span>
          <strong>Pro tip:</strong> Add these exams to your calendar via the Calendar tab. Exam schedules are set by your department and may be subject to change.
        </span>
      </motion.div>
    </div>
  );
}
