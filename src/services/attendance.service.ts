import type { AttendanceRecord, AttendanceSummary } from '../types';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabase';



export const attendanceService = {
  async markAttendance(courseId: string, classId: string, status: 'present' | 'absent' | 'late'): Promise<any> {
    console.log('[AttendanceService] Marking attendance on backend');
    return apiClient.post<any>('/attendance/mark', { courseId, classId, status });
  },

  async getAttendance(studentId: string): Promise<any[]> {
    console.log('[AttendanceService] Fetching attendance from backend for:', studentId);
    return apiClient.get<any[]>(`/attendance?studentId=${studentId}`);
  },

  async generateQR(classId: string): Promise<string> {
    const expiresAt = new Date(Date.now() + 300 * 1000).toISOString();
    return `nexlearn://attendance/${classId}?expires=${expiresAt}`;
  },

  async getStudentAttendance(userId: string): Promise<{ records: AttendanceRecord[]; summary: AttendanceSummary; calendarData: { date: string; count: number }[] }> {
    const data = await this.getAttendance(userId);
    
    const records: AttendanceRecord[] = (data || []).map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      studentName: row.users?.name || 'Student',
      courseId: row.course_id,
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
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };

    return {
      records,
      summary,
      calendarData: [],
    };
  },

  async getCourseAttendance(courseId: string, date?: string): Promise<AttendanceRecord[]> {
    console.log('[AttendanceService] Fetching course attendance from backend');
    let path = `/attendance/course/${courseId}`;
    if (date) path += `?date=${date}`;
    return apiClient.get<AttendanceRecord[]>(path);
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

  async scanQRCode(qrData: string, studentId: string): Promise<AttendanceRecord> {
    console.log('[AttendanceService] Scanning QR code on backend');
    return apiClient.post<AttendanceRecord>('/attendance/scan', { qrData, studentId });
  },

  async getAttendanceReport(courseId: string): Promise<{ studentName: string; percentage: number; total: number; present: number }[]> {
    console.log('[AttendanceService] Fetching course report from backend');
    return apiClient.get<any[]>(`/attendance/report/${courseId}`);
  },

  subscribeToAttendance(courseId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel('public:attendance')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance', filter: `course_id=eq.${courseId}` },
        onUpdate
      )
      .subscribe();
  }
};
