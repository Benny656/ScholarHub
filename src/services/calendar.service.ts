import type { CalendarEvent } from '../types';
import { apiClient } from '../lib/apiClient';

export const calendarService = {
  async getEvents(userId: string, month?: number, year?: number): Promise<CalendarEvent[]> {
    console.log('[CalendarService] Fetching events from backend for User:', userId, 'Month:', month, 'Year:', year);
    const query = new URLSearchParams();
    if (month !== undefined) query.append('month', String(month));
    if (year !== undefined) query.append('year', String(year));
    
    const queryString = query.toString();
    const path = `/calendar/events${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<CalendarEvent[]>(path);
  },

  async createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    console.log('[CalendarService] Creating event on backend:', event);
    return apiClient.post<CalendarEvent>('/calendar/events', event);
  },

  async deleteEvent(id: string): Promise<void> {
    console.log('[CalendarService] Deleting event on backend:', id);
    await apiClient.delete(`/calendar/events/${id}`);
  },

  async syncGoogleCalendar(userId: string): Promise<{ success: boolean; synced: number }> {
    console.log('[CalendarService] Syncing Google Calendar on backend for User:', userId);
    return apiClient.post<{ success: boolean; synced: number }>('/calendar/sync/google', { userId });
  },
};
