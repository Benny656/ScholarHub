import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, Bell, Users, Megaphone, Pin, Paperclip, Smile, MoreVertical, CheckCheck, Circle } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { messagesService } from '../../services/messages.service';
import { socketService } from '../../services/socket.service';
import { GlassCard, Badge, Avatar, SearchInput } from '../../components/ui/index';
import type { Message } from '../../types';

const CONVERSATIONS = [
  { id: 'dm1', name: 'Dr. Sarah Chen', role: 'teacher', lastMsg: 'Great submission! I left some feedback.', time: '2m', unread: 2, online: true },
  { id: 'dm2', name: 'Prof. Raj Patel', role: 'teacher', lastMsg: 'The ML assignment deadline has been extended.', time: '1h', unread: 0, online: false },
  { id: 'grp1', name: 'Web Dev — Study Group', role: 'group', lastMsg: 'Alex: Did anyone finish the last project?', time: '30m', unread: 5, online: true, members: 14 },
  { id: 'grp2', name: 'React Advanced — Q&A', role: 'group', lastMsg: 'Sarah: Good question Jordan! ...', time: '2h', unread: 0, online: false, members: 247 },
];

const ANNOUNCEMENTS = [
  { id: 'a1', title: 'Platform Maintenance Notice', body: 'NexLearn will undergo scheduled maintenance on Sunday, June 22 from 2-4 AM UTC. Expect brief downtime.', from: 'System Admin', time: '2 days ago', pinned: true },
  { id: 'a2', title: 'New AI Features Released!', body: 'The AI Assignment Checker now supports longer submissions and has 40% better feedback quality. Try it out!', from: 'Dr. Sarah Chen', time: '3 days ago', pinned: false },
  { id: 'a3', title: 'Summer Course Registration Open', body: 'Registration for Summer 2024 courses is now open. Enroll early to secure your spot in limited-capacity workshops.', from: 'Registrar', time: '1 week ago', pinned: false },
];

const NOTIFICATIONS = [
  { id: 'n1', msg: 'Your assignment "React Architecture" was graded: A', time: '10 min ago', type: 'grade', read: false },
  { id: 'n2', msg: 'Live class starts in 15 minutes — Advanced React Patterns', time: '30 min ago', type: 'class', read: false },
  { id: 'n3', msg: 'New announcement from Dr. Sarah Chen', time: '2 hours ago', type: 'announcement', read: true },
  { id: 'n4', msg: 'Assignment deadline tomorrow: Algorithm Challenge Set', time: '1 day ago', type: 'deadline', read: true },
  { id: 'n5', msg: 'You earned a new badge: "7-Day Streak" 🔥', time: '2 days ago', type: 'achievement', read: true },
];

