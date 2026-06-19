import { motion } from 'framer-motion';
import { TrendingUp, Award, Star, Download } from 'lucide-react';

const SEMESTER_GPA = '3.85';
const CUMULATIVE_GPA = '3.72';

const GRADES = [
  {
    id: 'g1',
    code: 'CS101',
    course: 'Introduction to Artificial Intelligence',
    credits: 4,
    grade: 'A',
    gradePoints: 4.0,
    midterm: 88,
    assignment: 92,
    overall: 91,
    status: 'Excellent',
    gradient: 'from-violet-500 to-purple-600',
    icon: '🤖',
  },
  {
    id: 'g2',
    code: 'CS102',
    course: 'Data Structures & Algorithms',
    credits: 4,
    grade: 'A-',
    gradePoints: 3.7,
    midterm: 82,
    assignment: 85,
    overall: 84,
    status: 'Very Good',
    gradient: 'from-emerald-500 to-teal-600',
    icon: '🧩',
  },
  {
    id: 'g3',
    code: 'MA201',
    course: 'Linear Algebra for Computing',
    credits: 3,
    grade: 'B+',
    gradePoints: 3.3,
    midterm: 78,
    assignment: 80,
    overall: 79,
    status: 'Good',
    gradient: 'from-cyan-500 to-blue-600',
    icon: '📐',
  },
  {
    id: 'g4',
    code: 'CS103',
    course: 'Advanced Python Programming',
    credits: 3,
    grade: 'A',
    gradePoints: 4.0,
    midterm: 94,
    assignment: 96,
    overall: 95,
    status: 'Excellent',
    gradient: 'from-amber-500 to-orange-600',
    icon: '🐍',
  },
];

const gradeColorMap: Record<string, string> = {
  'A':  'from-emerald-500 to-teal-500',
  'A-': 'from-green-500 to-emerald-600',
  'B+': 'from-amber-500 to-orange-500',
  'B':  'from-yellow-500 to-amber-500',
};

const statusBadge: Record<string, string> = {
  'Excellent': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  'Very Good': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
  'Good':      'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
};

