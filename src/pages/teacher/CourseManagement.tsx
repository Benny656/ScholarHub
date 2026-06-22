import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Upload, Edit, Users, Calendar, 
  FileText, Download, Trash2, X, Plus, AlertCircle, 
  ChevronRight, Award, FolderOpen, ArrowUpRight
} from 'lucide-react';
import { GlassCard, Badge, Button, ProgressBar } from '../../components/ui/index';
import toast from 'react-hot-toast';

interface CourseData {
  id: string;
  code: string;
  title: string;
  enrollment: number;
  progress: number;
  currentWeek: string;
  description: string;
}

interface MaterialData {
  id: string;
  name: string;
  courseCode: string;
  uploadDate: string;
  size: string;
  type: 'pdf' | 'zip' | 'document';
}

export default function CourseManagement() {
  const [activeTab, setActiveTab] = useState<'all' | 'active'>('all');
  const [courses, setCourses] = useState<CourseData[]>([
    { id: '1', code: 'CS101', title: 'Introduction to Artificial Intelligence', enrollment: 120, progress: 65, currentWeek: 'Week 8 / 16', description: 'Fundamental concepts of AI, search algorithms, and machine learning principles.' },
    { id: '2', code: 'CS204', title: 'Data Structures & Algorithms', enrollment: 145, progress: 78, currentWeek: 'Week 8 / 16', description: 'Advanced linear and non-linear data structures, sorting, searching, and complexity analysis.' },
    { id: '3', code: 'CS302', title: 'Linear Algebra for Computing', enrollment: 98, progress: 52, currentWeek: 'Week 8 / 16', description: 'Matrix operations, vector spaces, eigenvalues, and computer science application transformations.' },
    { id: '4', code: 'CS412', title: 'Advanced Python Programming', enrollment: 110, progress: 85, currentWeek: 'Week 8 / 16', description: 'Concurrency, advanced decorators, meta-programming, and software architecture designs.' }
  ]);

  const [materials, setMaterials] = useState<MaterialData[]>([
    { id: 'm1', name: 'Lecture_08_NeuralNets.pdf', courseCode: 'CS101', uploadDate: '2026-06-18', size: '2.4 MB', type: 'pdf' },
    { id: 'm2', name: 'Assignment_3_StarterCode.zip', courseCode: 'CS204', uploadDate: '2026-06-15', size: '15.8 MB', type: 'zip' },
    { id: 'm3', name: 'Syllabus_CS101_Revised.pdf', courseCode: 'CS101', uploadDate: '2026-06-10', size: '1.1 MB', type: 'pdf' },
    { id: 'm4', name: 'Lecture_07_SearchAlgorithms.pdf', courseCode: 'CS101', uploadDate: '2026-06-08', size: '3.1 MB', type: 'pdf' },
  ]);

  // Modal State
  const [uploadCourse, setUploadCourse] = useState<CourseData | null>(null);
  const [editCourse, setEditCourse] = useState<CourseData | null>(null);
  
  // Form/Interactive States
  const [newFileName, setNewFileName] = useState('');
  const [syllabusProgress, setSyllabusProgress] = useState(0);
  const [syllabusDesc, setSyllabusDesc] = useState('');

  // Stats
  const totalEnrolled = courses.reduce((acc, c) => acc + c.enrollment, 0);
  const averageProgress = Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length);

  // File Upload Handlers
  const handleOpenUpload = (course: CourseData) => {
    setUploadCourse(course);
    setNewFileName('');
  };

  const handleMockUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim() || !uploadCourse) return;

    const fileExtension = newFileName.includes('.') ? newFileName.split('.').pop() : 'pdf';
    const cleanName = newFileName.includes('.') ? newFileName : `${newFileName}.pdf`;

    const newMaterial: MaterialData = {
      id: `m-${Date.now()}`,
      name: cleanName,
      courseCode: uploadCourse.code,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
      type: fileExtension === 'zip' ? 'zip' : 'pdf'
    };

    toast.loading(`Uploading ${cleanName} to ${uploadCourse.code}...`, { id: 'upload-toast' });

    setTimeout(() => {
      setMaterials(prev => [newMaterial, ...prev]);
      toast.success(`${cleanName} successfully uploaded to ${uploadCourse.code}! 📤`, { id: 'upload-toast' });
      setUploadCourse(null);
      setNewFileName('');
    }, 1200);
  };

  // Edit Syllabus Handlers
  const handleOpenEdit = (course: CourseData) => {
    setEditCourse(course);
    setSyllabusProgress(course.progress);
    setSyllabusDesc(course.description);
  };

  const handleSaveSyllabus = () => {
    if (!editCourse) return;

    setCourses(prev => prev.map(c => 
      c.id === editCourse.id 
        ? { ...c, progress: Number(syllabusProgress), description: syllabusDesc } 
        : c
    ));

    toast.success(`Syllabus for ${editCourse.code} updated! ✍️`);
    setEditCourse(null);
  };

  const handleDownload = (name: string) => {
    toast.success(`Downloading ${name}... 📥`);
  };

  const handleDeleteMaterial = (id: string, name: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    toast.success(`Removed ${name} from course list.`);
  };

  const handleViewRoster = (code: string) => {
    toast.success(`Navigating to student roster registry for ${code}... 👥`);
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
            <BookOpen size={16} /> College Workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0e100f] dark:text-[#E1DCC9] tracking-tight">
            Course Management Command Center 🏫
          </h1>
          <p className="text-sm text-[#7c7c6f] dark:text-neutral-455">
            Configure lecture materials, monitor syllabus completion rates, and manage academic resources.
          </p>
        </div>
      </motion.div>

      {/* QUICK METRICS */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Active Courses', value: courses.length, icon: BookOpen, color: 'text-[#9d95ff]', bg: 'bg-[#9d95ff]/10' },
          { label: 'Combined Enrollments', value: totalEnrolled, icon: Users, color: 'text-[#00bae2]', bg: 'bg-[#00bae2]/10' },
          { label: 'Weekly Active Files', value: materials.length, icon: FolderOpen, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Semester Schedule', value: 'Week 8 / 16', icon: Calendar, color: 'text-[#9d95ff]', bg: 'bg-[#9d95ff]/10' },
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

      {/* ACTIVE COURSES GRID */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#0e100f] dark:text-[#E1DCC9] flex items-center gap-2">
          <span>Active Courses Overview</span>
          <Badge variant="purple">{courses.length} courses</Badge>
        </h2>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {courses.map((course) => (
            <motion.div key={course.id} variants={itemVariants}>
              <GlassCard className="h-full border border-[#E1DCC9]/20 dark:border-neutral-850 bg-[#FFFCE1] dark:bg-[#412D15]/60 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#9d95ff]/5 dark:bg-[#9d95ff]/10 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  {/* Top line */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-[#9d95ff] dark:text-[#9d95ff] bg-[#9d95ff]/10 px-2 py-0.5 rounded uppercase">
                        {course.code}
                      </span>
                      <h3 className="text-base font-extrabold text-[#0e100f] dark:text-[#E1DCC9] tracking-tight mt-1.5 leading-snug">
                        {course.title}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-neutral-450 whitespace-nowrap bg-[#FFFCE1] dark:bg-[#412D15] px-2.5 py-1 rounded-lg">
                      {course.currentWeek}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] line-clamp-2 leading-relaxed mb-5">
                    {course.description}
                  </p>

                  {/* Metrics */}
                  <div className="space-y-3.5 border-t border-b border-[#E1DCC9]/20 dark:border-[#412D15]/80 py-4 my-4">
                    <div className="flex justify-between text-xs font-bold text-[#7c7c6f] dark:text-[#7c7c6f]">
                      <span className="flex items-center gap-1"><Users size={13} className="text-[#7c7c6f]" /> Students Enrolled</span>
                      <span className="font-mono text-[#0e100f] dark:text-[#E1DCC9]">{course.enrollment} Enrolled</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#7c7c6f]">Syllabus Completion</span>
                        <span className="text-[#9d95ff] dark:text-[#9d95ff]">{course.progress}%</span>
                      </div>
                      <ProgressBar value={course.progress} color="purple" />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleOpenUpload(course)}
                    className="flex-1 py-2 bg-[#9d95ff] hover:bg-[#9d95ff] text-[#E1DCC9] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#9d95ff]/10 active:scale-95 transition-all"
                  >
                    <Upload size={13} /> Upload Materials
                  </button>
                  <button 
                    onClick={() => handleOpenEdit(course)}
                    className="py-2 px-3 bg-[#FFFCE1] text-[#7c7c6f] dark:bg-[#412D15] dark:text-neutral-350 hover:bg-neutral-200 dark:hover:bg-neutral-750 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    title="Edit syllabus description & progress"
                  >
                    <Edit size={13} /> Syllabus
                  </button>
                  <button 
                    onClick={() => handleViewRoster(course.code)}
                    className="py-2 px-3 bg-[#FFFCE1] text-[#7c7c6f] dark:bg-[#412D15] dark:text-neutral-350 hover:bg-neutral-200 dark:hover:bg-neutral-750 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    title="View students roster"
                  >
                    <Users size={13} /> Roster
                  </button>
                </div>

              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* RECENT MATERIALS TABLE */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-black text-[#0e100f] dark:text-[#E1DCC9] flex items-center gap-2">
          <span>Recent Materials &amp; Activity</span>
          <Badge variant="slate">Updated</Badge>
        </h2>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <GlassCard padding="p-0" className="overflow-hidden border border-[#E1DCC9]/20 dark:border-neutral-850">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E1DCC9]/20 dark:border-[#412D15]/80 bg-[#FFFCE1]/50 dark:bg-[#412D15]/30">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7c7c6f] dark:text-[#7c7c6f]">File Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7c7c6f] dark:text-[#7c7c6f]">Course Code</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7c7c6f] dark:text-[#7c7c6f]">Upload Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7c7c6f] dark:text-[#7c7c6f]">Size</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#7c7c6f] dark:text-[#7c7c6f]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40">
                  {materials.map((file) => (
                    <tr 
                      key={file.id}
                      className="hover:bg-[#FFFCE1]/50 dark:hover:bg-neutral-850/10 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-6 py-4 font-bold text-[#0e100f] dark:text-[#E1DCC9]">
                        <div className="flex items-center gap-2.5">
                          <FileText size={16} className="text-neutral-450 shrink-0" />
                          {file.name}
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-6 py-4">
                        <Badge variant="blue" size="sm">{file.courseCode}</Badge>
                      </td>

                      {/* Upload Date */}
                      <td className="px-6 py-4 text-neutral-550 dark:text-[#7c7c6f] font-semibold text-xs font-mono">
                        {new Date(file.uploadDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Size */}
                      <td className="px-6 py-4 text-[#7c7c6f] font-mono text-xs">
                        {file.size}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleDownload(file.name)}
                            className="p-1.5 hover:bg-neutral-150 dark:hover:bg-[#412D15] text-neutral-550 dark:text-[#7c7c6f] rounded-lg hover:text-[#9d95ff] transition-colors"
                            title="Download File"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(file.id, file.name)}
                            className="p-1.5 hover:bg-neutral-150 dark:hover:bg-[#412D15] text-neutral-550 dark:text-neutral-450 rounded-lg hover:text-red-500 transition-colors"
                            title="Delete File"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* MOCK UPLOAD MATERIALS DIALOG */}
      <AnimatePresence>
        {uploadCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUploadCourse(null)}
              className="absolute inset-0 bg-[#1F150C]/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-3xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-bold text-[#0e100f] dark:text-[#E1DCC9] flex items-center gap-2">
                  <Upload size={16} className="text-[#9d95ff]" /> Upload: {uploadCourse.code}
                </h4>
                <button 
                  onClick={() => setUploadCourse(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#7c7c6f] hover:bg-[#FFFCE1] dark:hover:bg-[#412D15] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleMockUpload} className="space-y-4">
                <div className="border-2 border-dashed border-[#E1DCC9]/20 dark:border-[#412D15] rounded-2xl p-6 text-center bg-[#FFFCE1]/50 dark:bg-[#1F150C]/20">
                  <FolderOpen size={32} className="mx-auto text-neutral-350 dark:text-[#7c7c6f] mb-2 animate-bounce" />
                  <p className="text-xs text-[#7c7c6f]">Drag &amp; drop course handouts, slides, or zip files</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#7c7c6f] dark:text-[#7c7c6f]">File Name (with extension)</label>
                  <input
                    type="text"
                    required
                    value={newFileName}
                    onChange={e => setNewFileName(e.target.value)}
                    placeholder="e.g. Lecture_09_DecisionTrees.pdf"
                    className="w-full text-xs p-3 rounded-xl border border-[#E1DCC9]/20 dark:border-[#412D15] bg-[#FFFCE1]/50 dark:bg-[#412D15]/50 text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:border-[#9d95ff] focus:ring-1 focus:ring-[#9d95ff]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    className="flex-1 text-xs py-2.5 bg-[#FFFCE1] text-[#7c7c6f] dark:bg-[#412D15] dark:text-[#7c7c6f] font-bold rounded-xl active:scale-95 transition-all hover:bg-neutral-250" 
                    onClick={() => setUploadCourse(null)}
                  >
                    Cancel
                  </button>
                  <Button 
                    type="submit"
                    variant="primary" 
                    className="flex-1 text-xs py-2.5 bg-[#9d95ff] hover:bg-[#9d95ff] text-[#E1DCC9] rounded-xl shadow-md font-bold" 
                  >
                    Upload File
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOCK EDIT SYLLABUS DIALOG */}
      <AnimatePresence>
        {editCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditCourse(null)}
              className="absolute inset-0 bg-[#1F150C]/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-3xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-bold text-[#0e100f] dark:text-[#E1DCC9] flex items-center gap-2">
                  <Edit size={16} className="text-[#9d95ff]" /> Syllabus: {editCourse.code}
                </h4>
                <button 
                  onClick={() => setEditCourse(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#7c7c6f] hover:bg-[#FFFCE1] dark:hover:bg-[#412D15] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#7c7c6f] dark:text-[#7c7c6f]">
                    <span>Syllabus Progress Completion</span>
                    <span className="text-[#9d95ff]">{syllabusProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={syllabusProgress}
                    onChange={e => setSyllabusProgress(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#9d95ff]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#7c7c6f] dark:text-[#7c7c6f]">Course Scope &amp; Topics Summary</label>
                  <textarea
                    value={syllabusDesc}
                    onChange={e => setSyllabusDesc(e.target.value)}
                    placeholder="Provide syllabus details..."
                    className="w-full text-xs p-3 rounded-xl border border-[#E1DCC9]/20 dark:border-[#412D15] bg-[#FFFCE1]/50 dark:bg-[#412D15]/50 text-[#0e100f] dark:text-[#E1DCC9] outline-none focus:border-[#9d95ff] focus:ring-1 focus:ring-[#9d95ff] h-24 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    className="flex-1 text-xs py-2.5 bg-[#FFFCE1] text-[#7c7c6f] dark:bg-[#412D15] dark:text-neutral-350 font-bold rounded-xl active:scale-95 transition-all hover:bg-neutral-250" 
                    onClick={() => setEditCourse(null)}
                  >
                    Cancel
                  </button>
                  <Button 
                    variant="primary" 
                    className="flex-1 text-xs py-2.5 bg-[#9d95ff] hover:bg-[#9d95ff] text-[#E1DCC9] rounded-xl shadow-md font-bold" 
                    onClick={handleSaveSyllabus}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
