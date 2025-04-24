
import { supabase } from '@/lib/supabase';
import { JournalEntry, MoodType } from '@/types/journal';

/**
 * Fetches all journal entries for the user
 */
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

/**
 * Fetches a specific journal entry by ID
 */
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

/**
 * Fetches journal entries for a specific date
 */
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
