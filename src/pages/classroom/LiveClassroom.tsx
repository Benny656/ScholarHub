import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Hand, MessageSquare, MonitorPlay,
  Users, Grid, MoreVertical, Phone, Disc, Maximize2, PenLine,
  Circle, Square, Eraser, Minus, X, Send, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/index';

const PARTICIPANTS = [
  { id: 'u2', name: 'Dr. Sarah Chen', isMuted: false, isCameraOff: false, isHandRaised: false, role: 'host' },
  { id: 'u1', name: 'Alex Johnson', isMuted: false, isCameraOff: false, isHandRaised: true, role: 'participant' },
  { id: 'u8', name: 'Jordan Lee', isMuted: true, isCameraOff: false, isHandRaised: false, role: 'participant' },
  { id: 'u9', name: 'Priya Sharma', isMuted: false, isCameraOff: true, isHandRaised: false, role: 'participant' },
  { id: 'u10', name: 'Marcus Brown', isMuted: true, isCameraOff: true, isHandRaised: false, role: 'participant' },
  { id: 'u11', name: 'Sara Wilson', isMuted: false, isCameraOff: false, isHandRaised: false, role: 'participant' },
];

const CHAT_MSGS = [
  { sender: 'Dr. Sarah Chen', msg: 'Welcome everyone! Today we cover advanced React patterns.', time: '10:01 AM', isHost: true },
  { sender: 'Alex Johnson', msg: 'Excited for this session!', time: '10:02 AM', isHost: false },
  { sender: 'Priya Sharma', msg: 'Can you screen share the slides?', time: '10:03 AM', isHost: false },
  { sender: 'Dr. Sarah Chen', msg: 'Sure, sharing now. Can everyone see?', time: '10:04 AM', isHost: true },
  { sender: 'Jordan Lee', msg: '👍', time: '10:04 AM', isHost: false },
];

function ParticipantTile({ p, index }: { p: typeof PARTICIPANTS[0]; index: number }) {
  const colors = ['from-purple-600 to-blue-600', 'from-blue-600 to-emerald-600', 'from-emerald-600 to-purple-600', 'from-amber-600 to-red-600', 'from-red-600 to-purple-600', 'from-indigo-600 to-blue-600'];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', damping: 15 }}
      className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      {p.isCameraOff ? (
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${colors[index % colors.length]} opacity-30`}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
            {p.name[0]}
          </div>
        </div>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${colors[index % colors.length]} opacity-20`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold text-white">
              {p.name[0]}
            </div>
          </div>
        </div>
      )}

      {/* Animated speaking indicator */}
      {!p.isMuted && (
        <div className="absolute top-2 right-2 flex gap-0.5 items-end h-4">
          {[1, 2, 3].map(i => (
            <motion.div key={i} className="w-1 bg-emerald-400 rounded-full"
              animate={{ height: [4, 12, 4] }}
              transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
            />
          ))}
        </div>
      )}

      {/* Hand raised */}
      {p.isHandRaised && (
        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="absolute top-2 left-2">
          <span className="text-xl">✋</span>
        </motion.div>
      )}

      {/* Host badge */}
      {p.role === 'host' && (
        <div className="absolute top-2 left-2 text-xs font-bold px-1.5 py-0.5 rounded-md text-white" style={{ background: 'rgba(139,92,246,0.8)' }}>Host</div>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
        <span className="text-xs font-medium text-white truncate">{p.name}</span>
        <div className="flex items-center gap-1.5">
          {p.isMuted && <MicOff size={11} className="text-red-400" />}
          {p.isCameraOff && <VideoOff size={11} className="text-red-400" />}
        </div>
      </div>
    </motion.div>
  );
}

function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'line'>('pen');
  const [color, setColor] = useState('#8B5CF6');
  const [size, setSize] = useState(3);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const pos = getPos(e);
    ctx.lineWidth = tool === 'eraser' ? size * 5 : size;
    ctx.strokeStyle = tool === 'eraser' ? '#0b1326' : color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }, []);

  const COLORS = ['#8B5CF6', '#3B82F6', '#4edea3', '#F59E0B', '#EF4444', '#ffffff'];

  return (
    <div className="flex flex-col h-full">
      {/* Tools */}
      <div className="flex items-center gap-2 p-2 border-b border-white/5">
        <button onClick={() => setTool('pen')} className={`p-2 rounded-lg transition-all ${tool === 'pen' ? 'bg-purple-500/30 text-purple-300' : 'text-slate-400 hover:bg-white/5'}`}><PenLine size={16} /></button>
        <button onClick={() => setTool('line')} className={`p-2 rounded-lg transition-all ${tool === 'line' ? 'bg-purple-500/30 text-purple-300' : 'text-slate-400 hover:bg-white/5'}`}><Minus size={16} /></button>
        <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg transition-all ${tool === 'eraser' ? 'bg-purple-500/30 text-purple-300' : 'text-slate-400 hover:bg-white/5'}`}><Eraser size={16} /></button>
        <div className="w-px h-5 bg-white/10 mx-1" />
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} className={`w-5 h-5 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent' : ''}`} style={{ background: c }} />
        ))}
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button onClick={clearCanvas} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Eraser size={16} /></button>
      </div>
      <canvas
        ref={canvasRef}
        className="flex-1 cursor-crosshair"
        style={{ background: 'rgba(255,255,255,0.03)' }}
        onMouseDown={e => { setIsDrawing(true); lastPos.current = getPos(e); }}
        onMouseMove={draw}
        onMouseUp={() => { setIsDrawing(false); lastPos.current = null; }}
        onMouseLeave={() => { setIsDrawing(false); lastPos.current = null; }}
      />
    </div>
  );
}

