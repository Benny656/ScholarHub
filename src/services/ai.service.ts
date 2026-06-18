import { apiClient } from '../lib/apiClient';

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

export const aiService = {
  async tutorChat(message: string, context: string = ''): Promise<AIMessage> {
    console.log('[AIService] Calling tutor chat via Gemini API');
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('VITE_GEMINI_API_KEY is not set. Returning fallback mock response.');
      return { role: 'assistant', content: `I am your mock AI tutor. You asked about: ${message}` };
    }

    const systemPrompt = `You are a helpful, expert AI tutor for a student. ${context ? `The context of the course is: ${context}` : ''}
    Answer the student's question clearly and concisely.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent question: ${message}` }] }
          ]
        })
      });

      if (!response.ok) throw new Error('Failed to communicate with Gemini');
      
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      return { role: 'assistant', content: text };
    } catch (err) {
      console.error('Gemini API Error:', err);
      throw err;
    }
  },

  async sendTutorMessage(messages: AIMessage[], context?: string): Promise<AIMessage> {
    const lastMsg = messages[messages.length - 1]?.content || '';
    return this.tutorChat(lastMsg, context);
  },

  async generateQuiz(courseContent: string, difficulty: string = 'intermediate', questionCount: number = 5): Promise<QuizGenerationResult> {
    console.log('[AIService] Generating quiz via Gemini API');
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('VITE_GEMINI_API_KEY is not set. Returning fallback mock data.');
      return {
        questions: Array.from({ length: questionCount }).map((_, i) => ({
          question: `Sample auto-generated question ${i+1} about ${courseContent.substring(0, 20)}...`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'This is a mocked explanation since no API key is provided.',
          points: 10
        }))
      };
    }

    const prompt = `You are an expert educator. Generate a ${difficulty} level multiple-choice quiz with ${questionCount} questions based on the following content.
    Return ONLY a valid JSON object matching this schema: 
    { "questions": [ { "question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": number (0-3), "explanation": "string", "points": number } ] }
    Content: ${courseContent}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) throw new Error('Failed to generate quiz with Gemini');
      
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text) as QuizGenerationResult;
    } catch (err) {
      console.error('Gemini API Error:', err);
      throw err;
    }
  },

  async checkAssignment(submission: string, rubric: string): Promise<AssignmentCheckResult> {
    console.log('[AIService] Grading assignment via Gemini API');
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('VITE_GEMINI_API_KEY is not set. Returning mock grade.');
      return {
        score: Math.floor(Math.random() * 20) + 80, // 80-100
        feedback: "This is mock feedback. Good job overall!",
        strengths: ["Clear writing", "Good examples"],
        improvements: ["Add more details", "Check formatting"],
        plagiarismScore: 5
      };
    }

    const prompt = `You are an expert teacher grading an assignment.
    Rubric / Instructions:
    ${rubric}

    Student Submission:
    ${submission}

    Analyze the submission and provide a grade out of 100.
    Return ONLY a valid JSON object matching this schema:
    { "score": number, "feedback": "string", "strengths": ["string"], "improvements": ["string"], "plagiarismScore": number (0-100 estimate) }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) throw new Error('Failed to grade assignment with Gemini');
      
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text) as AssignmentCheckResult;
    } catch (err) {
      console.error('Gemini API Error:', err);
      throw err;
    }
  },

  async recommendCourses(studentId: string): Promise<CourseRecommendation[]> {
    console.log('[AIService] Fetching course recommendations from backend');
    const res = await apiClient.post<any>('/ai/recommendations', { studentId });
    return res.recommendations || [];
  },

  async getCourseRecommendations(userId: string, _enrolledCourseIds: string[]): Promise<CourseRecommendation[]> {
    return this.recommendCourses(userId);
  },

  async attendanceInsights(courseIdOrUserId: string, maybeData?: { percentage: number; trend: string }): Promise<AttendanceInsight[]> {
    console.log('[AIService] Fetching attendance insights via Gemini API');
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('VITE_GEMINI_API_KEY is not set. Returning mock insights.');
      return [
        { insight: "Attendance is stable.", type: "success", recommendation: "Keep up the good work." },
        { insight: "Some students are missing recent classes.", type: "warning", recommendation: "Send an announcement to check in." }
      ];
    }

    const prompt = `You are an educational data analyst.
    Analyze the following course data and provide exactly 3 insights about student performance and attendance.
    Data:
    ${courseIdOrUserId}

    Return ONLY a valid JSON object matching this schema:
    { "insights": [ { "insight": "string", "type": "warning" | "info" | "success", "recommendation": "string" } ] }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch insights with Gemini');
      
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text);
      return parsed.insights as AttendanceInsight[];
    } catch (err) {
      console.error('Gemini API Error:', err);
      throw err;
    }
  },

  async getAttendanceInsights(userId: string, attendanceData: { percentage: number; trend: string }): Promise<AttendanceInsight[]> {
    return this.attendanceInsights(userId, attendanceData);
  }
};
