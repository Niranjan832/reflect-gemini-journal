
import { supabase } from '@/lib/supabase';
import { JournalEntry, MoodType } from '@/types/journal';

/**
 * Adds a new journal entry
 */
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

/**
 * Sets an entry's published status
 */
export const shareEntryAsBlog = async (entryId: string): Promise<JournalEntry | null> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .update({ is_published: true })
    .eq('id', entryId)
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error publishing entry:', error);
    return null;
  }
  
  return {
    ...data,
    date: new Date(data.created_at),
    mood: data.mood as MoodType,
  };
};
