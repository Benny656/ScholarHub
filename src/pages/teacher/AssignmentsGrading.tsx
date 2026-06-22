import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, CheckCircle2, AlertCircle, Users, 
  Search, BookOpen, Calendar, ChevronRight, Award, GraduationCap 
} from 'lucide-react';
import { GlassCard, Badge, Button, ProgressBar } from '../../components/ui/index';
import toast from 'react-hot-toast';

interface AssignmentData {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  submittedCount: number;
  totalCount: number;
  status: 'active' | 'completed' | 'grading';
}

export default function AssignmentsGrading() {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [gradingId, setGradingId] = useState<string | null>(null);

  // Static React data array
  const assignments: AssignmentData[] = [
    { id: '1', title: 'Fractions Worksheet', className: 'Grade 6 Math', dueDate: '2026-06-20', submittedCount: 24, totalCount: 30, status: 'active' },
    { id: '2', title: 'Photosynthesis Lab Report', className: 'Grade 8 Science', dueDate: '2026-06-18', submittedCount: 28, totalCount: 30, status: 'active' },
    { id: '3', title: 'Introduction to Geometry Quiz', className: 'Grade 7 Math', dueDate: '2026-06-22', submittedCount: 15, totalCount: 28, status: 'active' },
    { id: '4', title: 'World War II Historical Essay', className: 'Grade 8 History', dueDate: '2026-06-15', submittedCount: 30, totalCount: 30, status: 'completed' },
    { id: '5', title: 'Python Control Flow Exercise', className: 'Grade 7 Coding', dueDate: '2026-06-25', submittedCount: 5, totalCount: 25, status: 'active' },
  ];

  // Derive stats
  const totalActive = assignments.filter(a => a.status === 'active').length;
  const pendingGrading = assignments.reduce((acc, curr) => acc + (curr.totalCount - curr.submittedCount), 0);
  const totalSubmissions = assignments.reduce((acc, curr) => acc + curr.submittedCount, 0);
  const totalPossible = assignments.reduce((acc, curr) => acc + curr.totalCount, 0);
  const overallSubmissionRate = Math.round((totalSubmissions / totalPossible) * 100);

  // Filter list
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'All' || assignment.className === classFilter;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = ['All', ...Array.from(new Set(assignments.map(a => a.className)))];

  const handleGrade = (id: string, title: string) => {
    setGradingId(id);
    toast.loading(`Opening grading suite for ${title}...`, { id: 'grading-toast' });
    
    setTimeout(() => {
      toast.success(`Loaded all submissions for ${title}!`, { id: 'grading-toast' });
      setGradingId(null);
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans space-y-8 px-4 sm:px-6 lg:px-8 pt-6 select-none">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9d95ff] dark:text-[#9d95ff] mb-2">
            <GraduationCap size={16} /> Educator Workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0e100f] dark:text-[#E1DCC9] tracking-tight">
            Assignments &amp; Grading 📝
          </h1>
          <p className="text-sm text-[#7c7c6f] dark:text-neutral-450">
            Review student submissions, check deadlines, and launch the grading evaluation tool.
          </p>
        </div>
      </motion.div>

      {/* QUICK STATISTICS */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Active Assignments', value: totalActive, icon: ClipboardList, color: 'text-[#9d95ff]', bg: 'bg-[#9d95ff]/10' },
          { label: 'Pending Reviews', value: pendingGrading, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Submission Rate', value: `${overallSubmissionRate}%`, icon: CheckCircle2, color: 'text-[#00bae2]', bg: 'bg-[#00bae2]/10' },
          { label: 'Total Enrolled', value: totalPossible, icon: Users, color: 'text-[#00bae2]', bg: 'bg-[#00bae2]/10' },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <GlassCard className="flex items-center gap-4 p-5 h-full hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#7c7c6f] uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#0e100f] dark:text-[#E1DCC9] leading-none">{stat.value}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* FILTER & SEARCH */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 justify-between items-center"
      >
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c7c6f] pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by assignment title..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E1DCC9]/20 dark:border-[#412D15] bg-[#FFFCE1] dark:bg-[#412D15] text-[#0e100f] dark:text-[#E1DCC9] text-sm outline-none focus:border-[#9d95ff] focus:ring-1 focus:ring-[#9d95ff] transition-all placeholder-neutral-400"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex gap-2 w-full sm:w-auto">
          {uniqueClasses.map((cls) => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                classFilter === cls
                  ? 'bg-[#9d95ff] text-[#E1DCC9] shadow-lg shadow-[#9d95ff]/20'
                  : 'bg-[#FFFCE1] dark:bg-[#412D15] text-[#7c7c6f] dark:text-[#7c7c6f] border border-[#E1DCC9]/20 dark:border-[#412D15] hover:bg-[#FFFCE1] dark:hover:bg-neutral-850'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ASSIGNMENTS TABLE */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard padding="p-0" className="overflow-hidden border border-[#E1DCC9]/20 dark:border-[#412D15]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E1DCC9]/20 dark:border-[#412D15]/80 bg-[#FFFCE1]/50 dark:bg-[#412D15]/30">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7c7c6f] dark:text-[#7c7c6f]">Assignment Title</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7c7c6f] dark:text-[#7c7c6f]">Class</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7c7c6f] dark:text-[#7c7c6f]">Due Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7c7c6f] dark:text-[#7c7c6f]">Submission Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#7c7c6f] dark:text-[#7c7c6f]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-[#7c7c6f] dark:text-[#7c7c6f]">
                      <BookOpen className="w-10 h-10 mx-auto text-[#7c7c6f] dark:text-[#7c7c6f] mb-3" />
                      <p className="font-semibold text-[#7c7c6f] dark:text-neutral-350">No assignments found</p>
                      <p className="text-xs text-[#7c7c6f] mt-1">Try adjusting your search criteria or class filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((assignment) => {
                    const isDueToday = new Date(assignment.dueDate).toDateString() === new Date().toDateString();
                    const progressValue = Math.round((assignment.submittedCount / assignment.totalCount) * 100);
                    
                    return (
                      <tr 
                        key={assignment.id} 
                        className="hover:bg-[#FFFCE1]/50 dark:hover:bg-neutral-850/10 transition-colors"
                      >
                        {/* Title */}
                        <td className="px-6 py-4.5 font-bold text-[#0e100f] dark:text-[#E1DCC9]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#9d95ff] shrink-0" />
                            {assignment.title}
                          </div>
                        </td>

                        {/* Class */}
                        <td className="px-6 py-4.5">
                          <Badge variant="blue" size="sm">
                            {assignment.className}
                          </Badge>
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-4.5 text-[#7c7c6f] dark:text-neutral-455 font-semibold text-xs">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Calendar size={13} className="text-[#7c7c6f]" />
                            {new Date(assignment.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {isDueToday && <span className="ml-1 text-red-500 font-sans font-bold">(Today)</span>}
                          </div>
                        </td>

                        {/* Submission Progress bar */}
                        <td className="px-6 py-4.5 w-[250px]">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-[#9d95ff] dark:text-[#9d95ff]">{assignment.submittedCount} / {assignment.totalCount} Submitted</span>
                              <span className="text-[#7c7c6f]">{progressValue}%</span>
                            </div>
                            <ProgressBar value={assignment.submittedCount} max={assignment.totalCount} color="purple" />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 text-right">
                          <Button 
                            variant="primary" 
                            size="sm"
                            loading={gradingId === assignment.id}
                            className="bg-[#9d95ff] hover:bg-[#9d95ff] text-[#E1DCC9] rounded-xl shadow-md shadow-[#9d95ff]/10 gap-1.5 py-1.5 px-3.5 text-xs font-bold"
                            onClick={() => handleGrade(assignment.id, assignment.title)}
                          >
                            Grade Submissions <ChevronRight size={13} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
