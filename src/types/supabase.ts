
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
