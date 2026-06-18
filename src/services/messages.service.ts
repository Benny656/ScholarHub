import type { Message, Conversation, Announcement } from '../types';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabase';

export const messagesService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    console.log('[MessagesService] Fetching conversations from backend for User:', userId);
    return apiClient.get<Conversation[]>('/messages/conversations');
  },

  async getMessages(userIdOrConversationId: string): Promise<Message[]> {
    console.log('[MessagesService] Fetching messages from backend for Conversation:', userIdOrConversationId);
    return apiClient.get<Message[]>(`/messages?conversationId=${userIdOrConversationId}`);
  },

  async getConversation(conversationId: string): Promise<Message[]> {
    return this.getMessages(conversationId);
  },

  async sendMessage(
    receiverIdOrConversationId: string,
    contentOrSenderId: string,
    maybeContent?: string,
    courseId?: string,
    fileUrl?: string,
    messageType?: 'text' | 'image' | 'file'
  ): Promise<Message> {
    console.log('[MessagesService] Sending message via backend');
    
    let receiverId: string | null = null;
    let content = '';

    if (maybeContent !== undefined) {
      const parts = receiverIdOrConversationId.split('-');
      receiverId = parts.find(id => id !== contentOrSenderId) || contentOrSenderId;
      content = maybeContent;
    } else {
      receiverId = receiverIdOrConversationId;
      content = contentOrSenderId;
    }

    return apiClient.post<Message>('/messages', {
      receiverId,
      content,
      courseId,
      fileUrl,
      messageType
    });
  },

  async markAsRead(messageId: string): Promise<void> {
    console.log('[MessagesService] Marking message read via backend:', messageId);
    await apiClient.put(`/messages/${messageId}/read`);
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
