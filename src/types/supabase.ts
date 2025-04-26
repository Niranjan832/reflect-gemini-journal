
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      journal_entries: {
        Row: {
          id: string
          content: string
          created_at: string
          mood: string
          summary?: string | null
          ai_reflection?: string | null
          media?: string[] | null
          is_published: boolean
          user_id: string
          classification?: string | null
          title?: string | null
        }
        Insert: {
          id?: string
          content: string
          created_at?: string
          mood: string
          summary?: string | null
          ai_reflection?: string | null
          media?: string[] | null
          is_published?: boolean
          user_id: string
          classification?: string | null
          title?: string | null
        }
        Update: {
          id?: string
          content?: string
          created_at?: string
          mood?: string
          summary?: string | null
          ai_reflection?: string | null
          media?: string[] | null
          is_published?: boolean
          user_id?: string
          classification?: string | null
          title?: string | null
        }
      }
      chat_logs: {
        Row: {
          id: string
          user_id: string
          message: string
          role: 'user' | 'assistant'
          timestamp: string
          related_entry_id?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          role: 'user' | 'assistant'
          timestamp?: string
          related_entry_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          role?: 'user' | 'assistant'
          timestamp?: string
          related_entry_id?: string | null
        }
      }
      users: {
        Row: {
          id: string
          username: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
