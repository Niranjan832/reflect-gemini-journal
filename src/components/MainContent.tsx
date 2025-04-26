
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JournalEntryForm from '@/components/JournalEntryForm';
import JournalEntryComponent from '@/components/JournalEntry';
import { JournalEntry as JournalEntryType, MoodType } from '@/types/journal';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainContentProps {
  activeView: string;
  selectedDate: Date;
  filteredEntries: JournalEntryType[];
  filteredEntriesLoading: boolean;
  filteredEntriesError: any;
  promptText: string;
  onNewEntry: (content: string, mood: MoodType, mediaFiles?: File[]) => Promise<void>;
  isWriting: boolean;
}

const MainContent = ({
  activeView,
  selectedDate,
  filteredEntries,
  filteredEntriesLoading,
  filteredEntriesError,
  promptText,
  onNewEntry,
  isWriting
}: MainContentProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleEntryClick = (entry: JournalEntryType) => {
    navigate(`/entry/${entry.id}`);
  };

  if (activeView !== 'diary') {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <Tabs defaultValue={isWriting ? 'write' : 'view'} className="w-full max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="view">View Entries</TabsTrigger>
          </TabsList>
          <TabsContent value="write" className="mt-0">
            <JournalEntryForm 
              onSubmit={onNewEntry} 
              promptText={promptText || "How was your day?"}
            />
          </TabsContent>
          <TabsContent value="view" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-serif text-gray-800">
                  {format(selectedDate, isMobile ? 'MMM d' : 'MMMM d, yyyy')} Entries
                </h2>
              </div>
              {filteredEntriesLoading ? (
                <div>Loading entries...</div>
              ) : filteredEntriesError ? (
                <div>Error loading entries</div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-8 px-2 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-400 text-sm">No journal entries for this date.</p>
                  <Button
                    className="mt-3 bg-journal-primary hover:bg-journal-secondary text-white"
                    onClick={() => {
                      const tab = document.querySelector('[data-value="write"]') as HTMLElement;
                      if (tab) tab.click();
                    }}
                  >
                    Write a new entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEntries.map(entry => (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Import Button at the top of the file
import { Button } from "@/components/ui/button";

export default MainContent;
