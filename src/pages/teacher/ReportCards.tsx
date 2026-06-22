import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, FileText, Plus, MessageSquare, Search, 
  Users, CheckCircle2, RefreshCw, X, FileDown, Smile
} from 'lucide-react';
import { GlassCard, Badge, Button, Avatar } from '../../components/ui/index';
import toast from 'react-hot-toast';

interface StudentData {
  id: string;
  name: string;
  className: string;
  termGrade: string;
  termPercentage: number;
  attendanceRate: number;
  initials: string;
  avatarBg: string;
  remarks?: string;
}

export default function ReportCards() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [remarksText, setRemarksText] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  
  // Static React data array
  const [students, setStudents] = useState<StudentData[]>([
    { id: '1', name: 'Aarav Sharma', className: 'Grade 6 Math', termGrade: 'A', termPercentage: 92, attendanceRate: 98, initials: 'AS', avatarBg: 'bg-[#00bae2]', remarks: 'Outstanding performance in geometry and quizzes.' },
    { id: '2', name: 'Ishita Verma', className: 'Grade 8 Science', termGrade: 'B+', termPercentage: 87, attendanceRate: 94, initials: 'IV', avatarBg: 'bg-[#9d95ff]', remarks: 'Active participant in lab assignments. Excellent theoretical understanding.' },
    { id: '3', name: 'Kabir Singh', className: 'Grade 7 English', termGrade: 'C', termPercentage: 74, attendanceRate: 88, initials: 'KS', avatarBg: 'bg-amber-500', remarks: 'Good essays, needs consistency in completing class tasks.' },
    { id: '4', name: 'Ananya Kapoor', className: 'Grade 6 Math', termGrade: 'A+', termPercentage: 95, attendanceRate: 99, initials: 'AK', avatarBg: 'bg-red-500', remarks: 'Consistently the top performer. Shows leadership qualities.' },
    { id: '5', name: 'Rahul Patel', className: 'Grade 8 Science', termGrade: 'B', termPercentage: 81, attendanceRate: 91, initials: 'RP', avatarBg: 'bg-[#00bae2]', remarks: 'Good analytical skills, displays great interest in physics modules.' },
  ]);

  // Derived stats
  const averageGrade = Math.round(students.reduce((acc, s) => acc + s.termPercentage, 0) / students.length);
  const averageAttendance = Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / students.length);
  const highAchievers = students.filter(s => s.termPercentage >= 90).length;

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenRemarks = (student: StudentData) => {
    setSelectedStudent(student);
    setRemarksText(student.remarks || '');
  };

  const handleSaveRemarks = () => {
    if (!selectedStudent) return;
    setStudents(prev => prev.map(s => 
      s.id === selectedStudent.id ? { ...s, remarks: remarksText } : s
    ));
    toast.success(`Remarks updated for ${selectedStudent.name}! 📝`);
    setSelectedStudent(null);
  };

  const handleGeneratePdf = (student: StudentData) => {
    setGeneratingId(student.id);
    toast.loading(`Generating PDF report card for ${student.name}...`, { id: 'pdf-toast' });
    
    setTimeout(() => {
      toast.success(`PDF report card generated successfully for ${student.name}!`, { id: 'pdf-toast' });
      setGeneratingId(null);
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
            <Award size={16} /> Educator Workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0e100f] dark:text-[#E1DCC9] tracking-tight">
            Report Cards &amp; Evaluations 📋
          </h1>
          <p className="text-sm text-[#7c7c6f] dark:text-neutral-455">
            Review calculated term performance, manage final remark notes, and export official student reports.
          </p>
        </div>
      </motion.div>

      {/* QUICK SUMMARY CARDS */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: 'Term Class Average', value: `${averageGrade}%`, icon: Award, color: 'text-[#9d95ff]', bg: 'bg-[#9d95ff]/10' },
          { label: 'Avg Class Attendance', value: `${averageAttendance}%`, icon: CheckCircle2, color: 'text-[#00bae2]', bg: 'bg-[#00bae2]/10' },
          { label: 'High Achievers (>=90%)', value: highAchievers, icon: Smile, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
        className="flex gap-4 items-center justify-between"
      >
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c7c6f] pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search student by name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E1DCC9]/20 dark:border-[#412D15] bg-[#FFFCE1] dark:bg-[#412D15] text-[#0e100f] dark:text-[#E1DCC9] text-sm outline-none focus:border-[#9d95ff] focus:ring-1 focus:ring-[#9d95ff] transition-all placeholder-neutral-400"
          />
        </div>
      </motion.div>

      {/* STUDENTS GRID */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#7c7c6f] dark:text-[#7c7c6f]">
            <Users className="w-12 h-12 mx-auto text-[#7c7c6f] dark:text-[#7c7c6f] mb-3 animate-pulse" />
            <p className="font-bold">No students found matching "{searchTerm}"</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isOutstanding = student.termPercentage >= 90;
            const isCritical = student.termPercentage < 75;
            
            return (
              <motion.div key={student.id} variants={itemVariants}>
                <GlassCard className="relative h-full flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-xl hover:border-[#9d95ff]/30 transition-all duration-300 border border-[#E1DCC9]/20 dark:border-neutral-850 p-6 bg-[#FFFCE1] dark:bg-[#412D15] overflow-hidden">
                  
                  {/* Subtle background glow */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#9d95ff]/5 dark:bg-[#9d95ff]/10 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Top card block */}
                  <div>
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl ${student.avatarBg} text-[#E1DCC9] flex items-center justify-center font-bold text-sm shadow-md`}>
                          {student.initials}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-[#0e100f] dark:text-[#E1DCC9] text-base tracking-tight leading-tight">{student.name}</h3>
                          <span className="text-[10px] uppercase font-black tracking-widest text-[#7c7c6f] mt-1 block">{student.className}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block font-black text-sm px-2.5 py-1 rounded-xl shadow-sm bg-gradient-to-r text-[#E1DCC9] ${
                          isOutstanding ? 'from-[#00bae2] to-[#00bae2]' :
                          isCritical ? 'from-red-500 to-pink-500' :
                          'from-[#9d95ff] to-[#9d95ff]'
                        }`}>
                          {student.termGrade} ({student.termPercentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="grid grid-cols-2 gap-4 border-t border-b border-[#E1DCC9]/20 dark:border-[#412D15] py-3.5 my-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">Attendance</p>
                        <p className={`text-base font-black font-mono mt-0.5 ${
                          student.attendanceRate >= 95 ? 'text-[#00bae2]' :
                          student.attendanceRate >= 90 ? 'text-[#00bae2]' :
                          'text-amber-500'
                        }`}>
                          {student.attendanceRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">Remarks Set</p>
                        <p className="text-xs font-semibold text-[#7c7c6f] dark:text-neutral-350 mt-0.5 truncate">
                          {student.remarks ? '✅ Configured' : '❌ Pending'}
                        </p>
                      </div>
                    </div>

                    {/* Remarks details */}
                    <div className="bg-[#FFFCE1] dark:bg-[#1F150C]/40 rounded-2xl p-3 border border-neutral-150 dark:border-[#412D15] min-h-[70px] flex items-center justify-center">
                      {student.remarks ? (
                        <p className="text-xs italic text-[#7c7c6f] dark:text-[#7c7c6f] leading-relaxed text-center">
                          "{student.remarks}"
                        </p>
                      ) : (
                        <p className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] italic text-center">
                          No teacher remarks added yet. Click Add Remarks below to specify.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 border-t border-[#E1DCC9]/20 dark:border-[#412D15] pt-4 mt-6">
                    <button
                      onClick={() => handleOpenRemarks(student)}
                      className="flex-1 py-2 px-3 hover:bg-[#9d95ff] dark:hover:bg-[#9d95ff]/20 text-[#9d95ff] dark:text-[#9d95ff] border border-[#9d95ff] dark:border-[#9d95ff]/40 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                    >
                      <MessageSquare size={13} /> Add Remarks
                    </button>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={generatingId === student.id}
                      onClick={() => handleGeneratePdf(student)}
                      className="rounded-xl flex-1 text-xs py-2 px-3 border border-[#E1DCC9]/20 dark:border-[#412D15] dark:bg-[#412D15] dark:hover:bg-[#412D15] gap-1.5 flex items-center justify-center font-bold text-[#7c7c6f] dark:text-[#7c7c6f] hover:scale-[1.02] transition-transform"
                    >
                      <FileDown size={13} /> Report PDF
                    </Button>
                  </div>

                </GlassCard>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* REMARKS DIALOG MODAL */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-[#1F150C]/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-3xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-bold text-[#0e100f] dark:text-[#E1DCC9]">Add Remarks: {selectedStudent.name}</h4>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#7c7c6f] hover:bg-[#FFFCE1] dark:hover:bg-[#412D15] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-[#7c7c6f] mb-4">
                Enter your academic evaluation review remarks. These will be appended directly to the student's official PDF transcript and term records.
              </p>
              
              <textarea
                value={remarksText}
                onChange={e => setRemarksText(e.target.value)}
                placeholder="Write remark evaluations... (e.g. Excellent active participation in team assignments, completed maths worksheet early)"
                className="w-full text-xs p-3 rounded-xl border border-[#E1DCC9]/20 dark:border-[#412D15] bg-[#FFFCE1]/50 dark:bg-[#412D15]/50 text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:border-[#9d95ff] h-28 resize-none mb-4 focus:ring-1 focus:ring-[#9d95ff]"
              />

              <div className="flex gap-2">
                <button 
                  className="flex-1 text-xs py-2 bg-[#FFFCE1] text-[#7c7c6f] dark:bg-[#412D15] dark:text-[#7c7c6f] font-bold rounded-xl active:scale-95 transition-all hover:bg-neutral-250" 
                  onClick={() => setSelectedStudent(null)}
                >
                  Cancel
                </button>
                <Button 
                  variant="primary" 
                  className="flex-1 text-xs py-2 bg-[#9d95ff] hover:bg-[#9d95ff] text-[#E1DCC9] rounded-xl shadow-md font-bold" 
                  onClick={handleSaveRemarks}
                >
                  Save Remarks
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
