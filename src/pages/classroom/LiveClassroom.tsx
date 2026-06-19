import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Clipboard,
  Clock,
  Loader2,
  LogOut,
  Monitor,
  Play,
  Radio,
  ShieldCheck,
  Square,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { JitsiMeeting } from '@jitsi/react-sdk';

const classroomDb = supabase as any;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: JitsiMeetOptions) => JitsiMeetApi;
  }
}

type ClassroomRole = 'student' | 'teacher' | 'admin' | 'k12_teacher' | 'school_student';
type SessionStatus = 'LIVE' | 'ENDED';
type ViewState = 'loading' | 'ready' | 'blocked' | 'error';

interface JitsiMeetApi {
  addEventListener: (event: string, handler: (...args: any[]) => void) => void;
  dispose: () => void;
  executeCommand?: (command: string, ...args: any[]) => void;
  getNumberOfParticipants?: () => number;
}

interface JitsiMeetOptions {
  roomName: string;
  width: string;
  height: string;
  parentNode: HTMLElement;
  userInfo: {
    displayName: string;
    email?: string;
  };
  configOverwrite: Record<string, unknown>;
  interfaceConfigOverwrite: Record<string, unknown>;
}

interface CourseRecord {
  id: string;
  title: string | null;
  instructor_id: string | null;
}

interface ProfileRecord {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  grade_level?: string | null;
}

interface LiveSession {
  id: string;
  course_id: string;
  host_id: string | null;
  meeting_room_id: string;
  meeting_url: string | null;
  status: SessionStatus;
  started_at: string | null;
  ended_at: string | null;
  created_at: string | null;
  courses?: {
    title: string | null;
  } | null;
}

interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  role: string | null;
  joined_at: string | null;
  left_at: string | null;
}

const JITSI_SCRIPT_ID = 'jitsi-external-api';
const JITSI_SCRIPT_SRC = 'https://meet.jit.si/external_api.js';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isCourseId(value?: string): value is string {
  return Boolean(value && UUID_PATTERN.test(value));
}

function getRoomName(courseId: string) {
  return `scholarhub_${courseId.replace(/[^a-zA-Z0-9]/g, '')}`;
}

function normalizeRole(profile: ProfileRecord | null, fallbackRole?: string): ClassroomRole {
  const role = (profile?.role || fallbackRole || 'student').toLowerCase();
  if (role === 'admin') return 'admin';
  if (role === 'k12_teacher') return 'k12_teacher';
  if (role === 'school_student') return 'school_student';
  if (role === 'teacher') return 'teacher';
  return 'student';
}

function isModerator(role: ClassroomRole) {
  return role === 'teacher' || role === 'admin' || role === 'k12_teacher';
}

