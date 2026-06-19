import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { classroomController } from '../controllers/classroom.controller.js';
import { sessionController } from '../controllers/session.controller.js';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authController } from '../controllers/auth.controller.js';
import { paymentController } from '../controllers/payment.controller.js';
import { calendarController } from '../controllers/calendar.controller.js';
import { aiController } from '../controllers/ai.controller.js';
import { uploadController } from '../controllers/upload.controller.js';
import { adminController } from '../controllers/admin.controller.js';
import { assignmentController } from '../controllers/assignment.controller.js';
import { attendanceController } from '../controllers/attendance.controller.js';
import { messageController } from '../controllers/message.controller.js';
import { notificationController } from '../controllers/notification.controller.js';
import { liveController } from '../controllers/live.controller.js';
import { certificateController } from '../controllers/certificate.controller.js';
import { verifyController } from '../controllers/verify.controller.js';

const router = Router();
const upload = multer();

// --- Public Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// --- Public Certificates (Demo) ---
router.post('/certificates/mint', certificateController.mintCertificate);
router.post('/verify/analyze-vision', upload.single('file'), verifyController.analyzeVision);

// --- Payment Routes (Public for demo) ---
router.post('/payments/order', paymentController.createOrder);
router.post('/payments/create-order', paymentController.createOrder); // alias for forward-compat

// --- AI Copilot Routes (Public for demo) ---
router.post('/ai/chat', aiController.chat);

// Apply authentication middleware to remaining api routes
router.use(authMiddleware);

// --- Protected Auth Routes ---
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authController.getMe);

// --- Classroom Routes ---
router.get('/classrooms/enrolled', classroomController.getEnrolledClassrooms);
router.get('/classrooms', classroomController.getClassrooms);
router.get('/classrooms/:id', classroomController.getClassroomById);
router.post('/classrooms', roleMiddleware(['teacher', 'admin']), classroomController.createClassroom);
router.put('/classrooms/:id', roleMiddleware(['teacher', 'admin']), classroomController.updateClassroom);
router.delete('/classrooms/:id', roleMiddleware(['teacher', 'admin']), classroomController.deleteClassroom);
router.put('/classrooms/:id/progress', classroomController.updateProgress);

// --- Enrollment & Members ---
router.post('/classrooms/:id/enroll', classroomController.enrollStudent);
router.get('/classrooms/:id/members', classroomController.getClassroomMembers);

// --- Live Sessions & Recording ---
router.get('/classrooms/:id/sessions', sessionController.getClassroomSessions);
router.post('/classrooms/:id/sessions', roleMiddleware(['teacher', 'admin']), sessionController.scheduleSession);
router.patch('/classrooms/:id/sessions/:sessionId/recording', roleMiddleware(['teacher', 'admin']), sessionController.updateSessionRecording);

// --- Teacher-Hosted Live Video Classroom System Routes ---
router.post('/live/start', roleMiddleware(['teacher', 'admin']), liveController.startSession);
router.post('/live/end', roleMiddleware(['teacher', 'admin']), liveController.endSession);
router.get('/live/participants', liveController.getParticipants);
router.post('/live/create-breakout-room', liveController.createBreakoutRoom);
router.get('/live/session/:classroomId', liveController.getActiveSession);
router.post('/live/join', liveController.joinSession);
router.post('/live/leave', liveController.leaveSession);

// --- Teacher Dashboard ---
router.get('/teacher/dashboard', roleMiddleware(['teacher', 'admin']), dashboardController.getTeacherDashboard);

// --- Payment Routes (Protected) ---
router.post('/payments/verify', paymentController.verifyPayment);



// --- Calendar Routes ---
router.get('/calendar/events', calendarController.getEvents);
router.post('/calendar/events', calendarController.createEvent);

router.delete('/calendar/events/:id', calendarController.deleteEvent);
router.post('/calendar/sync/google', calendarController.syncGoogleCalendar);

// --- Storage Upload Routes ---
router.post('/upload', upload.single('file'), uploadController.uploadFile);
router.delete('/upload/:key', uploadController.deleteFile);

// --- Admin System Routes ---
router.get('/admin/stats', roleMiddleware(['admin']), adminController.getStats);
router.get('/admin/users', roleMiddleware(['admin']), adminController.getUsers);
router.put('/admin/users/:id/status', roleMiddleware(['admin']), adminController.updateUserStatus);
router.get('/admin/logs', roleMiddleware(['admin']), adminController.getLogs);

// --- Assignments & Quizzes ---
router.get('/assignments', assignmentController.getAssignments);
router.get('/assignments/:id', assignmentController.getAssignmentById);
router.post('/assignments/:id/submit', assignmentController.submitAssignment);
router.post('/submissions/:id/grade', roleMiddleware(['teacher', 'admin']), assignmentController.gradeSubmission);
router.get('/quizzes/:courseId', assignmentController.getQuiz);
router.post('/quizzes/:id/submit', assignmentController.submitQuiz);
router.get('/teacher/assignments', roleMiddleware(['teacher', 'admin']), assignmentController.getTeacherAssignments);

// --- Attendance Routes ---
router.post('/attendance/mark', attendanceController.markAttendance);
router.get('/attendance', attendanceController.getAttendance);
router.get('/attendance/course/:courseId', attendanceController.getCourseAttendance);
router.post('/attendance/scan', attendanceController.scanQRCode);
router.get('/attendance/report/:courseId', roleMiddleware(['teacher', 'admin']), attendanceController.getAttendanceReport);

// --- Peer & Course Messaging ---
router.get('/messages/conversations', messageController.getConversations);
router.get('/messages', messageController.getMessages);
router.post('/messages', messageController.sendMessage);
router.put('/messages/:id/read', messageController.markRead);

// --- User Notifications ---
router.get('/notifications', notificationController.getNotifications);
router.put('/notifications/:id/read', notificationController.markRead);
router.put('/notifications/read-all', notificationController.markAllRead);



export default router;
