import type { Message, Conversation, Announcement, Notification } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    participants: [
      { id: 'u1', name: 'Alex Johnson' },
      { id: 'u2', name: 'Dr. Sarah Chen' },
    ],
    lastMessage: {
      id: 'm10',
      senderId: 'u2',
      senderName: 'Dr. Sarah Chen',
      content: 'Great progress on your assignment! Keep it up.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isRead: false,
      type: 'text',
    },
    unreadCount: 2,
    type: 'direct',
  },
  {
    id: 'conv2',
    participants: [
      { id: 'u1', name: 'Alex Johnson' },
      { id: 'u3', name: 'Marcus Rivera' },
      { id: 'u8', name: 'Jordan Lee' },
    ],
    lastMessage: {
      id: 'm20',
      senderId: 'u8',
      senderName: 'Jordan Lee',
      content: 'Anyone joining the study group tonight?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: true,
      type: 'text',
    },
    unreadCount: 0,
    type: 'group',
    name: 'Web Dev Study Group',
  },
  {
    id: 'conv3',
    participants: [
      { id: 'u1', name: 'Alex Johnson' },
    ],
    lastMessage: {
      id: 'm30',
      senderId: 'u2',
      senderName: 'Dr. Sarah Chen',
      content: 'New assignment posted: React Component Architecture',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: true,
      type: 'text',
    },
    unreadCount: 0,
    type: 'course',
    name: 'Full-Stack Web Dev — Announcements',
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  conv1: [
    { id: 'm1', senderId: 'u1', senderName: 'Alex Johnson', content: 'Hi Dr. Chen, I had a question about the assignment.', timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), isRead: true, type: 'text' },
    { id: 'm2', senderId: 'u2', senderName: 'Dr. Sarah Chen', content: 'Of course! What would you like to know?', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), isRead: true, type: 'text' },
    { id: 'm3', senderId: 'u1', senderName: 'Alex Johnson', content: 'Should we use React Context or Redux for state management?', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), isRead: true, type: 'text' },
    { id: 'm4', senderId: 'u2', senderName: 'Dr. Sarah Chen', content: 'For this project size, React Context is perfectly fine. Redux would be overkill.', timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(), isRead: true, type: 'text' },
    { id: 'm5', senderId: 'u2', senderName: 'Dr. Sarah Chen', content: 'Great progress on your assignment! Keep it up.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), isRead: false, type: 'text' },
  ],
  conv2: [
    { id: 'm21', senderId: 'u8', senderName: 'Jordan Lee', content: "Hey everyone! How's the DSA prep going?", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), isRead: true, type: 'text' },
    { id: 'm22', senderId: 'u1', senderName: 'Alex Johnson', content: 'Struggling with dynamic programming a bit 😅', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), isRead: true, type: 'text' },
    { id: 'm23', senderId: 'u8', senderName: 'Jordan Lee', content: 'Anyone joining the study group tonight?', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), isRead: true, type: 'text' },
  ],
};

const MOCK_ANNOUNCEMENTS: Announcement[] = [
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
  {
    id: 'ann2',
    title: 'Platform Maintenance — June 10',
    content: 'NexLearn will undergo scheduled maintenance on June 10 from 2:00 AM to 4:00 AM UTC. The platform may be temporarily unavailable.',
    authorId: 'u3',
    authorName: 'Marcus Rivera',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    pinned: false,
  },
  {
    id: 'ann3',
    title: 'Live Session: Advanced React Patterns — June 12',
    content: 'Join Dr. Sarah Chen for a live deep dive into advanced React patterns including compound components, render props, and custom hooks.',
    authorId: 'u2',
    authorName: 'Dr. Sarah Chen',
    courseId: 'c1',
    courseName: 'Full-Stack Web Development',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    pinned: false,
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Assignment Graded', message: 'Your UX Research Report received a score of 87/100', type: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), isRead: false, link: '/assignments/a3' },
  { id: 'n2', title: 'New Message', message: 'Dr. Sarah Chen sent you a message', type: 'info', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), isRead: false, link: '/messages' },
  { id: 'n3', title: 'Assignment Due Soon', message: 'React Component Architecture due in 3 days', type: 'warning', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), isRead: true, link: '/assignments/a1' },
  { id: 'n4', title: 'Certificate Earned', message: "You've completed UI/UX Design Masterclass!", type: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), isRead: true, link: '/certificates' },
  { id: 'n5', title: 'Live Class Starting', message: 'Advanced React Patterns starts in 10 minutes', type: 'info', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), isRead: false, link: '/classroom/cl1' },
];

export const messagesService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    await delay(500);
    // In real app: GET /api/messages/conversations
    return MOCK_CONVERSATIONS;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    await delay(400);
    // In real app: GET /api/messages/conversations/:id/messages
    return MOCK_MESSAGES[conversationId] || [];
  },

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    await delay(200);
    const msg: Message = {
      id: `m-${Date.now()}`,
      senderId,
      senderName: 'Alex Johnson',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text',
    };
    // In real app: POST /api/messages/conversations/:id/send (or via WebSocket)
    return msg;
  },

  async getAnnouncements(userId: string): Promise<Announcement[]> {
    await delay(400);
    // In real app: GET /api/announcements
    return MOCK_ANNOUNCEMENTS;
  },

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    await delay(500);
    const ann: Announcement = {
      id: `ann-${Date.now()}`,
      title: data.title || '',
      content: data.content || '',
      authorId: data.authorId || '',
      authorName: data.authorName || '',
      courseId: data.courseId,
      courseName: data.courseName,
      createdAt: new Date().toISOString(),
      pinned: false,
    };
    // In real app: POST /api/announcements
    return ann;
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    await delay(300);
    // In real app: GET /api/notifications
    return MOCK_NOTIFICATIONS;
  },

  async markNotificationRead(id: string): Promise<void> {
    await delay(200);
    // In real app: PUT /api/notifications/:id/read
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    await delay(300);
    // In real app: PUT /api/notifications/read-all
  },
};
