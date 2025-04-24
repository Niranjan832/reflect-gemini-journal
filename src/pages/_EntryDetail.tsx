
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAsyncData } from '@/utils/asyncUtils';
import { getJournalEntryById } from '@/utils/journalUtils';

const EntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    data: entry,
    loading,
    error
  } = useAsyncData(() => getJournalEntryById(id || ''), [id]);

  if (loading) {
    return <div>Loading journal entry...</div>;
  }

  if (error) {
    return <div>Error loading entry: {error.message}</div>;
  }

  if (!entry) {
    return <div>No entry found</div>;
  }

  return (
    <div>
      <h1>{entry.content}</h1>
      {/* Render other entry details */}
    </div>
  );
};

export default EntryDetail;
