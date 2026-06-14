import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const messageController = {
  // GET /api/messages/conversations
  async getConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const userId = req.user!.id;

      const { data, error } = await userClient
        .from('messages')
        .select('*, sender:users!messages_sender_id_fkey(name, avatar_url), receiver:users!messages_receiver_id_fkey(name, avatar_url)')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      if (!data) return res.json([]);

      const conversationsMap: Record<string, any> = {};

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
              type: 'text'
            }
          };
        } else {
          if (!msg.is_read && msg.receiver_id === userId) {
            conversationsMap[convId].unreadCount++;
          }
        }
      });

      res.json(Object.values(conversationsMap));
    } catch (error: any) {
      console.warn('getConversations error:', error.message || error);
      res.json([]);
    }
  },

  // GET /api/messages
  async getMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const { conversationId } = req.query;
      if (!conversationId) {
        return res.status(400).json({ error: 'conversationId parameter required' });
      }

      const userClient = getSupabaseForUser(req.user!.token);
      const parts = (conversationId as string).split('-');

      let query = userClient.from('messages').select('*, sender:users!messages_sender_id_fkey(name, avatar_url)');

      if (parts.length >= 2) {
        const [uid1, uid2] = parts;
        query = query.or(`and(sender_id.eq.${uid1},receiver_id.eq.${uid2}),and(sender_id.eq.${uid2},receiver_id.eq.${uid1})`);
      } else {
        query = query.or(`sender_id.eq.${conversationId},receiver_id.eq.${conversationId}`);
      }

      const { data, error } = await query.order('sent_at', { ascending: true });
      if (error) throw error;

      const formatted = (data || []).map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender?.name || 'User',
        senderAvatar: msg.sender?.avatar_url || '',
        content: msg.content || '',
        timestamp: msg.sent_at,
        isRead: msg.is_read,
        type: 'text'
      }));

      res.json(formatted);
    } catch (error: any) {
      console.warn('getMessages error:', error.message || error);
      res.json([]);
    }
  },

  // POST /api/messages
  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { receiverId, content, courseId } = req.body;
      const userId = req.user!.id;
      const userClient = getSupabaseForUser(req.user!.token);

      const { data, error } = await userClient
        .from('messages')
        .insert({
          sender_id: userId,
          receiver_id: courseId ? null : receiverId,
          course_id: courseId || null,
          content,
          is_read: false
        })
        .select('*, sender:users!messages_sender_id_fkey(name, avatar_url)')
        .single();

      if (error) throw error;

      res.status(201).json({
        id: data.id,
        senderId: data.sender_id,
        senderName: data.sender?.name || 'User',
        senderAvatar: data.sender?.avatar_url || '',
        content: data.content || '',
        timestamp: data.sent_at,
        isRead: data.is_read,
        type: 'text'
      });
    } catch (error: any) {
      console.warn('sendMessage error:', error.message || error);
      res.status(400).json({ error: error.message || 'Failed to send message' });
    }
  },

  // PUT /api/messages/:id/read
  async markRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userClient = getSupabaseForUser(req.user!.token);

      const { error } = await userClient
        .from('messages')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      console.warn('markRead error:', error.message || error);
      res.status(400).json({ error: error.message || 'Failed to mark message as read' });
    }
  }
};
