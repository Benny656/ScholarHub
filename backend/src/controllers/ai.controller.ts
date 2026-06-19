import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const aiController = {
  async chat(req: AuthenticatedRequest | any, res: Response) {
    try {
      const { messages, context } = req.body;
      
      // Simulate a 2-second streaming response using the context as requested for the demo failsafe
      // We will just do a mock delay and return a realistic response without crashing.
      const userMessage = messages[messages.length - 1]?.content || '';
      
      // We could use @google/genai or openai here if keys exist, but for the demo failsafe we return immediately if no keys
      const hasKeys = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
      
      let simulatedResponse = `I see you are focused on your studies. Would you like me to generate a 25-minute Pomodoro study schedule?`;
      if (context) {
        simulatedResponse = `I see from your context that ${context}. How can I help you with your tasks today?`;
      }
      
      if (userMessage.toLowerCase().includes('pomodoro') || userMessage.toLowerCase().includes('schedule')) {
        simulatedResponse = `Sure! Let's start a 25-minute study block. Focus on one topic, and I'll remind you to take a 5-minute break when the time is up.`;
      } else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        simulatedResponse = `Hello there! I'm the ScholarHub AI Copilot. ${context ? `I know ${context}.` : ''} What can I assist you with today?`;
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return res.status(200).json({
        role: 'assistant',
        content: simulatedResponse
      });
      
    } catch (error: any) {
      console.error('[AI Copilot] Chat error:', error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
};
