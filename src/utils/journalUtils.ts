import { supabase } from '@/lib/supabase';
import { JournalEntry, MoodType, DailyPrompt, MoodTrend } from '@/types/journal';
import { format } from 'date-fns';
import { generateGeminiResponse } from './apiUtils';

export const getAllJournalEntries = async (): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entries:', error);
    return [];
  }

  return data.map(entry => ({
    ...entry,
    date: new Date(entry.created_at),
    mood: entry.mood as MoodType,
  }));
};

export const getJournalEntryById = async (id: string): Promise<JournalEntry | undefined> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching entry:', error);
    return undefined;
  }

  return {
    ...data,
    date: new Date(data.created_at),
    mood: data.mood as MoodType,
  };
};

export const getJournalEntriesByDate = async (date: Date): Promise<JournalEntry[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entries by date:', error);
    return [];
  }

  return data.map(entry => ({
    ...entry,
    date: new Date(entry.created_at),
    mood: entry.mood as MoodType,
  }));
};

export const addJournalEntry = async (
  content: string,
  mood: MoodType,
  mediaFiles?: File[]
): Promise<JournalEntry | null> => {
  // First, upload any media files
  const mediaUrls: string[] = [];
  
  if (mediaFiles && mediaFiles.length > 0) {
    for (const file of mediaFiles) {
      const { data, error } = await supabase.storage
        .from('journal-media')
        .upload(`${Date.now()}-${file.name}`, file);

      if (error) {
        console.error('Error uploading file:', error);
        continue;
      }

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('journal-media')
          .getPublicUrl(data.path);
        mediaUrls.push(publicUrl);
      }
    }
  }

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    return null;
  }

  // Create the entry
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([{
      content,
      mood,
      media: mediaUrls,
      user_id: user.id,
      created_at: new Date().toISOString(),
      is_published: false,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding entry:', error);
    return null;
  }

  return {
    ...data,
    date: new Date(data.created_at),
    mood: data.mood as MoodType,
  };
};

export const shareEntryAsBlog = (entryId: string): JournalEntry | null => {
  const entry = mockJournalEntries.find(e => e.id === entryId);
  
  if (!entry) return null;
  
  entry.isPublished = true;
  return entry;
};

export const getDailyPrompt = (): DailyPrompt => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayPrompt = mockPrompts.find(prompt => 
    format(prompt.date, 'yyyy-MM-dd') === today
  );
  
  if (todayPrompt) {
    return todayPrompt;
  }
  
  return mockPrompts[mockPrompts.length - 1];
};

export const getMoodTrends = (): MoodTrend[] => {
  const total = mockJournalEntries.length;
  const moodCounts = mockJournalEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<MoodType, number>);
  
  const trends: MoodTrend[] = Object.entries(moodCounts).map(([mood, count]) => ({
    mood: mood as MoodType,
    count,
    percentage: Math.round((count / total) * 100)
  }));
  
  return trends;
};

export const generateAISummary = async (content: string): Promise<string> => {
  try {
    const prompt = `Please summarize the following journal entry in a concise way (30 words or less):\n\n${content}`;
    return await generateGeminiResponse(prompt);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return content.length > 100 
      ? content.substring(0, 100) + '...' 
      : content;
  }
};

export const generateAIReflection = async (content: string, mood: MoodType): Promise<string> => {
  try {
    const prompt = `Please provide a thoughtful, empathetic reflection (2-3 sentences) on this journal entry. The person's mood is ${mood}.\n\n${content}`;
    return await generateGeminiResponse(prompt);
  } catch (error) {
    console.error('Error generating AI reflection:', error);
    const reflections = {
      'happy': 'It\'s great to see you\'re feeling positive. Keep this momentum going!',
      'neutral': 'Days like these are important too. What small thing could make tomorrow a bit brighter?',
      'reflective': 'Taking time to reflect shows great self-awareness. What insights will you carry forward?',
      'sad': 'It\'s okay to have difficult days. Be gentle with yourself and remember that emotions are temporary.'
    };
    
    return reflections[mood];
  }
};

export const speechToText = async (): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("This is a placeholder for speech-to-text conversion. In a real implementation, this would be your spoken words transcribed to text.");
    }, 1000);
  });
};
