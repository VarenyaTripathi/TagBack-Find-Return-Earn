import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          reward_points: number | null;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          reward_points?: number | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          username?: string;
          email?: string;
          reward_points?: number | null;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
      };
      lost_items: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          description: string;
          location: string;
          reward: string | null;
          images: string[] | null;
          category: string;
          status: string | null;
          date_reported: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          description: string;
          location: string;
          reward?: string | null;
          images?: string[] | null;
          category: string;
          status?: string | null;
          date_reported?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string | null;
          title?: string;
          description?: string;
          location?: string;
          reward?: string | null;
          images?: string[] | null;
          category?: string;
          status?: string | null;
          date_reported?: string | null;
          updated_at?: string | null;
        };
      };
      found_items: {
        Row: {
          id: string;
          user_id: string | null;
          description: string;
          location: string;
          images: string[] | null;
          category: string;
          status: string | null;
          date_reported: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          description: string;
          location: string;
          images?: string[] | null;
          category: string;
          status?: string | null;
          date_reported?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string | null;
          description?: string;
          location?: string;
          images?: string[] | null;
          category?: string;
          status?: string | null;
          date_reported?: string | null;
          updated_at?: string | null;
        };
      };
      item_matches: {
        Row: {
          id: string;
          lost_item_id: string | null;
          found_item_id: string | null;
          confidence_score: number;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          lost_item_id?: string | null;
          found_item_id?: string | null;
          confidence_score: number;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          lost_item_id?: string | null;
          found_item_id?: string | null;
          confidence_score?: number;
          status?: string | null;
        };
      };
    };
  };
}