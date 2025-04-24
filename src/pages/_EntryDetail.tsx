import React from 'react';
import { useParams } from 'react-router-dom';
import { useAsyncData } from '@/utils/asyncUtils';
import { getJournalEntryById } from '@/utils/journalUtils';

const EntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Use our hook to handle async data
  const [entry, loading, error] = useAsyncData(
    () => getJournalEntryById(id || ''),
    [id]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !entry) {
    return <div>Error loading entry</div>;
  }

  return (
    <div>
      <h1>{entry.content}</h1>
      {/* Render other entry details */}
    </div>
  );
};

export default EntryDetail;
