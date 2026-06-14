import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';

export const aiController = {
  // POST /api/ai/tutor
  async tutorChat(req: AuthenticatedRequest, res: Response) {
    try {
      const { message, context } = req.body;
      const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

      if (!apiKey) {
        return res.json({
          role: 'assistant',
          content: "OpenAI API key is missing. The server is running in mock mode. You asked: " + message
        });
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const json = await response.json() as any;
      res.json({
        role: 'assistant',
        content: json.choices?.[0]?.message?.content || 'Failed to generate response.'
      });
    } catch (error: any) {
      console.error('tutorChat error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  // POST /api/ai/quiz/generate
  async generateQuiz(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseContent, difficulty, questionCount } = req.body;
      const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
      const count = questionCount || 5;
      const diff = difficulty || 'Intermediate';

      if (!apiKey) {
        return res.json({ questions: [] });
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an educational assistant that outputs JSON.' },
            { role: 'user', content: `Generate a quiz with ${count} multiple-choice questions on this topic: ${courseContent}. Difficulty: ${diff}. Return a JSON object matching this structure: { \"questions\": [ { \"question\": \"string\", \"options\": [\"string\", \"string\", \"string\", \"string\"], \"correctAnswer\": 0, \"explanation\": \"string\", \"points\": 10 } ] }` }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const json = await response.json() as any;
      const text = json.choices?.[0]?.message?.content || '{}';
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error('generateQuiz error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  // POST /api/ai/assignments/check
  async checkAssignment(req: AuthenticatedRequest, res: Response) {
    try {
      const { submission, rubric } = req.body;
      const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API key missing' });
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an educational grader that outputs JSON.' },
            { role: 'user', content: `Grade this submission based on the rubric: "${rubric}". Submission: "${submission}". Return a JSON object exactly matching: { \"score\": 85, \"feedback\": \"overall review\", \"strengths\": [\"list of strengths\"], \"improvements\": [\"list of improvements\"], \"plagiarismScore\": 5 }` }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const json = await response.json() as any;
      const text = json.choices?.[0]?.message?.content || '{}';
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error('checkAssignment error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  // POST /api/ai/recommendations
  async recommendCourses(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.body;
      const userClient = getSupabaseForUser(req.user!.token);
      const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

      let enrolledCoursesText = '';
      try {
        const { data } = await userClient
          .from('enrollments')
          .select('courses(title)')
          .eq('student_id', studentId);
        
        if (data) {
          enrolledCoursesText = data.map((d: any) => d.courses?.title).filter(Boolean).join(', ');
        }
      } catch (e) {
        console.warn('Could not query enrollments database for courses:', e);
      }

      if (!apiKey) {
        return res.json({ recommendations: [] });
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a course advisor assistant that outputs JSON.' },
            { role: 'user', content: `Based on the student's enrolled courses: [${enrolledCoursesText}], recommend 3 suitable courses they should take next. Return a JSON array of objects inside a top level "recommendations" field: { \"recommendations\": [ { \"courseId\": \"string\", \"title\": \"string\", \"reason\": \"why this matches\", \"matchScore\": 95, \"category\": \"string\" } ] }` }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const json = await response.json() as any;
      const text = json.choices?.[0]?.message?.content || '{}';
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error('recommendCourses error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  // POST /api/ai/attendance/insights
  async attendanceInsights(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseIdOrUserId, percentage, trend } = req.body;
      const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
      
      const pct = percentage || 85;
      const trnd = trend || 'stable';

      if (!apiKey) {
        return res.json({ insights: [] });
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an educational assistant that outputs JSON.' },
            { role: 'user', content: `Analyze student attendance. Current attendance: ${pct}%, Trend: ${trnd}. Generate 2 insights with recommendations. Return a JSON object matching: { \"insights\": [ { \"insight\": \"string\", \"type\": \"info\", \"recommendation\": \"string\" } ] }. Supported types: \"warning\", \"info\", \"success\"` }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const json = await response.json() as any;
      const text = json.choices?.[0]?.message?.content || '{}';
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error('attendanceInsights error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
};
