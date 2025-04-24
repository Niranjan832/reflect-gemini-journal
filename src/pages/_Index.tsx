
import React from 'react';
import { useAsyncData } from '@/utils/asyncUtils';
import { getAllJournalEntries, addJournalEntry, getJournalEntriesByDate, getDailyPrompt, getMoodTrends } from '@/utils/journalUtils';
import { JournalEntry, MoodType } from '@/types/journal';

const Index = () => {
  // Use our hook to handle async data
  const [entries, entriesLoading, entriesError] = useAsyncData(getAllJournalEntries, []);
  const [dailyPrompt, promptLoading] = useAsyncData(getDailyPrompt, []);
  const [moodTrends, trendsLoading] = useAsyncData(getMoodTrends, []);
  
  const handleAddEntry = async (content: string, mood: MoodType, media?: File[]) => {
    try {
      await addJournalEntry(content, mood, media);
      // Refetch entries after adding a new one
      const updatedEntries = await getAllJournalEntries();
      // This is now type-safe as useAsyncData manages state internally
    } catch (err) {
      console.error('Error adding entry:', err);
    }
  };

  return (
    <div>
      {/* Use the data safely with proper loading states */}
      {entriesLoading ? (
        <div>Loading entries...</div>
      ) : entriesError ? (
        <div>Error loading entries</div>
      ) : entries ? (
        <div>
          {/* Render your entries */}
        </div>
      ) : null}

      {dailyPrompt && !promptLoading && (
        <div>
          {/* Now we can safely access dailyPrompt.text */}
          <p>Today's prompt: {dailyPrompt.text}</p>
        </div>
      )}

      {moodTrends && !trendsLoading && (
        <div>
          {/* Render mood trends */}
        </div>
      )}
    </div>
  );
};

export default Index;
