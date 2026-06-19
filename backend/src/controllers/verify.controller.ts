import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const verifyController = {
  async analyzeVision(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback for demo if API key is missing
        console.warn('GEMINI_API_KEY missing, returning mock parsed data.');
        return res.json({
          studentName: "Mock Student Name",
          courseName: "Mock Course Name",
          date: new Date().toLocaleDateString()
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

      const inlineData = {
        data: file.buffer.toString('base64'),
        mimeType: file.mimetype
      };

      const prompt = 'You are a highly accurate document data extraction engine. Read the provided educational certificate. Extract the student name, the course/subject name, and the issuance date. Return ONLY a raw JSON object with the exact keys: "studentName", "courseName", and "date". Do not include any markdown wrappers, code blocks, or conversational text.';

      const result = await model.generateContent([
        prompt,
        { inlineData }
      ]);

      const textResponse = result.response.text();
      
      // Parse the returned string as JSON
      let parsed;
      try {
        parsed = JSON.parse(textResponse);
      } catch (err) {
        console.error('Failed to parse Gemini response as JSON:', textResponse);
        throw new Error('Failed to parse extraction results.');
      }

      return res.status(200).json(parsed);
    } catch (error: any) {
      console.error('Vision Analysis Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
