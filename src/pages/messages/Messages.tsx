import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, Bell, Users, Megaphone, Pin, Paperclip, Smile, MoreVertical, CheckCheck, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { messagesService } from '../../services/messages.service';
import { socketService } from '../../services/socket.service';
import { GlassCard, Avatar, SearchInput } from '../../components/ui/index';
import type { Message, Conversation } from '../../types';

export function Messages() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'messages' | 'groups' | 'announcements' | 'notifications'>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = socketService.getSocket();

  useEffect(() => {
    if (!user) return;
    
    // Fetch initial conversations
    messagesService.getConversations(user.id).then(data => {
      setConversations(data);
      if (data.length > 0 && !activeConv) setActiveConv(data[0].id);
    });

    // Connect socket and listen for online status and messages
    socketService.connect(user.id);
    
    if (socket) {
      socket.emit('set-online', { userId: user.id });

      socket.on('user-online', ({ userId }) => {
        setOnlineUsers(prev => new Set(prev).add(userId));
      });

      socket.on('user-offline', ({ userId }) => {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      });

      socket.on('chat-message', ({ conversationId, message }) => {
        if (conversationId === activeConv) {
          setMessages(prev => [...prev, message]);
          if (message.senderId !== user.id) {
            socket.emit('chat-read', { conversationId, messageId: message.id, userId: user.id });
            messagesService.markAsRead(message.id);
          }
        } else {
          setConversations(prev => prev.map(c => 
            c.id === conversationId ? { ...c, unreadCount: c.unreadCount + 1, lastMessage: message } : c
          ));
        }
      });

      socket.on('chat-read', ({ conversationId, messageId, userId }) => {
        if (conversationId === activeConv && userId !== user.id) {
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
        }
      });

      socket.on('chat-typing', ({ conversationId, userId }) => {
        if (conversationId === activeConv && userId !== user.id) {
          setTypingUsers(prev => new Set(prev).add(userId));
        }
      });

      socket.on('chat-stop-typing', ({ conversationId, userId }) => {
        if (conversationId === activeConv && userId !== user.id) {
          setTypingUsers(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('user-online');
        socket.off('user-offline');
        socket.off('chat-message');
        socket.off('chat-read');
        socket.off('chat-typing');
        socket.off('chat-stop-typing');
      }
    };
  }, [user, activeConv, socket]);

  useEffect(() => {
    if (!activeConv || !socket) return;
    
    socket.emit('join-chat', { conversationId: activeConv });
    
    messagesService.getConversation(activeConv).then(data => {
      setMessages(data);
      // Mark unread as read
      const unreadMsgs = data.filter(m => !m.isRead && m.senderId !== user?.id);
      unreadMsgs.forEach(m => {
        socket.emit('chat-read', { conversationId: activeConv, messageId: m.id, userId: user?.id });
        messagesService.markAsRead(m.id);
      });
      
      setConversations(prev => prev.map(c => 
        c.id === activeConv ? { ...c, unreadCount: 0 } : c
      ));
    });

    return () => {
      socket.emit('leave-chat', { conversationId: activeConv });
    };
  }, [activeConv, user, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMsg(e.target.value);
    if (!socket || !activeConv || !user) return;
    
    if (e.target.value.trim().length > 0) {
      socket.emit('chat-typing', { conversationId: activeConv, userId: user.id });
    } else {
      socket.emit('chat-stop-typing', { conversationId: activeConv, userId: user.id });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv || !user) return;

    setIsUploading(true);
    try {
      // Simulate file upload with Base64 for local dev
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileUrl = reader.result as string;
        const messageType = file.type.startsWith('image/') ? 'image' : 'file';
        
        const sentMsg = await messagesService.sendMessage(activeConv, 'Shared a file', undefined, undefined, fileUrl, messageType);
        setMessages(p => [...p, sentMsg]);
        if (socket) socket.emit('chat-message', { conversationId: activeConv, message: sentMsg });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload failed', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !user || !activeConv) return;
    const content = newMsg.trim();
    setNewMsg('');
    
    if (socket) socket.emit('chat-stop-typing', { conversationId: activeConv, userId: user.id });

    try {
      const sentMsg = await messagesService.sendMessage(activeConv, content);
      setMessages(p => [...p, sentMsg]);
      
      // Update local conversations list
      setConversations(prev => prev.map(c => 
        c.id === activeConv ? { ...c, lastMessage: sentMsg } : c
      ));

      if (socket) socket.emit('chat-message', { conversationId: activeConv, message: sentMsg });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const activeConvData = conversations.find(c => c.id === activeConv);
  const filteredConvs = conversations.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.participants.some(p => p.name.toLowerCase().includes(search.toLowerCase())));
  const displayConvs = filteredConvs.filter(c => tab === 'messages' ? c.type !== 'group' && c.type !== 'course' : c.type === 'group' || c.type === 'course');

  return (
    <div className="space-y-6">
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Left sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-outline-variant/10 flex flex-col bg-neutral-100/30 dark:bg-neutral-950/40">
          {/* Tabs */}
          <div className="grid grid-cols-4 p-2 border-b border-outline-variant/10">
            {[
              { id: 'messages', icon: <Send size={15} />, badge: conversations.filter(c => c.type === 'direct').reduce((acc, c) => acc + c.unreadCount, 0) },
              { id: 'groups', icon: <Users size={15} />, badge: conversations.filter(c => c.type !== 'direct').reduce((acc, c) => acc + c.unreadCount, 0) },
              { id: 'announcements', icon: <Megaphone size={15} />, badge: 0 },
              { id: 'notifications', icon: <Bell size={15} />, badge: notifications.filter(n => !n.read).length },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`relative flex items-center justify-center p-2 rounded-xl transition-all ${tab === t.id ? 'text-[#EC4899]' : 'text-on-surface-variant hover:text-on-surface'}`}
                style={tab === t.id ? { background: 'color-mix(in srgb, #EC4899 20%, transparent)' } : {}}>
                {t.icon}
                {t.badge > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#EC4899] text-white text-xs flex items-center justify-center">{t.badge}</span>}
              </button>
            ))}
          </div>

          <div className="p-3"><SearchInput value={search} onChange={setSearch} placeholder="Search..." /></div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {(tab === 'messages' || tab === 'groups') && (
              displayConvs.length > 0 ? displayConvs.map(conv => {
                const otherParticipant = conv.participants.find(p => p.id !== user?.id) || conv.participants[0];
                const displayName = conv.name || otherParticipant.name;
                const isOnline = onlineUsers.has(otherParticipant.id);
                
                return (
                  <motion.button key={conv.id} onClick={() => setActiveConv(conv.id)}
                    whileHover={{ x: 2 }}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-l-2 ${activeConv === conv.id ? 'border-[#EC4899] bg-[#EC4899]/10' : 'border-transparent hover:bg-on-surface/5'}`}>
                    <div className="flex-shrink-0">
                      <Avatar name={displayName} src={otherParticipant.avatar} size="md" online={isOnline} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm font-semibold truncate ${activeConv === conv.id ? 'text-[#EC4899]' : 'text-on-surface'}`}>{displayName}</span>
                        <span className="text-xs text-outline flex-shrink-0">
                          {conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">
                        {conv.lastMessage?.type === 'image' ? '🖼️ Photo' : conv.lastMessage?.type === 'file' ? '📎 File attachment' : conv.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#EC4899] text-white text-xs flex items-center justify-center flex-shrink-0">{conv.unreadCount}</span>
                    )}
                  </motion.button>
                );
              }) : (
                <div className="p-4 text-center text-sm text-on-surface-variant">No conversations found</div>
              )
            )}

            {tab === 'announcements' && <div className="p-4 text-center text-sm text-on-surface-variant">No announcements</div>}
            {tab === 'notifications' && <div className="p-4 text-center text-sm text-on-surface-variant">No new notifications</div>}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeConv && activeConvData ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10" style={{ background: 'var(--surface-container-low)' }}>
                {(() => {
                   const otherParticipant = activeConvData.participants.find(p => p.id !== user?.id) || activeConvData.participants[0];
                   const displayName = activeConvData.name || otherParticipant.name;
                   const isOnline = onlineUsers.has(otherParticipant.id);
                   return (
                     <>
                        <Avatar name={displayName} src={otherParticipant.avatar} size="md" online={isOnline} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-on-surface">{displayName}</p>
                          <p className="text-xs text-on-surface-variant">{isOnline ? 'Online' : 'Offline'}</p>
                        </div>
                     </>
                   )
                })()}
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-all"><Search size={16} /></button>
                  <button className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5 transition-all"><MoreVertical size={16} /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--outline-variant) transparent' }}>
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.id;
                  const showAvatar = !isMe && (i === 0 || messages[i - 1]?.senderId !== msg.senderId);
                  
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && <div className="flex-shrink-0">{showAvatar ? <Avatar name={msg.senderName} src={msg.senderAvatar} size="sm" /> : <div className="w-7" />}</div>}
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {showAvatar && !isMe && <p className="text-xs text-on-surface-variant mb-1 ml-1">{msg.senderName}</p>}
                        
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed overflow-hidden ${isMe ? 'rounded-br-sm text-on-surface' : 'rounded-bl-sm text-on-surface'}`}
                          style={isMe ? { background: 'linear-gradient(135deg, #EC4899, #3B82F6)' } : { background: 'var(--surface-container-high)', backdropFilter: 'blur(8px)' }}>
                          
                          {/* Render Attachment based on type */}
                          {msg.type === 'image' && msg.fileUrl && (
                            <div className="mb-2 -mx-4 -mt-2">
                              <img src={msg.fileUrl} alt="attachment" className="max-w-full h-auto object-contain" style={{ maxHeight: '250px' }} />
                            </div>
                          )}
                          {msg.type === 'file' && msg.fileUrl && (
                            <a href={msg.fileUrl} download className="flex items-center gap-2 p-2 mb-1 bg-black/10 rounded-lg text-sm hover:underline">
                              <FileText size={16} /> Download File
                            </a>
                          )}
                          
                          {/* Text content */}
                          {msg.type !== 'image' && msg.type !== 'file' ? msg.content : (msg.content !== 'Shared a file' ? msg.content : null)}
                        </div>
                        
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-outline">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <CheckCheck size={14} className={msg.isRead ? 'text-[#EC4899]' : 'text-outline'} />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {/* Typing Indicator */}
                <AnimatePresence>
                  {typingUsers.size > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-2.5">
                      <div className="w-7 flex-shrink-0" />
                      <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm" style={{ background: 'var(--surface-container-high)' }}>
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-5 py-4 border-t border-outline-variant/10">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <div className="flex items-end gap-3 px-4 py-3 rounded-2xl border border-outline-variant/20 bg-neutral-100/50 dark:bg-neutral-850/30">
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="text-on-surface-variant hover:text-[#EC4899] transition-colors flex-shrink-0 pb-0.5">
                    <Paperclip size={18} />
                  </button>
                  <textarea
                    value={newMsg}
                    onChange={handleTyping}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={isUploading ? "Uploading..." : "Type a message... (Enter to send)"}
                    rows={1}
                    disabled={isUploading}
                    className="flex-1 bg-transparent text-sm text-on-surface placeholder-slate-500 outline-none resize-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="text-on-surface-variant hover:text-[#EC4899] transition-colors flex-shrink-0 pb-0.5">
                    <Smile size={18} />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={!newMsg.trim() || isUploading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
                    style={{ background: 'linear-gradient(135deg, #EC4899, #3B82F6)' }}
                  >
                    <Send size={15} className="text-white" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-on-surface/5 flex items-center justify-center mx-auto mb-4">
                  <Send size={36} className="text-outline" />
                </div>
                <p className="text-lg font-semibold text-on-surface-variant">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
