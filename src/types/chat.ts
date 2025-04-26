
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mediaFiles?: File[];
  user_id?: string; // Added for Supabase integration
}

export interface ChatSettings {
  usePersonalization: boolean;
  personalizationStrength: 'low' | 'medium' | 'high';
}

export interface ChatLog {
  id: string;
  user_id: string;
  message: string;
  role: 'user' | 'assistant';
  timestamp: string;
}
