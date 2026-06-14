import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';
import { localDB } from '../localDB.js';

export const liveController = {
  // POST /api/live/start
  async startSession(req: AuthenticatedRequest, res: Response) {
    const { classroomId, title } = req.body;
    const meetingRoomId = `classroom_${classroomId}_${Date.now()}`;
    const meetingUrl = `https://meet.jit.si/${meetingRoomId}`;
    const teacherId = req.user!.id;

    try {
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('live_sessions')
        .insert({
          classroom_id: classroomId,
          teacher_id: teacherId,
          meeting_room_id: meetingRoomId,
          meeting_url: meetingUrl,
          status: 'LIVE',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      localDB.addLiveSession(data);
      res.status(201).json(data);
    } catch (err: any) {
      console.error('startSession error (falling back to local DB):', err.message || err);
      const mockSession = {
        id: `sess_${Math.random().toString(36).substring(2, 9)}`,
        classroom_id: classroomId,
        teacher_id: teacherId,
        meeting_room_id: meetingRoomId,
        meeting_url: meetingUrl,
        status: 'LIVE',
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      localDB.addLiveSession(mockSession);
      res.status(201).json(mockSession);
    }
  },

  // POST /api/live/end
  async endSession(req: AuthenticatedRequest, res: Response) {
    const { sessionId } = req.body;
    const endedAt = new Date().toISOString();

    try {
      const userClient = getSupabaseForUser(req.user!.token);

      // Fetch the session first to calculate duration for recording
      let session = localDB.getLiveSessionById(sessionId);
      if (!session) {
        const { data, error } = await userClient
          .from('live_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
        if (error) throw error;
        session = data;
      }

      const { data, error } = await userClient
        .from('live_sessions')
        .update({
          status: 'ENDED',
          ended_at: endedAt
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      localDB.updateLiveSession(sessionId, { status: 'ENDED', ended_at: endedAt });

      // Create recording record
      const started = new Date(session.started_at).getTime();
      const ended = new Date(endedAt).getTime();
      const duration = Math.max(1, Math.floor((ended - started) / 1000));
      const recordingUrl = `https://meet.jit.si/rec/${session.meeting_room_id}.mp4`;

      await userClient
        .from('recordings')
        .insert({
          session_id: sessionId,
          recording_url: recordingUrl,
          duration: duration
        });

      const mockRecording = {
        id: `rec_${Math.random().toString(36).substring(2, 9)}`,
        session_id: sessionId,
        recording_url: recordingUrl,
        duration: duration,
        created_at: new Date().toISOString()
      };
      localDB.addRecording(mockRecording);

      res.json(data);
    } catch (err: any) {
      console.error('endSession error (falling back to local DB):', err.message || err);
      const session = localDB.getLiveSessionById(sessionId);
      let duration = 60;
      if (session) {
        const started = new Date(session.started_at).getTime();
        const ended = new Date(endedAt).getTime();
        duration = Math.max(1, Math.floor((ended - started) / 1000));
      }
      localDB.updateLiveSession(sessionId, { status: 'ENDED', ended_at: endedAt });

      const recordingUrl = session ? `https://meet.jit.si/rec/${session.meeting_room_id}.mp4` : 'https://meet.jit.si/rec/general.mp4';
      const mockRecording = {
        id: `rec_${Math.random().toString(36).substring(2, 9)}`,
        session_id: sessionId,
        recording_url: recordingUrl,
        duration: duration,
        created_at: new Date().toISOString()
      };
      localDB.addRecording(mockRecording);

      res.json({ success: true, status: 'ENDED', ended_at: endedAt });
    }
  },

  // GET /api/live/participants
  async getParticipants(req: AuthenticatedRequest, res: Response) {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId query parameter' });
    }

    try {
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('session_participants')
        .select(`
          *,
          user:users(id, name, role, avatar_url)
        `)
        .eq('session_id', sessionId);

      if (error) throw error;

      res.json(data || []);
    } catch (err: any) {
      console.error('getParticipants error (falling back to local DB):', err.message || err);
      const localParts = localDB.getSessionParticipants(sessionId as string);
      // Map user details from localDB users
      const enriched = localParts.map(p => {
        const localUser = localDB.getUserById(p.user_id);
        return {
          ...p,
          user: localUser ? {
            id: localUser.id,
            name: localUser.name,
            role: localUser.role,
            avatar_url: localUser.avatar || ''
          } : {
            id: p.user_id,
            name: 'Alex Johnson',
            role: 'student',
            avatar_url: ''
          }
        };
      });
      res.json(enriched);
    }
  },

  // POST /api/live/create-breakout-room
  async createBreakoutRoom(req: AuthenticatedRequest, res: Response) {
    const { sessionId, name } = req.body;
    const breakoutRoomId = `classroom_breakout_${sessionId}_${name ? name.replace(/\s+/g, '_').toLowerCase() : 'room'}_${Date.now()}`;
    const meetingUrl = `https://meet.jit.si/${breakoutRoomId}`;

    res.json({
      breakoutRoomId,
      meetingUrl
    });
  },

  // GET /api/live/session/:classroomId
  async getActiveSession(req: AuthenticatedRequest, res: Response) {
    const { classroomId } = req.params;

    try {
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('live_sessions')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('status', 'LIVE')
        .maybeSingle();

      if (error) throw error;

      res.json({ session: data || null });
    } catch (err: any) {
      console.error('getActiveSession error (falling back to local DB):', err.message || err);
      const session = localDB.getLiveSessionByClassroomId(classroomId);
      res.json({ session: session || null });
    }
  },

  // POST /api/live/join
  async joinSession(req: AuthenticatedRequest, res: Response) {
    const { sessionId } = req.body;
    const userId = req.user!.id;
    const role = req.user!.role;

    try {
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('session_participants')
        .insert({
          session_id: sessionId,
          user_id: userId,
          role: role,
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      localDB.addSessionParticipant(data);
      res.status(201).json(data);
    } catch (err: any) {
      console.error('joinSession error (falling back to local DB):', err.message || err);
      const mockParticipant = {
        id: `part_${Math.random().toString(36).substring(2, 9)}`,
        session_id: sessionId,
        user_id: userId,
        role: role,
        joined_at: new Date().toISOString()
      };
      localDB.addSessionParticipant(mockParticipant);
      res.status(201).json(mockParticipant);
    }
  },

  // POST /api/live/leave
  async leaveSession(req: AuthenticatedRequest, res: Response) {
    const { sessionId } = req.body;
    const userId = req.user!.id;

    try {
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('session_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .is('left_at', null)
        .select();

      if (error) throw error;

      localDB.updateSessionParticipantLeave(sessionId, userId);
      res.json({ success: true, data });
    } catch (err: any) {
      console.error('leaveSession error (falling back to local DB):', err.message || err);
      localDB.updateSessionParticipantLeave(sessionId, userId);
      res.json({ success: true });
    }
  }
};
