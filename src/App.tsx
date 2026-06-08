import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Landing page components (untouched)
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MarqueeTicker } from './components/MarqueeTicker';
import { ProblemSection, SolutionSection } from './components/ProblemSolution';
import { DashboardPreview, FeaturesSection } from './components/Dashboard';
import { StatsSection } from './components/Stats';
import { TestimonialsSection } from './components/Testimonials';
import { PricingSection } from './components/Pricing';
import { HowItWorks, CTASection } from './components/OnboardingCTA';
import { Footer } from './components/Footer';
import { NotFound } from './components/NotFound';
import { CustomCursor } from './components/CustomCursor';
import { useScrollReveal } from './hooks/useAnimations';

// Auth context
import { AuthProvider } from './context/AuthContext';

// Auth pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword, ResetPassword } from './pages/auth/ForgotPassword';

// Dashboards
import { StudentDashboard } from './pages/student/Dashboard';
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

function HomePage() {
  useScrollReveal();

  useEffect(() => {
    const createRipple = (event: MouseEvent) => {
      const button = event.currentTarget as HTMLElement;
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
      circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
      circle.classList.add('ripple');
      const ripple = button.querySelector('.ripple');
      if (ripple) ripple.remove();
      button.appendChild(circle);
    };
    const buttons = document.querySelectorAll('.ripple-btn');
    buttons.forEach((button) => button.addEventListener('click', createRipple as EventListener));
    return () => buttons.forEach((button) => button.removeEventListener('click', createRipple as EventListener));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-on-surface transition-colors duration-500"
    >
      <Navbar />
      <Hero />
      <MarqueeTicker />
      <ProblemSection />
      <SolutionSection />
      <DashboardPreview />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ─── Landing page (untouched) ─── */}
        <Route path="/" element={<HomePage />} />

        {/* ─── Auth ─── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ─── Dashboards ─── */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* ─── Courses ─── */}
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/courses/create" element={<CreateCourse />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/courses/:id/edit" element={<EditCourse />} />

        {/* ─── Live Classroom ─── */}
        <Route path="/classroom/:id" element={<LiveClassroom />} />

        {/* ─── LMS Course Player ─── */}
        <Route path="/learn/:courseId/:lessonId" element={<CoursePlayer />} />

        {/* ─── Assignments ─── */}
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/assignments/:id" element={<AssignmentDetail />} />
        <Route path="/assignments/:id/quiz" element={<Quiz />} />

        {/* ─── Other screens ─── */}
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/verify/:certId" element={<CertificateVerify />} />
        <Route path="/profile" element={<Profile />} />

        {/* ─── Fallbacks ─── */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomCursor />
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'rgba(13,20,45,0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
