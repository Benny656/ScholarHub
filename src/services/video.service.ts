import { supabase } from '../lib/supabase';

export interface RoomDetails {
  roomId: string;
  roomName: string;
  active: boolean;
  token?: string;
}

export const videoService = {
  /**
   * Room creation function ready for 100ms API key injection:
   * HMS_ACCESS_KEY=your_access_key
   * HMS_SECRET=your_secret_key
   */
  async createRoom(courseId: string, title: string): Promise<RoomDetails> {
    console.log('[100ms Video Service] Creating video room for course:', courseId);
    
    // In production, this would make a server-side request to 100ms Management API:
    // POST https://api.100ms.live/v2/rooms
    // Header: Authorization: Bearer <management_token_generated_using_HMS_ACCESS_KEY_and_HMS_SECRET>
    // Body: { name: title, description: "Live classroom session" }
    
    const mockRoomId = `hms_room_${Math.random().toString(36).substring(2, 10)}`;

    // Create live class entry in Supabase database
    const { data, error } = await supabase
      .from('live_classes')
      .insert({
        course_id: courseId,
        title,
        room_id: mockRoomId,
        status: 'scheduled',
        scheduled_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // starts in 10 mins
      })
      .select()
      .single();

    if (error) throw error;

    return {
      roomId: data.room_id,
      roomName: data.title,
      active: true,
    };
  },

  /**
   * Fetch app token to join 100ms room
   */
  async joinRoom(roomId: string, role: 'host' | 'guest' = 'guest'): Promise<string> {
    console.log('[100ms Video Service] Requesting access token for room:', roomId, 'role:', role);
    
    // In production, you generate client tokens using JWT signing or fetch from backend token endpoint:
    // https://prod-in2.100ms.live/hmsapi/<tenant>.app.100ms.live/api/token
    // Body: { room_id: roomId, user_id: client_user_id, role: role }
    
    const mockToken = `hms_token_${Math.random().toString(36).substring(2, 20)}`;
    return mockToken;
  },

  /**
   * Realtime live class changes subscription
   */
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
