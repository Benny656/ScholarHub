// AI Service — All AI features go through this module
// Replace mock implementations with real API calls (OpenAI, Gemini, etc.)

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CourseRecommendation {
  courseId: string;
  title: string;
  reason: string;
  matchScore: number;
  category: string;
}

export interface QuizGenerationResult {
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    points: number;
  }[];
}

export interface AssignmentCheckResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  plagiarismScore: number;
}

export interface AttendanceInsight {
  insight: string;
  type: 'warning' | 'info' | 'success';
  recommendation: string;
}

// Simulated streaming response
async function* streamText(text: string): AsyncGenerator<string> {
  const words = text.split(' ');
  for (const word of words) {
    await delay(50 + Math.random() * 80);
    yield word + ' ';
  }
}

export const aiService = {
  // AI Tutor chatbot
  async sendTutorMessage(messages: AIMessage[], context?: string): Promise<AIMessage> {
    await delay(1200);
    const lastMsg = messages[messages.length - 1]?.content || '';

    // In real app: POST /api/ai/tutor with messages history
    const responses: Record<string, string> = {
      default: "That's a great question! Let me break it down for you. The key concepts here involve understanding the fundamental principles and how they interconnect. I recommend practicing with small examples first, then scaling up to more complex scenarios.",
      react: "React is a powerful UI library by Facebook. The core concepts are: **Components** (reusable UI pieces), **Props** (data passed to components), **State** (internal component data), and **Hooks** (functions to use React features). Start with functional components and useState/useEffect hooks.",
      python: "Python is excellent for beginners! Key concepts: variables, data types, control flow (if/else, loops), functions, and OOP. For ML specifically, focus on NumPy for arrays, Pandas for data manipulation, and Matplotlib for visualization.",
      algorithm: "When approaching algorithm problems, use the UFCSE framework: **Understand** the problem, **Find patterns**, **Choose** a data structure, **Solve** step by step, **Evaluate** complexity. For this type of problem, I'd suggest trying dynamic programming or a greedy approach.",
    };

    const lower = lastMsg.toLowerCase();
    let response = responses.default;
    if (lower.includes('react') || lower.includes('hook') || lower.includes('component')) response = responses.react;
    if (lower.includes('python') || lower.includes('pandas') || lower.includes('numpy')) response = responses.python;
    if (lower.includes('algorithm') || lower.includes('complexity') || lower.includes('leetcode')) response = responses.algorithm;

    return { role: 'assistant', content: response };
  },

  // Streaming version for typing effect
  streamTutorMessage: streamText,

  // AI Course Recommendations
  async getCourseRecommendations(userId: string, enrolledCourseIds: string[]): Promise<CourseRecommendation[]> {
    await delay(1000);
    // In real app: POST /api/ai/recommendations with user profile and history
    return [
      {
        courseId: 'c4',
        title: 'Data Structures & Algorithms',
        reason: 'Complements your Web Development studies — essential for technical interviews',
        matchScore: 96,
        category: 'Computer Science',
      },
      {
        courseId: 'c5',
        title: 'Cloud Computing with AWS',
        reason: 'Perfect next step after mastering full-stack development',
        matchScore: 91,
        category: 'Cloud & DevOps',
      },
      {
        courseId: 'c6',
        title: 'Cybersecurity Fundamentals',
        reason: 'High demand skill that pairs well with your development background',
        matchScore: 84,
        category: 'Security',
      },
    ];
  },

  // AI Quiz Generator
  async generateQuiz(topic: string, difficulty: string, questionCount: number): Promise<QuizGenerationResult> {
    await delay(2000);
    // In real app: POST /api/ai/quiz/generate
    return {
      questions: Array.from({ length: Math.min(questionCount, 5) }, (_, i) => ({
        question: `AI-Generated Question ${i + 1}: What is the key principle of ${topic} at ${difficulty} level?`,
        options: [
          `Option A: The first concept related to ${topic}`,
          `Option B: The correct answer involving ${topic} principles`,
          `Option C: A common misconception about ${topic}`,
          `Option D: An unrelated concept`,
        ],
        correctAnswer: 1,
        explanation: `This tests understanding of core ${topic} concepts. The correct answer demonstrates ${difficulty}-level mastery.`,
        points: 10,
      })),
    };
  },

  // AI Assignment Checker
  async checkAssignment(content: string, rubric: string): Promise<AssignmentCheckResult> {
    await delay(2500);
    // In real app: POST /api/ai/assignments/check
    return {
      score: Math.floor(75 + Math.random() * 20),
      feedback: 'Overall, this is a strong submission demonstrating good understanding of the core concepts. The implementation is clean and well-structured.',
      strengths: [
        'Clear and organized code structure',
        'Good use of TypeScript types',
        'Proper error handling implemented',
        'Comprehensive documentation',
      ],
      improvements: [
        'Consider adding more unit tests',
        'The performance could be optimized in the data processing section',
        'Some edge cases could be handled more gracefully',
      ],
      plagiarismScore: Math.floor(Math.random() * 15),
    };
  },

  // AI Attendance Insights
  async getAttendanceInsights(userId: string, attendanceData: { percentage: number; trend: string }): Promise<AttendanceInsight[]> {
    await delay(800);
    // In real app: POST /api/ai/attendance/insights
    const insights: AttendanceInsight[] = [];

    if (attendanceData.percentage < 75) {
      insights.push({
        insight: `Your attendance is at ${attendanceData.percentage}%, which is below the required 75% threshold.`,
        type: 'warning',
        recommendation: 'You need to attend at least 5 more consecutive classes to meet the minimum requirement.',
      });
    } else if (attendanceData.percentage >= 90) {
      insights.push({
        insight: `Excellent! Your ${attendanceData.percentage}% attendance puts you in the top 10% of students.`,
        type: 'success',
        recommendation: 'Keep up the great attendance record. You are on track for an attendance bonus.',
      });
    } else {
      insights.push({
        insight: `Your attendance of ${attendanceData.percentage}% is good and meets requirements.`,
        type: 'info',
        recommendation: 'Aim for 90%+ attendance to maximize your learning outcomes and eligibility for certificates.',
      });
    }

    insights.push({
      insight: 'AI detected: Your attendance tends to drop on Fridays.',
      type: 'info',
      recommendation: 'Consider setting a recurring reminder every Friday morning to improve consistency.',
    });

    return insights;
  },
};
