
export type MoodType = 'happy' | 'neutral' | 'reflective' | 'sad';

export interface JournalEntry {
  id: string;
  content: string;
  date: Date;
  mood: MoodType;
  summary?: string;
  aiReflection?: string;
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
