import { supabase } from '@/lib/supabase';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
}

/**
 * Get user's writing streak data
 */
export const getWritingStreak = async (): Promise<StreakData> => {
  const { data: streakData, error } = await supabase
    .from('user_streaks')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching streak:', error);
    return { currentStreak: 0, longestStreak: 0, lastEntryDate: null };
  }

  if (!streakData) {
    return { currentStreak: 0, longestStreak: 0, lastEntryDate: null };
  }

  return streakData;
};

/**
 * Update writing streak after new entry
 */
export const updateWritingStreak = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data: currentStreak } = await supabase
    .from('user_streaks')
    .select('*')
    .single();

  if (!currentStreak) {
    // First entry ever
    await supabase.from('user_streaks').insert({
      current_streak: 1,
      longest_streak: 1,
      last_entry_date: today
    });
    return;
  }

  const lastEntryDate = new Date(currentStreak.last_entry_date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  let newCurrentStreak = currentStreak.current_streak;
  
  // If last entry was yesterday, increment streak
  if (lastEntryDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
    newCurrentStreak += 1;
  } 
  // If last entry was before yesterday, reset streak
  else if (lastEntryDate < yesterday) {
    newCurrentStreak = 1;
  }
  // If last entry was today, keep current streak

  const newLongestStreak = Math.max(newCurrentStreak, currentStreak.longest_streak);

  await supabase
    .from('user_streaks')
    .update({
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak,
      last_entry_date: today
    })
    .eq('id', currentStreak.id);
};
