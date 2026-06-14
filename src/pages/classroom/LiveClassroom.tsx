import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, MessageSquare, MonitorPlay,
  Users, Grid, Phone, Disc, PenLine,
  Eraser, Minus, X, Send, Moon, Sun
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const CHAT_MSGS: any[] = [];



function Whiteboard({ socket, roomId }: { socket: any; roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'line'>('pen');
  const [color, setColor] = useState('#2563EB');
  const [size] = useState(3);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const drawSegment = (
    x0: number, y0: number, x1: number, y1: number,
    strokeColor: string, strokeSize: number, strokeTool: string
  ) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.lineWidth = strokeTool === 'eraser' ? strokeSize * 5 : strokeSize;
    
    // Use destination-out to actually remove pixels instead of painting over them
    if (strokeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokeColor;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    
    // Reset composite operation to default
    ctx.globalCompositeOperation = 'source-over';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const pos = getPos(e);
    if (lastPos.current) {
      drawSegment(lastPos.current.x, lastPos.current.y, pos.x, pos.y, color, size, tool);
      if (socket) {
        socket.emit('draw', {
          roomId,
          drawData: {
            x0: lastPos.current.x,
            y0: lastPos.current.y,
            x1: pos.x,
            y1: pos.y,
            color,
            size,
            tool
          }
        });
      }
    }
    lastPos.current = pos;
  };

  const clearCanvas = (emit = true) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (emit && socket) {
      socket.emit('draw', {
        roomId,
        drawData: { tool: 'clear' }
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRemoteDraw = (drawData: any) => {
      if (drawData.tool === 'clear') {
        clearCanvas(false);
      } else {
        drawSegment(
          drawData.x0, drawData.y0, drawData.x1, drawData.y1,
          drawData.color, drawData.size, drawData.tool
        );
      }
    };

    socket.on('draw', handleRemoteDraw);
    return () => {
      socket.off('draw', handleRemoteDraw);
    };
  }, [socket]);

  const COLORS = ['#2563EB', '#3B82F6', '#4edea3', '#F59E0B', '#EF4444', '#ffffff'];

  return (
    <div className="flex flex-col h-full">
      {/* Tools */}
      <div className="flex items-center gap-2 p-2 border-b border-outline-variant/10">
        <button onClick={() => setTool('pen')} className={`p-2 rounded-lg transition-all ${tool === 'pen' ? 'bg-purple-500/30 text-purple-300' : 'text-on-surface-variant hover:bg-on-surface/5'}`}><PenLine size={16} /></button>
        <button onClick={() => setTool('line')} className={`p-2 rounded-lg transition-all ${tool === 'line' ? 'bg-purple-500/30 text-purple-300' : 'text-on-surface-variant hover:bg-on-surface/5'}`}><Minus size={16} /></button>
        <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg transition-all ${tool === 'eraser' ? 'bg-purple-500/30 text-purple-300' : 'text-on-surface-variant hover:bg-on-surface/5'}`}><Eraser size={16} /></button>
        <div className="w-px h-5 bg-on-surface/10 mx-1" />
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} className={`w-5 h-5 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent' : ''}`} style={{ background: c }} />
        ))}
        <div className="w-px h-5 bg-on-surface/10 mx-1" />
        <button onClick={() => clearCanvas(true)} className="p-2 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-all"><Eraser size={16} /></button>
      </div>
      <canvas
        ref={canvasRef}
        className="flex-1 cursor-crosshair bg-neutral-100/10 dark:bg-neutral-900/30"
        onMouseDown={e => { setIsDrawing(true); lastPos.current = getPos(e); }}
        onMouseMove={draw}
        onMouseUp={() => { setIsDrawing(false); lastPos.current = null; }}
        onMouseLeave={() => { setIsDrawing(false); lastPos.current = null; }}
      />
    </div>
  );
}

