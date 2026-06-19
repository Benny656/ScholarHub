import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const aiController = {
  async chat(req: AuthenticatedRequest | any, res: Response) {
    try {
      const { messages, context } = req.body;
      
      const userMessage = messages[messages.length - 1]?.content || '';
      const prompt = context 
        ? `System Context: ${context}\n\nUser: ${userMessage}` 
        : userMessage;
      
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      return res.status(200).json({
        role: 'assistant',
        content: responseText
      });
      
    } catch (error: any) {
      console.error("GEMINI CRASH:", error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
};