export function GradesGPA() {
  const totalCredits = GRADES.reduce((s, g) => s + g.credits, 0);
  const weightedPoints = GRADES.reduce((s, g) => s + g.credits * g.gradePoints, 0);
  const computedGPA = (weightedPoints / totalCredits).toFixed(2);

  return (
    <div className="max-w-[1100px] mx-auto pb-12 space-y-8 font-sans">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Grades & GPA
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          B.Tech CSE (AI & ML) · Semester 1 Academic Performance · 2025–26
        </p>
      </motion.div>

      {/* GPA Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-3xl p-7 md:p-10 shadow-2xl shadow-purple-600/30 overflow-hidden"
      >
        {/* Background glow orbs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-cyan-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Left: GPA */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-2">Current Semester GPA</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-white drop-shadow-lg">{SEMESTER_GPA}</span>
              <span className="text-xl font-semibold text-white/50">/ 4.0</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Star size={14} className="text-yellow-300 fill-yellow-300" />
              <Star size={14} className="text-yellow-300 fill-yellow-300" />
              <Star size={14} className="text-yellow-300 fill-yellow-300" />
              <Star size={14} className="text-yellow-300 fill-yellow-300" />
              <Star size={14} className="text-yellow-300/30" />
              <span className="text-xs text-white/70 ml-1">Dean's List Eligible</span>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-end">
            {[
              { label: 'Semester GPA', value: SEMESTER_GPA, sub: 'Current Term' },
              { label: 'Cumulative GPA', value: CUMULATIVE_GPA, sub: 'All Semesters' },
              { label: 'Credits Earned', value: `${totalCredits}`, sub: 'This Semester' },
              { label: 'Class Rank', value: '#7', sub: 'Out of 84' },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 text-center min-w-[90px]">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[10px] font-bold text-white/60 mt-1 leading-tight">{s.label}</p>
                <p className="text-[9px] text-white/40 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* GPA Progress bar */}
        <div className="relative z-10 mt-6">
          <div className="flex justify-between text-xs text-white/60 mb-1.5">
            <span>GPA Progress to 4.0</span>
            <span>{((parseFloat(SEMESTER_GPA) / 4.0) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(parseFloat(SEMESTER_GPA) / 4.0) * 100}%` }}
              transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Grade breakdown header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={18} className="text-purple-500" />
          Course Grade Breakdown
        </h2>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-1.5 hover:border-purple-400/50">
          <Download size={12} /> Download Report
        </button>
      </motion.div>

      {/* Grades Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-neutral-900/70 border border-neutral-200/70 dark:border-white/10 rounded-2xl shadow-md overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b-2 border-purple-500/20 bg-neutral-50/80 dark:bg-neutral-800/40">
                <th className="text-left px-5 py-3.5 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Course</th>
                <th className="text-center px-4 py-3.5 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Credits</th>
                <th className="text-center px-4 py-3.5 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Midterm</th>
                <th className="text-center px-4 py-3.5 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Assignments</th>
                <th className="text-center px-4 py-3.5 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Overall</th>
                <th className="text-center px-4 py-3.5 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Grade</th>
                <th className="text-center px-4 py-3.5 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {GRADES.map((g, i) => (
                <motion.tr
                  key={g.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                  whileHover={{ backgroundColor: 'rgba(168,85,247,0.04)' }}
                  className="transition-colors group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${g.gradient} flex items-center justify-center text-base shadow shrink-0`}>
                        {g.icon}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-neutral-400 font-mono">{g.code}</p>
                        <p className="font-semibold text-neutral-900 dark:text-white text-xs leading-snug">{g.course}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">{g.credits}</span>
                    <span className="text-[10px] text-neutral-400 ml-0.5">cr</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">{g.midterm}%</span>
                      <div className="w-12 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full mt-1 overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${g.gradient}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${g.midterm}%` }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.07 }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">{g.assignment}%</span>
                      <div className="w-12 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full mt-1 overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${g.gradient}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${g.assignment}%` }}
                          transition={{ duration: 1, delay: 0.35 + i * 0.07 }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-black text-neutral-900 dark:text-white">{g.overall}%</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-block bg-gradient-to-r ${gradeColorMap[g.grade] || 'from-purple-500 to-violet-600'} text-white px-3 py-1 rounded-lg font-black text-sm shadow-sm`}>
                      {g.grade}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge[g.status]}`}>
                      {g.status === 'Excellent' && <Award size={9} />}
                      {g.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>

            {/* Weighted GPA footer row */}
            <tfoot>
              <tr className="border-t-2 border-purple-500/20 bg-purple-500/5">
                <td className="px-5 py-4 font-black text-sm text-neutral-900 dark:text-white">Semester Total</td>
                <td className="px-4 py-4 text-center font-black text-sm text-neutral-900 dark:text-white">{totalCredits} cr</td>
                <td colSpan={3} className="px-4 py-4 text-center text-xs text-neutral-500 dark:text-neutral-400">Weighted Grade Points: {weightedPoints.toFixed(1)}</td>
                <td colSpan={2} className="px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-1.5 rounded-xl font-black text-sm shadow-md">
                    <TrendingUp size={13} /> GPA: {computedGPA}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Motivational footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl p-4 flex items-center gap-3 text-sm"
      >
        <Award size={18} className="text-violet-500 shrink-0" />
        <p className="text-neutral-700 dark:text-neutral-300">
          <strong className="text-violet-600 dark:text-violet-400">Outstanding!</strong> Your GPA of {SEMESTER_GPA} places you in the <strong>top 10%</strong> of the department.
          Keep up this pace and you'll qualify for the <strong>Dean's Merit List</strong> at the end of the semester.
        </p>
      </motion.div>
    </div>
  );
}
