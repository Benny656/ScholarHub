import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'local_db.json');

interface LocalDBData {
  users: any[];
  courses: any[];
  sessions: any[];
  enrollments: any[];
  assignments: any[];
  attendance: any[];
  messages: any[];
  notifications: any[];
  live_sessions?: any[];
  session_participants?: any[];
  recordings?: any[];
}

const defaultData: LocalDBData = {
  users: [],
  courses: [],
  sessions: [],
  enrollments: [],
  assignments: [],
  attendance: [],
  messages: [],
  notifications: [],
  live_sessions: [],
  session_participants: [],
  recordings: [],
};

function readDB(): LocalDBData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading local DB:', error);
    return defaultData;
  }
}

function writeDB(data: LocalDBData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing local DB:', error);
  }
}

export const localDB = {
  // Users
  getUsers(): any[] {
    return readDB().users;
  },
  getUserByEmail(email: string): any {
    return readDB().users.find(u => u.email === email);
  },
  getUserById(id: string): any {
    return readDB().users.find(u => u.id === id);
  },
  addUser(user: any) {
    const db = readDB();
    // Prevent duplicate emails
    const existingIndex = db.users.findIndex(u => u.email === user.email);
    if (existingIndex >= 0) {
      db.users[existingIndex] = { ...db.users[existingIndex], ...user };
    } else {
      db.users.push(user);
    }
    writeDB(db);
    return user;
  },

  // Courses
  getCourses(): any[] {
    return readDB().courses;
  },
  getCourseById(id: string): any {
    return readDB().courses.find(c => c.id === id);
  },
  addCourse(course: any) {
    const db = readDB();
    db.courses.push(course);
    writeDB(db);
    return course;
  },
  updateCourse(id: string, courseData: any) {
    const db = readDB();
    const idx = db.courses.findIndex(c => c.id === id);
    if (idx >= 0) {
      db.courses[idx] = { ...db.courses[idx], ...courseData };
      writeDB(db);
      return db.courses[idx];
    }
    return null;
  },
  deleteCourse(id: string) {
    const db = readDB();
    db.courses = db.courses.filter(c => c.id !== id);
    db.sessions = db.sessions.filter(s => s.course_id !== id);
    db.enrollments = db.enrollments.filter(e => e.course_id !== id);
    writeDB(db);
  },

  // Sessions
  getSessions(): any[] {
    return readDB().sessions;
  },
  addSession(session: any) {
    const db = readDB();
    db.sessions.push(session);
    writeDB(db);
    return session;
  },
  updateSessionRecording(sessionId: string, recordingUrl: string) {
    const db = readDB();
    const idx = db.sessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) {
      db.sessions[idx].recording_url = recordingUrl;
      writeDB(db);
      return db.sessions[idx];
    }
    return null;
  },

  // Enrollments
  getEnrollments(): any[] {
    return readDB().enrollments;
  },
  addEnrollment(enrollment: any) {
    const db = readDB();
    const exists = db.enrollments.some(e => e.course_id === enrollment.course_id && e.student_id === enrollment.student_id);
    if (!exists) {
      db.enrollments.push(enrollment);
      writeDB(db);
    }
    return enrollment;
  },
  updateProgress(courseId: string, studentId: string, progress: number) {
    const db = readDB();
    const idx = db.enrollments.findIndex(e => e.course_id === courseId && e.student_id === studentId);
    if (idx >= 0) {
      db.enrollments[idx].progress = progress;
      writeDB(db);
      return db.enrollments[idx];
    }
    return null;
  },

  // Live Sessions
  getLiveSessions(): any[] {
    return readDB().live_sessions || [];
  },
  addLiveSession(session: any) {
    const db = readDB();
    if (!db.live_sessions) db.live_sessions = [];
    db.live_sessions.push(session);
    writeDB(db);
    return session;
  },
  getLiveSessionById(id: string): any {
    return (readDB().live_sessions || []).find(s => s.id === id);
  },
  updateLiveSession(id: string, updates: any) {
    const db = readDB();
    if (!db.live_sessions) db.live_sessions = [];
    const idx = db.live_sessions.findIndex(s => s.id === id);
    if (idx >= 0) {
      db.live_sessions[idx] = { ...db.live_sessions[idx], ...updates };
      writeDB(db);
      return db.live_sessions[idx];
    }
    return null;
  },
  getLiveSessionByClassroomId(classroomId: string) {
    return (readDB().live_sessions || []).find(s => s.classroom_id === classroomId && s.status === 'LIVE');
  },

  // Session Participants
  getSessionParticipants(sessionId: string): any[] {
    return (readDB().session_participants || []).filter(p => p.session_id === sessionId);
  },
  addSessionParticipant(participant: any) {
    const db = readDB();
    if (!db.session_participants) db.session_participants = [];
    const existsIdx = db.session_participants.findIndex(p => p.session_id === participant.session_id && p.user_id === participant.user_id && !p.left_at);
    if (existsIdx >= 0) {
      db.session_participants[existsIdx] = { ...db.session_participants[existsIdx], ...participant };
    } else {
      db.session_participants.push(participant);
    }
    writeDB(db);
    return participant;
  },
  updateSessionParticipantLeave(sessionId: string, userId: string) {
    const db = readDB();
    if (!db.session_participants) db.session_participants = [];
    const idx = db.session_participants.findIndex(p => p.session_id === sessionId && p.user_id === userId && !p.left_at);
    if (idx >= 0) {
      db.session_participants[idx].left_at = new Date().toISOString();
      writeDB(db);
      return db.session_participants[idx];
    }
    return null;
  },

  // Recordings
  getRecordingsBySessionId(sessionId: string): any[] {
    return (readDB().recordings || []).filter(r => r.session_id === sessionId);
  },
  addRecording(recording: any) {
    const db = readDB();
    if (!db.recordings) db.recordings = [];
    db.recordings.push(recording);
    writeDB(db);
    return recording;
  },

  // Messages
  getMessages(): any[] {
    return readDB().messages || [];
  },
  getMessagesByConversation(senderId: string, receiverId: string): any[] {
    const msgs = readDB().messages || [];
    return msgs.filter(m => 
      (m.sender_id === senderId && m.receiver_id === receiverId) ||
      (m.sender_id === receiverId && m.receiver_id === senderId)
    );
  },
  getCourseMessages(courseId: string): any[] {
    return (readDB().messages || []).filter(m => m.course_id === courseId);
  },
  addMessage(message: any) {
    const db = readDB();
    if (!db.messages) db.messages = [];
    db.messages.push(message);
    writeDB(db);
    return message;
  },
  updateMessageRead(messageId: string) {
    const db = readDB();
    if (!db.messages) db.messages = [];
    const idx = db.messages.findIndex(m => m.id === messageId);
    if (idx >= 0) {
      db.messages[idx].is_read = true;
      writeDB(db);
      return db.messages[idx];
    }
    return null;
  }
};
