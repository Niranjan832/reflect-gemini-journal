
import { MoodType, MoodTrend } from '@/types/journal';
import { generateGeminiResponse } from '@/utils/apiUtils';
import { supabase } from '@/lib/supabase';

/**
 * Generate an AI summary of journal content
 */
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

/**
 * Generate an AI reflection based on journal content and mood
 */
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

/**
 * Fetch mood trends from journal entries
 */
export const getMoodTrends = async (): Promise<MoodTrend[]> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('mood');
  
  if (error || !data) {
    console.error('Error fetching mood trends:', error);
    return [];
  }
  
  // Count occurrences of each mood
  const moodCounts: Record<string, number> = {};
  data.forEach(entry => {
    const mood = entry.mood;
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });
  
  const total = data.length;
  
  // Convert to MoodTrend array
  const trends: MoodTrend[] = Object.entries(moodCounts).map(([mood, count]) => ({
    mood: mood as MoodType,
    count,
    percentage: Math.round((count / total) * 100)
  }));
  
  return trends;
};