export function Messages() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'messages' | 'groups' | 'announcements' | 'notifications'>('messages');
  const [activeConv, setActiveConv] = useState<string | null>('dm1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketService.connect(user?.token || 'demo');
    return () => socketService.disconnect();
  }, [user]);

  useEffect(() => {
    if (!activeConv) return;
    messagesService.getConversation(activeConv).then(setMessages);
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !user || !activeConv) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      conversationId: activeConv,
      senderId: user.id,
      senderName: user.name,
      content: newMsg,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages(p => [...p, msg]);
    setNewMsg('');
    await messagesService.sendMessage(activeConv, newMsg);
  };

  const activeConvData = CONVERSATIONS.find(c => c.id === activeConv);
  const filteredConvs = CONVERSATIONS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Left sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col" style={{ background: 'rgba(13,20,45,0.6)' }}>
          {/* Tabs */}
          <div className="grid grid-cols-4 p-2 border-b border-white/5">
            {[
              { id: 'messages', icon: <Send size={15} />, badge: 2 },
              { id: 'groups', icon: <Users size={15} />, badge: 5 },
              { id: 'announcements', icon: <Megaphone size={15} />, badge: 0 },
              { id: 'notifications', icon: <Bell size={15} />, badge: notifications.filter(n => !n.read).length },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`relative flex items-center justify-center p-2 rounded-xl transition-all ${tab === t.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                style={tab === t.id ? { background: 'rgba(139,92,246,0.25)' } : {}}>
                {t.icon}
                {t.badge > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{t.badge}</span>}
              </button>
            ))}
          </div>

          <div className="p-3"><SearchInput value={search} onChange={setSearch} placeholder="Search..." /></div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {(tab === 'messages' || tab === 'groups') && filteredConvs.filter(c => tab === 'messages' ? c.role !== 'group' : c.role === 'group').map(conv => (
              <motion.button key={conv.id} onClick={() => setActiveConv(conv.id)}
                whileHover={{ x: 2 }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-l-2 ${activeConv === conv.id ? 'border-purple-500 bg-purple-500/10' : 'border-transparent hover:bg-white/5'}`}>
                <div className="flex-shrink-0">
                  <Avatar name={conv.name} size="md" online={conv.online} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold truncate ${activeConv === conv.id ? 'text-purple-300' : 'text-white'}`}>{conv.name}</span>
                    <span className="text-xs text-slate-600 flex-shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{conv.lastMsg}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center flex-shrink-0">{conv.unread}</span>
                )}
              </motion.button>
            ))}

            {tab === 'announcements' && ANNOUNCEMENTS.map(ann => (
              <div key={ann.id} className="px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-white leading-tight">{ann.title}</p>
                  {ann.pinned && <Pin size={12} className="text-amber-400 flex-shrink-0 ml-2" />}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-1">{ann.body}</p>
                <p className="text-xs text-slate-600">{ann.from} · {ann.time}</p>
              </div>
            ))}

            {tab === 'notifications' && notifications.map((n, i) => (
              <div key={n.id} onClick={() => setNotifications(prev => prev.map((x, j) => j === i ? { ...x, read: true } : x))}
                className={`px-4 py-3 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${!n.read ? 'bg-purple-500/5' : ''}`}>
                <div className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${!n.read ? 'bg-purple-400' : 'bg-transparent'}`} />
                  <div>
                    <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-slate-400'}`}>{n.msg}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeConv && activeConvData ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5" style={{ background: 'rgba(11,19,38,0.8)' }}>
                <Avatar name={activeConvData.name} size="md" online={activeConvData.online} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{activeConvData.name}</p>
                  <p className="text-xs text-slate-500">{activeConvData.online ? 'Online' : 'Offline'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"><Search size={16} /></button>
                  <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"><MoreVertical size={16} /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
                {(messages.length ? messages : [
                  { id: 'm1', conversationId: 'dm1', senderId: 'u2', senderName: 'Dr. Sarah Chen', content: 'Hi! How are you doing with the React assignment?', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: true },
                  { id: 'm2', conversationId: 'dm1', senderId: user?.id || 'u1', senderName: user?.name || 'Alex', content: 'Working on it! Having trouble with useContext though.', timestamp: new Date(Date.now() - 3500000).toISOString(), isRead: true },
                  { id: 'm3', conversationId: 'dm1', senderId: 'u2', senderName: 'Dr. Sarah Chen', content: 'useContext is tricky at first. Let me share a resource that helped my students a lot.', timestamp: new Date(Date.now() - 3400000).toISOString(), isRead: true },
                  { id: 'm4', conversationId: 'dm1', senderId: 'u2', senderName: 'Dr. Sarah Chen', content: 'Great submission! I left some feedback on your last pull request.', timestamp: new Date(Date.now() - 120000).toISOString(), isRead: false },
                ] as Message[]).map((msg, i) => {
                  const isMe = msg.senderId === user?.id || msg.senderId === 'u1';
                  const showAvatar = !isMe && (i === 0 || messages[i - 1]?.senderId !== msg.senderId);
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && <div className="flex-shrink-0">{showAvatar ? <Avatar name={msg.senderName} size="sm" /> : <div className="w-7" />}</div>}
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {showAvatar && !isMe && <p className="text-xs text-slate-500 mb-1 ml-1">{msg.senderName}</p>}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'rounded-br-sm text-white' : 'rounded-bl-sm text-slate-200'}`}
                          style={isMe ? { background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' } : { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
                          {msg.content}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-slate-600">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <CheckCheck size={12} className={msg.isRead ? 'text-blue-400' : 'text-slate-600'} />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-5 py-4 border-t border-white/5">
                <div className="flex items-end gap-3 px-4 py-3 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <button className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 pb-0.5"><Paperclip size={18} /></button>
                  <textarea
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message... (Enter to send)"
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <button className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 pb-0.5"><Smile size={18} /></button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={!newMsg.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
                  >
                    <Send size={15} className="text-white" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Send size={36} className="text-slate-600" />
                </div>
                <p className="text-lg font-semibold text-slate-400">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
