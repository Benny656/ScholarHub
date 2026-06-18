import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { aiService, AttendanceInsight } from '../../services/ai.service';
import { GlassCard, SkeletonCard } from '../ui/index';
import { Sparkles, AlertTriangle, TrendingUp, Info } from 'lucide-react';

interface InsightsDashboardProps {
  courseId: string;
}

export function InsightsDashboard({ courseId }: InsightsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<AttendanceInsight[]>([]);
  const [stats, setStats] = useState({
    avgGrade: 0,
    attendanceRate: 0,
    totalStudents: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [courseId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('course_id', courseId);
        
      const studentIds = (enrollments || []).map(e => e.student_id);
      
      // 2. Fetch Grades
      const { data: submissions } = await supabase
        .from('submissions')
        .select('grade, assignment_id')
        .not('grade', 'is', null);
      
      // Filter submissions for this course's assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, max_grade')
        .eq('course_id', courseId);
        
      const assignmentIds = (assignments || []).map(a => a.id);
      const courseSubmissions = (submissions || []).filter(s => assignmentIds.includes(s.assignment_id));
      
      let totalGradePercentage = 0;
      courseSubmissions.forEach(sub => {
        const asg = assignments?.find(a => a.id === sub.assignment_id);
        if (asg && asg.max_grade > 0) {
          totalGradePercentage += (sub.grade / asg.max_grade);
        }
      });
      
      const avgGrade = courseSubmissions.length > 0 
        ? Math.round((totalGradePercentage / courseSubmissions.length) * 100) 
        : 0;

      // 3. Fetch Attendance
      const { data: attendance } = await supabase
        .from('attendance')
        .select('status')
        .eq('course_id', courseId);
        
      const totalAttendance = attendance?.length || 0;
      const present = attendance?.filter(a => a.status === 'present').length || 0;
      const attendanceRate = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0;

      setStats({
        avgGrade,
        attendanceRate,
        totalStudents: studentIds.length
      });

      // 4. Generate AI Insights via Gemini
      // Passing aggregated data string to AI Service
      const aggregatedDataString = `
        Course Data Summary:
        - Enrolled Students: ${studentIds.length}
        - Average Assignment Grade: ${avgGrade}%
        - Overall Attendance Rate: ${attendanceRate}%
        - Total Attendance Records: ${totalAttendance}
      `;
      
      // Since aiService.attendanceInsights accepts a string context
      const aiInsights = await aiService.attendanceInsights(aggregatedDataString);
      setInsights(aiInsights);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard tint="blue">
          <p className="text-xs text-blue-200 mb-1">Enrolled Students</p>
          <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
        </GlassCard>
        <GlassCard tint={stats.avgGrade >= 70 ? 'emerald' : 'amber'}>
          <p className="text-xs text-white/70 mb-1">Class Average Grade</p>
          <p className="text-3xl font-bold text-white">{stats.avgGrade}%</p>
        </GlassCard>
        <GlassCard tint={stats.attendanceRate >= 80 ? 'emerald' : 'red'}>
          <p className="text-xs text-white/70 mb-1">Average Attendance</p>
          <p className="text-3xl font-bold text-white">{stats.attendanceRate}%</p>
        </GlassCard>
      </div>

      <GlassCard tint="purple">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-400" size={20} />
          <h3 className="text-lg font-bold text-white">AI Course Insights & Recommendations</h3>
        </div>
        
        {insights.length === 0 ? (
          <p className="text-sm text-purple-200">No specific insights generated at this time.</p>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-black/20 p-4 rounded-xl border border-white/10 flex gap-4">
                <div className="mt-1">
                  {insight.type === 'warning' && <AlertTriangle className="text-red-400" size={20} />}
                  {insight.type === 'success' && <TrendingUp className="text-emerald-400" size={20} />}
                  {insight.type === 'info' && <Info className="text-blue-400" size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">{insight.insight}</h4>
                  <p className="text-sm text-purple-200">{insight.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
