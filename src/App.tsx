import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Layout
import { V2DashboardLayout } from './layouts/V2DashboardLayout';

// Landing page
import { LandingPage } from './pages/landing/LandingPage';

// Other shared components
import { NotFound } from './components/NotFound';
import { CustomCursor } from './components/ui/CustomCursor';
import { FloatingElements3D } from './components/FloatingElements3D';
import { LoadingScreen } from './components/ui/LoadingScreen';

// Auth & Theme context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './hooks/useTheme';

// Auth pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword, ResetPassword } from './pages/auth/ForgotPassword';

// Dashboards
import { StudentDashboard } from './pages/unistudents/Dashboard';
import { SchoolStudentDashboard } from './pages/school-student/SchoolStudentDashboard';
import { TeacherDashboard } from './pages/teacher/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';

// Courses
import { CourseCatalog } from './pages/courses/CourseCatalog';
import { CreateCourse } from './pages/courses/CreateCourse';
import { CourseDetail, EditCourse } from './pages/courses/CourseDetail';

// Classroom & LMS
import { LiveClassroom } from './pages/classroom/LiveClassroom';
import { CoursePlayer } from './pages/lms/CoursePlayer';

// Assignments
import { Assignments, AssignmentDetail, Quiz } from './pages/assignments/Assignments';

// Other screens
import { Attendance } from './pages/attendance/Attendance';
import { Messages } from './pages/messages/Messages';
import { Analytics } from './pages/analytics/Analytics';
import { CalendarPage } from './pages/calendar/Calendar';
import { Certificates, CertificateVerify } from './pages/certificates/Certificates';
import { Profile } from './pages/profile/Profile';
import { PricingPage } from './pages/pricing/PricingPage';
import { AdminLogin } from './pages/admin-panel/AdminLogin';
import { AdminGuard } from './components/admin/AdminGuard';

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

// ─── App routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ─── Landing ─── */}
        <Route path="/" element={<LandingPage />} />

        {/* ─── Auth ─── */}
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />

        {/* ─── Dashboards ─── */}
        <Route path="/unistudents/dashboard" element={<DashboardWrapper><StudentDashboard /></DashboardWrapper>} />
        <Route path="/school-student/dashboard" element={<DashboardWrapper><SchoolStudentDashboard /></DashboardWrapper>} />
        <Route path="/teacher/dashboard" element={<DashboardWrapper><TeacherDashboard /></DashboardWrapper>} />
        <Route path="/admin/dashboard" element={<DashboardWrapper><AdminDashboard /></DashboardWrapper>} />

        {/* ─── Courses ─── */}
        <Route path="/courses" element={<DashboardWrapper><CourseCatalog /></DashboardWrapper>} />
        <Route path="/courses/create" element={<DashboardWrapper><CreateCourse /></DashboardWrapper>} />
        <Route path="/courses/:id" element={<DashboardWrapper><CourseDetail /></DashboardWrapper>} />
        <Route path="/courses/:id/edit" element={<DashboardWrapper><EditCourse /></DashboardWrapper>} />

        {/* ─── Live Classroom ─── */}
        <Route path="/classroom/:id" element={<DashboardWrapper><LiveClassroom /></DashboardWrapper>} />

        {/* ─── LMS Course Player ─── */}
        <Route path="/learn/:courseId/:lessonId" element={<DashboardWrapper><CoursePlayer /></DashboardWrapper>} />

        {/* ─── Assignments ─── */}
        <Route path="/assignments" element={<DashboardWrapper><Assignments /></DashboardWrapper>} />
        <Route path="/assignments/:id" element={<DashboardWrapper><AssignmentDetail /></DashboardWrapper>} />
        <Route path="/assignments/:id/quiz" element={<DashboardWrapper><Quiz /></DashboardWrapper>} />

        {/* ─── Other screens ─── */}
        <Route path="/attendance" element={<DashboardWrapper><Attendance /></DashboardWrapper>} />
        <Route path="/messages" element={<DashboardWrapper><Messages /></DashboardWrapper>} />
        <Route path="/analytics" element={<DashboardWrapper><Analytics /></DashboardWrapper>} />
        <Route path="/calendar" element={<DashboardWrapper><CalendarPage /></DashboardWrapper>} />
        <Route path="/certificates" element={<DashboardWrapper><Certificates /></DashboardWrapper>} />
        <Route path="/verify/:certId" element={<DashboardWrapper><CertificateVerify /></DashboardWrapper>} />
        <Route path="/profile" element={<DashboardWrapper><Profile /></DashboardWrapper>} />
        <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />

        {/* ─── Secure Admin Panel ─── */}
        <Route path="/scholar-hub-admin-panel" element={<Navigate to="/scholar-hub-admin-panel/login" replace />} />
        <Route path="/scholar-hub-admin-panel/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
        <Route path="/scholar-hub-admin-panel/dashboard" element={<DashboardWrapper><AdminGuard><AdminDashboard /></AdminGuard></DashboardWrapper>} />

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
  const [isLoading, setIsLoading] = useState(true);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <LoadingScreen key="global-loader" onComplete={() => setIsLoading(false)} />
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
