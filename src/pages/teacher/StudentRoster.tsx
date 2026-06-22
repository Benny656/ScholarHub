import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Activity, Award, Search, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { PageHeader, StatCard, GlassCard, Badge, Avatar, EmptyState } from '../../components/ui/index';

export function StudentRoster() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    averageGrade: 0
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch courses for this teacher
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id')
          .eq('instructor_id', user.id);
        
        const courseIds = (coursesData || []).map(c => c.id);

        if (courseIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch enrollments
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('*')
          .in('course_id', courseIds);

        if (!enrollmentsData || enrollmentsData.length === 0) {
          setLoading(false);
          return;
        }

        const studentIds = [...new Set(enrollmentsData.map(e => e.student_id))];

        // Fetch user profiles
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, email, avatar')
          .in('id', studentIds);

        const usersMap = new Map((usersData || []).map(u => [u.id, u]));

        // Fetch attendance to calculate percentage
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('student_id, status')
          .in('course_id', courseIds);

        // Fetch submissions to calculate grades
        const { data: submissionsData } = await supabase
          .from('submissions')
          .select('student_id, score, max_score')
          .not('score', 'is', null); // only graded ones

        // Process data
        let totalAttendancePercentage = 0;
        let totalGradePercentage = 0;
        let studentsWithAttendance = 0;
        let studentsWithGrades = 0;

        const rosterData = studentIds.map(sId => {
          const studentInfo = usersMap.get(sId) || { name: 'Unknown Student', email: 'N/A', avatar: null };
          
          // Calculate individual attendance
          const studentAttendance = (attendanceData || []).filter(a => a.student_id === sId);
          let attendancePercentage = 100;
          if (studentAttendance.length > 0) {
            const present = studentAttendance.filter(a => a.status === 'present').length;
            attendancePercentage = Math.round((present / studentAttendance.length) * 100);
            totalAttendancePercentage += attendancePercentage;
            studentsWithAttendance++;
          }

          // Calculate individual grade
          const studentSubmissions = (submissionsData || []).filter(s => s.student_id === sId);
          let gradePercentage = 0;
          if (studentSubmissions.length > 0) {
            let totalScore = 0;
            let totalMax = 0;
            studentSubmissions.forEach(s => {
              totalScore += (s.score || 0);
              totalMax += (s.max_score || 100);
            });
            gradePercentage = Math.round((totalScore / totalMax) * 100);
            totalGradePercentage += gradePercentage;
            studentsWithGrades++;
          }

          // Find enrollment date
          const studentEnrollments = enrollmentsData.filter(e => e.student_id === sId);
          const enrolledAt = studentEnrollments.length > 0 ? studentEnrollments[0].enrolled_at : new Date().toISOString();

          return {
            id: sId,
            name: studentInfo.name,
            email: studentInfo.email,
            avatar: studentInfo.avatar,
            enrolledAt,
            attendance: attendancePercentage,
            grade: gradePercentage,
            hasGrade: studentSubmissions.length > 0
          };
        });

        setStudents(rosterData.sort((a, b) => a.name.localeCompare(b.name)));
        
        setStats({
          totalStudents: studentIds.length,
          averageAttendance: studentsWithAttendance > 0 ? Math.round(totalAttendancePercentage / studentsWithAttendance) : 100,
          averageGrade: studentsWithGrades > 0 ? Math.round(totalGradePercentage / studentsWithGrades) : 0
        });

      } catch (err) {
        console.error("Error fetching roster:", err);
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
        title="Student Roster" 
        subtitle="Manage and view your enrolled students across all courses."
        breadcrumb={[{ label: 'Student Roster' }]}
      />

      {students.length === 0 ? (
        <EmptyState 
          icon={<Users className="w-12 h-12 text-[#9d95ff]" />}
          title="No Students Enrolled"
          description="You don't have any students enrolled in your courses yet. Once students enroll, they will appear here with their attendance and grades."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              label="Total Students" 
              value={stats.totalStudents} 
              icon={<Users />} 
              color="blue" 
            />
            <StatCard 
              label="Average Attendance" 
              value={`${stats.averageAttendance}%`} 
              icon={<Activity />} 
              color="emerald" 
            />
            <StatCard 
              label="Average Grade" 
              value={`${stats.averageGrade}%`} 
              icon={<Award />} 
              color="purple" 
            />
          </div>

          <GlassCard className="overflow-hidden p-0">
            <div className="p-4 border-b border-[#E1DCC9]/20 dark:border-[#412D15] flex justify-between items-center bg-[#FFFCE1]/50 dark:bg-[#412D15]/50">
              <h3 className="font-semibold text-[#0e100f] dark:text-[#E1DCC9]">All Enrolled Students</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7c7c6f]" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="pl-9 pr-4 py-2 bg-[#FFFCE1] dark:bg-[#412D15] border border-[#E1DCC9]/20 dark:border-[#412D15] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FFFCE1] dark:bg-[#412D15] text-[#7c7c6f] dark:text-[#7c7c6f] text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Enrollment Date</th>
                    <th className="px-6 py-4">Attendance</th>
                    <th className="px-6 py-4">Average Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-[#FFFCE1]/50 dark:hover:bg-[#412D15]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.name} src={student.avatar} size="sm" />
                          <div>
                            <p className="font-semibold text-[#0e100f] dark:text-[#E1DCC9]">{student.name}</p>
                            <p className="text-xs text-[#7c7c6f]">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#7c7c6f] dark:text-[#7c7c6f]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#7c7c6f]" />
                          {new Date(student.enrolledAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={student.attendance >= 90 ? 'emerald' : student.attendance >= 75 ? 'amber' : 'red'}>
                          {student.attendance}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {student.hasGrade ? (
                          <Badge variant={student.grade >= 80 ? 'purple' : student.grade >= 60 ? 'blue' : 'amber'}>
                            {student.grade}%
                          </Badge>
                        ) : (
                          <span className="text-xs text-[#7c7c6f] italic">No grades yet</span>
                        )}
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
