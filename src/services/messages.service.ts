import type { Message, Conversation, Announcement } from '../types';
import { supabase } from '../lib/supabase';

export const messagesService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(name, avatar_url), receiver:users!messages_receiver_id_fkey(name, avatar_url)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('sent_at', { ascending: false }) as any;

    if (error) throw error;
    if (!data) return [];

    const conversationsMap: Record<string, Conversation> = {};

    data.forEach((msg: any) => {
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
  },

  async getMessages(userIdOrConversationId: string): Promise<Message[]> {
    const parts = userIdOrConversationId.split('-');
    if (parts.length >= 2) {
      const [uid1, uid2] = parts;
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:users!messages_sender_id_fkey(name, avatar_url)')
        .or(`and(sender_id.eq.${uid1},receiver_id.eq.${uid2}),and(sender_id.eq.${uid2},receiver_id.eq.${uid1})`)
        .order('sent_at', { ascending: true }) as any;

      if (error) throw error;
      return (data || []).map(this.mapDBMessageToFrontend);
    } else {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:users!messages_sender_id_fkey(name, avatar_url)')
        .or(`sender_id.eq.${userIdOrConversationId},receiver_id.eq.${userIdOrConversationId}`)
        .order('sent_at', { ascending: true }) as any;

      if (error) throw error;
      return (data || []).map(this.mapDBMessageToFrontend);
    }
  },

  // Alias for Messages.tsx compatibility
  async getConversation(conversationId: string): Promise<Message[]> {
    return this.getMessages(conversationId);
  },

  async sendMessage(
    receiverIdOrConversationId: string,
    contentOrSenderId: string,
    maybeContent?: string,
    courseId?: string
  ): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    let finalReceiverId: string | null = null;
    let finalContent = '';

    if (maybeContent !== undefined) {
      const parts = receiverIdOrConversationId.split('-');
      finalReceiverId = parts.find(id => id !== contentOrSenderId) || contentOrSenderId;
      finalContent = maybeContent;
    } else {
      finalReceiverId = receiverIdOrConversationId;
      finalContent = contentOrSenderId;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: courseId ? null : finalReceiverId,
        course_id: courseId || null,
        content: finalContent,
        is_read: false,
      })
      .select('*, sender:users!messages_sender_id_fkey(name, avatar_url)')
      .single() as any;

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

  async getAnnouncements(_userId: string): Promise<Announcement[]> {
    return [];
  },

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    return {
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
  },

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

  subscribeToMessages(conversationId: string, onNewMessage: (msg: Message) => void) {
    const parts = conversationId.split('-');
    
    return supabase
      .channel(`room:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new;
          const belongs = parts.length >= 2 
            ? (newMsg.sender_id === parts[0] && newMsg.receiver_id === parts[1]) || (newMsg.sender_id === parts[1] && newMsg.receiver_id === parts[0])
            : newMsg.course_id === conversationId;
            
          if (belongs) {
            const { data: userData } = await supabase
              .from('users')
              .select('name, avatar_url')
              .eq('id', newMsg.sender_id)
              .single() as any;
              
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
