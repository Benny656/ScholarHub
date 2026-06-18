import { supabase } from '../lib/supabase';
import type { AttendanceRecord, AttendanceSummary } from '../types';

const generateCalendarData = (records: any[]) => {
  const data: { date: string; count: number }[] = [];
  // Use real data to count daily attendances
  const dateMap: Record<string, number> = {};
  records.forEach(r => {
    if (r.status === 'present') {
      dateMap[r.date] = (dateMap[r.date] || 0) + 1;
    }
  });

  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    data.push({
      date: dateStr,
      count: dateMap[dateStr] || 0,
    });
  }
  return data.reverse();
};

export const attendanceService = {
  async markAttendance(courseId: string, studentId: string, status: 'present' | 'absent' | 'late', classId?: string): Promise<any> {
    const { data, error } = await supabase.from('attendance').insert({
      course_id: courseId,
      student_id: studentId,
      class_id: classId || null,
      status,
      date: new Date().toISOString().split('T')[0],
      marked_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    return data;
  },

  async getStudentAttendance(userId: string): Promise<{ records: AttendanceRecord[]; summary: AttendanceSummary; calendarData: { date: string; count: number }[] }> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, courses(title)')
      .eq('student_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    const records = (data || []).map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      courseId: row.course_id,
      courseName: row.courses?.title,
      date: row.date,
      status: row.status as any,
      markedBy: row.qr_code ? 'qr' : 'manual',
    }));

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;

    const summary: AttendanceSummary = {
      total,
      present,
      absent,
      late,
      percentage: total > 0 ? Math.round((present / total) * 100) : 100,
    };

    return {
      records,
      summary,
      calendarData: generateCalendarData(data || []),
    };
  },

  async getCourseAttendance(courseId: string, date?: string): Promise<any[]> {
    let query = supabase
      .from('attendance')
      .select('*, users:student_id(name)')
      .eq('course_id', courseId)
      .order('marked_at', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async generateQRCode(courseId: string, expiresIn: number = 300): Promise<{ qrData: string; expiresAt: string; sessionId: string }> {
    const sessionId = 'sess-' + Math.random().toString(36).substring(2, 9);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    return {
      qrData: `nexlearn://attendance/${courseId}/${sessionId}?expires=${expiresAt}`,
      expiresAt,
      sessionId,
    };
  },

  async scanQRCode(qrData: string, studentId: string): Promise<any> {
    const match = qrData.match(/nexlearn:\/\/attendance\/([^\/]+)\/([^\?]+)/);
    if (!match) throw new Error('Invalid QR code format');
    
    const courseId = match[1];
    const classId = match[2];

    const { data, error } = await supabase.from('attendance').insert({
      student_id: studentId,
      course_id: courseId,
      class_id: classId,
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      qr_code: qrData,
      marked_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    return data;
  },

  async getAttendanceReport(courseId: string): Promise<any[]> {
    // Basic aggregation handled on client for now or via a rpc call
    const data = await this.getCourseAttendance(courseId);
    
    const studentStats: Record<string, { present: number; total: number; name: string }> = {};
    
    data.forEach(r => {
      if (!studentStats[r.student_id]) {
        studentStats[r.student_id] = { present: 0, total: 0, name: r.users?.name || 'Unknown' };
      }
      studentStats[r.student_id].total++;
      if (r.status === 'present') studentStats[r.student_id].present++;
    });

    return Object.values(studentStats).map(s => ({
      studentName: s.name,
      total: s.total,
      present: s.present,
      percentage: Math.round((s.present / s.total) * 100)
    }));
  },

  subscribeToAttendance(courseId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel(`public:attendance:${courseId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance', filter: `course_id=eq.${courseId}` },
        onUpdate
      )
      .subscribe();
  }
};
