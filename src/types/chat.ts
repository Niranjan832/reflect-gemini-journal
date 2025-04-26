
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mediaFiles?: File[];
}

export interface ChatSettings {
  usePersonalization: boolean;
  personalizationStrength: 'low' | 'medium' | 'high';
}