export function LiveClassroom() {
  const { id } = useParams<{ id: string }>();
  const [view, setView] = useState<'grid' | 'whiteboard'>('grid');
  const [chatOpen, setChatOpen] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [recording, setRecording] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState(CHAT_MSGS);
  const [breakoutOpen, setBreakoutOpen] = useState(false);

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    setMessages(p => [...p, { sender: 'Alex Johnson', msg: chatMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isHost: false }]);
    setChatMsg('');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#070d1f' }}>
      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5" style={{ background: 'rgba(11,19,38,0.95)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {recording && <span className="text-xs font-bold text-red-400 uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>● REC</span>}
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Geist, sans-serif' }}>Advanced React Patterns — Live</span>
            <span className="text-xs text-slate-400 hidden sm:block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Room #{id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(v => v === 'grid' ? 'whiteboard' : 'grid')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border border-white/10 hover:bg-white/5 text-slate-300"
            >
              {view === 'grid' ? <><PenLine size={14} /> Whiteboard</> : <><Grid size={14} /> Grid View</>}
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Users size={13} className="text-slate-400" />
              <span className="text-xs text-slate-300">{PARTICIPANTS.length}</span>
            </div>
            <button
              onClick={() => setRecording(r => !r)}
              className={`p-2 rounded-xl transition-all border border-white/10 ${recording ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <Disc size={14} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden p-3">
          <AnimatePresence mode="wait">
            {view === 'grid' ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full grid grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                {PARTICIPANTS.map((p, i) => <ParticipantTile key={p.id} p={p} index={i} />)}
              </motion.div>
            ) : (
              <motion.div key="wb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full rounded-2xl overflow-hidden border border-white/10"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Whiteboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-center gap-3 py-4 px-4 border-t border-white/5" style={{ background: 'rgba(11,19,38,0.95)' }}>
          <button
            onClick={() => setMuted(m => !m)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${muted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/8 text-white hover:bg-white/12 border border-white/10'}`}
          >
            {muted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={() => setCameraOff(c => !c)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${cameraOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/8 text-white hover:bg-white/12 border border-white/10'}`}
          >
            {cameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
          <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/8 text-white hover:bg-white/12 border border-white/10 transition-all">
            <MonitorPlay size={20} />
          </button>
          <motion.button
            onClick={() => setHandRaised(h => !h)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${handRaised ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/8 text-white border-white/10 hover:bg-white/12'}`}
          >
            <span className="text-xl">{handRaised ? '✋' : '🤚'}</span>
          </motion.button>
          <button
            onClick={() => setChatOpen(o => !o)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${chatOpen ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/8 text-white border-white/10 hover:bg-white/12'}`}
          >
            <MessageSquare size={20} />
          </button>
          <button
            onClick={() => setBreakoutOpen(o => !o)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/8 text-white hover:bg-white/12 border border-white/10 transition-all"
          >
            <Grid size={20} />
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white transition-all" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}>
            <Phone size={16} className="rotate-[135deg]" /> Leave
          </button>
        </div>
      </div>

      {/* Chat sidebar */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col border-l border-white/5 flex-shrink-0 overflow-hidden"
            style={{ background: 'rgba(13,20,45,0.98)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">Class Chat</h3>
              <button onClick={() => setChatOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i}>
                  <p className={`text-xs font-semibold mb-0.5 ${m.isHost ? 'text-purple-400' : 'text-blue-400'}`}>{m.sender}</p>
                  <div className="text-sm text-slate-200 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{m.msg}</div>
                  <p className="text-xs text-slate-600 mt-0.5">{m.time}</p>
                </div>
              ))}
            </div>

            {/* Raised hands */}
            {handRaised && (
              <div className="px-3 py-2 border-t border-white/5 border-b" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <p className="text-xs font-semibold text-amber-400 mb-1">✋ Raised Hands</p>
                <p className="text-xs text-slate-300">Alex Johnson</p>
              </div>
            )}

            <div className="p-3 border-t border-white/5">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <input
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                />
                <button onClick={sendMsg} className="text-purple-400 hover:text-purple-300 transition-colors">
                  <Send size={14} />
                </button>
              </div>
            </div>
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
            className="absolute top-16 right-4 w-64 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
            style={{ background: 'rgba(13,20,45,0.98)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">Breakout Rooms</h3>
              <button onClick={() => setBreakoutOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={14} /></button>
            </div>
            {['Room A — Frontend', 'Room B — Backend', 'Room C — Design'].map((r, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{r}</p>
                  <p className="text-xs text-slate-500">{[2, 3, 1][i]} participants</p>
                </div>
                <button className="text-xs px-2.5 py-1 rounded-lg text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 transition-all">Join</button>
              </div>
            ))}
            <div className="p-3">
              <button className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
                Create Room
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