export function LiveClassroom() {
  const { toggle } = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [view, setView] = useState<'grid' | 'whiteboard'>('grid');
  const [chatOpen, setChatOpen] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [recording, setRecording] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState(CHAT_MSGS);
  const [breakoutOpen, setBreakoutOpen] = useState(false);
  const [raisedHands, setRaisedHands] = useState<{ userId: string; userName: string }[]>([]);

  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [roomName, setRoomName] = useState<string | null>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  // Lobby UI States
  const [joined, setJoined] = useState(false);
  const [countdown, setCountdown] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // New Live Classroom States
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [breakoutRooms, setBreakoutRooms] = useState<any[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'participants' | 'assignments'>('chat');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  
  // Assignment creation form states (for teachers)
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgDesc, setNewAsgDesc] = useState('');
  const [newAsgDueDate, setNewAsgDueDate] = useState('');
  const [newAsgMaxGrade, setNewAsgMaxGrade] = useState(100);

  // Student submission form states
  const [subText, setSubText] = useState('');
  const [subFileUrl, setSubFileUrl] = useState('');

  // Teacher grading form states
  const [gradeValue, setGradeValue] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const loadAssignments = async () => {
    if (!id) return;
    try {
      const data = await apiClient.get<any[]>(`/live/classroom/${id}/assignments`);
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    }
  };

  const loadSubmissions = async (assignmentId: string) => {
    try {
      const data = await apiClient.get<any[]>(`/live/assignments/${assignmentId}/submissions`);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    }
  };

  useEffect(() => {
    if (joined) {
      loadAssignments();
    }
  }, [joined]);

  useEffect(() => {
    if (sidebarTab === 'assignments') {
      loadAssignments();
      setSelectedAssignmentId(null);
    }
  }, [sidebarTab]);
  const [classroom, setClassroom] = useState<any | null>(null);
  const [currentBreakout, setCurrentBreakout] = useState<string | null>(null);

  // Refs to prevent stale closures
  const activeSessionRef = useRef<any>(null);
  const roomNameRef = useRef<string | null>(null);
  const userRef = useRef<any>(null);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  useEffect(() => {
    roomNameRef.current = roomName;
  }, [roomName]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Lobby countdown simulation (e.g. 12 minutes starting)
  useEffect(() => {
    const targetTime = Date.now() + 12 * 60 * 1000;
    const interval = setInterval(() => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setCountdown('Starting now...');
        clearInterval(interval);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch local video preview stream for the Lobby
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (!joined && !cameraOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          activeStream = stream;
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn('Local webcam preview access denied or unsupported:', err);
        });
    } else {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [joined, cameraOff]);

  const handleLeave = async () => {
    const currentSession = activeSessionRef.current;
    const currentRoomName = roomNameRef.current;

    if (currentSession) {
      try {
        await apiClient.post('/live/leave', { sessionId: currentSession.id });
      } catch (err) {
        console.error('Error leaving session:', err);
      }
    }

    if (socketRef.current && currentRoomName) {
      socketRef.current.emit('leave-conference', { roomId: currentRoomName });
    }

    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand('hangup');
      } catch (e) {}
      try {
        jitsiApiRef.current.dispose();
      } catch (e) {}
      jitsiApiRef.current = null;
    }

    navigate('/courses');
  };

  const handleEndSession = async () => {
    const currentSession = activeSessionRef.current;
    if (!currentSession) return;

    try {
      await apiClient.post('/live/end', { sessionId: currentSession.id });
      if (socketRef.current) {
        socketRef.current.emit('session-status-update', {
          roomId: id,
          status: 'ENDED',
          session: null
        });
      }
      toast.success('Live class session ended successfully.');
    } catch (err) {
      console.error('Error ending session:', err);
      toast.error('Failed to end live class.');
    }

    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand('hangup');
      } catch (e) {}
      try {
        jitsiApiRef.current.dispose();
      } catch (e) {}
      jitsiApiRef.current = null;
    }

    navigate('/courses');
  };

  // Setup Socket.IO connection and listeners
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    if (id && user) {
      socket.emit('join-room', {
        roomId: id,
        userId: user.id,
        userName: user.name,
        role: user.role,
        token: token
      });
      console.log(`[Socket] Joined room: ${id}`);
    }

    socket.on('receive-message', (message: any) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('hand-raised', ({ userId, userName }: { userId: string; userName: string }) => {
      setRaisedHands(prev => {
        if (prev.some(h => h.userId === userId)) return prev;
        return [...prev, { userId, userName }];
      });
    });

    socket.on('hand-lowered', ({ userId }: { userId: string }) => {
      setRaisedHands(prev => prev.filter(h => h.userId !== userId));
    });

    // Custom Live Conference listeners
    socket.on('participant-list-update', (list: any[]) => {
      console.log('[Socket] Participant list update:', list);
      setParticipants(list);
    });

    socket.on('participant-joined', (part: any) => {
      console.log('[Socket] Participant joined:', part);
      toast.success(`${part.userName} joined the class`);
    });

    socket.on('participant-left', (part: any) => {
      console.log('[Socket] Participant left:', part);
      toast.error(`${part.userName} left the class`);
    });

    socket.on('session-status-changed', ({ status, session }: any) => {
      console.log('[Socket] Session status changed:', status, session);
      if (status === 'LIVE' && session) {
        setActiveSession(session);
        setRoomName(session.meeting_room_id);
        toast.success('Live class has started!');
      } else if (status === 'ENDED') {
        setActiveSession(null);
        setRoomName(null);
        toast.error('The teacher has ended this live session.');
        setJoined(false);
      }
    });

    socket.on('mute-user-received', ({ userId }: { userId: string }) => {
      const currentUser = userRef.current;
      if (currentUser && userId === currentUser.id) {
        if (jitsiApiRef.current) {
          jitsiApiRef.current.isAudioMuted().then((isMuted: boolean) => {
            if (!isMuted) {
              jitsiApiRef.current.executeCommand('toggleAudio');
              toast.error('You have been muted by the host.');
            }
          });
        } else {
          setMuted(true);
          toast.error('You have been muted by the host.');
        }
      }
    });

    socket.on('kick-user-received', ({ userId }: { userId: string }) => {
      const currentUser = userRef.current;
      if (currentUser && userId === currentUser.id) {
        toast.error('You have been removed from the class by the host.');
        handleLeave();
      }
    });

    socket.on('breakout-room-created', (room: any) => {
      setBreakoutRooms(prev => {
        if (prev.some(r => r.roomName === room.roomName)) return prev;
        return [...prev, room];
      });
      toast.success(`Breakout room "${room.name}" created by host.`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  // Load Jitsi script dynamically
  useEffect(() => {
    const scriptId = 'jitsi-external-api';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      document.body.appendChild(script);
    }
    
    const handleScriptLoad = () => setJitsiLoaded(true);
    script.addEventListener('load', handleScriptLoad);
    
    if ((window as any).JitsiMeetExternalAPI) {
      setJitsiLoaded(true);
    }

    return () => {
      script.removeEventListener('load', handleScriptLoad);
    };
  }, []);

  // Fetch classroom details
  useEffect(() => {
    async function fetchClassroom() {
      try {
        const response = await apiClient.get<any>(`/classrooms/${id}`);
        setClassroom(response);
      } catch (err) {
        console.error('Error fetching classroom details:', err);
      }
    }
    if (id) {
      fetchClassroom();
    }
  }, [id]);

  // Fetch active session from backend
  useEffect(() => {
    async function fetchActiveSession() {
      try {
        const response = await apiClient.get<any>(`/live/session/${id}`);
        if (response.session) {
          setActiveSession(response.session);
          setRoomName(response.session.meeting_room_id);
        }
      } catch (err) {
        console.error('Error fetching active session:', err);
      }
    }
    if (id) {
      fetchActiveSession();
    }
  }, [id]);

  // Instantiate Jitsi Meet iframe
  useEffect(() => {
    if (!joined || !jitsiLoaded || !roomName || !jitsiContainerRef.current || jitsiApiRef.current) return;
    
    const domain = 'meet.jit.si';
    
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: user?.name || 'Guest User',
        email: user?.email || '',
      },
      configOverwrite: {
        startWithAudioMuted: muted,
        startWithVideoMuted: cameraOff,
        prejoinPageEnabled: false,
        toolbarButtons: [], // Hide Jitsi default toolbar to use our own custom control bar
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      }
    };
    
    const api = new (window as any).JitsiMeetExternalAPI(domain, options);
    jitsiApiRef.current = api;
    
    api.addEventListener('audioMuteStatusChanged', ({ muted: isMuted }: { muted: boolean }) => {
      setMuted(isMuted);
    });
    
    api.addEventListener('videoMuteStatusChanged', ({ muted: isVideoMuted }: { muted: boolean }) => {
      setCameraOff(isVideoMuted);
    });
    
    api.addEventListener('videoConferenceLeft', () => {
      handleLeave();
    });

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [joined, jitsiLoaded, roomName, user]);

  const handleStartLiveClass = async () => {
    if (user?.role !== 'teacher') return;
    try {
      const response = await apiClient.post<any>('/live/start', {
        classroomId: id,
        title: classroom?.title || 'Live Classroom Session'
      });
      const sessionData = response;
      setActiveSession(sessionData);
      setRoomName(sessionData.meeting_room_id);

      if (socketRef.current) {
        socketRef.current.emit('session-status-update', {
          roomId: id,
          status: 'LIVE',
          session: sessionData
        });
      }

      await apiClient.post('/live/join', { sessionId: sessionData.id });

      if (socketRef.current) {
        socketRef.current.emit('join-conference', {
          roomId: sessionData.meeting_room_id,
          sessionId: sessionData.id,
          userId: user.id,
          userName: user.name || 'Teacher',
          role: user.role,
          token: token
        });
      }

      setJoined(true);
      toast.success('Live class session started!');
    } catch (err) {
      console.error('Error starting live class:', err);
      toast.error('Failed to start live class.');
    }
  };

  const handleJoinLiveClass = async () => {
    if (!activeSession) {
      toast.error('No active session found. Please wait for the teacher to start.');
      return;
    }
    try {
      await apiClient.post('/live/join', { sessionId: activeSession.id });

      if (socketRef.current) {
        socketRef.current.emit('join-conference', {
          roomId: activeSession.meeting_room_id,
          sessionId: activeSession.id,
          userId: user?.id,
          userName: user?.name || 'Student',
          role: user?.role,
          token: token
        });
      }

      setJoined(true);
      toast.success('Joined live class session!');
    } catch (err) {
      console.error('Error joining live class:', err);
      toast.error('Failed to join live class.');
    }
  };

  const handleJoinBreakoutRoom = async (breakoutRoom: any) => {
    const currentRoom = roomNameRef.current;
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('leave-conference', { roomId: currentRoom });
    }

    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch (e) {}
      jitsiApiRef.current = null;
    }

    setCurrentBreakout(breakoutRoom.name);
    setRoomName(breakoutRoom.roomName);

    if (socketRef.current) {
      socketRef.current.emit('join-conference', {
        roomId: breakoutRoom.roomName,
        userId: user?.id,
        userName: user?.name || 'User',
        role: user?.role
      });
    }

    toast.success(`Joined breakout room: ${breakoutRoom.name}`);
  };

  const handleReturnToMainRoom = async () => {
    if (!activeSession) return;

    const currentRoom = roomNameRef.current;
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('leave-conference', { roomId: currentRoom });
    }

    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch (e) {}
      jitsiApiRef.current = null;
    }

    setCurrentBreakout(null);
    setRoomName(activeSession.meeting_room_id);

    if (socketRef.current) {
      socketRef.current.emit('join-conference', {
        roomId: activeSession.meeting_room_id,
        userId: user?.id,
        userName: user?.name || 'User',
        role: user?.role
      });
    }

    toast.success('Returned to main class.');
  };

  const handleCreateBreakoutRoom = async () => {
    if (user?.role !== 'teacher') return;
    const name = prompt('Enter breakout room name (e.g. Room A):');
    if (!name || !name.trim()) return;

    try {
      const response = await apiClient.post<any>('/live/create-breakout-room', {
        sessionId: activeSession?.id,
        name: name.trim()
      });

      const breakoutRoom = {
        name: name.trim(),
        roomName: response.breakoutRoomId,
        url: response.meetingUrl
      };

      setBreakoutRooms(prev => [...prev, breakoutRoom]);

      if (socketRef.current) {
        socketRef.current.emit('create-breakout-room', {
          roomId: id,
          breakoutRoom
        });
      }

      toast.success(`Breakout room "${name}" created.`);
    } catch (err) {
      console.error('Error creating breakout room:', err);
      toast.error('Failed to create breakout room.');
    }
  };

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    const newMsg = {
      sender: user?.name || 'User',
      msg: chatMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost: user?.role === 'teacher'
    };
    
    setMessages(prev => [...prev, newMsg]);
    
    if (socketRef.current && id) {
      socketRef.current.emit('send-message', { roomId: id, message: newMsg });
    }
    
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('sendChatMessage', chatMsg);
    }
    setChatMsg('');
  };

  const handleToggleMute = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
    } else {
      setMuted(m => !m);
    }
  };

  const handleToggleCamera = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
    } else {
      setCameraOff(c => !c);
    }
  };

  const handleToggleScreenShare = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleShareScreen');
    }
  };

  const handleToggleHand = () => {
    const nextHandState = !handRaised;
    setHandRaised(nextHandState);
    
    if (user && id && socketRef.current) {
      if (nextHandState) {
        socketRef.current.emit('raise-hand', {
          roomId: id,
          userId: user.id,
          userName: user.name || 'Student'
        });
        setRaisedHands(prev => {
          if (prev.some(h => h.userId === user.id)) return prev;
          return [...prev, { userId: user.id, userName: 'You' }];
        });
      } else {
        socketRef.current.emit('lower-hand', {
          roomId: id,
          userId: user.id
        });
        setRaisedHands(prev => prev.filter(h => h.userId !== user.id));
      }
    }
    
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleRaiseHand');
    }
  };

  if (!joined) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 text-on-surface">
        {/* Lobby Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-lg text-neutral-900 dark:text-neutral-50">Scholar Hub Live</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-200/50 dark:bg-neutral-800 text-neutral-500 font-mono">Room #{id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-xl border border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-all"
              aria-label="Toggle theme"
            >
              <Moon className="w-4 h-4 dark:hidden" />
              <Sun className="w-4 h-4 hidden dark:block" />
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-outline-variant/20 hover:bg-on-surface/5 transition-all"
            >
              Back to Courses
            </button>
          </div>
        </div>

        {/* Lobby Body */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl w-full items-center">
            
            {/* Left Column: Media Preview */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="aspect-video bg-neutral-900 dark:bg-neutral-950 border border-outline-variant/15 rounded-2xl relative overflow-hidden shadow-2xl flex items-center justify-center">
                {!cameraOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-neutral-500">
                    <div className="w-16 h-16 rounded-full bg-neutral-800/80 dark:bg-neutral-900/80 border border-neutral-700 flex items-center justify-center text-xl font-bold">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <p className="text-xs font-semibold">Camera is turned off</p>
                  </div>
                )}
                
                {/* Media toggles overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 z-10">
                  <button
                    onClick={() => setMuted(!muted)}
                    className={`p-3 rounded-xl transition-all ${
                      muted 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                  >
                    {muted ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  <button
                    onClick={() => setCameraOff(!cameraOff)}
                    className={`p-3 rounded-xl transition-all ${
                      cameraOff 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    aria-label={cameraOff ? "Turn camera on" : "Turn camera off"}
                  >
                    {cameraOff ? <VideoOff size={16} /> : <Video size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                Check your video and audio settings before entering the session.
              </p>
            </div>

            {/* Right Column: Classroom Info & Actions */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Live Session Lobby</span>
                  
                  {/* Status Indicator */}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ml-auto sm:ml-0 ${
                    activeSession
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {activeSession ? 'Live Now' : 'Class Offline'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 leading-tight tracking-tight">
                    {classroom?.title || 'Scholar Hub Live'}
                  </h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {classroom?.description || 'Interactive classroom session. Join to connect live with video, audio, screen-sharing, and collaborative whiteboard.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-outline-variant/10 bg-neutral-100/20 dark:bg-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-neutral-500 dark:text-neutral-400">
                    <span>Host / Educator:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{classroom?.teacher?.name || 'Course Instructor'}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-500 dark:text-neutral-400">
                    <span>Active Session Status:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {activeSession ? 'Ongoing Class' : 'No active broadcast'}
                    </span>
                  </div>
                  {countdown && (
                    <div className="flex justify-between items-center text-neutral-500 dark:text-neutral-400 border-t border-outline-variant/10 pt-2 mt-2">
                      <span>Time to session start:</span>
                      <span className="font-mono font-bold text-brand-primary">{countdown}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {user?.role === 'teacher' ? (
                  <button
                    onClick={activeSession ? handleJoinLiveClass : handleStartLiveClass}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-purple-500/15 hover:shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Video size={16} />
                    <span>{activeSession ? 'Rejoin Live Class' : 'Start Live Class'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleJoinLiveClass}
                    disabled={!activeSession}
                    className={`w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      activeSession
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/15 hover:shadow-purple-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 cursor-pointer'
                        : 'bg-neutral-300 dark:bg-neutral-850 text-neutral-500 dark:text-neutral-600 cursor-not-allowed border border-outline-variant/10'
                    }`}
                  >
                    <Video size={16} />
                    <span>{activeSession ? 'Join Live Class' : 'Waiting for Teacher to start...'}</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={async () => {
                      if (!activeSession) {
                        if (user?.role === 'teacher') {
                          toast.error('Please start the class first.');
                        } else {
                          toast.error('Please wait for the teacher to start the class.');
                        }
                        return;
                      }
                      await handleJoinLiveClass();
                      setView('whiteboard');
                    }}
                    className="py-2.5 px-4 rounded-xl border border-outline-variant/20 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <PenLine size={13} />
                    <span>Open Whiteboard</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!activeSession) {
                        if (user?.role === 'teacher') {
                          toast.error('Please start the class first.');
                        } else {
                          toast.error('Please wait for the teacher to start the class.');
                        }
                        return;
                      }
                      await handleJoinLiveClass();
                      setTimeout(() => {
                        if (jitsiApiRef.current) {
                          jitsiApiRef.current.executeCommand('toggleShareScreen');
                        }
                      }, 1200);
                    }}
                    className="py-2.5 px-4 rounded-xl border border-outline-variant/20 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MonitorPlay size={13} />
                    <span>Share Screen</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {recording && <span className="text-xs font-bold text-red-400 uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>● REC</span>}
            <span className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Geist, sans-serif' }}>
              {classroom?.title || 'Live Classroom'} {currentBreakout ? `— ${currentBreakout}` : '— Main Room'}
            </span>
            <span className="text-xs text-on-surface-variant hidden sm:block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Room #{id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-all"
              aria-label="Toggle theme"
            >
              <Moon className="w-4 h-4 dark:hidden" />
              <Sun className="w-4 h-4 hidden dark:block" />
            </button>
            <button
              onClick={() => setView(v => v === 'grid' ? 'whiteboard' : 'grid')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border border-outline-variant/20 hover:bg-on-surface/5 text-on-surface-variant"
            >
              {view === 'grid' ? <><PenLine size={14} /> Whiteboard</> : <><Grid size={14} /> Grid View</>}
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-outline-variant/20 bg-neutral-100/30 dark:bg-white/5">
              <Users size={13} className="text-on-surface-variant" />
              <span className="text-xs text-on-surface-variant">{participants.length}</span>
            </div>
            <button
              onClick={() => setRecording(r => !r)}
              className={`p-2 rounded-xl transition-all border border-outline-variant/20 ${recording ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-on-surface-variant hover:bg-on-surface/5'}`}
            >
              <Disc size={14} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden p-3">
          <AnimatePresence mode="wait">
            {view === 'grid' ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full rounded-2xl overflow-hidden border border-outline-variant/20 bg-neutral-950 flex items-center justify-center">
                {!jitsiLoaded || !roomName ? (
                  <div className="text-white text-sm animate-pulse" style={{ fontFamily: 'Inter, sans-serif' }}>Initializing Live Stream...</div>
                ) : (
                  <div ref={jitsiContainerRef} className="w-full h-full" />
                )}
              </motion.div>
            ) : (
              <motion.div key="wb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full rounded-2xl overflow-hidden border border-outline-variant/20 bg-neutral-100/10 dark:bg-neutral-900/30">
                <Whiteboard socket={socketRef.current} roomId={id || ''} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-center gap-3 py-4 px-4 border-t border-outline-variant/10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md">
          <button
            onClick={handleToggleMute}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${muted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/8 text-on-surface hover:bg-white/12 border border-outline-variant/20'}`}
          >
            {muted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={handleToggleCamera}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${cameraOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/8 text-on-surface hover:bg-white/12 border border-outline-variant/20'}`}
          >
            {cameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
          <button onClick={handleToggleScreenShare} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/8 text-on-surface hover:bg-white/12 border border-outline-variant/20 transition-all">
            <MonitorPlay size={20} />
          </button>
          <motion.button
            onClick={handleToggleHand}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${handRaised ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/8 text-on-surface border-outline-variant/20 hover:bg-white/12'}`}
          >
            <span className="text-xl">{handRaised ? '✋' : '🤚'}</span>
          </motion.button>
          <button
            onClick={() => setChatOpen(o => !o)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${chatOpen ? 'bg-blue-500/20 text-[#2563EB] border-blue-500/30' : 'bg-white/8 text-on-surface border-outline-variant/20 hover:bg-white/12'}`}
          >
            <MessageSquare size={20} />
          </button>
          <button
            onClick={() => setBreakoutOpen(o => !o)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${breakoutOpen ? 'bg-purple-500/20 text-[#2563EB] border-purple-500/30' : 'bg-white/8 text-on-surface border-outline-variant/20 hover:bg-white/12'}`}
          >
            <Grid size={20} />
          </button>
          <div className="w-px h-8 bg-on-surface/10" />
          
          {user?.role === 'teacher' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLeave}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-semibold text-on-surface border border-outline-variant/20 hover:bg-white/10 transition-all"
              >
                Leave
              </button>
              <button
                onClick={handleEndSession}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-semibold text-white transition-all bg-red-600 hover:bg-red-700"
                style={{ boxShadow: '0 4px 12px rgba(220,38,38,0.2)' }}
              >
                End Class
              </button>
            </div>
          ) : (
            <button
              onClick={handleLeave}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-on-surface transition-all"
              style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
            >
              <Phone size={16} className="rotate-[135deg]" /> Leave
            </button>
          )}
        </div>
      </div>

      {/* Sidebar (Chat & Participants) */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col border-l border-outline-variant/10 flex-shrink-0 overflow-hidden bg-white/95 dark:bg-neutral-950/98 backdrop-blur-md"
          >
            <div className="flex flex-col border-b border-outline-variant/10">
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-semibold text-on-surface">Classroom Sidebar</h3>
                <button onClick={() => setChatOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors"><X size={14} /></button>
              </div>
              <div className="flex border-t border-outline-variant/10 bg-neutral-100/30 dark:bg-neutral-900/10">
                <button
                  onClick={() => setSidebarTab('chat')}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all ${
                    sidebarTab === 'chat'
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-on-surface-variant hover:bg-on-surface/5'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setSidebarTab('participants')}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all ${
                    sidebarTab === 'participants'
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-on-surface-variant hover:bg-on-surface/5'
                  }`}
                >
                  Participants ({participants.length})
                </button>
                <button
                  onClick={() => setSidebarTab('assignments')}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all ${
                    sidebarTab === 'assignments'
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-on-surface-variant hover:bg-on-surface/5'
                  }`}
                >
                  Assignments
                </button>
              </div>
            </div>

            {sidebarTab === 'chat' ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-900/50">
                  {messages.map((m, i) => (
                    <div key={i} className="mb-4 bg-white dark:bg-neutral-800 p-3.5 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700">
                      <p className="text-sm font-bold mb-1 text-blue-700 dark:text-blue-400">{m.sender}</p>
                      <div className="text-[15px] text-neutral-900 dark:text-neutral-50 leading-relaxed font-medium break-words">{m.msg}</div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">{m.time}</p>
                    </div>
                  ))}
                </div>

                {/* Raised hands */}
                {raisedHands.length > 0 && (
                  <div className="px-3 py-2 border-t border-outline-variant/10 border-b bg-amber-500/10">
                    <p className="text-xs font-semibold text-amber-500 dark:text-amber-400 mb-1">✋ Raised Hands</p>
                    {raisedHands.map(h => (
                      <p key={h.userId} className="text-xs text-on-surface-variant">{h.userName}</p>
                    ))}
                  </div>
                )}

                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 shadow-sm">
                    <input
                      value={chatMsg}
                      onChange={e => setChatMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMsg()}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-[15px] font-medium text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 outline-none"
                    />
                    <button onClick={sendMsg} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-1">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : sidebarTab === 'participants' ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {participants.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4">No other participants connected.</p>
                ) : (
                  participants.map((p, idx) => (
                    <div key={p.userId || idx} className="flex items-center justify-between p-2 rounded-xl bg-neutral-100/50 dark:bg-white/5 border border-outline-variant/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {p.userName?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-on-surface truncate">{p.userName}</p>
                          <p className="text-[10px] text-on-surface-variant capitalize">{p.role}</p>
                        </div>
                      </div>

                      {user?.role === 'teacher' && p.userId !== user.id && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              if (socketRef.current && roomName) {
                                socketRef.current.emit('mute-user', { roomId: roomName, userId: p.userId });
                                toast.success(`Requested to mute ${p.userName}`);
                              }
                            }}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Mute Participant"
                          >
                            <MicOff size={12} />
                          </button>
                          <button
                            onClick={() => {
                              if (socketRef.current && roomName) {
                                socketRef.current.emit('kick-user', { roomId: roomName, userId: p.userId });
                                toast.success(`Requested to kick ${p.userName}`);
                              }
                            }}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Kick Participant"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              // This is the new 'assignments' tab!
              <div className="flex-1 overflow-y-auto p-3 space-y-4 flex flex-col h-full min-h-0 text-on-surface">
                {selectedAssignmentId ? (
                  // Grading (Teacher) or Submitting (Student) Sub-view
                  <div className="space-y-3 flex flex-col h-full min-h-0">
                    <button
                      onClick={() => setSelectedAssignmentId(null)}
                      className="text-xs text-[#2563EB] hover:underline mb-1 flex items-center gap-1.5"
                    >
                      ← Back to Assignments
                    </button>
                    {(() => {
                      const asg = assignments.find(a => a.id === selectedAssignmentId);
                      if (!asg) return null;
                      
                      return (
                        <div className="space-y-3 flex-1 flex flex-col min-h-0 overflow-y-auto pb-4">
                          <h4 className="text-sm font-bold text-on-surface">{asg.title}</h4>
                          <p className="text-xs text-on-surface-variant bg-neutral-150 dark:bg-white/5 p-2.5 rounded-lg leading-relaxed">
                            {asg.description}
                          </p>
                          <div className="text-[11px] text-on-surface-variant flex justify-between">
                            <span>Max Grade: <b>{asg.max_grade} pts</b></span>
                            <span>Due: <b>{new Date(asg.due_date).toLocaleDateString()}</b></span>
                          </div>

                          {user?.role === 'teacher' ? (
                            // Teacher Submissions View & Grading Form
                            <div className="space-y-3 flex-1 flex flex-col min-h-0">
                              <h5 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mt-2">Student Submissions</h5>
                              <div className="space-y-2 flex-1 overflow-y-auto min-h-[150px] pr-1">
                                {submissions.length === 0 ? (
                                  <p className="text-xs text-neutral-500 text-center py-4">No submissions yet.</p>
                                ) : (
                                  submissions.map((sub: any) => (
                                    <div key={sub.id} className="p-2.5 rounded-lg border border-outline-variant/10 bg-neutral-100/50 dark:bg-white/5 space-y-2 text-xs">
                                      <div className="flex justify-between font-bold">
                                        <span>{sub.user?.name || 'Student'}</span>
                                        <span className={sub.grade !== null ? 'text-emerald-400' : 'text-amber-400'}>
                                          {sub.grade !== null ? `Graded: ${sub.grade}/${asg.max_grade}` : 'Pending'}
                                        </span>
                                      </div>
                                      <div className="text-neutral-500 bg-neutral-200/50 dark:bg-neutral-900/50 p-2 rounded break-all select-all font-mono text-[10px]">
                                        {sub.file_url}
                                      </div>
                                      <div className="text-[10px] text-neutral-500">
                                        Submitted: {new Date(sub.submitted_at).toLocaleString()}
                                      </div>

                                      {/* Grading controls */}
                                      {sub.grade === null && (
                                        <div className="space-y-1.5 pt-1.5 border-t border-outline-variant/5">
                                          <div className="flex gap-2">
                                            <input
                                              type="number"
                                              placeholder="Grade"
                                              max={asg.max_grade}
                                              value={gradeValue}
                                              onChange={e => setGradeValue(e.target.value)}
                                              className="w-16 px-1.5 py-1 text-xs rounded border border-outline-variant/20 bg-transparent"
                                            />
                                            <input
                                              type="text"
                                              placeholder="Feedback"
                                              value={gradeFeedback}
                                              onChange={e => setGradeFeedback(e.target.value)}
                                              className="flex-1 px-1.5 py-1 text-xs rounded border border-outline-variant/20 bg-transparent"
                                            />
                                            <button
                                              onClick={async () => {
                                                if (!gradeValue) return toast.error('Enter grade value');
                                                try {
                                                  await apiClient.post(`/live/submissions/${sub.id}/grade`, {
                                                    grade: gradeValue,
                                                    feedback: gradeFeedback
                                                  });
                                                  toast.success('Graded successfully!');
                                                  setGradeValue('');
                                                  setGradeFeedback('');
                                                  loadSubmissions(asg.id);
                                                } catch (e) {
                                                  toast.error('Grading failed.');
                                                }
                                              }}
                                              className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded text-[10px] font-bold"
                                            >
                                              Grade
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                      {sub.grade !== null && sub.feedback && (
                                        <div className="text-[10px] text-emerald-400 bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10">
                                          <b>Feedback:</b> {sub.feedback}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          ) : (
                            // Student Submission Form
                            <div className="space-y-3 pt-2">
                              {asg.submission ? (
                                <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2 text-xs">
                                  <p className="font-bold text-[#2563EB]">✓ Assignment Submitted</p>
                                  <div className="bg-neutral-200/50 dark:bg-neutral-900/50 p-2 rounded font-mono text-[10px] break-all select-all text-on-surface-variant">
                                    {asg.submission.file_url}
                                  </div>
                                  {asg.submission.grade !== null ? (
                                    <div className="pt-2 border-t border-outline-variant/10 space-y-1">
                                      <p className="text-emerald-400 font-bold">Grade: {asg.submission.grade} / {asg.max_grade}</p>
                                      {asg.submission.feedback && <p className="text-on-surface-variant"><b>Feedback:</b> {asg.submission.feedback}</p>}
                                    </div>
                                  ) : (
                                    <p className="text-neutral-500 text-[10px] italic">Awaiting grade from teacher.</p>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2 border-t border-outline-variant/10 pt-3">
                                  <h5 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Submit Solution</h5>
                                  <textarea
                                    rows={4}
                                    placeholder="Enter your submission text or explanation..."
                                    value={subText}
                                    onChange={e => setSubText(e.target.value)}
                                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-outline-variant/20 bg-transparent outline-none focus:border-[#2563EB] text-on-surface resize-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Or paste a file link/url (e.g. S3, Drive, GitHub)..."
                                    value={subFileUrl}
                                    onChange={e => setSubFileUrl(e.target.value)}
                                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-outline-variant/20 bg-transparent outline-none focus:border-[#2563EB] text-on-surface"
                                  />
                                  <button
                                    onClick={async () => {
                                      if (!subText.trim() && !subFileUrl.trim()) {
                                        return toast.error('Please enter submission text or a file link.');
                                      }
                                      try {
                                        await apiClient.post(`/live/assignments/${asg.id}/submit`, {
                                          text: subText,
                                          fileUrl: subFileUrl
                                        });
                                        toast.success('Assignment submitted!');
                                        setSubText('');
                                        setSubFileUrl('');
                                        loadAssignments();
                                      } catch (e) {
                                        toast.error('Submission failed.');
                                      }
                                    }}
                                    className="w-full py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all"
                                  >
                                    Submit
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  // Main Assignments View (Form + List)
                  <div className="space-y-4 flex flex-col h-full min-h-0">
                    {user?.role === 'teacher' && (
                      // Teacher Creation Box
                      <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-2 text-xs">
                        <p className="font-bold text-brand-primary">Create Assignment</p>
                        <input
                          type="text"
                          placeholder="Assignment Title"
                          value={newAsgTitle}
                          onChange={e => setNewAsgTitle(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded border border-outline-variant/20 bg-transparent"
                        />
                        <textarea
                          placeholder="Instructions / Description..."
                          rows={2}
                          value={newAsgDesc}
                          onChange={e => setNewAsgDesc(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded border border-outline-variant/20 bg-transparent resize-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="datetime-local"
                            value={newAsgDueDate}
                            onChange={e => setNewAsgDueDate(e.target.value)}
                            className="px-2 py-1 text-[10px] rounded border border-outline-variant/20 bg-transparent"
                          />
                          <input
                            type="number"
                            placeholder="Max Score (default 100)"
                            value={newAsgMaxGrade}
                            onChange={e => setNewAsgMaxGrade(Number(e.target.value))}
                            className="px-2 py-1 text-[10px] rounded border border-outline-variant/20 bg-transparent"
                          />
                        </div>
                        <button
                          onClick={async () => {
                            if (!newAsgTitle.trim() || !newAsgDesc.trim() || !newAsgDueDate) {
                              return toast.error('Please fill in all assignment fields.');
                            }
                            try {
                              await apiClient.post(`/live/classroom/${id}/assignments`, {
                                title: newAsgTitle,
                                description: newAsgDesc,
                                dueDate: new Date(newAsgDueDate).toISOString(),
                                maxGrade: newAsgMaxGrade
                              });
                              toast.success('Assignment created!');
                              setNewAsgTitle('');
                              setNewAsgDesc('');
                              setNewAsgDueDate('');
                              loadAssignments();
                            } catch (e) {
                              toast.error('Failed to create assignment.');
                            }
                          }}
                          className="w-full py-1.5 rounded-lg text-white font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-[10px]"
                        >
                          Publish Assignment
                        </button>
                      </div>
                    )}

                    {/* Assignment List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
                      <h4 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Active Assignments</h4>
                      {assignments.length === 0 ? (
                        <p className="text-xs text-neutral-500 text-center py-6">No assignments published for this class.</p>
                      ) : (
                        assignments.map((asg: any) => {
                          const isOverdue = new Date(asg.due_date).getTime() < Date.now();
                          
                          let statusLabel = 'Pending';
                          let statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';

                          if (user?.role === 'student') {
                            if (asg.submission) {
                              if (asg.submission.grade !== null) {
                                statusLabel = `Graded: ${asg.submission.grade}/${asg.max_grade}`;
                                statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                              } else {
                                statusLabel = 'Submitted';
                                statusColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                              }
                            } else if (isOverdue) {
                              statusLabel = 'Overdue';
                              statusColor = 'text-red-400 bg-red-500/10 border-red-500/20';
                            }
                          } else {
                            // Teacher
                            statusLabel = `${asg.submissionsCount || 0} submissions`;
                            statusColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                          }

                          return (
                            <div
                              key={asg.id}
                              onClick={() => {
                                setSelectedAssignmentId(asg.id);
                                if (user?.role === 'teacher') {
                                  loadSubmissions(asg.id);
                                }
                              }}
                              className="p-3 rounded-xl border border-outline-variant/10 bg-neutral-100/50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 transition-all cursor-pointer flex justify-between items-center gap-3"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold truncate text-on-surface">{asg.title}</p>
                                <p className="text-[10px] text-neutral-500 mt-1">Due: {new Date(asg.due_date).toLocaleDateString()}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                                {statusLabel}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breakout rooms panel */}
      <AnimatePresence>
        {breakoutOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-4 w-64 rounded-2xl border border-outline-variant/20 shadow-2xl z-50 overflow-hidden bg-white/95 dark:bg-neutral-950/98 backdrop-blur-md"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10">
              <h3 className="text-sm font-semibold text-on-surface">Breakout Rooms</h3>
              <button onClick={() => setBreakoutOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors"><X size={14} /></button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {breakoutRooms.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-6">No breakout rooms active.</p>
              ) : (
                breakoutRooms.map((room, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10 hover:bg-on-surface/5 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{room.name}</p>
                    </div>
                    {currentBreakout === room.name ? (
                      <span className="text-xs text-green-400 font-semibold px-2 py-1 rounded bg-green-500/10">Current</span>
                    ) : (
                      <button
                        onClick={() => handleJoinBreakoutRoom(room)}
                        className="text-xs px-2.5 py-1 rounded-lg text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 transition-all"
                      >
                        Join
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            {currentBreakout && (
              <div className="p-2 border-b border-outline-variant/10 bg-purple-500/10 flex justify-center">
                <button
                  onClick={handleReturnToMainRoom}
                  className="text-xs text-purple-300 font-semibold hover:underline"
                >
                  ← Return to Main Room
                </button>
              </div>
            )}
            {user?.role === 'teacher' && (
              <div className="p-3">
                <button
                  onClick={handleCreateBreakoutRoom}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-on-surface transition-all"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}
                >
                  Create Room
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
