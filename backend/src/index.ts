import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173', // Vite default port
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(...process.env.FRONTEND_URL.split(',').map(url => url.trim()));
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Not allowed by CORS'));
      } else {
        callback(null, true); // Fallback for local debugging
      }
    }
  },
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for API testing ease
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- AI Copilot Backdoor Route (Strictly Public) ---
app.post('/api/public-chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    const userMessage = messages[messages.length - 1]?.content || '';
    const prompt = context 
      ? `System Context: ${context}\n\nUser: ${userMessage}` 
      : userMessage;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined, using simulated response");
      let simulatedResponse = `I see you are focused on your studies. Would you like me to generate a 25-minute Pomodoro study schedule?`;
      if (context) {
        simulatedResponse = `I see from your context that ${context}. How can I help you with your tasks today?`;
      }
      return res.status(200).json({
        role: 'assistant',
        content: simulatedResponse
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return res.status(200).json({
      role: 'assistant',
      content: responseText
    });
  } catch (error: any) {
    console.error("GEMINI CRASH in public-chat:", error);
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error' 
    });
  }
});

// Mount API routes
app.use('/api', apiRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Scholarhub Backend is awake!', timestamp: new Date().toISOString() });
});

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Keep track of active conference room participants
// Key: roomId, Value: Map of socketId -> { userId, userName, role }
const activeRoomParticipants = new Map<string, Map<string, { userId: string, userName: string, role: string }>>();

// Track online users for messaging app
// Key: userId, Value: socketId
const onlineUsers = new Map<string, string>();

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // ---- MESSAGING APP SOCKETS ----
  socket.on('set-online', ({ userId }) => {
    onlineUsers.set(userId, socket.id);
    socket.data = { ...socket.data, userId };
    io.emit('user-online', { userId });
  });

  socket.on('join-chat', ({ conversationId }) => {
    socket.join(`chat_${conversationId}`);
    console.log(`[Socket] User ${socket.data?.userId} joined chat_${conversationId}`);
  });

  socket.on('leave-chat', ({ conversationId }) => {
    socket.leave(`chat_${conversationId}`);
  });

  socket.on('chat-typing', ({ conversationId, userId }) => {
    socket.to(`chat_${conversationId}`).emit('chat-typing', { conversationId, userId });
  });

  socket.on('chat-stop-typing', ({ conversationId, userId }) => {
    socket.to(`chat_${conversationId}`).emit('chat-stop-typing', { conversationId, userId });
  });

  socket.on('chat-message', ({ conversationId, message }) => {
    io.to(`chat_${conversationId}`).emit('chat-message', { conversationId, message });
  });

  socket.on('chat-read', ({ conversationId, messageId, userId }) => {
    io.to(`chat_${conversationId}`).emit('chat-read', { conversationId, messageId, userId });
  });
  // -------------------------------

  // Join a classroom room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('user-connected', socket.id);
  });

  // Track live Jitsi conference room participants
  socket.on('join-conference', ({ roomId, userId, userName, role }) => {
    socket.join(roomId);
    if (!activeRoomParticipants.has(roomId)) {
      activeRoomParticipants.set(roomId, new Map());
    }
    activeRoomParticipants.get(roomId)!.set(socket.id, { userId, userName, role });

    const participants = Array.from(activeRoomParticipants.get(roomId)!.values());
    io.to(roomId).emit('participant-list-update', participants);
    io.to(roomId).emit('participant-joined', { userId, userName, role });

    console.log(`[Socket] ${userName} (${role}) joined conference ${roomId}`);
  });

  socket.on('leave-conference', ({ roomId }) => {
    socket.leave(roomId);
    if (activeRoomParticipants.has(roomId)) {
      const participant = activeRoomParticipants.get(roomId)!.get(socket.id);
      if (participant) {
        activeRoomParticipants.get(roomId)!.delete(socket.id);
        const participants = Array.from(activeRoomParticipants.get(roomId)!.values());
        io.to(roomId).emit('participant-list-update', participants);
        io.to(roomId).emit('participant-left', participant);
        console.log(`[Socket] ${participant.userName} left conference ${roomId}`);
      }
    }
  });

  // Broadcast live session status updates (LIVE/ENDED)
  socket.on('session-status-update', ({ roomId, status, session }) => {
    console.log(`[Socket] Session status update for classroom ${roomId}: ${status}`);
    io.to(roomId).emit('session-status-changed', { status, session });
  });

  // Real-time chat messages inside a classroom
  socket.on('send-message', ({ roomId, message }) => {
    socket.to(roomId).emit('receive-message', message);
  });

  // Real-time whiteboard draw events
  socket.on('draw', ({ roomId, drawData }) => {
    socket.to(roomId).emit('draw', drawData);
  });

  // Real-time raise hand events
  socket.on('raise-hand', ({ roomId, userId, userName }) => {
    socket.to(roomId).emit('hand-raised', { userId, userName });
  });

  socket.on('lower-hand', ({ roomId, userId }) => {
    socket.to(roomId).emit('hand-lowered', { userId });
  });

  socket.on('mute-user', ({ roomId, userId }) => {
    console.log(`[Socket] Mute requested for user ${userId} in room ${roomId}`);
    io.to(roomId).emit('mute-user-received', { userId });
  });

  socket.on('kick-user', ({ roomId, userId }) => {
    console.log(`[Socket] Kick requested for user ${userId} in room ${roomId}`);
    io.to(roomId).emit('kick-user-received', { userId });
  });

  socket.on('create-breakout-room', ({ roomId, breakoutRoom }) => {
    console.log(`[Socket] Breakout room created in classroom ${roomId}:`, breakoutRoom);
    io.to(roomId).emit('breakout-room-created', breakoutRoom);
  });

  socket.on('disconnecting', () => {
    // Handle global messaging online status
    const userId = socket.data?.userId;
    if (userId && onlineUsers.get(userId) === socket.id) {
      onlineUsers.delete(userId);
      io.emit('user-offline', { userId });
    }

    // Check all rooms the socket was in before disconnecting
    for (const roomId of socket.rooms) {
      if (activeRoomParticipants.has(roomId)) {
        const participant = activeRoomParticipants.get(roomId)!.get(socket.id);
        if (participant) {
          activeRoomParticipants.get(roomId)!.delete(socket.id);
          const participants = Array.from(activeRoomParticipants.get(roomId)!.values());
          io.to(roomId).emit('participant-list-update', participants);
          io.to(roomId).emit('participant-left', participant);
          console.log(`[Socket] ${participant.userName} left conference on disconnect from ${roomId}`);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 ScholarHub Backend Server running on port ${PORT}`);
});
