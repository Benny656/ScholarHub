import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { GlassCard, Button, Badge } from '../ui/index';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export function BulkAttendance({ courseId }: { courseId: string }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Record of student_id -> status
  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  useEffect(() => {
    loadStudents();
  }, [courseId]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`users:student_id (id, name, email)`)
        .eq('course_id', courseId);
      
      if (error) throw error;

      const st = (data || []).map(e => e.users).filter(Boolean);
      setStudents(st);

      // Pre-fill all as present by default
      const initialState: Record<string, 'present' | 'absent' | 'late'> = {};
      st.forEach(s => {
        if (s && s.id) initialState[s.id] = 'present';
      });
      setAttendanceState(initialState);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students for attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const recordsToInsert = students.map(s => ({
        course_id: courseId,
        student_id: s.id,
        status: attendanceState[s.id],
        date: date,
        marked_at: new Date().toISOString(),
        marked_by: 'manual'
      }));

      // Delete any existing attendance for these students on this date for this course
      await supabase
        .from('attendance')
        .delete()
        .eq('course_id', courseId)
        .eq('date', date)
        .in('student_id', students.map(s => s.id));

      const { error } = await supabase.from('attendance').insert(recordsToInsert as any);
      
      if (error) throw error;
      toast.success('Bulk attendance saved successfully! ✅');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save bulk attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-3 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl h-32" />;
  }

  if (students.length === 0) {
    return (
      <GlassCard className="text-center p-6">
        <p className="text-neutral-500">No students enrolled to mark attendance.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Manual Bulk Attendance</h3>
          <p className="text-xs text-neutral-500 mt-1">Mark present/absent for the entire class at once.</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm outline-none text-neutral-900 dark:text-white"
          />
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            Save Register
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {students.map(student => {
          const status = attendanceState[student.id];
          return (
            <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 gap-3">
              <div className="font-semibold text-sm text-neutral-900 dark:text-white line-clamp-1">
                {student.name || 'Unknown Student'}
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStatusChange(student.id, 'present')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    status === 'present' 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <CheckCircle size={14} /> Present
                </button>
                <button
                  onClick={() => handleStatusChange(student.id, 'late')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    status === 'late' 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <Clock size={14} /> Late
                </button>
                <button
                  onClick={() => handleStatusChange(student.id, 'absent')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    status === 'absent' 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <XCircle size={14} /> Absent
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
