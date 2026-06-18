import { supabase } from '../lib/supabase';

export interface UploadResult {
  url: string;
  key: string;
  name: string;
  size: number;
  type: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const uploadService = {
  async uploadFile(
    file: File,
    folder: string = 'general',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    console.log('[UploadService] Uploading file to Supabase:', file.name, 'Folder:', folder);

    // Default bucket based on folder prefix
    let bucket = 'general';
    if (folder.startsWith('assignments')) bucket = 'assignments';
    if (folder.startsWith('submissions')) bucket = 'submissions';
    if (folder.startsWith('avatars')) bucket = 'avatars';
    if (folder.startsWith('courses')) bucket = 'courses';

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    onProgress?.({ loaded: 0, total: file.size, percentage: 0 });

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    onProgress?.({ loaded: file.size, total: file.size, percentage: 100 });

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      key: filePath,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  },

  async uploadAvatar(file: File, userId: string): Promise<UploadResult> {
    return this.uploadFile(file, `avatars/${userId}`);
  },

  async uploadAssignmentFile(file: File, assignmentId: string): Promise<UploadResult> {
    return this.uploadFile(file, `assignments/${assignmentId}`);
  },

  async uploadCourseMaterial(file: File, courseId: string): Promise<UploadResult> {
    return this.uploadFile(file, `courses/${courseId}/materials`);
  },

  async deleteFile(key: string, bucket: string = 'general'): Promise<void> {
    console.log('[UploadService] Deleting file from Supabase:', key);
    const { error } = await supabase.storage.from(bucket).remove([key]);
    if (error) throw error;
  },

  getFileIcon(type: string): string {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  },

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};
