import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';

export const uploadController = {
  // POST /api/upload
  async uploadFile(req: AuthenticatedRequest, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const folder = req.body.folder || 'general';
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;

      // Default mock fallback URL if Supabase storage bucket fails
      let fileUrl = `https://storage.nexlearn.com/${fileName}`;

      try {
        const { data, error } = await supabase.storage
          .from('scholarhub-bucket')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (error) {
          console.warn('Supabase storage upload error (falling back to mock URL):', error.message);
        } else if (data) {
          const { data: publicUrlData } = supabase.storage
            .from('scholarhub-bucket')
            .getPublicUrl(data.path);
          
          if (publicUrlData?.publicUrl) {
            fileUrl = publicUrlData.publicUrl;
          }
        }
      } catch (storageErr: any) {
        console.warn('Supabase storage exception (using mock CDN URL fallback):', storageErr.message || storageErr);
      }

      res.status(201).json({
        url: fileUrl,
        key: fileName,
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      });
    } catch (error: any) {
      console.error('uploadFile error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  // DELETE /api/upload/:key
  async deleteFile(req: AuthenticatedRequest, res: Response) {
    try {
      const { key } = req.params;

      try {
        const { error } = await supabase.storage
          .from('scholarhub-bucket')
          .remove([key]);

        if (error) {
          console.warn('Supabase storage delete error:', error.message);
        }
      } catch (storageErr: any) {
        console.warn('Supabase storage delete exception:', storageErr.message || storageErr);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('deleteFile error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
};
