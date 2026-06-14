import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/apiClient';

export interface RoomDetails {
  roomId: string;
  roomName: string;
  active: boolean;
  token?: string;
}

export const videoService = {
  async createRoom(titleOrCourseId: string, maybeTitle?: string): Promise<RoomDetails> {
    let title = '';
    let courseId = 'c1'; // default course fallback

    if (maybeTitle !== undefined) {
      courseId = titleOrCourseId;
      title = maybeTitle;
    } else {
      title = titleOrCourseId;
    }

    console.log('[100ms Video Service] Creating video room:', title);
    
    const mockRoomId = `hms_room_${Math.random().toString(36).substring(2, 10)}`;

    const data = await apiClient.post<any>(`/classrooms/${courseId}/sessions`, {
      title,
      scheduledAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      roomId: mockRoomId,
    });

    return {
      roomId: data.room_id,
      roomName: data.title,
      active: true,
    };
  },

  async joinRoom(roomId: string, role: 'host' | 'guest' = 'guest'): Promise<string> {
    console.log('[100ms Video Service] Requesting access token for room:', roomId, 'role:', role);
    const mockToken = `hms_token_${Math.random().toString(36).substring(2, 20)}`;
    return mockToken;
  },

  subscribeToLiveClasses(courseId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel('public:live_classes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_classes', filter: `course_id=eq.${courseId}` },
        onUpdate
      )
      .subscribe();
  }
};
