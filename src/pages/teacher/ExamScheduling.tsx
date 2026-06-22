import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, AlertCircle, FileEdit, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { PageHeader, StatCard, GlassCard, Badge, Button, EmptyState } from '../../components/ui/index';

export function ExamScheduling() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0
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

        // We try to fetch from 'exams' or 'assignments' where type='quiz'/type='exam'
        // For this page, we'll look for assignments that might represent exams
        const { data: examsData, error } = await supabase
          .from('assignments')
          .select('*')
          .in('course_id', courseIds)
          .eq('type', 'quiz'); // Assuming quizzes/exams are marked as 'quiz'
          
        if (error) {
           console.error("No exams/quizzes data found or table structure differs", error);
        }

        const now = new Date();
        let upcomingCount = 0;
        let completedCount = 0;

        const processedExams = (examsData || []).map(e => {
          const isCompleted = new Date(e.due_date) < now;
          if (isCompleted) {
            completedCount++;
          } else {
            upcomingCount++;
          }

          return {
            ...e,
            courseName: coursesMap.get(e.course_id) || 'Unknown Course',
            status: isCompleted ? 'Completed' : 'Upcoming',
            duration: '90 mins' // Mock duration as it's typically in the Quiz schema
          };
        }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

        setExams(processedExams);
        setStats({
          upcoming: upcomingCount,
          completed: completedCount
        });

      } catch (err) {
        console.error("Error fetching exams:", err);
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
        title="Exam Scheduling" 
        subtitle="Schedule and manage upcoming examinations for your courses."
        breadcrumb={[{ label: 'Exam Scheduling' }]}
        action={
          <Button variant="primary" icon={<Plus size={16} />}>Schedule Exam</Button>
        }
      />

      {exams.length === 0 ? (
        <EmptyState 
          icon={<Calendar className="w-12 h-12 text-[#00bae2]" />}
          title="No Exams Scheduled"
          description="You haven't scheduled any exams for your active courses. Use the scheduling tool to set up your first examination session."
          action={<Button variant="primary" icon={<Plus size={16} />}>Schedule Exam</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard 
              label="Upcoming Exams" 
              value={stats.upcoming} 
              icon={<Clock />} 
              color="amber" 
            />
            <StatCard 
              label="Completed Exams" 
              value={stats.completed} 
              icon={<CheckCircle2 />} 
              color="emerald" 
            />
          </div>

          <GlassCard className="overflow-hidden p-0">
            <div className="p-4 border-b border-[#E1DCC9]/20 dark:border-[#412D15] flex justify-between items-center bg-[#FFFCE1]/50 dark:bg-[#412D15]/50">
              <h3 className="font-semibold text-[#0e100f] dark:text-[#E1DCC9]">Scheduled Examinations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FFFCE1] dark:bg-[#412D15] text-[#7c7c6f] dark:text-[#7c7c6f] text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Exam Name</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-[#FFFCE1]/50 dark:hover:bg-[#412D15]/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#0e100f] dark:text-[#E1DCC9]">{exam.title}</p>
                      </td>
                      <td className="px-6 py-4 text-[#7c7c6f] dark:text-[#7c7c6f]">
                        {exam.courseName}
                      </td>
                      <td className="px-6 py-4 text-[#7c7c6f] dark:text-[#7c7c6f]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#7c7c6f]" />
                          {new Date(exam.due_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#7c7c6f] dark:text-[#7c7c6f]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#7c7c6f]" />
                          {exam.duration}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={exam.status === 'Completed' ? 'emerald' : 'amber'}>
                          {exam.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" icon={<FileEdit size={14} />}>Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
