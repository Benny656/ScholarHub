import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  Lock,
  Mail,
  MessageSquare,
  MonitorPlay,
  Search,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, GlassCard } from '../../components/ui';

type HelpCategory =
  | 'Getting Started'
  | 'Student Help'
  | 'Teacher Help'
  | 'Admin Help'
  | 'Live Classroom'
  | 'Assignments & Grading'
  | 'Certificates'
  | 'Account & Security'
  | 'FAQ'
  | 'Contact Support';

type HelpArticle = {
  title: string;
  category: HelpCategory;
  roles: Array<'student' | 'teacher' | 'admin'>;
  summary: string;
  steps: string[];
};

const categories: Array<{ title: HelpCategory; description: string; icon: React.ComponentType<{ size?: number; className?: string }>; accent: string }> = [
  { title: 'Getting Started', description: 'Set up your dashboard, profile, and first workflow.', icon: Sparkles, accent: 'text-[#00bae2] bg-[#00bae2]/10 border-[#00bae2]/20' },
  { title: 'Student Help', description: 'Courses, homework, attendance, grades, and learning tools.', icon: GraduationCap, accent: 'text-[#00bae2] bg-[#00bae2]/10 border-[#00bae2]/20' },
  { title: 'Teacher Help', description: 'Course setup, rosters, assignments, grading, and reports.', icon: Users, accent: 'text-[#9d95ff] bg-[#9d95ff]/10 border-[#9d95ff]/20' },
  { title: 'Admin Help', description: 'User management, subject assignment, analytics, and settings.', icon: UserCog, accent: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { title: 'Live Classroom', description: 'Start, join, monitor, and troubleshoot live sessions.', icon: MonitorPlay, accent: 'text-red-500 bg-red-500/10 border-red-500/20' },
  { title: 'Assignments & Grading', description: 'Submissions, feedback, quiz attempts, and gradebooks.', icon: CheckCircle, accent: 'text-[#00bae2] bg-[#00bae2]/10 border-[#00bae2]/20' },
  { title: 'Certificates', description: 'Issue, download, verify, and manage certificates.', icon: ShieldCheck, accent: 'text-[#9d95ff] bg-[#9d95ff]/10 border-[#9d95ff]/20' },
  { title: 'Account & Security', description: 'Login, profile, notifications, access, and account safety.', icon: Lock, accent: 'text-slate-600 bg-slate-500/10 border-slate-500/20' },
];

const articles: HelpArticle[] = [
  {
    title: 'Set up your ScholarHub dashboard',
    category: 'Getting Started',
    roles: ['student', 'teacher', 'admin'],
    summary: 'Confirm your role, complete your profile, and use the left navigation to reach your daily tools.',
    steps: ['Open your dashboard from the ScholarHub logo.', 'Review your profile details from the account card.', 'Use notifications and messages to catch new work or announcements.'],
  },
  {
    title: 'Find and continue enrolled courses',
    category: 'Student Help',
    roles: ['student'],
    summary: 'Use Course Catalog, My Courses, or Subjects depending on whether you are a university or K-12 student.',
    steps: ['Open Course Catalog or Subjects from the dashboard menu.', 'Select a course to view lessons, assignments, attendance, and certificates.', 'Use the course player to resume your most recent lesson.'],
  },
  {
    title: 'Track assignments and quiz work',
    category: 'Student Help',
    roles: ['student'],
    summary: 'See upcoming assignments, upload submissions, and review quiz or grading feedback.',
    steps: ['Open Assignments & Quizzes or Homework & Assignments.', 'Select the item you need to complete.', 'Submit your work before the due date and check feedback after grading.'],
  },
  {
    title: 'Create and manage course activity',
    category: 'Teacher Help',
    roles: ['teacher'],
    summary: 'Teachers can manage course content, rosters, assignments, attendance, and student performance views.',
    steps: ['Open Course Management or My Classes.', 'Use the course detail page to add lessons, assignments, and live sessions.', 'Review rosters, attendance, and analytics from the course tabs.'],
  },
  {
    title: 'Grade submissions efficiently',
    category: 'Assignments & Grading',
    roles: ['teacher', 'admin'],
    summary: 'Review student submissions, add grades, and return feedback from the teacher grading tools.',
    steps: ['Open Assignments & Question Banks or Assignments & Grading.', 'Select the assignment and student submission.', 'Enter a grade, leave concise feedback, and save.'],
  },
  {
    title: 'Manage platform users',
    category: 'Admin Help',
    roles: ['admin'],
    summary: 'Admins can review accounts, adjust status, assign roles, and audit key account activity.',
    steps: ['Open User Management from the admin dashboard.', 'Search for the account you need.', 'Update access, role, or status based on your institution policy.'],
  },
  {
    title: 'Assign K-12 subjects to teachers',
    category: 'Admin Help',
    roles: ['admin'],
    summary: 'Subject Assignment keeps K-12 teaching access controlled by administrators.',
    steps: ['Open Subject Assignment.', 'Choose the teacher and subject area.', 'Save the assignment so it appears in the teacher workspace.'],
  },
  {
    title: 'Start or join a live classroom',
    category: 'Live Classroom',
    roles: ['student', 'teacher', 'admin'],
    summary: 'Live Classroom connects students, teachers, and admins to the right real-time session.',
    steps: ['Open Live Classroom from the dashboard or a course.', 'Join an existing session or start one if you have educator access.', 'Check camera, microphone, and browser permissions before class.'],
  },
  {
    title: 'Download or verify certificates',
    category: 'Certificates',
    roles: ['student', 'teacher', 'admin'],
    summary: 'Certificates can be viewed from the dashboard and verified using the certificate verification route.',
    steps: ['Open Certificates from the dashboard.', 'Select a certificate to view or download.', 'Use the verification link or certificate ID for authenticity checks.'],
  },
  {
    title: 'Keep your account secure',
    category: 'Account & Security',
    roles: ['student', 'teacher', 'admin'],
    summary: 'Use secure login habits, keep your profile current, and review account notifications.',
    steps: ['Use your own ScholarHub account for all activity.', 'Keep recovery email and profile details accurate.', 'Report unexpected role or access changes to an admin.'],
  },
];

const faqs = [
  {
    question: 'Why do I see different menu items than another user?',
    answer: 'ScholarHub shows tools based on your active role. Students, teachers, K-12 teachers, and admins each get a focused dashboard.',
  },
  {
    question: 'Where do I find help for a course-specific issue?',
    answer: 'Open the course first, then check the relevant tab: lessons, assignments, attendance, live class, progress, or certificates.',
  },
  {
    question: 'Can admins view platform analytics?',
    answer: 'Yes. Admin users can open Platform Analytics to review account, course, K-12, university, enrollment, attendance, and live classroom activity.',
  },
  {
    question: 'What should I do if a live class will not load?',
    answer: 'Refresh the page, check browser camera and microphone permissions, then rejoin from the course or Live Classroom menu item.',
  },
  {
    question: 'How do certificates get verified?',
    answer: 'Use the certificate verification page or verification link connected to the certificate ID shown in ScholarHub.',
  },
];

function getRoleLabel(role?: string | null) {
  if (role === 'admin') return 'Admin';
  if (role === 'teacher') return 'Teacher';
  return 'Student';
}

export function HelpCenter() {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'All'>('All');
  const [openFaq, setOpenFaq] = useState(0);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
  });

  const roleArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesRole = article.roles.includes(role as 'student' | 'teacher' | 'admin');
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      const matchesSearch =
        !normalizedQuery ||
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.summary.toLowerCase().includes(normalizedQuery) ||
        article.category.toLowerCase().includes(normalizedQuery);

      return matchesRole && matchesCategory && matchesSearch;
    });
  }, [query, role, selectedCategory]);

  const roleCollections = articles.filter((article) => article.roles.includes(role as 'student' | 'teacher' | 'admin')).slice(0, 4);

  const handleSupportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      toast.error('Add a subject and message first.');
      return;
    }

    toast.success('Support request drafted. We will connect this to the support inbox next.');
    setSupportForm({ subject: '', message: '' });
  };

  return (
    <div className="max-w-[1280px] mx-auto pb-12 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E1DCC9]/20 bg-[#FFFCE1] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#7c7c6f] dark:border-[#412D15] dark:bg-[#412D15] dark:text-[#7c7c6f]">
              <HelpCircle size={14} />
              {getRoleLabel(role)} Help Center
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#0e100f] dark:text-[#E1DCC9]">
              Find the right answer fast.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7c7c6f] dark:text-[#7c7c6f]">
              Role-aware guides for learning, teaching, live classes, assignments, certificates, account access, and platform administration.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#E1DCC9]/20 bg-[#FFFCE1] p-2 dark:border-[#412D15] dark:bg-[#412D15]">
            {['student', 'teacher', 'admin'].map((item) => (
              <div
                key={item}
                className={`rounded-xl px-3 py-2 text-center text-xs font-bold capitalize ${
                  role === item
                    ? 'bg-brand-primary text-[#E1DCC9]'
                    : 'bg-[#FFFCE1] text-[#7c7c6f] dark:bg-[#412D15]/70 dark:text-[#7c7c6f]'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <GlassCard className="p-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E1DCC9]/20 bg-[#FFFCE1] px-4 py-3 dark:border-[#412D15] dark:bg-[#1F150C]/40">
            <Search className="h-5 w-5 shrink-0 text-[#7c7c6f]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search help articles, guides, or topics"
              className="w-full bg-transparent text-sm font-medium text-[#0e100f] outline-none placeholder:text-[#7c7c6f] dark:text-[#E1DCC9]"
            />
          </div>
        </GlassCard>
      </motion.div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category, index) => {
          const Icon = category.icon;
          const active = selectedCategory === category.title;

          return (
            <motion.button
              key={category.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setSelectedCategory(active ? 'All' : category.title)}
              className={`group rounded-3xl border bg-[#FFFCE1] p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-[#412D15] ${
                active ? 'border-brand-primary ring-2 ring-brand-primary/10' : 'border-[#E1DCC9]/20 dark:border-[#412D15]'
              }`}
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${category.accent}`}>
                <Icon size={20} />
              </div>
              <h2 className="text-sm font-bold text-[#0e100f] dark:text-[#E1DCC9]">{category.title}</h2>
              <p className="mt-2 text-xs leading-5 text-[#7c7c6f] dark:text-[#7c7c6f]">{category.description}</p>
            </motion.button>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <GlassCard className="min-h-[420px]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0e100f] dark:text-[#E1DCC9]">Recommended Articles</h2>
              <p className="mt-1 text-xs font-medium text-[#7c7c6f] dark:text-[#7c7c6f]">
                {selectedCategory === 'All' ? `${getRoleLabel(role)} guides` : selectedCategory}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setQuery('');
              }}
              className="text-xs font-bold text-brand-primary hover:text-brand-primary/80"
            >
              Reset filters
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {roleArticles.length ? (
                roleArticles.map((article) => (
                  <motion.article
                    key={article.title}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-[#E1DCC9]/20 bg-[#FFFCE1]/70 p-4 dark:border-[#412D15] dark:bg-[#1F150C]/30"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 inline-flex rounded-lg bg-[#FFFCE1] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7c7c6f] ring-1 ring-neutral-200 dark:bg-[#412D15] dark:text-[#7c7c6f] dark:ring-neutral-800">
                          {article.category}
                        </div>
                        <h3 className="text-sm font-bold text-[#0e100f] dark:text-[#E1DCC9]">{article.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-[#7c7c6f] dark:text-[#7c7c6f]">{article.summary}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 md:grid-cols-3">
                      {article.steps.map((step) => (
                        <div key={step} className="rounded-xl bg-[#FFFCE1] px-3 py-2 text-xs leading-5 text-[#7c7c6f] ring-1 ring-neutral-200 dark:bg-[#412D15] dark:text-[#7c7c6f] dark:ring-neutral-800">
                          {step}
                        </div>
                      ))}
                    </div>
                  </motion.article>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center dark:border-[#412D15]"
                >
                  <BookOpen className="mx-auto mb-3 h-8 w-8 text-[#7c7c6f]" />
                  <p className="text-sm font-semibold text-[#7c7c6f] dark:text-neutral-200">No matching articles yet</p>
                  <p className="mt-1 text-xs text-[#7c7c6f] dark:text-[#7c7c6f]">Try another keyword or category.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-primary" />
              <h2 className="text-sm font-bold text-[#0e100f] dark:text-[#E1DCC9]">Role Quick Links</h2>
            </div>
            <div className="space-y-2">
              {roleCollections.map((article) => (
                <button
                  key={article.title}
                  onClick={() => {
                    setSelectedCategory(article.category);
                    setQuery(article.title);
                  }}
                  className="w-full rounded-2xl border border-[#E1DCC9]/20 bg-[#FFFCE1] p-3 text-left text-xs font-semibold text-[#7c7c6f] transition hover:border-brand-primary/40 hover:text-brand-primary dark:border-[#412D15] dark:bg-[#1F150C]/40 dark:text-[#7c7c6f]"
                >
                  {article.title}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#00bae2]" />
              <h2 className="text-sm font-bold text-[#0e100f] dark:text-[#E1DCC9]">Contact Support</h2>
            </div>
            <form onSubmit={handleSupportSubmit} className="space-y-3">
              <input
                value={supportForm.subject}
                onChange={(event) => setSupportForm((prev) => ({ ...prev, subject: event.target.value }))}
                placeholder="Subject"
                className="w-full rounded-2xl border border-[#E1DCC9]/20 bg-[#FFFCE1] px-4 py-3 text-sm text-[#0e100f] outline-none transition focus:border-brand-primary dark:border-[#412D15] dark:bg-[#1F150C]/40 dark:text-[#E1DCC9]"
              />
              <textarea
                value={supportForm.message}
                onChange={(event) => setSupportForm((prev) => ({ ...prev, message: event.target.value }))}
                placeholder="Tell us what you need help with"
                rows={5}
                className="w-full resize-none rounded-2xl border border-[#E1DCC9]/20 bg-[#FFFCE1] px-4 py-3 text-sm text-[#0e100f] outline-none transition focus:border-brand-primary dark:border-[#412D15] dark:bg-[#1F150C]/40 dark:text-[#E1DCC9]"
              />
              <Button type="submit" variant="primary" className="w-full" icon={<Mail size={14} />}>
                Send Request
              </Button>
            </form>
          </GlassCard>
        </div>
      </section>

      <GlassCard>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#0e100f] dark:text-[#E1DCC9]">FAQ</h2>
          <p className="mt-1 text-xs font-medium text-[#7c7c6f] dark:text-[#7c7c6f]">Fast answers for common ScholarHub workflows.</p>
        </div>

        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {faqs.map((faq, index) => {
            const open = openFaq === index;

            return (
              <div key={faq.question} className="py-3">
                <button
                  onClick={() => setOpenFaq(open ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-sm font-bold text-[#0e100f] dark:text-[#E1DCC9]">{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[#7c7c6f] transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3 text-sm leading-6 text-[#7c7c6f] dark:text-[#7c7c6f]"
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
