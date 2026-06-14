import { apiClient } from '../lib/apiClient';

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
    console.log('[UploadService] Uploading file to backend:', file.name, 'Folder:', folder);

    onProgress?.({ loaded: 0, total: file.size, percentage: 0 });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = await (await import('../lib/supabase')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);

    return new Promise<UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:5000/api/upload');
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress?.({ loaded: event.loaded, total: event.total, percentage });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (e) {
            reject(new Error('Invalid response JSON'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.send(formData);
    });
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

  async deleteFile(key: string): Promise<void> {
    console.log('[UploadService] Deleting file via backend:', key);
    await apiClient.delete(`/upload/${encodeURIComponent(key)}`);
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