function formatDuration(startedAt?: string | null, endedAt?: string | null) {
  if (!startedAt) return '0m';
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const totalMinutes = Math.max(0, Math.floor((end - start) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// Removed manual Jitsi script loader as we now use @jitsi/react-sdk

export function LiveClassroom({ courseId: propCourseId }: { courseId?: string }) {
  const { courseId: paramCourseId, id: paramId } = useParams();
  const activeId = propCourseId || paramCourseId || paramId;
  console.log("Classroom received ID:", activeId);

  const navigate = useNavigate();
  const { user } = useAuth();

  const courseId = activeId;
  const jitsiApiRef = useRef<JitsiMeetApi | null>(null);
  const participantRowRef = useRef<string | null>(null);

  const [viewState, setViewState] = useState<ViewState>('loading');
  const [message, setMessage] = useState('Loading classroom');
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [adminSessions, setAdminSessions] = useState<LiveSession[]>([]);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [jitsiReady, setJitsiReady] = useState(false);
  const [joined, setJoined] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [durationNow, setDurationNow] = useState(Date.now());

  const role = useMemo(() => normalizeRole(profile, user?.role), [profile, user?.role]);
  const canModerate = isModerator(role);
  const displayName = profile?.full_name || user?.name || user?.email?.split('@')[0] || 'ScholarHub User';
  const isAdmin = role === 'admin';
  const selectedSession = activeSession;
  const hasActiveCourseSession = Boolean(activeSession?.status === 'LIVE');
  const activeParticipantCount = Math.max(
    participantCount,
    participants.filter((participant) => !participant.left_at).length,
  );

  const loadParticipants = useCallback(async (sessionId: string) => {
    const { data, error } = await supabase
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Failed to load participants:', error);
      return;
    }

    setParticipants((data || []) as SessionParticipant[]);
  }, []);

  const loadActiveSessions = useCallback(async () => {
    let query = supabase
      .from('live_sessions')
      .select('*, courses:course_id(title)')
      .eq('status', 'LIVE')
      .order('started_at', { ascending: false });

    if (courseId) {
      if (isCourseId(courseId)) {
        query = query.eq('course_id', courseId);
      } else {
        query = query.is('course_id', null);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    const sessions = (data || []) as LiveSession[];
    if (isAdmin) setAdminSessions(sessions);
    if (courseId) setActiveSession(sessions[0] || null);
  }, [courseId, isAdmin]);

  const verifyAccess = useCallback(async () => {
    if (!user) {
      setViewState('blocked');
      setMessage('Please sign in to open the live classroom.');
      return;
    }

    setViewState('loading');
    setMessage('Loading classroom');

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id,email,full_name,avatar_url,role,grade_level')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    const resolvedProfile = profileData as ProfileRecord | null;
    const resolvedRole = normalizeRole(resolvedProfile, user.role);
    setProfile(resolvedProfile);

    if (!courseId) {
      if (resolvedRole === 'admin') {
        await loadActiveSessions();
        setViewState('ready');
        setMessage('');
        return;
      }

      // setViewState('blocked');
      // setMessage('This classroom link is not connected to a valid course.');
      // return;
    }

    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id,title,instructor_id')
      .eq('id', isCourseId(courseId) ? courseId : '00000000-0000-0000-0000-000000000000')
      .maybeSingle();

    if (courseError) {
      console.error("Course fetch error:", courseError);
    }
    if (!courseData) {
      // setViewState('blocked');
      // setMessage('This course could not be found.');
      // return;
    } else {
      setCourse(courseData as CourseRecord);
    }

    if (isModerator(resolvedRole) || (courseData as CourseRecord)?.instructor_id === user.id) {
      await loadActiveSessions();
      setViewState('ready');
      setMessage('');
      return;
    }

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', isCourseId(courseId) ? courseId : '00000000-0000-0000-0000-000000000000')
      .eq('student_id', user.id)
      .maybeSingle();

    if (enrollmentError) {
      console.error("Enrollment error:", enrollmentError);
    }

    if (!enrollment) {
      // setViewState('blocked');
      // setMessage('You need to be enrolled in this course before joining its live classroom.');
      // return;
    }

    await loadActiveSessions();
    setViewState('ready');
    setMessage('');
  }, [courseId, loadActiveSessions, user]);

  useEffect(() => {
    verifyAccess().catch((error) => {
      console.error('Classroom load failed:', error);
      setViewState('error');
      setMessage(error?.message || 'Unable to load the live classroom.');
      toast.error('Unable to load the live classroom.');
    });
  }, [verifyAccess]);

  useEffect(() => {
    if (viewState !== 'ready') return;

    const channel = supabase
      .channel(courseId ? `live-sessions-${courseId}` : 'live-sessions-admin')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_sessions',
          ...(isCourseId(courseId) ? { filter: `course_id=eq.${courseId}` } : courseId === 'general' ? { filter: 'course_id=is.null' } : {}),
        },
        () => {
          loadActiveSessions().catch((error) => {
            console.error('Realtime refresh failed:', error);
            toast.error('Live session update failed.');
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId, loadActiveSessions, viewState]);

  useEffect(() => {
    if (!selectedSession?.id) {
      setParticipants([]);
      return;
    }

    loadParticipants(selectedSession.id);

    const channel = supabase
      .channel(`session-participants-${selectedSession.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${selectedSession.id}`,
        },
        () => loadParticipants(selectedSession.id),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadParticipants, selectedSession?.id]);

  useEffect(() => {
    const timer = window.setInterval(() => setDurationNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const disposeJitsi = useCallback(() => {
    if (!jitsiApiRef.current) return;

    try {
      jitsiApiRef.current.dispose();
    } catch (error) {
      console.error('Failed to dispose Jitsi:', error);
    }

    jitsiApiRef.current = null;
    setJitsiReady(false);
    setParticipantCount(0);
  }, []);

  const markParticipantLeft = useCallback(async () => {
    if (!participantRowRef.current) return;

    const rowId = participantRowRef.current;
    participantRowRef.current = null;

    const { error } = await classroomDb
      .from('session_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('id', rowId);

    if (error) console.error('Failed to mark participant left:', error);
  }, []);

  const leaveClassroom = useCallback(
    async (navigateAway = true) => {
      await markParticipantLeft();
      disposeJitsi();
      setJoined(false);

      if (navigateAway) {
        navigate(courseId ? `/courses/${courseId}` : '/courses');
      }
    },
    [courseId, disposeJitsi, markParticipantLeft, navigate],
  );

  useEffect(() => {
    if (!joined || !selectedSession) return;
    return () => {
      disposeJitsi();
    };
  }, [joined, selectedSession, disposeJitsi]);

  const startClass = async () => {
    if (!courseId || !user) return;
    setBusyAction('start');
    setMessage('Starting session');

    try {
      let checkQuery = supabase.from('live_sessions').select('*').eq('status', 'LIVE');
      if (isCourseId(courseId)) {
        checkQuery = checkQuery.eq('course_id', courseId);
      } else {
        checkQuery = checkQuery.is('course_id', null);
      }
      
      const { data: existing, error: existingError } = await checkQuery.maybeSingle();

      if (existingError) throw existingError;

      const session = existing as LiveSession | null;
      if (session) {
        setActiveSession(session);
        setJoined(true);
        toast.success('Live class is already running.');
        return;
      }

      const roomName = getRoomName(courseId);
      const { data, error } = await classroomDb
        .from('live_sessions')
        .insert({
          course_id: isCourseId(courseId) ? courseId : null,
          host_id: user.id,
          meeting_room_id: roomName,
          meeting_url: `https://meet.jit.si/${roomName}`,
          status: 'LIVE',
          started_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;

      setActiveSession(data as LiveSession);
      setJoined(true);
      toast.success('Live class started.');
    } catch (error: any) {
      console.error('Failed to start class:', error);
      toast.error(error?.message || 'Failed to start live class.');
    } finally {
      setBusyAction(null);
      setMessage('');
    }
  };

  const joinSession = (session: LiveSession) => {
    setActiveSession(session);
    setJoined(true);
  };

  const endSession = async (session: LiveSession) => {
    if (!canModerate) return;
    setBusyAction(`end-${session.id}`);

    try {
      const { error } = await classroomDb
        .from('live_sessions')
        .update({
          status: 'ENDED',
          ended_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (error) throw error;

      if (activeSession?.id === session.id) {
        await leaveClassroom(false);
        setActiveSession(null);
      }

      toast.success('Live session ended.');
      await loadActiveSessions();
    } catch (error: any) {
      console.error('Failed to end session:', error);
      toast.error(error?.message || 'Failed to end live session.');
    } finally {
      setBusyAction(null);
    }
  };

  const copyJoinLink = async () => {
    if (!selectedSession) return;

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/classroom/${selectedSession.course_id}`);
      toast.success('Join link copied.');
    } catch {
      toast.error('Unable to copy join link.');
    }
  };

  const headerTitle = course?.title || selectedSession?.courses?.title || 'Live Classroom';
  const canStartCourseSession = Boolean(courseId && canModerate);
  const statusText = joined
    ? jitsiReady
      ? 'Connected'
      : 'Connecting'
    : hasActiveCourseSession
      ? 'Live Now'
      : 'No Active Session';

  if (viewState === 'loading') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-neutral-600 dark:text-neutral-300">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-sm font-semibold">{message}</p>
        </div>
      </div>
    );
  }

  if (viewState === 'blocked' || viewState === 'error') {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl border border-red-200 dark:border-red-500/20 bg-white dark:bg-neutral-900 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
        <h1 className="text-lg font-bold text-neutral-950 dark:text-white mb-2">Classroom unavailable</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-350 mb-6">{message}</p>
        <Link to="/courses" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold">
          <ArrowLeft size={16} />
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-white">
      <header className="border-b border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-925">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <button
              onClick={() => leaveClassroom(true)}
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-purple-600 transition-colors mb-2"
            >
              <ArrowLeft size={15} />
              Courses
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-black truncate">{headerTitle}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-300">
                <Radio size={13} />
                {statusText}
              </span>
              {canModerate && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck size={13} />
                  Moderator
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold">
              <Users size={15} className="text-purple-500" />
              {activeParticipantCount} participants
            </span>
            {selectedSession && (
              <button
                onClick={copyJoinLink}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-850"
              >
                <Clipboard size={15} />
                Copy Link
              </button>
            )}
            {joined && (
              <button
                onClick={() => leaveClassroom(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold"
              >
                <LogOut size={15} />
                Leave
              </button>
            )}
            {selectedSession && canModerate && (
              <button
                onClick={() => endSession(selectedSession)}
                disabled={busyAction === `end-${selectedSession.id}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold disabled:opacity-60"
              >
                {busyAction === `end-${selectedSession.id}` ? <Loader2 size={15} className="animate-spin" /> : <Square size={14} />}
                End
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
        <section className="min-h-[58vh] xl:min-h-[calc(100vh-11rem)] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-850 bg-neutral-950 relative">
          {!joined && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-neutral-950 text-white">
              <div className="max-w-md text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h2 className="text-xl font-black mb-2">
                  {hasActiveCourseSession ? 'Live class is running' : 'No live session is active'}
                </h2>
                <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                  {hasActiveCourseSession
                    ? 'Join the Jitsi room connected to this course. Students, teachers, and admins use the same Supabase session.'
                    : canStartCourseSession
                      ? 'Start a live class to create the Supabase session and open the Jitsi room for enrolled students.'
                      : 'When your teacher starts a live class, this screen will update automatically.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {selectedSession && (
                    <button
                      onClick={() => joinSession(selectedSession)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700"
                    >
                      <Video size={18} />
                      Join Class
                    </button>
                  )}
                  {!selectedSession && canStartCourseSession && (
                    <button
                      onClick={startClass}
                      disabled={busyAction === 'start'}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-60"
                    >
                      {busyAction === 'start' ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                      Start Live Class
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {joined && selectedSession && (
            <div className="w-full h-full min-h-[600px] xl:h-[calc(100vh-11rem)] relative">
              <JitsiMeeting
                domain="meet.jit.si"
                roomName={(selectedSession.meeting_room_id || getRoomName(selectedSession.course_id)).replace(/\s+/g, '_')}
                spinner={() => (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-950 text-white w-full h-full min-h-[600px]">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-400 mb-4" />
                    <p className="text-sm font-semibold">Connecting to meeting...</p>
                  </div>
                )}
                configOverwrite={{
                  prejoinPageEnabled: false,
                  disableDeepLinking: true,
                  startWithAudioMuted: !canModerate,
                  startWithVideoMuted: false,
                  disableInviteFunctions: true,
                  hideConferenceSubject: false,
                  enableWelcomePage: false,
                  readOnlyName: true,
                }}
                interfaceConfigOverwrite={{
                  SHOW_JITSI_WATERMARK: false,
                  SHOW_WATERMARK_FOR_GUESTS: false,
                  SHOW_BRAND_WATERMARK: false,
                  SHOW_POWERED_BY: false,
                  DISPLAY_WELCOME_PAGE_CONTENT: false,
                  DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
                  MOBILE_APP_PROMO: false,
                  HIDE_INVITE_MORE_HEADER: true,
                  TOOLBAR_BUTTONS: [
                    'microphone',
                    'camera',
                    'desktop',
                    'chat',
                    'participants-pane',
                    'raisehand',
                    'tileview',
                    'settings',
                    'recording',
                    'fullscreen',
                    'hangup',
                  ],
                }}
                userInfo={{
                  displayName,
                  email: profile?.email || user?.email || undefined,
                }}
                getIFrameRef={(iframeRef) => {
                  iframeRef.style.height = '100%';
                  iframeRef.style.width = '100%';
                }}
                onApiReady={(externalApi) => {
                  jitsiApiRef.current = externalApi as any;
                  setJitsiReady(true);
                  setMessage('');
                  setParticipantCount(externalApi.getNumberOfParticipants?.() || 1);

                  externalApi.addEventListener('videoConferenceJoined', async () => {
                    const { data, error } = await classroomDb
                      .from('session_participants')
                      .insert({
                        session_id: selectedSession.id,
                        user_id: user?.id,
                        role: canModerate ? 'host' : 'participant',
                      })
                      .select('id')
                      .single();

                    if (error) {
                      console.error('Participant tracking failed:', error);
                      return;
                    }

                    participantRowRef.current = data.id;
                    loadParticipants(selectedSession.id);
                  });

                  externalApi.addEventListener('participantJoined', () => {
                    setParticipantCount(externalApi.getNumberOfParticipants?.() || 0);
                  });

                  externalApi.addEventListener('participantLeft', () => {
                    setParticipantCount(externalApi.getNumberOfParticipants?.() || 0);
                  });

                  externalApi.addEventListener('videoConferenceLeft', () => {
                    leaveClassroom(false);
                  });
                }}
              />
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Monitor size={17} className="text-purple-500" />
              <h2 className="text-sm font-black">Session Information</h2>
            </div>
            <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-350">
              <div className="flex justify-between gap-3">
                <span>Status</span>
                <span className="font-bold text-neutral-950 dark:text-white">{statusText}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Role</span>
                <span className="font-bold text-neutral-950 dark:text-white capitalize">{role.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Room</span>
                <span className="font-mono font-bold text-neutral-950 dark:text-white truncate">{selectedSession?.meeting_room_id || '-'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Duration</span>
                <span className="font-bold text-neutral-950 dark:text-white">
                  {selectedSession ? formatDuration(selectedSession.started_at, selectedSession.ended_at || (durationNow ? null : null)) : '0m'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 p-4">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck size={17} className="text-emerald-500" />
              <h2 className="text-sm font-black">Participants</h2>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {participants.filter((participant) => !participant.left_at).length === 0 ? (
                <p className="text-xs text-neutral-500">No participants have joined yet.</p>
              ) : (
                participants
                  .filter((participant) => !participant.left_at)
                  .map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{participant.user_id === user?.id ? displayName : participant.user_id.slice(0, 8)}</p>
                        <p className="text-[10px] text-neutral-500 capitalize">{participant.role || 'participant'}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                  ))
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={17} className="text-blue-500" />
                <h2 className="text-sm font-black">Admin Monitor</h2>
              </div>
              <div className="space-y-2">
                {adminSessions.length === 0 ? (
                  <p className="text-xs text-neutral-500">No active live sessions.</p>
                ) : (
                  adminSessions.map((session) => (
                    <div key={session.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                      <p className="text-xs font-bold text-neutral-950 dark:text-white truncate">{session.courses?.title || session.course_id}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => joinSession(session)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 text-white px-2 py-1.5 text-[10px] font-bold"
                        >
                          <Video size={12} />
                          Join
                        </button>
                        <button
                          onClick={() => endSession(session)}
                          disabled={busyAction === `end-${session.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 text-white px-2 py-1.5 text-[10px] font-bold disabled:opacity-60"
                        >
                          <Square size={11} />
                          End
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 p-4 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              <Clock size={15} />
              Realtime enabled
            </div>
            Active sessions are loaded from Supabase and update automatically when a teacher starts or ends class.
          </div>
        </aside>
      </main>
    </div>
  );
}
