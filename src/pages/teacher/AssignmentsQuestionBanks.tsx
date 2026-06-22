import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, FileText, Database, Plus, Search, Calendar, FileQuestion } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { PageHeader, StatCard, GlassCard, Badge, Button, EmptyState } from '../../components/ui/index';

export function AssignmentsQuestionBanks() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [questionBanks, setQuestionBanks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingGrading: 0,
    totalSubmissions: 0
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch courses for this teacher
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title')
          .eq('instructor_id', user.id);
        
        const courseIds = (coursesData || []).map(c => c.id);
        const coursesMap = new Map((coursesData || []).map(c => [c.id, c.title]));

        if (courseIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch assignments
        const { data: assignmentsData } = await supabase
          .from('assignments')
          .select('*')
          .in('course_id', courseIds)
          .order('due_date', { ascending: true });

        const assignmentIds = (assignmentsData || []).map(a => a.id);

        let submissionsData: any[] = [];
        if (assignmentIds.length > 0) {
          // Fetch submissions
          const { data } = await supabase
            .from('submissions')
            .select('id, assignment_id, status, score')
            .in('assignment_id', assignmentIds);
          submissionsData = data || [];
        }

        // Process Assignments
        let pendingCount = 0;
        const processedAssignments = (assignmentsData || []).map(a => {
          const aSubmissions = submissionsData.filter(s => s.assignment_id === a.id);
          const pendingForThis = aSubmissions.filter(s => s.status === 'submitted' && s.score === null).length;
          pendingCount += pendingForThis;

          return {
            ...a,
            courseName: coursesMap.get(a.course_id) || 'Unknown Course',
            submissionsCount: aSubmissions.length,
            pendingGrading: pendingForThis
          };
        });

        setAssignments(processedAssignments);
        setStats({
          totalAssignments: processedAssignments.length,
          pendingGrading: pendingCount,
          totalSubmissions: submissionsData.length
        });

        // Question banks - assuming quizzes or a mock for now
        const { data: quizzesData } = await supabase
          .from('quizzes')
          .select('id, title, course_id, questions')
          .in('course_id', courseIds);
        
        if (quizzesData) {
          setQuestionBanks(quizzesData.map(q => ({
            id: q.id,
            title: q.title,
            courseName: coursesMap.get(q.course_id) || 'Unknown Course',
            questionsCount: Array.isArray(q.questions) ? q.questions.length : 0
          })));
        }

      } catch (err) {
        console.error("Error fetching assignments data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Assignments & Question Banks" 
        subtitle="Manage course assignments, grading, and reusable question banks."
        breadcrumb={[{ label: 'Assignments & Question Banks' }]}
        action={
          <Button variant="primary" icon={<Plus size={16} />}>Create Assignment</Button>
        }
      />

      {assignments.length === 0 && questionBanks.length === 0 ? (
        <EmptyState 
          icon={<CheckSquare className="w-12 h-12 text-[#00bae2]" />}
          title="No Assignments Yet"
          description="You haven't created any assignments or question banks for your courses. Get started by creating your first assignment."
          action={<Button variant="primary" icon={<Plus size={16} />}>Create Assignment</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              label="Total Assignments" 
              value={stats.totalAssignments} 
              icon={<FileText />} 
              color="blue" 
            />
            <StatCard 
              label="Pending Grading" 
              value={stats.pendingGrading} 
              icon={<FileQuestion />} 
              color="amber" 
            />
            <StatCard 
              label="Total Submissions" 
              value={stats.totalSubmissions} 
              icon={<Database />} 
              color="purple" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="overflow-hidden p-0 flex flex-col h-[500px]">
              <div className="p-4 border-b border-[#E1DCC9]/20 dark:border-[#412D15] flex justify-between items-center bg-[#FFFCE1]/50 dark:bg-[#412D15]/50 shrink-0">
                <h3 className="font-semibold text-[#0e100f] dark:text-[#E1DCC9] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00bae2]" /> Active Assignments
                </h3>
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {assignments.length === 0 ? (
                  <div className="p-8 text-center text-[#7c7c6f] flex flex-col items-center justify-center h-full">
                    <FileText className="w-8 h-8 mb-2 opacity-20" />
                    <p>No assignments found.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FFFCE1] dark:bg-[#412D15] text-[#7c7c6f] dark:text-[#7c7c6f] text-xs uppercase font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Course</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3 text-center">Submissions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-[#FFFCE1]/50 dark:hover:bg-[#412D15]/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-[#0e100f] dark:text-[#E1DCC9] truncate max-w-[150px]">{assignment.title}</p>
                          </td>
                          <td className="px-4 py-3 text-[#7c7c6f] dark:text-[#7c7c6f]">
                            <span className="truncate max-w-[100px] block">{assignment.courseName}</span>
                          </td>
                          <td className="px-4 py-3 text-[#7c7c6f] dark:text-[#7c7c6f]">
                            {new Date(assignment.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={assignment.pendingGrading > 0 ? 'amber' : 'emerald'}>
                              {assignment.submissionsCount} {assignment.pendingGrading > 0 && `(${assignment.pendingGrading} new)`}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </GlassCard>

            <GlassCard className="overflow-hidden p-0 flex flex-col h-[500px]">
              <div className="p-4 border-b border-[#E1DCC9]/20 dark:border-[#412D15] flex justify-between items-center bg-[#FFFCE1]/50 dark:bg-[#412D15]/50 shrink-0">
                <h3 className="font-semibold text-[#0e100f] dark:text-[#E1DCC9] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#9d95ff]" /> Question Banks
                </h3>
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {questionBanks.length === 0 ? (
                  <div className="p-8 text-center text-[#7c7c6f] flex flex-col items-center justify-center h-full">
                    <Database className="w-8 h-8 mb-2 opacity-20" />
                    <p className="mb-4">No question banks created yet.</p>
                    <Button variant="secondary" size="sm">Create Bank</Button>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FFFCE1] dark:bg-[#412D15] text-[#7c7c6f] dark:text-[#7c7c6f] text-xs uppercase font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3">Bank Name</th>
                        <th className="px-4 py-3">Course</th>
                        <th className="px-4 py-3 text-center">Questions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {questionBanks.map((bank) => (
                        <tr key={bank.id} className="hover:bg-[#FFFCE1]/50 dark:hover:bg-[#412D15]/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-[#0e100f] dark:text-[#E1DCC9] truncate max-w-[150px]">{bank.title}</p>
                          </td>
                          <td className="px-4 py-3 text-[#7c7c6f] dark:text-[#7c7c6f]">
                            <span className="truncate max-w-[120px] block">{bank.courseName}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="purple">{bank.questionsCount}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
