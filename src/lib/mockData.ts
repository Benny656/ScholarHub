export interface Course {
  id: string;
  code: string;
  title: string;
  instructor: string;
  studentsCount: number;
  progress: number;
  nextSchedule: string;
  icon: string;
  category: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseTitle: string;
  type: string;
  dueDate: string;
  status: "not_started" | "in_progress" | "in_review" | "completed";
  studentName?: string;
  gpaRating?: string;
  score?: number;
}

export interface SecurityEvent {
  id: string;
  event: string;
  location: string;
  ip: string;
  time: string;
  type: "info" | "warning" | "alert";
}

export interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  avatar: string;
  text: string;
  time: string;
  unread: boolean;
  type: "direct" | "notification";
}

export const initialCourses: Course[] = [
  {
    id: "c1",
    code: "CS 302",
    title: "Data Science Foundations",
    instructor: "Prof. Sarah Jenkins",
    studentsCount: 942,
    progress: 72,
    nextSchedule: "Today, 2:00 PM",
    icon: "database",
    category: "Computer Science"
  },
  {
    id: "c2",
    code: "MATH 201",
    title: "Linear Algebra & Matrices",
    instructor: "Dr. Robert Chen",
    studentsCount: 124,
    progress: 45,
    nextSchedule: "Tomorrow, 10:30 AM",
    icon: "calculate",
    category: "Mathematics"
  },
  {
    id: "c3",
    code: "PHYS 402",
    title: "Nuclear Physics II",
    instructor: "Dr. Julian Vance",
    studentsCount: 128,
    progress: 88,
    nextSchedule: "Today, 10:30 AM",
    icon: "atom",
    category: "Physics"
  },
  {
    id: "c4",
    code: "AI 512",
    title: "Cognitive Models & AI Lab",
    instructor: "Prof. Clara Oswald",
    studentsCount: 210,
    progress: 60,
    nextSchedule: "Friday, 3:00 PM",
    icon: "brain-circuit",
    category: "Artificial Intelligence"
  },
  {
    id: "c5",
    code: "PHIL 101",
    title: "Ethics in AI & Modern Lab",
    instructor: "Prof. Julian Vance",
    studentsCount: 112,
    progress: 35,
    nextSchedule: "Monday, 1:00 PM",
    icon: "scale",
    category: "philosophy"
  }
];

export const initialAssignments: Assignment[] = [
  {
    id: "a1",
    title: "Neural Networks & Backpropagation Research Paper",
    courseTitle: "Data Science Foundations",
    type: "Research Paper",
    dueDate: "Due in 2 days",
    status: "in_progress",
    studentName: "Alex Mercer",
  },
  {
    id: "a2",
    title: "Weekly Calculus & Eigenvector Quiz",
    courseTitle: "Linear Algebra & Matrices",
    type: "Quiz",
    dueDate: "Tomorrow, 11:00 PM",
    status: "not_started",
    studentName: "Marcus Thorne",
  },
  {
    id: "a3",
    title: "Quantum Mechanics Final Laboratory Report",
    courseTitle: "Nuclear Physics II",
    type: "Lab Report",
    dueDate: "Due Today",
    status: "in_review",
    studentName: "Marcus Thorne",
    score: 85
  },
  {
    id: "a4",
    title: "Heuristic Search Problem Set Draft",
    courseTitle: "Cognitive Models & AI Lab",
    type: "Homework",
    dueDate: "Completed 2h ago",
    status: "completed",
    studentName: "Elena Rodriguez",
    score: 94,
    gpaRating: "3.9"
  }
];

export const initialSecurityEvents: SecurityEvent[] = [
  {
    id: "s1",
    event: "New Administrator Location Logged",
    location: "London, UK",
    ip: "192.168.1.42",
    time: "2 minutes ago",
    type: "info"
  },
  {
    id: "s2",
    event: "SSH Key Attempt Rejected",
    location: "Frankfurt, DE",
    ip: "84.123.95.12",
    time: "14 minutes ago",
    type: "warning"
  },
  {
    id: "s3",
    event: "Database Schema Auto-Backup Complete",
    location: "Cloud Storage Bucket",
    ip: "Storage Internal",
    time: "1 hour ago",
    type: "info"
  }
];

export const initialMessages: Message[] = [
  {
    id: "m1",
    senderName: "Dr. Julian Vance",
    senderRole: "Senior Physics Fellow",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    text: "Review on Nuclear Physics II homework syllabus is ready. Need final clearance.",
    time: "08:14 AM",
    unread: true,
    type: "direct"
  },
  {
    id: "m2",
    senderName: "Marcus Thorne",
    senderRole: "College Student",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face",
    text: "Professor, I had a question on the third formula of the Quantum mechanics worksheet. Can we review today?",
    time: "Yesterday",
    unread: false,
    type: "direct"
  },
  {
    id: "m3",
    senderName: "System Administrator",
    senderRole: "System Health Alert",
    avatar: "",
    text: "ScholarHub platform experienced 99.98% uptime in last week cycle.",
    time: "3 days ago",
    unread: false,
    type: "notification"
  }
];

export interface Role {
  id: "student_school" | "student_college" | "teacher" | "admin";
  name: string;
  badge: string;
  avatar: string;
  description: string;
}

export const allRoles: Role[] = [
  {
    id: "student_school",
    name: "Alex Mercer (School)",
    badge: "Grade 11 Student",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face",
    description: "High School Scholar pursuing Mathematics and Preparatory Physics."
  },
  {
    id: "student_college",
    name: "Alex Mercer (College)",
    badge: "Junior • CompSci",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    description: "Computer Science Major with specialized focus on neural architecture frameworks."
  },
  {
    id: "teacher",
    name: "Dr. Julian Vance",
    badge: "Senior Academic Fellow",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
    description: "Lead lecturer in Theoretical Quantum Physics and Core AI Ethics."
  },
  {
    id: "admin",
    name: "Dean Sarah Chen",
    badge: "General Admin Console",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face",
    description: "Institutional supervisor of ScholarHub network, handling logs and ARR statistics."
  }
];
