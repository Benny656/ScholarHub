import { createClient } from '@supabase/supabase-js';

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'student' | 'teacher' | 'admin' | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak: number;
  last_login: string | null;
  created_at: string;
};

interface TestDB {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Partial<UserRow> & { id: string };
        Update: Partial<UserRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

const client = createClient<TestDB>('https://niebnbpcmnfqfyodkqvr.supabase.co', 'key');
const run = async () => {
  const { data } = await client.from('users').select('*');
  if (data) {
    const name: string | null = data[0].name;
    console.log(name);
  }
};
run();
