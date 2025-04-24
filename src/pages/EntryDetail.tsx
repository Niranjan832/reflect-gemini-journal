
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsyncData } from '@/utils/asyncUtils';
import { getJournalEntryById, shareEntryAsBlog } from '@/utils/journalUtils';
import { JournalEntry as JournalEntryType } from '@/types/journal';
import JournalEntryComponent from '@/components/JournalEntry';
import ShareBlogButton from '@/components/ShareBlogButton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';

const EntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    data: entry,
    loading,
    error
  } = useAsyncData(() => getJournalEntryById(id || ''), [id]);

  const handleBackToCalendar = () => {
    if (entry) {
      navigate('/', { state: { selectedDate: entry.date } });
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-journal-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-gray-800 mb-4">Error: {error.message}</h1>
        <Button onClick={() => navigate('/')}>Return to Journal</Button>
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
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            className="pl-0 text-journal-secondary"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Journal
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleBackToCalendar}
            >
              <Calendar className="mr-2 h-4 w-4" />
              View in Calendar
            </Button>
            
            <ShareBlogButton entry={entry} />
          </div>
        </div>
        
        <JournalEntryComponent entry={entry} isDetailed={true} />
        
        {entry.media && entry.media.length > 0 && (
          <div className="mt-8">
            <h3 className="font-medium text-gray-700 mb-3">Media Attachments</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {entry.media.map((url, index) => {
                const isImage = !url.includes('video');
                return (
                  <div key={index} className="rounded-lg overflow-hidden border h-40">
                    {isImage ? (
                      <img 
                        src={url} 
                        alt={`Attachment ${index}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video 
                        src={url} 
                        controls 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryDetail;
