
import { MoodType, MoodTrend } from '@/types/journal';
import { localML } from '@/utils/ml/localInference';
import { supabase } from '@/lib/supabase';

/**
 * Generate an AI summary of journal content using Ollama
 * @param content Journal entry content
 * @returns Concise summary of the entry
 */
export const generateAISummary = async (content: string): Promise<string> => {
  try {
    // Use Ollama for more advanced summarization
    const summary = await localML.summarizeText(content);
    
    // Clean up summary (remove quotes, ensure proper length)
    const cleanSummary = summary.replace(/^["']|["']$/g, '').trim();
    
    console.log('Generated summary:', cleanSummary);
    return cleanSummary;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    // Fall back to simple summary if advanced summarization fails
    return content.length > 100 
      ? content.substring(0, 100) + '...' 
      : content;
  }
};

/**
 * Generate an AI reflection based on journal content and mood
 * @param content Journal entry content
 * @param mood Detected mood 
 * @returns Thoughtful reflection on the journal entry
 */
export const generateAIReflection = async (content: string, mood: MoodType): Promise<string> => {
  try {
    // Set appropriate system prompt based on mood
    const reflectionSystemPrompt = `You are a supportive journal assistant. Provide a thoughtful, 
    empathetic reflection on the following journal entry which has a mood of ${mood}. 
    Be supportive, insightful, and highlight positive aspects.
    Keep your response between 2-4 sentences.`;
    
    localML.setSystemPrompt('ollama-mistral', reflectionSystemPrompt);
    
    // Use Ollama for advanced reflection generation
    const result = await localML.generateText(
      content,
      'ollama-mistral'
    );
    
    return result || getDefaultReflection(mood);
  } catch (error) {
    console.error('Error generating AI reflection:', error);
    return getDefaultReflection(mood);
  }
};

/**
 * Get default reflection text based on mood
 * @param mood Emotional mood
 * @returns Default reflection message
 */
const getDefaultReflection = (mood: MoodType): string => {
  const reflections = {
    'happy': 'It\'s great to see you\'re feeling positive. Keep this momentum going!',
    'neutral': 'Days like these are important too. What small thing could make tomorrow a bit brighter?',
    'reflective': 'Taking time to reflect shows great self-awareness. What insights will you carry forward?',
    'sad': 'It\'s okay to have difficult days. Be gentle with yourself and remember that emotions are temporary.'
  };
  
  return reflections[mood];
};

/**
 * Detect mood from journal content using NLP
 * Uses either basic sentiment analysis or advanced Ollama-based analysis
 * @param content Journal text content
 * @returns Detected mood category
 */
export const detectMood = async (content: string): Promise<MoodType> => {
  try {
    // For short content, use basic sentiment analysis
    if (content.length < 50) {
      return await localML.analyzeMood(content);
    }
    
    // For longer content, use more advanced Ollama-based analysis
    return await localML.analyzeAdvancedMood(content);
  } catch (error) {
    console.error('Error detecting mood:', error);
    return 'neutral';
  }
};

/**
 * Fetch mood trends from journal entries
 * @returns Array of mood trends with counts and percentages
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
