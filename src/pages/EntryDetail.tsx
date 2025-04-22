
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJournalEntryById } from '@/utils/journalUtils';
import { JournalEntry as JournalEntryType } from '@/types/journal';
import JournalEntryComponent from '@/components/JournalEntry';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundEntry = getJournalEntryById(id);
      setEntry(foundEntry || null);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-journal-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-gray-800 mb-4">Entry not found</h1>
        <Button onClick={() => navigate('/')}>Return to Journal</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-6 pl-0 text-journal-secondary"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Journal
        </Button>
        
        <JournalEntryComponent entry={entry} isDetailed={true} />
      </div>
    </div>
  );
};

export default EntryDetail;
