import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';
import { localDB } from '../localDB.js';

export const messageController = {
  // GET /api/messages/conversations
  async getConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userClient = getSupabaseForUser(req.user!.token);
      const userId = req.user!.id;

      let data: any[] | null = null;

      try {
        const { data: dbData, error } = await userClient
          .from('messages')
          .select('*, sender:users!messages_sender_id_fkey(name, avatar_url), receiver:users!messages_receiver_id_fkey(name, avatar_url)')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('sent_at', { ascending: false });

        if (error) throw error;
        data = dbData;
      } catch (e) {
        // localDB fallback
        console.warn('[Messages] Falling back to localDB for conversations');
        const allMsgs = localDB.getMessages();
        const users = localDB.getUsers();
        data = allMsgs.filter(m => m.sender_id === userId || m.receiver_id === userId).map(m => {
          const sender = users.find(u => u.id === m.sender_id);
          const receiver = users.find(u => u.id === m.receiver_id);
          return {
            ...m,
            sender: { name: sender?.name, avatar_url: sender?.avatar_url },
            receiver: { name: receiver?.name, avatar_url: receiver?.avatar_url }
          };
        }).sort((a, b) => new Date(b.sent_at || Date.now()).getTime() - new Date(a.sent_at || Date.now()).getTime());
      }

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
              fileUrl: msg.file_url || null,
              timestamp: msg.sent_at,
              isRead: msg.is_read,
              type: msg.message_type || 'text'
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

      let formatted: any[] = [];

      try {
        let query = userClient.from('messages').select('*, sender:users!messages_sender_id_fkey(name, avatar_url)');

        if (parts.length >= 2) {
          const [uid1, uid2] = parts;
          query = query.or(`and(sender_id.eq.${uid1},receiver_id.eq.${uid2}),and(sender_id.eq.${uid2},receiver_id.eq.${uid1})`);
        } else {
          query = query.or(`sender_id.eq.${conversationId},receiver_id.eq.${conversationId}`);
        }

        const { data, error } = await query.order('sent_at', { ascending: true });
        if (error) throw error;
        
        formatted = (data || []).map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.sender?.name || 'User',
          senderAvatar: msg.sender?.avatar_url || '',
          content: msg.content || '',
          fileUrl: msg.file_url || null,
          timestamp: msg.sent_at,
          isRead: msg.is_read,
          type: msg.message_type || 'text'
        }));
      } catch (e) {
        console.warn('[Messages] Falling back to localDB for getMessages');
        let data: any[] = [];
        if (parts.length >= 2) {
          data = localDB.getMessagesByConversation(parts[0], parts[1]);
        } else {
          data = localDB.getCourseMessages(conversationId as string);
        }
        
        const users = localDB.getUsers();
        formatted = data.map((msg: any) => {
          const sender = users.find(u => u.id === msg.sender_id);
          return {
            id: msg.id,
            senderId: msg.sender_id,
            senderName: sender?.name || 'User',
            senderAvatar: sender?.avatar_url || '',
            content: msg.content || '',
            fileUrl: msg.file_url || null,
            timestamp: msg.sent_at,
            isRead: msg.is_read,
            type: msg.message_type || 'text'
          };
        });
      }

      res.json(formatted);
    } catch (error: any) {
      console.warn('getMessages error:', error.message || error);
      res.json([]);
    }
  },

  // POST /api/messages
  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { receiverId, content, courseId, fileUrl, messageType } = req.body;
      const userId = req.user!.id;
      const userClient = getSupabaseForUser(req.user!.token);

      const msgObj = {
        sender_id: userId,
        receiver_id: courseId ? null : receiverId,
        course_id: courseId || null,
        content,
        file_url: fileUrl || null,
        message_type: messageType || 'text',
        is_read: false,
        sent_at: new Date().toISOString()
      };

      let sentMsg: any = null;

      try {
        const { data, error } = await userClient
          .from('messages')
          .insert(msgObj)
          .select('*, sender:users!messages_sender_id_fkey(name, avatar_url)')
          .single();

        if (error) throw error;
        sentMsg = data;
      } catch (e) {
        console.warn('[Messages] Falling back to localDB for sendMessage');
        const inserted = localDB.addMessage({ id: 'msg_' + Date.now(), ...msgObj });
        const sender = localDB.getUserById(userId);
        sentMsg = { ...inserted, sender: { name: sender?.name, avatar_url: sender?.avatar_url } };
      }

      res.status(201).json({
        id: sentMsg.id,
        senderId: sentMsg.sender_id,
        senderName: sentMsg.sender?.name || 'User',
        senderAvatar: sentMsg.sender?.avatar_url || '',
        content: sentMsg.content || '',
        fileUrl: sentMsg.file_url || null,
        timestamp: sentMsg.sent_at,
        isRead: sentMsg.is_read,
        type: sentMsg.message_type || 'text'
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

      try {
        const { error } = await userClient
          .from('messages')
          .update({ is_read: true })
          .eq('id', id);

        if (error) throw error;
      } catch (e) {
        console.warn('[Messages] Falling back to localDB for markRead');
        localDB.updateMessageRead(id);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.warn('markRead error:', error.message || error);
      res.status(400).json({ error: error.message || 'Failed to mark message as read' });
    }
  }
};
