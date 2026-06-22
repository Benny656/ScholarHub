import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { aiService } from '../../services/ai.service';
import { GlassCard, Badge, Button, SkeletonCard } from '../ui/index';
import toast from 'react-hot-toast';
import { FileText, Sparkles } from 'lucide-react';

interface TeacherGradebookProps {
  courseId: string;
}

export function TeacherGradebook({ courseId }: TeacherGradebookProps) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Grading states
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiGrading, setAiGrading] = useState(false);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch assignments
      const { data: asgData } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('due_date', { ascending: true });
      setAssignments(asgData || []);

      const assignmentIds = (asgData || []).map(a => a.id);

      // Fetch submissions
      if (assignmentIds.length > 0) {
        const { data: subData } = await supabase
          .from('submissions')
          .select(`*, users:student_id (id, name, email)`)
          .in('assignment_id', assignmentIds);
        setSubmissions(subData || []);
      } else {
        setSubmissions([]);
      }

      // Fetch enrolled students
      const { data: enrollData } = await supabase
        .from('enrollments')
        .select(`users:student_id (id, name, email)`)
        .eq('course_id', courseId);
      
      const st = (enrollData || []).map(e => e.users).filter(Boolean);
      setStudents(st);

    } catch (err) {
      console.error(err);
      toast.error('Failed to load gradebook');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!gradingSubmission) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ grade: score, feedback })
        .eq('id', gradingSubmission.id);
        
      if (error) throw error;
      toast.success('Grade saved successfully');
      setGradingSubmission(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  const handleAIGrade = async () => {
    if (!gradingSubmission) return;
    setAiGrading(true);
    try {
      // Find the assignment description to use as rubric
      const assignment = assignments.find(a => a.id === gradingSubmission.assignment_id);
      
      // Since it's a file_url or basic submission text, we just pass what we know.
      // If submission text is missing, we pass the file_url (though AI can't read URLs directly here, it's a demo)
      const submissionContent = gradingSubmission.file_url || gradingSubmission.text_answer || "No text content submitted.";
      const rubric = assignment?.description || "Grade this submission.";

      const result = await aiService.checkAssignment(submissionContent, rubric);
      
      setScore(Math.min(Math.round((result.score / 100) * (assignment?.max_grade || 100)), assignment?.max_grade || 100));
      setFeedback(`[AI Evaluated]\n${result.feedback}\n\nStrengths: ${result.strengths.join(', ')}\nImprovements: ${result.improvements.join(', ')}`);
      toast.success('AI Grading Complete!');
    } catch (err) {
      console.error(err);
      toast.error('AI Grading failed.');
    } finally {
      setAiGrading(false);
    }
  };

  if (loading) {
    return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  }

  if (assignments.length === 0) {
    return (
      <GlassCard className="text-center py-12">
        <FileText size={48} className="mx-auto text-[#7c7c6f] mb-4 opacity-50" />
        <h3 className="text-base font-bold text-[#0e100f] dark:text-[#E1DCC9]">No Assignments Yet</h3>
        <p className="text-sm text-[#7c7c6f] mt-2">Create assignments to start using the gradebook.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#0e100f] dark:text-[#E1DCC9]">Course Gradebook</h3>
          <Badge variant="purple">{students.length} Students</Badge>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-[#E1DCC9]/20 dark:border-[#412D15]">
          <table className="w-full text-left text-sm text-[#7c7c6f] dark:text-[#7c7c6f]">
            <thead className="bg-[#FFFCE1] dark:bg-neutral-850 text-xs uppercase font-bold">
              <tr>
                <th className="px-4 py-3 border-b border-[#E1DCC9]/20 dark:border-[#412D15] sticky left-0 bg-[#FFFCE1] dark:bg-neutral-850 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">Student Name</th>
                {assignments.map(asg => (
                  <th key={asg.id} className="px-4 py-3 border-b border-[#E1DCC9]/20 dark:border-[#412D15] min-w-[140px] text-center">
                    <div className="line-clamp-1" title={asg.title}>{asg.title}</div>
                    <div className="text-[10px] text-[#7c7c6f] font-normal mt-1 text-center">Max: {asg.max_grade}</div>
                  </th>
                ))}
                <th className="px-4 py-3 border-b border-[#E1DCC9]/20 dark:border-[#412D15] text-center font-black">Course Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-[#FFFCE1] dark:bg-[#412D15]">
              {students.map(student => {
                let totalScore = 0;
                let totalMax = 0;

                return (
                  <tr key={student.id} className="hover:bg-[#FFFCE1] dark:hover:bg-[#412D15]/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#0e100f] dark:text-[#E1DCC9] sticky left-0 bg-[#FFFCE1] dark:bg-[#412D15] z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
                      {student.name || 'Unknown'}
                    </td>
                    {assignments.map(asg => {
                      const sub = submissions.find(s => s.assignment_id === asg.id && s.student_id === student.id);
                      
                      if (sub && sub.grade !== null && sub.grade !== undefined) {
                        totalScore += sub.grade;
                        totalMax += asg.max_grade;
                      }

                      return (
                        <td key={asg.id} className="px-4 py-3 text-center border-l border-[#E1DCC9]/20 dark:border-[#412D15]/50">
                          {sub ? (
                            sub.grade !== null ? (
                              <button 
                                onClick={() => { setGradingSubmission(sub); setScore(sub.grade); setFeedback(sub.feedback || ''); }}
                                className="px-2 py-1 bg-[#00bae2]/10 text-[#00bae2] dark:text-[#00bae2] rounded-md font-bold text-xs hover:bg-[#00bae2]/20 w-full"
                              >
                                {sub.grade} / {asg.max_grade}
                              </button>
                            ) : (
                              <button 
                                onClick={() => { setGradingSubmission(sub); setScore(asg.max_grade); setFeedback(''); }}
                                className="px-2 py-1 bg-amber-500/10 text-amber-500 dark:text-amber-500 rounded-md font-bold text-xs hover:bg-amber-500/20 w-full"
                              >
                                Grade Now
                              </button>
                            )
                          ) : (
                            <span className="text-[10px] text-[#7c7c6f] italic">No Sub</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center font-black border-l border-[#E1DCC9]/20 dark:border-[#412D15]">
                      {totalMax > 0 ? (
                        <span className={totalScore/totalMax >= 0.7 ? 'text-[#00bae2]' : 'text-amber-500'}>
                          {Math.round((totalScore / totalMax) * 100)}%
                        </span>
                      ) : (
                        <span className="text-[#7c7c6f]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={assignments.length + 2} className="px-4 py-8 text-center text-[#7c7c6f]">
                    No students enrolled in this course yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Grading Modal Overlay */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F150C]/60 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-md" tint="purple">
            <h3 className="text-lg font-bold text-[#E1DCC9] mb-1">Evaluate Submission</h3>
            <p className="text-sm text-[#9d95ff] mb-6">Student: {gradingSubmission.users?.name}</p>

            <div className="space-y-4 text-sm">
              <div className="p-3 bg-[#FFFCE1]/10 rounded-xl">
                <p className="text-xs text-[#9d95ff] font-semibold mb-1">Submission File/Link:</p>
                <a href={gradingSubmission.file_url} target="_blank" rel="noreferrer" className="text-[#E1DCC9] hover:underline break-all">
                  {gradingSubmission.file_url}
                </a>
              </div>

              <div>
                <label className="block text-[#E1DCC9] font-semibold mb-1">Score</label>
                <input 
                  type="number"
                  value={score}
                  onChange={e => setScore(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-[#FFFCE1]/10 border border-[#E1DCC9]/20 text-[#E1DCC9] outline-none focus:border-[#E1DCC9]/40"
                />
              </div>

              <div>
                <label className="block text-[#E1DCC9] font-semibold mb-1">Teacher Feedback</label>
                <textarea 
                  rows={3}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Great job on..."
                  className="w-full p-2.5 rounded-lg bg-[#FFFCE1]/10 border border-[#E1DCC9]/20 text-[#E1DCC9] outline-none focus:border-[#E1DCC9]/40"
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleAIGrade} 
                  loading={aiGrading}
                  icon={<Sparkles size={14} className="text-[#9d95ff]" />}
                  className="w-full justify-center bg-[#9d95ff]/10 text-[#9d95ff] border-[#9d95ff]/20 hover:bg-[#9d95ff]/20"
                >
                  Auto-grade with AI
                </Button>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setGradingSubmission(null)}>Cancel</Button>
                <Button variant="primary" className="flex-1" onClick={handleGrade} loading={saving}>Save Grade</Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
