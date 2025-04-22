
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { JournalEntry as JournalEntryType, MoodType } from '@/types/journal';
import { addJournalEntry, getAllJournalEntries, getDailyPrompt, getMoodTrends } from '@/utils/journalUtils';
import JournalEntryComponent from '@/components/JournalEntry';
import JournalEntryForm from '@/components/JournalEntryForm';
import DailyPrompt from '@/components/DailyPrompt';
import MoodVisualization from '@/components/MoodVisualization';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryType | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  
  useEffect(() => {
    // Load journal entries
    const loadedEntries = getAllJournalEntries();
    setEntries(loadedEntries);
  }, []);
  
  const handleNewEntry = (content: string, mood: MoodType) => {
    const newEntry = addJournalEntry(content, mood);
    setEntries([newEntry, ...entries]);
    setIsWriting(false);
  };
  
  const handlePromptClick = () => {
    setIsWriting(true);
  };
  
  const handleEntryClick = (entry: JournalEntryType) => {
    navigate(`/entry/${entry.id}`);
  };
  
  const dailyPrompt = getDailyPrompt();
  const moodTrends = getMoodTrends();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif text-journal-secondary mb-1">Reflect</h1>
          <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Entry form or selected entry */}
          <div className="col-span-1 lg:col-span-2">
            {selectedEntry ? (
              <div className="space-y-4">
                <JournalEntryComponent entry={selectedEntry} isDetailed={true} />
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedEntry(null)}
                >
                  Back to all entries
                </Button>
              </div>
            ) : isWriting ? (
              <div className="space-y-4">
                <JournalEntryForm 
                  onSubmit={handleNewEntry} 
                  promptText={dailyPrompt.text}
                />
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsWriting(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-serif text-gray-800">Recent Journal Entries</h2>
                  <Button
                    className="bg-journal-primary hover:bg-journal-secondary text-white"
                    onClick={() => setIsWriting(true)}
                  >
                    New Entry
                  </Button>
                </div>
                
                {entries.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-500">You haven't created any journal entries yet.</p>
                    <Button
                      className="mt-4 bg-journal-primary hover:bg-journal-secondary text-white"
                      onClick={() => setIsWriting(true)}
                    >
                      Write your first entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map(entry => (
                      <div
                        key={entry.id}
                        onClick={() => handleEntryClick(entry)}
                        className="cursor-pointer"
                      >
                        <JournalEntryComponent entry={entry} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right column: Daily prompt and mood trends */}
          <div className="col-span-1 space-y-6">
            {!isWriting && (
              <DailyPrompt prompt={dailyPrompt} onClick={handlePromptClick} />
            )}
            
            {entries.length > 0 && (
              <>
                <Separator className="my-6" />
                <MoodVisualization trends={moodTrends} />
              </>
            )}
            
            <div className="bg-journal-surface p-6 rounded-lg border border-journal-primary/20 mt-6">
              <h3 className="font-medium text-journal-secondary mb-2">About Reflect</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your private, AI-powered journaling companion. Record your thoughts through text or voice, and get personalized insights and reflections.
              </p>
              <p className="text-xs text-gray-500">
                All your entries are private and securely stored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
