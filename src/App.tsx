import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster as SonnerToaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Layout
import { V2DashboardLayout } from './layouts/V2DashboardLayout';

import { LandingPage } from './pages/landing/LandingPage';

import { StudentRoster } from './pages/teacher/StudentRoster';
import { AssignmentsQuestionBanks } from './pages/teacher/AssignmentsQuestionBanks';
import { ExamScheduling } from './pages/teacher/ExamScheduling';

// Components
import { NotFound } from './components/NotFound';
import { CustomCursor } from './components/ui/CustomCursor';
import { FloatingElements3D } from './components/FloatingElements3D';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { AppLoading } from './components/ui/AppLoading';
import { AICopilot } from './components/AICopilot';

// Auth & Theme context
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './hooks/useTheme';
import { getDashboardPath, ADMIN_EMAILS } from './services/auth.service';

// Auth pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { RoleSelection } from './pages/auth/RoleSelection';
import { ForgotPassword, ResetPassword } from './pages/auth/ForgotPassword';

// Dashboards
import { StudentDashboard } from './pages/unistudents/Dashboard';
import { PeerHub } from './pages/unistudents/PeerHub';
import { SchoolStudentDashboard } from './pages/school-student/SchoolStudentDashboard';
import { CollegeDashboard } from './pages/teacher/CollegeDashboard';
import { K12TeacherDashboard } from './pages/teacher/K12TeacherDashboard';
import { AdminDashboard } from './pages/admin/Dashboard';
import { UsersPage } from './pages/admin/UsersPage';
import { CoursesPage } from './pages/admin/CoursesPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { AdminSubjectAssignment } from './pages/admin/AdminSubjectAssignment';

// Courses
import { CourseCatalog } from './pages/courses/CourseCatalog';
import { CreateCourse } from './pages/courses/CreateCourse';
import { CourseDetail } from './pages/courses/CourseDetail';
import { MyCourses } from './pages/unistudents/MyCourses';
import { ExamCalendar } from './pages/unistudents/ExamCalendar';
import { GradesGPA } from './pages/unistudents/GradesGPA';

// Classroom & LMS
import { LiveClassroom } from './pages/classroom/LiveClassroom';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

function LiveClassroomWrapper() {
  const { courseId } = useParams<{ courseId: string }>();

  if (!courseId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
        <p className="text-neutral-500 dark:text-neutral-400 font-medium">Resolving classroom session details...</p>
      </div>
    );
  }

  return <LiveClassroom courseId={courseId} />;
}

function MyClassesWrapper() {
  const { user } = useAuth();
  const isK12Teacher = user?.role === 'teacher' && (user.teacherTrack === 'k12' || user.gradeLevel?.toLowerCase().startsWith('k12'));

  if (isK12Teacher) {
    return <K12TeacherDashboard />;
  }

  return <ComingSoonPlaceholder title="My Classes" />;
}

function TimetableRouteWrapper() {
  const { user } = useAuth();
  const isK12Teacher = user?.role === 'teacher' && (user.teacherTrack === 'k12' || user.gradeLevel?.toLowerCase().startsWith('k12'));
  const isK12Student = user?.role === 'student' && user.gradeLevel?.toLowerCase().startsWith('k12');

  if (isK12Teacher) {
    return <TeacherTimetable />;
  }
  if (isK12Student) {
    return <StudentTimetable />;
  }

  return <ComingSoonPlaceholder title="Timetable" />;
}
import { CoursePlayer } from './pages/lms/CoursePlayer';

// Assignments
import { Assignments, AssignmentDetail, Quiz } from './pages/assignments/Assignments';

// Other screens
import { Attendance } from './pages/attendance/Attendance';
import { Messages } from './pages/messages/Messages';
import { Analytics } from './pages/analytics/Analytics';
import { CalendarPage } from './pages/calendar/Calendar';
import { Certificates, CertificateVerify } from './pages/certificates/Certificates';
import { IssueCertificate } from './components/IssueCertificate';
import { AdminIssueCertificate } from './pages/admin/AdminIssueCertificate';
import { Profile } from './pages/profile/Profile';
import { NotificationsSettings } from './pages/settings/Notifications';
import { PricingPage } from './pages/pricing/PricingPage';
import { AdminLogin } from './pages/admin-panel/AdminLogin';
import { AdminGuard } from './components/admin/AdminGuard';
import { ComingSoonPlaceholder } from './components/ComingSoonPlaceholder';
import { HelpCenter } from './pages/help/HelpCenter';
import AssignmentsGrading from './pages/teacher/AssignmentsGrading';
import ReportCards from './pages/teacher/ReportCards';
import TeacherTimetable from './pages/teacher/TeacherTimetable';
import StudentTimetable from './pages/school-student/StudentTimetable';
import CourseManagement from './pages/teacher/CourseManagement';

// ─── Page animation wrapper ────────────────────────────────────────────────────
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

