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

      // Fetch the classroom/course ID associated with the session
      let session = localDB.getLiveSessionById(sessionId);
      if (!session) {
        const { data: sessData, error: sessErr } = await userClient
          .from('live_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
        if (sessErr) throw sessErr;
        session = sessData;
      }

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const classroomId = session.classroom_id;

      // Enforce student enrollment
      if (role === 'student') {
        let isEnrolled = false;
        try {
          const { data: enroll } = await userClient
            .from('enrollments')
            .select('*')
            .eq('course_id', classroomId)
            .eq('student_id', userId)
            .maybeSingle();
          if (enroll) {
            isEnrolled = true;
          }
        } catch (e) {
          // ignore
        }

        if (!isEnrolled) {
          isEnrolled = localDB.getEnrollments().some(
            e => e.course_id === classroomId && e.student_id === userId
          );
        }

        if (!isEnrolled) {
          return res.status(403).json({ error: 'Access denied. You are not enrolled in this course.' });
        }
      }

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

      // --- Real-Time Attendance Update (Present on Join) ---
      if (role === 'student') {
        const dateStr = new Date().toISOString().split('T')[0];
        const existingLocal = localDB.getAttendance().find(
          a => a.student_id === userId && a.class_id === sessionId
        );

        if (existingLocal) {
          localDB.updateAttendance(existingLocal.id, { status: 'present', marked_at: new Date().toISOString() });
        } else {
          localDB.addAttendance({
            id: `att_${Math.random().toString(36).substring(2, 9)}`,
            student_id: userId,
            course_id: classroomId,
            class_id: sessionId,
            date: dateStr,
            status: 'present',
            marked_at: new Date().toISOString()
          });
        }
        
        try {
          const { data: existingAtt } = await userClient
            .from('attendance')
            .select('id')
            .eq('student_id', userId)
            .eq('class_id', sessionId)
            .maybeSingle();

          if (existingAtt) {
            await userClient
              .from('attendance')
              .update({ status: 'present', marked_at: new Date().toISOString() })
              .eq('id', existingAtt.id);
          } else {
            await userClient
              .from('attendance')
              .insert({
                student_id: userId,
                course_id: classroomId,
                class_id: sessionId,
                date: dateStr,
                status: 'present',
                marked_at: new Date().toISOString()
              });
          }
        } catch (e) {
          // ignore
        }
      }
      
      res.status(201).json(data);
    } catch (err: any) {
      console.error('joinSession error (falling back to local DB):', err.message || err);

      // Secondary check on localDB during fallback
      let session = localDB.getLiveSessionById(sessionId);
      if (session && role === 'student') {
        const classroomId = session.classroom_id;
        const isEnrolled = localDB.getEnrollments().some(
          e => e.course_id === classroomId && e.student_id === userId
        );
        if (!isEnrolled) {
          return res.status(403).json({ error: 'Access denied. You are not enrolled in this course.' });
        }
        
        // --- Real-Time Attendance Update (Present on Join) ---
        const dateStr = new Date().toISOString().split('T')[0];
        const existingLocal = localDB.getAttendance().find(
          a => a.student_id === userId && a.class_id === sessionId
        );

        if (existingLocal) {
          localDB.updateAttendance(existingLocal.id, { status: 'present', marked_at: new Date().toISOString() });
        } else {
          localDB.addAttendance({
            id: `att_${Math.random().toString(36).substring(2, 9)}`,
            student_id: userId,
            course_id: classroomId,
            class_id: sessionId,
            date: dateStr,
            status: 'present',
            marked_at: new Date().toISOString()
          });
        }
      }

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

  // Shared stay duration and attendance calculator
  async processParticipantLeave(sessionId: string, userId: string, token: string) {
    try {
      const userClient = getSupabaseForUser(token || 'mock-bypass-token');
      const leftAt = new Date().toISOString();

      try {
        await userClient
          .from('session_participants')
          .update({ left_at: leftAt })
          .eq('session_id', sessionId)
          .eq('user_id', userId)
          .is('left_at', null);
      } catch (err) {
        // ignore
      }

      localDB.updateSessionParticipantLeave(sessionId, userId);

      // Fetch the live session metadata
      let session = localDB.getLiveSessionById(sessionId);
      if (!session) {
        try {
          const { data } = await userClient
            .from('live_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();
          session = data;
        } catch (err) {
          // ignore
        }
      }

      if (!session) return;
      const classroomId = session.classroom_id;

      // Fetch all participant segments for this student in this session
      let segments: any[] = [];
      try {
        const { data } = await userClient
          .from('session_participants')
          .select('*')
          .eq('session_id', sessionId)
          .eq('user_id', userId);
        if (data) segments = data;
      } catch (err) {
        // ignore
      }

      if (segments.length === 0) {
        segments = localDB.getSessionParticipants(sessionId).filter(p => p.user_id === userId);
      }

      // Calculate connection stay duration in seconds
      let totalStaySec = 0;
      segments.forEach(seg => {
        const joinTime = new Date(seg.joined_at).getTime();
        const leaveTime = seg.left_at ? new Date(seg.left_at).getTime() : Date.now();
        totalStaySec += Math.max(0, Math.floor((leaveTime - joinTime) / 1000));
      });

      // Configurable stays (default 10 mins = 600s)
      const minRequiredSec = Number(process.env.MIN_REQUIRED_DURATION_SEC) || 600;
      let status = 'partial';
      if (totalStaySec >= minRequiredSec) {
        status = 'present';
      } else if (totalStaySec === 0) {
        status = 'absent';
      }

      const dateStr = new Date().toISOString().split('T')[0];

      // Upsert into Supabase attendance table
      try {
        const { data: existing } = await userClient
          .from('attendance')
          .select('id')
          .eq('student_id', userId)
          .eq('class_id', sessionId)
          .maybeSingle();

        if (existing) {
          await userClient
            .from('attendance')
            .update({ status, marked_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          await userClient
            .from('attendance')
            .insert({
              student_id: userId,
              course_id: classroomId,
              class_id: sessionId,
              date: dateStr,
              status,
              marked_at: new Date().toISOString()
            });
        }
      } catch (err) {
        // ignore
      }

      // Upsert into localDB fallback
      const existingLocal = localDB.getAttendance().find(
        a => a.student_id === userId && a.class_id === sessionId
      );

      if (existingLocal) {
        localDB.updateAttendance(existingLocal.id, { status, marked_at: new Date().toISOString() });
      } else {
        localDB.addAttendance({
          id: `att_${Math.random().toString(36).substring(2, 9)}`,
          student_id: userId,
          course_id: classroomId,
          class_id: sessionId,
          date: dateStr,
          status,
          marked_at: new Date().toISOString()
        });
      }

      console.log(`[Attendance] Stay computed for student ${userId}: ${totalStaySec}s (required: ${minRequiredSec}s). Status: ${status}`);
    } catch (err: any) {
      console.error('processParticipantLeave error:', err.message || err);
    }
  },

  // POST /api/live/leave
  async leaveSession(req: AuthenticatedRequest, res: Response) {
    const { sessionId } = req.body;
    const userId = req.user!.id;

    try {
      await liveController.processParticipantLeave(sessionId, userId, req.user!.token);
      res.json({ success: true });
    } catch (err: any) {
      console.error('leaveSession endpoint error:', err.message || err);
      res.status(400).json({ error: err.message || 'Failed to process leave' });
    }
  },

  // GET /api/live/classroom/:classroomId/assignments
  async getClassroomAssignments(req: AuthenticatedRequest, res: Response) {
    const { classroomId } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const { data, error } = await userClient
        .from('assignments')
        .select('*')
        .eq('course_id', classroomId);

      if (error) throw error;

      let submissions: any[] = [];
      if (role === 'student') {
        const { data: subsData } = await userClient
          .from('submissions')
          .select('*')
          .eq('student_id', userId);
        if (subsData) submissions = subsData;
      } else {
        const asgIds = (data || []).map(a => a.id);
        if (asgIds.length > 0) {
          const { data: subsData } = await userClient
            .from('submissions')
            .select('*')
            .in('assignment_id', asgIds);
          if (subsData) submissions = subsData;
        }
      }

      const formatted = (data || []).map(a => {
        let sub = null;
        if (role === 'student') {
          sub = submissions.find(s => s.assignment_id === a.id);
        } else {
          sub = submissions.filter(s => s.assignment_id === a.id);
        }
        return {
          id: a.id,
          course_id: a.course_id,
          teacher_id: a.teacher_id,
          title: a.title,
          description: a.description,
          due_date: a.due_date,
          max_grade: a.max_grade,
          created_at: a.created_at,
          submission: role === 'student' ? sub : undefined,
          submissionsCount: role === 'teacher' ? (sub ? (sub as any[]).length : 0) : undefined
        };
      });

      res.json(formatted);
    } catch (err: any) {
      console.warn('getClassroomAssignments error (falling back to local DB):', err.message || err);
      const assignments = localDB.getAssignmentsByCourseId(classroomId);
      
      let submissions: any[] = [];
      if (role === 'student') {
        submissions = localDB.getSubmissions().filter(s => s.student_id === userId);
      } else {
        submissions = localDB.getSubmissions();
      }

      const formatted = assignments.map(a => {
        let sub = null;
        if (role === 'student') {
          sub = submissions.find(s => s.assignment_id === a.id);
        } else {
          sub = submissions.filter(s => s.assignment_id === a.id);
        }
        return {
          id: a.id,
          course_id: a.course_id,
          teacher_id: a.teacher_id,
          title: a.title,
          description: a.description,
          due_date: a.due_date,
          max_grade: a.max_grade,
          created_at: a.created_at,
          submission: role === 'student' ? sub : undefined,
          submissionsCount: role === 'teacher' ? (sub ? (sub as any[]).length : 0) : undefined
        };
      });

      res.json(formatted);
    }
  },

  // POST /api/live/classroom/:classroomId/assignments
  async createClassroomAssignment(req: AuthenticatedRequest, res: Response) {
    const { classroomId } = req.params;
    const { title, description, dueDate, maxGrade } = req.body;
    const userId = req.user!.id;

    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const { data, error } = await userClient
        .from('assignments')
        .insert({
          course_id: classroomId,
          teacher_id: userId,
          title,
          description,
          due_date: dueDate,
          max_grade: maxGrade || 100
        })
        .select()
        .single();

      if (error) throw error;

      localDB.addAssignment(data);
      res.status(201).json(data);
    } catch (err: any) {
      console.warn('createClassroomAssignment error (falling back to local DB):', err.message || err);
      const mockAsg = {
        id: `asg_${Math.random().toString(36).substring(2, 9)}`,
        course_id: classroomId,
        teacher_id: userId,
        title,
        description,
        due_date: dueDate,
        max_grade: maxGrade || 100,
        created_at: new Date().toISOString()
      };
      localDB.addAssignment(mockAsg);
      res.status(201).json(mockAsg);
    }
  },

  // GET /api/live/assignments/:assignmentId/submissions
  async getAssignmentSubmissions(req: AuthenticatedRequest, res: Response) {
    const { assignmentId } = req.params;

    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const { data, error } = await userClient
        .from('submissions')
        .select(`
          *,
          user:users(id, name, role, avatar_url)
        `)
        .eq('assignment_id', assignmentId);

      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      console.warn('getAssignmentSubmissions error (falling back to local DB):', err.message || err);
      const subs = localDB.getSubmissionsByAssignmentId(assignmentId);
      const enriched = subs.map(s => {
        const localUser = localDB.getUserById(s.student_id);
        return {
          ...s,
          user: localUser ? {
            id: localUser.id,
            name: localUser.name,
            role: localUser.role,
            avatar_url: localUser.avatar || ''
          } : {
            id: s.student_id,
            name: 'Demo Student',
            role: 'student',
            avatar_url: ''
          }
        };
      });
      res.json(enriched);
    }
  },

  // POST /api/live/assignments/:assignmentId/submit
  async submitClassroomAssignment(req: AuthenticatedRequest, res: Response) {
    const { assignmentId } = req.params;
    const { text, fileUrl } = req.body;
    const userId = req.user!.id;

    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const { data, error } = await userClient
        .from('submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: userId,
          file_url: fileUrl || text || '',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      localDB.addSubmission(data);
      res.status(201).json(data);
    } catch (err: any) {
      console.warn('submitClassroomAssignment error (falling back to local DB):', err.message || err);
      const mockSub = {
        id: `sub_${Math.random().toString(36).substring(2, 9)}`,
        assignment_id: assignmentId,
        student_id: userId,
        file_url: fileUrl || text || '',
        submitted_at: new Date().toISOString()
      };
      localDB.addSubmission(mockSub);
      res.status(201).json(mockSub);
    }
  },

  // POST /api/live/submissions/:submissionId/grade
  async gradeClassroomSubmission(req: AuthenticatedRequest, res: Response) {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const { data, error } = await userClient
        .from('submissions')
        .update({
          grade: Number(grade),
          feedback
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;

      localDB.updateSubmission(submissionId, { grade: Number(grade), feedback });
      res.json(data);
    } catch (err: any) {
      console.warn('gradeClassroomSubmission error (falling back to local DB):', err.message || err);
      localDB.updateSubmission(submissionId, { grade: Number(grade), feedback });
      res.json({ success: true, grade: Number(grade), feedback });
    }
  }
};
