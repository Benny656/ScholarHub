import type { CalendarEvent } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const calendarService = {
  async getEvents(userId: string, month?: number, year?: number): Promise<CalendarEvent[]> {
    await delay(500);
    const now = new Date();
    const m = month ?? now.getMonth();
    const y = year ?? now.getFullYear();

    // In real app: GET /api/calendar/events?userId=...&month=...&year=...
    return [
      { id: 'ev1', title: 'Web Dev Live Session', date: `${y}-${String(m + 1).padStart(2, '0')}-10`, startTime: '10:00', endTime: '11:30', type: 'class', courseId: 'c1', courseName: 'Full-Stack Web Dev', location: 'Room A - Zoom' },
      { id: 'ev2', title: 'React Component Assignment Due', date: `${y}-${String(m + 1).padStart(2, '0')}-15`, type: 'assignment', courseId: 'c1', courseName: 'Full-Stack Web Dev' },
      { id: 'ev3', title: 'ML Midterm Exam', date: `${y}-${String(m + 1).padStart(2, '0')}-18`, startTime: '14:00', endTime: '16:00', type: 'exam', courseId: 'c2', courseName: 'Machine Learning', location: 'Online Proctored' },
      { id: 'ev4', title: 'Design Review Session', date: `${y}-${String(m + 1).padStart(2, '0')}-12`, startTime: '09:00', endTime: '10:00', type: 'class', courseId: 'c3', courseName: 'UI/UX Design' },
      { id: 'ev5', title: 'UX Research Report Due', date: `${y}-${String(m + 1).padStart(2, '0')}-08`, type: 'assignment', courseId: 'c3', courseName: 'UI/UX Design' },
      { id: 'ev6', title: 'AWS Architecture Assignment', date: `${y}-${String(m + 1).padStart(2, '0')}-25`, type: 'assignment', courseId: 'c5', courseName: 'Cloud Computing' },
      { id: 'ev7', title: 'Office Hours — Dr. Chen', date: `${y}-${String(m + 1).padStart(2, '0')}-14`, startTime: '15:00', endTime: '17:00', type: 'meeting', description: 'Open office hours, first-come-first-served' },
      { id: 'ev8', title: 'DSA Final Exam', date: `${y}-${String(m + 1).padStart(2, '0')}-28`, startTime: '10:00', endTime: '12:00', type: 'exam', courseId: 'c4', courseName: 'Data Structures & Algorithms' },
      { id: 'ev9', title: 'Web Dev Live Session', date: `${y}-${String(m + 1).padStart(2, '0')}-17`, startTime: '10:00', endTime: '11:30', type: 'class', courseId: 'c1', courseName: 'Full-Stack Web Dev' },
      { id: 'ev10', title: 'Security Practical Lab', date: `${y}-${String(m + 1).padStart(2, '0')}-20`, startTime: '13:00', endTime: '14:30', type: 'class', courseId: 'c6', courseName: 'Cybersecurity' },
    ];
  },

  async createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    await delay(400);
    const newEvent: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: event.title || 'Untitled Event',
      date: event.date || new Date().toISOString().split('T')[0],
      type: event.type || 'class',
      ...event,
    };
    // In real app: POST /api/calendar/events
    return newEvent;
  },

  async deleteEvent(id: string): Promise<void> {
    await delay(300);
    // In real app: DELETE /api/calendar/events/:id
  },

  async syncGoogleCalendar(userId: string): Promise<{ success: boolean; synced: number }> {
    await delay(1200);
    // In real app: POST /api/calendar/sync/google (OAuth flow)
    return { success: true, synced: 10 };
  },
};