// ─── Dashboard shell wrapper ───────────────────────────────────────────────────
function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <V2DashboardLayout>
      <PageWrapper>
        {children}
      </PageWrapper>
    </V2DashboardLayout>
  );
}

// ─── Auth Redirector ──────────────────────────────────────────────────────────
function AuthRedirector({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, requireRoleSelection, isLoading } = useAuth();

  if (isLoading) return <AppLoading />;

  const userEmail = user?.email?.toLowerCase();
  const isAdminEmail = userEmail && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(userEmail);

  if (isAuthenticated && isAdminEmail) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (requireRoleSelection) {
    return <Navigate to="/onboarding/role-selection" replace />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, requireRoleSelection, user } = useAuth();

  if (isLoading) return <AppLoading />;

  const userEmail = user?.email?.toLowerCase();
  const isAdminEmail = userEmail && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(userEmail);

  if (requireRoleSelection && !isAdminEmail) return <Navigate to="/onboarding/role-selection" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

// ─── App routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AuthRedirector><LandingPage /></AuthRedirector>} />

        {/* ─── Auth ─── */}
        <Route path="/login" element={<AuthRedirector><PageWrapper><Login /></PageWrapper></AuthRedirector>} />
        <Route path="/register" element={<AuthRedirector><PageWrapper><Register /></PageWrapper></AuthRedirector>} />
        <Route path="/onboarding/role-selection" element={<PageWrapper><RoleSelection /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />

        {/* ─── Dashboards ─── */}
        <Route path="/unistudents/dashboard" element={<ProtectedRoute><DashboardWrapper><StudentDashboard /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/unistudents/peer-hub" element={<ProtectedRoute><DashboardWrapper><PeerHub /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/school-student/dashboard" element={<ProtectedRoute><DashboardWrapper><SchoolStudentDashboard /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/teacher/dashboard" element={<ProtectedRoute><DashboardWrapper><CollegeDashboard /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/k12-teacher/dashboard" element={<ProtectedRoute><DashboardWrapper><K12TeacherDashboard /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardWrapper><AdminGuard><AdminDashboard /></AdminGuard></DashboardWrapper></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><DashboardWrapper><AdminGuard><UsersPage /></AdminGuard></DashboardWrapper></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute><DashboardWrapper><AdminGuard><CoursesPage /></AdminGuard></DashboardWrapper></ProtectedRoute>} />
        <Route path="/admin/subject-assignment" element={<ProtectedRoute><DashboardWrapper><AdminGuard><AdminSubjectAssignment /></AdminGuard></DashboardWrapper></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><DashboardWrapper><AdminGuard><AnalyticsPage /></AdminGuard></DashboardWrapper></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><DashboardWrapper><AdminGuard><SettingsPage /></AdminGuard></DashboardWrapper></ProtectedRoute>} />

        {/* ─── Courses ─── */}
        <Route path="/courses" element={<ProtectedRoute><DashboardWrapper><CourseCatalog /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/courses/create" element={<ProtectedRoute><DashboardWrapper><CreateCourse /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><DashboardWrapper><CourseDetail /></DashboardWrapper></ProtectedRoute>} />

        {/* ─── Live Classroom ─── */}
        <Route path="/classroom/:courseId" element={<ProtectedRoute><DashboardWrapper><LiveClassroomWrapper /></DashboardWrapper></ProtectedRoute>} />

        {/* ─── LMS Course Player ─── */}
        <Route path="/learn/:courseId/:lessonId" element={<ProtectedRoute><DashboardWrapper><CoursePlayer /></DashboardWrapper></ProtectedRoute>} />

        {/* ─── Assignments ─── */}
        <Route path="/assignments" element={<ProtectedRoute><DashboardWrapper><Assignments /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/assignments/:id" element={<ProtectedRoute><DashboardWrapper><AssignmentDetail /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/assignments/:id/quiz" element={<ProtectedRoute><DashboardWrapper><Quiz /></DashboardWrapper></ProtectedRoute>} />

        {/* ─── Other screens ─── */}
        <Route path="/attendance" element={<ProtectedRoute><DashboardWrapper><Attendance /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><DashboardWrapper><Messages /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><DashboardWrapper><ComingSoonPlaceholder title="Analytics" /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><DashboardWrapper><CalendarPage /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute><DashboardWrapper><Certificates /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/verify/:certId" element={<ProtectedRoute><DashboardWrapper><CertificateVerify /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/issue-certificates" element={<ProtectedRoute><DashboardWrapper><IssueCertificate /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/verify-certificates" element={<ProtectedRoute><DashboardWrapper><CertificateVerify /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><DashboardWrapper><Profile /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><DashboardWrapper><HelpCenter /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/settings/notifications" element={<ProtectedRoute><DashboardWrapper><NotificationsSettings /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />

        {/* ─── Role-specific Placeholder Routes ─── */}
        <Route path="/subjects" element={<ProtectedRoute><DashboardWrapper><ComingSoonPlaceholder title="Subjects" /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/homework" element={<ProtectedRoute><DashboardWrapper><ComingSoonPlaceholder title="Homework & Assignments" /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/timetable" element={<ProtectedRoute><DashboardWrapper><TimetableRouteWrapper /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/report-card" element={<ProtectedRoute><DashboardWrapper><ComingSoonPlaceholder title="Report Card" /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/ai-tutor" element={<ProtectedRoute><DashboardWrapper><ComingSoonPlaceholder title="AI Tutor" /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/my-courses" element={<ProtectedRoute><DashboardWrapper><MyCourses /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/exam-calendar" element={<ProtectedRoute><DashboardWrapper><ExamCalendar /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/grades-gpa" element={<ProtectedRoute><DashboardWrapper><GradesGPA /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/progress-analytics" element={<ProtectedRoute><DashboardWrapper><ComingSoonPlaceholder title="Progress Analytics" /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/my-classes" element={<ProtectedRoute><DashboardWrapper><MyClassesWrapper /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/daily-attendance" element={<ProtectedRoute><DashboardWrapper><ComingSoonPlaceholder title="Daily Attendance" /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/assignments-grading" element={<ProtectedRoute><DashboardWrapper><AssignmentsGrading /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/report-cards" element={<ProtectedRoute><DashboardWrapper><ReportCards /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/parent-communication" element={<ProtectedRoute><DashboardWrapper><ComingSoonPlaceholder title="Parent Communication" /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><DashboardWrapper><ComingSoonPlaceholder title="Announcements" /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/course-management" element={<ProtectedRoute><DashboardWrapper><CourseManagement /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/student-roster" element={<ProtectedRoute><DashboardWrapper><StudentRoster /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/question-banks" element={<ProtectedRoute><DashboardWrapper><AssignmentsQuestionBanks /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/exam-scheduling" element={<ProtectedRoute><DashboardWrapper><ExamScheduling /></DashboardWrapper></ProtectedRoute>} />
        <Route path="/course-analytics" element={<ProtectedRoute><DashboardWrapper><ComingSoonPlaceholder title="Course Analytics" /></DashboardWrapper></ProtectedRoute>} />
        

        {/* Admin Specific Sub-Routes */}
        <Route path="/admin/issue-certificates" element={<ProtectedRoute><DashboardWrapper><AdminGuard><AdminIssueCertificate /></AdminGuard></DashboardWrapper></ProtectedRoute>} />
        <Route path="/admin/verify-certificates" element={<ProtectedRoute><DashboardWrapper><AdminGuard><CertificateVerify /></AdminGuard></DashboardWrapper></ProtectedRoute>} />
        <Route path="/admin/course-approvals" element={<Navigate to="/admin/courses" replace />} />
        <Route path="/admin/platform-analytics" element={<ProtectedRoute><DashboardWrapper><AdminGuard><AnalyticsPage /></AdminGuard></DashboardWrapper></ProtectedRoute>} />
        <Route path="/admin/revenue-analytics" element={<ProtectedRoute><DashboardWrapper><AdminGuard><ComingSoonPlaceholder title="Revenue Analytics" /></AdminGuard></DashboardWrapper></ProtectedRoute>} />
        <Route path="/admin/system-settings" element={<ProtectedRoute><DashboardWrapper><AdminGuard><ComingSoonPlaceholder title="System Settings" /></AdminGuard></DashboardWrapper></ProtectedRoute>} />

        {/* ─── Secure Admin Panel ─── */}
        <Route path="/scholar-hub-admin-panel" element={<Navigate to="/scholar-hub-admin-panel/login" replace />} />
        <Route path="/scholar-hub-admin-panel/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
        <Route path="/scholar-hub-admin-panel/dashboard" element={<ProtectedRoute><DashboardWrapper><AdminGuard><AdminDashboard /></AdminGuard></DashboardWrapper></ProtectedRoute>} />

        {/* ─── Fallbacks ─── */}
        <Route path="/404" element={<PageWrapper><NotFound /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

// ─── Theme-aware Toaster — lives inside ThemeProvider ─────────────────────────
function ThemeAwareToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3500,
        style: isDark
          ? {
              background: 'rgba(13, 18, 30, 0.96)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#e2e8f0',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }
          : {
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              color: '#181c22',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            },
      }}
    />
  );
}

// ─── App content — must be inside ThemeProvider ────────────────────────────────
function AppContent() {
  const { isLoading: authLoading } = useAuth();
  const [appReady, setAppReady] = useState(false);
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {(!appReady && location.pathname === '/') ? (
        <LoadingScreen key="global-loader" onComplete={() => setAppReady(true)} />
      ) : (
        <motion.div
          key="app-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-full w-full"
        >
          <CustomCursor />
          <FloatingElements3D />
          <AppRoutes />
          <ThemeAwareToaster />
          <SonnerToaster position="top-right" richColors />
          <AICopilot />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
