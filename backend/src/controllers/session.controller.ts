import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';
import { localDB } from '../localDB.js';

export const sessionController = {
  // GET /api/classrooms/:id/sessions
  async getClassroomSessions(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    try {
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('live_classes')
        .select('*')
        .eq('course_id', id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      res.json(data || []);
    } catch (error: any) {
      console.error('getClassroomSessions error (falling back to local DB):', error.message || error);
      const filtered = localDB.getSessions().filter(s => s.course_id === id);
      res.json(filtered);
    }
  },

  // POST /api/classrooms/:id/sessions
  async scheduleSession(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { title, scheduledAt, roomId } = req.body;
    const room = roomId || `classroom_${id}_${Date.now()}`;
    try {
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('live_classes')
        .insert({
          course_id: id,
          teacher_id: req.user!.id,
          title,
          room_id: room,
          scheduled_at: scheduledAt || new Date().toISOString(),
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;

      localDB.addSession(data);
      res.status(201).json(data);
    } catch (error: any) {
      console.error('scheduleSession error (falling back to local DB):', error.message || error);
      const mockSession = {
        id: `sess_${Math.random().toString(36).substring(2, 9)}`,
        course_id: id,
        teacher_id: req.user!.id,
        title: title || 'Live Session',
        room_id: room,
        scheduled_at: scheduledAt || new Date().toISOString(),
        status: 'scheduled',
      };
      localDB.addSession(mockSession);
      res.status(201).json(mockSession);
    }
  },

  // PATCH /api/classrooms/:id/sessions/:sessionId/recording
  async updateSessionRecording(req: AuthenticatedRequest, res: Response) {
    const { sessionId } = req.params;
    const { recordingUrl } = req.body;
    try {
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('live_classes')
        .update({ recording_url: recordingUrl })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      localDB.updateSessionRecording(sessionId, recordingUrl);
      res.json(data);
    } catch (error: any) {
      console.error('updateSessionRecording error (falling back to local DB):', error.message || error);
      localDB.updateSessionRecording(sessionId, recordingUrl);
      res.json({ success: true, recording_url: recordingUrl });
    }
  }
};
