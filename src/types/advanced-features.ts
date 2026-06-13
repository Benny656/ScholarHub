// src/types/advanced-features.ts

// AI Proctoring
export interface ExamSession {
  id: string;
  courseId: string;
  studentId: string;
  startTime: string;
  status: 'monitoring' | 'completed' | 'flagged';
  webcamStatus: 'active' | 'disconnected' | 'blocked';
}

export interface ViolationLog {
  id: string;
  sessionId: string;
  timestamp: string;
  type: 'no_face' | 'multiple_faces' | 'tab_switch' | 'audio_anomaly';
  severity: 'low' | 'medium' | 'high';
  snapshotUrl?: string;
}

// Blockchain Certificates
export interface BlockchainRecord {
  id: string;
  certificateId: string;
  studentId: string;
  status: 'pending' | 'processing' | 'verified' | 'failed';
  hash?: string;
  timestamp?: string;
  network: string;
}

// Peer Review
export interface PeerReview {
  id: string;
  assignmentId: string;
  reviewerId: string;
  revieweeId: string;
  status: 'assigned' | 'in_progress' | 'submitted';
  score?: number;
  feedback?: string;
  dueDate: string;
}

// Learning Streaks
export interface StudentStreak {
  studentId: string;
  currentStreak: number;
  longestStreak: number;
  xpPoints: number;
  level: number;
  badges: string[];
}

// AI Study Planner
export interface StudyPlan {
  id: string;
  studentId: string;
  weekStartDate: string;
  tasks: StudyTask[];
}

export interface StudyTask {
  id: string;
  title: string;
  course: string;
  type: 'video' | 'reading' | 'assignment' | 'quiz';
  allocatedMinutes: number;
  status: 'pending' | 'completed';
  aiSuggested: boolean;
}

// Offline Mode
export interface OfflineResource {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'notes';
  sizeBytes: number;
  syncStatus: 'synced' | 'downloading' | 'pending_upload';
  progress?: number;
}

// Voice Commands
export interface VoiceCommand {
  command: string;
  confidence: number;
  action: 'navigate' | 'action' | 'query';
  target?: string;
}
