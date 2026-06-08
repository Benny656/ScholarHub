import type { AttendanceRecord, AttendanceSummary } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateCalendarData = () => {
  const data: { date: string; count: number }[] = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      count: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0,
    });
  }
  return data;
};

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'at1', studentId: 'u1', studentName: 'Alex Johnson', courseId: 'c1', date: '2024-06-07', status: 'present', markedBy: 'qr' },
  { id: 'at2', studentId: 'u1', studentName: 'Alex Johnson', courseId: 'c1', date: '2024-06-06', status: 'present', markedBy: 'qr' },
  { id: 'at3', studentId: 'u1', studentName: 'Alex Johnson', courseId: 'c1', date: '2024-06-05', status: 'absent', markedBy: 'manual' },
  { id: 'at4', studentId: 'u1', studentName: 'Alex Johnson', courseId: 'c2', date: '2024-06-04', status: 'late', markedBy: 'qr' },
  { id: 'at5', studentId: 'u1', studentName: 'Alex Johnson', courseId: 'c3', date: '2024-06-03', status: 'present', markedBy: 'qr' },
  { id: 'at6', studentId: 'u8', studentName: 'Jordan Lee', courseId: 'c1', date: '2024-06-07', status: 'absent', markedBy: 'manual' },
  { id: 'at7', studentId: 'u9', studentName: 'Priya Sharma', courseId: 'c1', date: '2024-06-07', status: 'present', markedBy: 'qr' },
];

export const attendanceService = {
  async getStudentAttendance(userId: string): Promise<{ records: AttendanceRecord[]; summary: AttendanceSummary; calendarData: { date: string; count: number }[] }> {
    await delay(600);
    const records = MOCK_ATTENDANCE.filter(a => a.studentId === userId);
    const summary: AttendanceSummary = {
      total: 45,
      present: 38,
      absent: 4,
      late: 3,
      percentage: Math.round((38 / 45) * 100),
    };
    // In real app: GET /api/attendance/student/:userId
    return { records, summary, calendarData: generateCalendarData() };
  },

  async getCourseAttendance(courseId: string, date?: string): Promise<AttendanceRecord[]> {
    await delay(500);
    const records = MOCK_ATTENDANCE.filter(a => a.courseId === courseId);
    // In real app: GET /api/attendance/course/:courseId?date=...
    return records;
  },

  async markAttendance(studentId: string, courseId: string, status: 'present' | 'absent' | 'late'): Promise<AttendanceRecord> {
    await delay(400);
    const record: AttendanceRecord = {
      id: `at-${Date.now()}`,
      studentId,
      studentName: 'Student',
      courseId,
      date: new Date().toISOString().split('T')[0],
      status,
      markedBy: 'manual',
    };
    // In real app: POST /api/attendance/mark
    return record;
  },

  async generateQRCode(courseId: string, expiresIn: number = 300): Promise<{ qrData: string; expiresAt: string; sessionId: string }> {
    await delay(400);
    const sessionId = `sess-${Date.now()}`;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    // In real app: POST /api/attendance/qr/generate
    return {
      qrData: `nexlearn://attendance/${courseId}/${sessionId}?expires=${expiresAt}`,
      expiresAt,
      sessionId,
    };
  },

  async scanQRCode(qrData: string, studentId: string): Promise<AttendanceRecord> {
    await delay(600);
    // Parse courseId from QR
    const parts = qrData.split('/');
    const courseId = parts[3] || 'c1';
    // In real app: POST /api/attendance/qr/scan
    return {
      id: `at-${Date.now()}`,
      studentId,
      studentName: 'Alex Johnson',
      courseId,
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      markedBy: 'qr',
    };
  },

  async getAttendanceReport(courseId: string): Promise<{ studentName: string; percentage: number; total: number; present: number }[]> {
    await delay(600);
    // In real app: GET /api/attendance/report/course/:courseId
    return [
      { studentName: 'Alex Johnson', percentage: 84, total: 45, present: 38 },
      { studentName: 'Jordan Lee', percentage: 71, total: 45, present: 32 },
      { studentName: 'Priya Sharma', percentage: 96, total: 45, present: 43 },
      { studentName: 'Marcus Brown', percentage: 62, total: 45, present: 28 },
      { studentName: 'Sara Wilson', percentage: 89, total: 45, present: 40 },
    ];
  },
};
