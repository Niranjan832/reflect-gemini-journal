
import { format } from 'date-fns';
import { DailyPrompt } from '@/types/journal';

/**
 * Fetch the daily writing prompt
 */
export const getDailyPrompt = async (): Promise<DailyPrompt> => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // In a real implementation, you would fetch this from the database
  // For now, we'll return a default prompt
  return {
    id: '1',
    text: "What's one thing you're grateful for today?",
    date: new Date(),
  };
};
