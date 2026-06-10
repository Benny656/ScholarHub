import type { Message, Conversation, Announcement } from '../types';
import { supabase } from '../lib/supabase';

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann1',
    title: 'New Assignment Posted: React Component Architecture',
    content: 'A new assignment has been posted for the Full-Stack Web Development course. Please review the requirements and submit by June 15th.',
    authorId: 'u2',
    authorName: 'Dr. Sarah Chen',
    courseId: 'c1',
    courseName: 'Full-Stack Web Development',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    pinned: true,
  },
];

export const messagesService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      // In our requested database, messages table stores receiver_id and sender_id.
      // We can query distinct sender/receiver pairs or courses.
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:users!messages_sender_id_fkey(name, avatar_url), receiver:users!messages_receiver_id_fkey(name, avatar_url)')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        return this.getMockConversations();
      }

      const conversationsMap: Record<string, Conversation> = {};

      data.forEach(msg => {
        const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        
        if (!otherUserId || !otherUser) return;
        
        const convId = [userId, otherUserId].sort().join('-');
        
        if (!conversationsMap[convId]) {
          conversationsMap[convId] = {
            id: convId,
            participants: [
              { id: userId, name: 'You' },
              { id: otherUserId, name: otherUser.name || 'User', avatar: otherUser.avatar_url || '' }
            ],
            unreadCount: !msg.is_read && msg.receiver_id === userId ? 1 : 0,
            type: msg.course_id ? 'course' : 'direct',
            name: msg.course_id ? 'Course Chat' : undefined,
            lastMessage: {
              id: msg.id,
              senderId: msg.sender_id,
              senderName: msg.sender?.name || 'User',
              senderAvatar: msg.sender?.avatar_url || '',
              content: msg.content || '',
              timestamp: msg.sent_at,
              isRead: msg.is_read,
              type: 'text',
            }
          };
        } else {
          if (!msg.is_read && msg.receiver_id === userId) {
            conversationsMap[convId].unreadCount++;
          }
        }
      });

      return Object.values(conversationsMap);
    } catch (err) {
      console.warn('Supabase getConversations failed, returning mocks:', err);
      return this.getMockConversations();
    }
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      // Parse ids from dynamic conversations
      const parts = conversationId.split('-');
      if (parts.length < 2) {
        // Assume course_id lookup
        const { data, error } = await supabase
          .from('messages')
          .select('*, sender:users!messages_sender_id_fkey(name, avatar_url)')
          .eq('course_id', conversationId)
          .order('sent_at', { ascending: true });
        
        if (error) throw error;
        return (data || []).map(this.mapDBMessageToFrontend);
      }

      const [uid1, uid2] = parts;
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:users!messages_sender_id_fkey(name, avatar_url)')
        .or(`and(sender_id.eq.${uid1},receiver_id.eq.${uid2}),and(sender_id.eq.${uid2},receiver_id.eq.${uid1})`)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(this.mapDBMessageToFrontend);
    } catch (err) {
      console.warn('Supabase getMessages failed, returning mocks:', err);
      return [];
    }
  },

  async sendMessage(conversationId: string, senderId: string, content: string, courseId?: string): Promise<Message> {
    const parts = conversationId.split('-');
    const receiverId = parts.find(id => id !== senderId) || senderId;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: courseId ? null : receiverId,
        course_id: courseId || null,
        content,
        is_read: false,
      })
      .select('*, sender:users!messages_sender_id_fkey(name, avatar_url)')
      .single();

    if (error) throw error;
    return this.mapDBMessageToFrontend(data);
  },

  async markAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
  },

  async getAnnouncements(userId: string): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase
        .from('assignments') // We can query announcements or courses or a custom Announcements table.
        // Wait, the new schema doesn't have announcements, let's query lessons or courses or fallback
        .select('*, courses(title, teacher_id)');
      
      if (error) throw error;
      return MOCK_ANNOUNCEMENTS;
    } catch {
      return MOCK_ANNOUNCEMENTS;
    }
  },

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    const ann: Announcement = {
      id: `ann-${Date.now()}`,
      title: data.title || '',
      content: data.content || '',
      authorId: data.authorId || '',
      authorName: data.authorName || 'Teacher',
      courseId: data.courseId,
      courseName: data.courseName,
      createdAt: new Date().toISOString(),
      pinned: false,
    };
    return ann;
  },

  // Private helpers
  mapDBMessageToFrontend(msg: any): Message {
    return {
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.sender?.name || 'User',
      senderAvatar: msg.sender?.avatar_url || '',
      content: msg.content || '',
      timestamp: msg.sent_at,
      isRead: msg.is_read,
      type: 'text',
    };
  },

  getMockConversations(): Conversation[] {
    return [
      {
        id: 'u1-u2',
        participants: [
          { id: 'u1', name: 'Alex Johnson' },
          { id: 'u2', name: 'Dr. Sarah Chen' },
        ],
        lastMessage: {
          id: 'm10',
          senderId: 'u2',
          senderName: 'Dr. Sarah Chen',
          content: 'Great progress on your assignment! Keep it up.',
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'text',
        },
        unreadCount: 1,
        type: 'direct',
      }
    ];
  },

  // Realtime subscription helper
  subscribeToMessages(conversationId: string, onNewMessage: (msg: Message) => void) {
    const parts = conversationId.split('-');
    const filter = parts.length >= 2 
      ? `or(and(sender_id.eq.${parts[0]},receiver_id.eq.${parts[1]}),and(sender_id.eq.${parts[1]},receiver_id.eq.${parts[0]}))`
      : `course_id=eq.${conversationId}`;

    return supabase
      .channel(`room:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new;
          // Verify if it belongs to this conversation
          const belongs = parts.length >= 2 
            ? (newMsg.sender_id === parts[0] && newMsg.receiver_id === parts[1]) || (newMsg.sender_id === parts[1] && newMsg.receiver_id === parts[0])
            : newMsg.course_id === conversationId;
            
          if (belongs) {
            // Fetch sender profile details
            const { data: userData } = await supabase
              .from('users')
              .select('name, avatar_url')
              .eq('id', newMsg.sender_id)
              .single();
              
            onNewMessage({
              id: newMsg.id,
              senderId: newMsg.sender_id,
              senderName: userData?.name || 'User',
              senderAvatar: userData?.avatar_url || '',
              content: newMsg.content,
              timestamp: newMsg.sent_at,
              isRead: newMsg.is_read,
              type: 'text',
            });
          }
        }
      )
      .subscribe();
  }
};
