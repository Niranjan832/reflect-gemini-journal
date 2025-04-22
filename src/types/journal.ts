
export type MoodType = 'happy' | 'neutral' | 'reflective' | 'sad';

export interface JournalEntry {
  id: string;
  content: string;
  date: Date;
  mood: MoodType;
  summary?: string;
  aiReflection?: string;
  media?: string[]; // URLs to media files
  isPublished?: boolean; // Whether this entry is shared as a blog
}

export interface DailyPrompt {
  id: string;
  text: string;
  date: Date;
}

export interface MoodTrend {
  mood: MoodType;
  count: number;
  percentage: number;
}
