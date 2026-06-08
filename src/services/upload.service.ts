// File Upload Service Placeholder
// Replace with real implementation (S3, Cloudinary, Supabase Storage, etc.)

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const uploadService = {
  async uploadFile(
    file: File,
    folder: string = 'general',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await delay(100);
      onProgress?.({ loaded: (file.size * i) / 100, total: file.size, percentage: i });
    }

    // In real app: Use FormData + fetch to POST /api/upload or directly to S3
    return {
      url: `https://storage.nexlearn.com/${folder}/${Date.now()}-${file.name}`,
      key: `${folder}/${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  },

  async uploadAvatar(file: File, userId: string): Promise<UploadResult> {
    // In real app: POST /api/upload/avatar with resize to 200x200
    return this.uploadFile(file, `avatars/${userId}`);
  },

  async uploadAssignmentFile(file: File, assignmentId: string): Promise<UploadResult> {
    // In real app: POST /api/upload/assignment with virus scan
    return this.uploadFile(file, `assignments/${assignmentId}`);
  },

  async uploadCourseMaterial(file: File, courseId: string): Promise<UploadResult> {
    // In real app: POST /api/upload/course-material with CDN distribution
    return this.uploadFile(file, `courses/${courseId}/materials`);
  },

  async deleteFile(key: string): Promise<void> {
    await delay(300);
    // In real app: DELETE /api/upload with { key }
    console.log('[UploadService] Mock delete:', key);
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
