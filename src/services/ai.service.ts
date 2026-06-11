import { supabase } from '../lib/supabase';

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
  async tutorChat(message: string, context?: string): Promise<AIMessage> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      return {
        role: 'assistant',
        content: "OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your env."
      };
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: `You are a helpful AI Tutor. Context: ${context || 'General learning platform'}` },
            { role: 'user', content: message }
          ]
        })
      });
      const json = await res.json();
      return {
        role: 'assistant',
        content: json.choices?.[0]?.message?.content || 'Failed to generate response.'
      };
    } catch (err) {
      console.error('Error calling OpenAI Chat:', err);
      return {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.'
      };
    }
  },

  async sendTutorMessage(messages: AIMessage[], context?: string): Promise<AIMessage> {
    const lastMsg = messages[messages.length - 1]?.content || '';
    return this.tutorChat(lastMsg, context);
  },

  async generateQuiz(courseContent: string, difficulty?: string, questionCount?: number): Promise<QuizGenerationResult> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const count = questionCount || 5;
    const diff = difficulty || 'Intermediate';

    if (!apiKey) {
      // Mock fallback
      return {
        questions: Array.from({ length: count }, (_, i) => ({
          question: `Sample Question ${i + 1} about ${courseContent}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 1,
          explanation: 'This is a mock explanation.',
          points: 10
        }))
      };
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an educational assistant that outputs JSON.' },
            { role: 'user', content: `Generate a quiz with ${count} multiple-choice questions on this topic: ${courseContent}. Difficulty: ${diff}. Return a JSON object matching this structure: { "questions": [ { "question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": 0, "explanation": "string", "points": 10 } ] }` }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const json = await res.json();
      const text = json.choices?.[0]?.message?.content || '{}';
      return JSON.parse(text);
    } catch (err) {
      console.error('Error calling OpenAI generateQuiz:', err);
      return {
        questions: []
      };
    }
  },

  async checkAssignment(submission: string, rubric: string): Promise<AssignmentCheckResult> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      return {
        score: 85,
        feedback: 'Standard feedback: Good structure and details.',
        strengths: ['Organization', 'Content coverage'],
        improvements: ['Formatting details'],
        plagiarismScore: 5
      };
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an educational grader that outputs JSON.' },
            { role: 'user', content: `Grade this submission based on the rubric: "${rubric}". Submission: "${submission}". Return a JSON object exactly matching: { "score": 85, "feedback": "overall review", "strengths": ["list of strengths"], "improvements": ["list of improvements"], "plagiarismScore": 5 }` }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const json = await res.json();
      const text = json.choices?.[0]?.message?.content || '{}';
      return JSON.parse(text);
    } catch (err) {
      console.error('Error calling OpenAI checkAssignment:', err);
      return {
        score: 0,
        feedback: 'Failed to process grading.',
        strengths: [],
        improvements: [],
        plagiarismScore: 0
      };
    }
  },

  async recommendCourses(studentId: string): Promise<CourseRecommendation[]> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    let enrolledCoursesText = '';

    try {
      const { data } = await supabase
        .from('enrollments')
        .select('courses(title)')
        .eq('student_id', studentId) as any;
      if (data) {
        enrolledCoursesText = data.map((d: any) => d.courses?.title).filter(Boolean).join(', ');
      }
    } catch (e) {
      console.error('Error fetching enrolled courses for recommendations', e);
    }

    if (!apiKey) {
      return [
        {
          courseId: 'c4',
          title: 'Data Structures & Algorithms',
          reason: 'Complements your current studies — essential for interviews',
          matchScore: 96,
          category: 'Computer Science',
        }
      ];
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a course advisor assistant that outputs JSON.' },
            { role: 'user', content: `Based on the student's enrolled courses: [${enrolledCoursesText}], recommend 3 suitable courses they should take next. Return a JSON array of objects inside a top level "recommendations" field: { "recommendations": [ { "courseId": "string", "title": "string", "reason": "why this matches", "matchScore": 95, "category": "string" } ] }` }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const json = await res.json();
      const text = json.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);
      return parsed.recommendations || [];
    } catch (err) {
      console.error('Error calling OpenAI recommendCourses:', err);
      return [];
    }
  },

  async getCourseRecommendations(userId: string, _enrolledCourseIds: string[]): Promise<CourseRecommendation[]> {
    return this.recommendCourses(userId);
  },

  async attendanceInsights(courseIdOrUserId: string, maybeData?: { percentage: number; trend: string }): Promise<AttendanceInsight[]> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    let pct = maybeData?.percentage || 85;
    let trend = maybeData?.trend || 'stable';

    if (!maybeData) {
      try {
        const { data } = await supabase
          .from('attendance')
          .select('status')
          .eq('course_id', courseIdOrUserId) as any;
        if (data && data.length > 0) {
          const present = data.filter((d: any) => d.status === 'present').length;
          pct = Math.round((present / data.length) * 100);
          trend = 'analyzed';
        }
      } catch (e) {
        console.error('Error fetching attendance data', e);
      }
    }

    if (!apiKey) {
      return [
        {
          insight: `Your attendance is at ${pct}%.`,
          type: 'info',
          recommendation: 'Keep attending regularly.'
        }
      ];
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an educational assistant that outputs JSON.' },
            { role: 'user', content: `Analyze student attendance. Current attendance: ${pct}%, Trend: ${trend}. Generate 2 insights with recommendations. Return a JSON object matching: { "insights": [ { "insight": "string", "type": "info", "recommendation": "string" } ] }. Supported types: "warning", "info", "success"` }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const json = await res.json();
      const text = json.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);
      return parsed.insights || [];
    } catch (err) {
      console.error('Error calling OpenAI attendanceInsights:', err);
      return [];
    }
  },

  async getAttendanceInsights(userId: string, attendanceData: { percentage: number; trend: string }): Promise<AttendanceInsight[]> {
    return this.attendanceInsights(userId, attendanceData);
  }
};
