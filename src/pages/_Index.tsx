
import React from 'react';
import { useAsyncData } from '@/utils/asyncUtils';
import { getAllJournalEntries, addJournalEntry, getJournalEntriesByDate, getDailyPrompt, getMoodTrends } from '@/utils/journalUtils';
import { JournalEntry, MoodType } from '@/types/journal';

const Index = () => {
  const { 
    data: entries,
    loading: entriesLoading,
    error: entriesError
  } = useAsyncData(getAllJournalEntries, []);

  const {
    data: dailyPrompt,
    loading: promptLoading,
    error: promptError
  } = useAsyncData(getDailyPrompt, []);

  const {
    data: moodTrends,
    loading: trendsLoading,
    error: trendsError
  } = useAsyncData(getMoodTrends, []);
  
  const handleAddEntry = async (content: string, mood: MoodType, media?: File[]) => {
    try {
      await addJournalEntry(content, mood, media);
      // After adding, you would typically trigger a refetch of entries
      // This would be handled by your state management solution
    } catch (err) {
      console.error('Error adding entry:', err);
    }
  };

  return (
    <div>
      {entriesLoading ? (
        <div>Loading entries...</div>
      ) : entriesError ? (
        <div>Error loading entries: {entriesError.message}</div>
      ) : !entries ? (
        <div>No entries found</div>
      ) : (
        <div>
          {/* Render your entries */}
        </div>
      )}

      {promptLoading ? (
        <div>Loading prompt...</div>
      ) : promptError ? (
        <div>Error loading prompt: {promptError.message}</div>
      ) : dailyPrompt && (
        <div>
          <p>Today's prompt: {dailyPrompt.text}</p>
        </div>
      )}

      {trendsLoading ? (
        <div>Loading trends...</div>
      ) : trendsError ? (
        <div>Error loading trends: {trendsError.message}</div>
      ) : moodTrends && (
        <div>
          {/* Render mood trends */}
        </div>
      )}
    </div>
  );
};

export default Index;
