
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { JournalEntry as JournalEntryType, MoodType } from '@/types/journal';
import { useAsyncData } from '@/utils/asyncUtils';
import { addJournalEntry, getAllJournalEntries, getDailyPrompt, getMoodTrends, getJournalEntriesByDate } from '@/utils/journalUtils';
import JournalEntryComponent from '@/components/JournalEntry';
import JournalEntryForm from '@/components/JournalEntryForm';
import DailyPrompt from '@/components/DailyPrompt';
import MoodVisualization from '@/components/MoodVisualization';
import CalendarView from '@/components/CalendarView';
import SystemPromptConfig from '@/components/SystemPromptConfig';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScrollableTabs from '@/components/ScrollableTabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

/**
 * Main index page component
 * Displays journal entries, calendar, and writing interface
 */
const Index = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isWriting, setIsWriting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isMobile = useIsMobile();

  // Fetch all journal entries
  const { 
    data: entries = [],
    loading: entriesLoading,
    error: entriesError
  } = useAsyncData(getAllJournalEntries, []);

  // Fetch entries for the selected date
  const { 
    data: filteredEntries = [],
    loading: filteredEntriesLoading,
    error: filteredEntriesError
  } = useAsyncData(() => getJournalEntriesByDate(selectedDate), [selectedDate]);

  // Fetch daily prompt
  const {
    data: dailyPrompt,
    loading: promptLoading,
    error: promptError
  } = useAsyncData(getDailyPrompt, []);

  // Fetch mood trends
  const {
    data: moodTrends = [],
    loading: trendsLoading,
    error: trendsError
  } = useAsyncData(getMoodTrends, []);

  /**
   * Handle creating a new journal entry
   */
  const handleNewEntry = async (content: string, mood: MoodType, mediaFiles?: File[]) => {
    try {
      const newEntry = await addJournalEntry(content, mood, mediaFiles);
      if (newEntry) {
        navigate(`/entry/${newEntry.id}`);
      }
    } catch (err) {
      console.error('Error adding entry:', err);
    }
  };

  /**
   * Handle clicking on the daily prompt
   */
  const handlePromptClick = () => {
    setIsWriting(true);
  };

  /**
   * Handle clicking on a journal entry
   */
  const handleEntryClick = (entry: JournalEntryType) => {
    navigate(`/entry/${entry.id}`);
  };

  /**
   * Handle selecting a date in the calendar
   */
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  /**
   * Generate a range of dates around today
   */
  const generateDateRange = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = -15; i <= 15; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = generateDateRange();

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      <aside className="w-full md:w-[340px] lg:w-[380px] md:min-h-screen flex-shrink-0 bg-journal-surface border-b md:border-r border-journal-primary/10">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-lg text-journal-secondary">Journal Dashboard</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>System Settings</DialogTitle>
                </DialogHeader>
                <SystemPromptConfig />
              </DialogContent>
            </Dialog>
          </div>
          
          <CalendarView 
            onDateSelect={handleDateSelect}
            entries={entries || []}
          />
          <div className="w-full">
            {trendsLoading ? (
              <div>Loading trends...</div>
            ) : trendsError ? (
              <div>Error loading trends</div>
            ) : (
              <MoodVisualization trends={moodTrends} />
            )}
          </div>
          {promptLoading ? (
            <div>Loading prompt...</div>
          ) : promptError ? (
            <div>Error loading prompt</div>
          ) : dailyPrompt ? (
            <DailyPrompt prompt={dailyPrompt} onClick={handlePromptClick} />
          ) : null}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex-shrink-0 p-4 text-center border-b bg-white">
          <h1 className="text-2xl md:text-3xl font-serif text-journal-secondary">Reflect</h1>
          <p className="text-gray-500 text-sm md:text-base">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollableTabs
            dates={availableDates}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          <div className="flex-1 overflow-y-auto px-4 py-2">
            <Tabs defaultValue={isWriting ? 'write' : 'view'} className="w-full max-w-3xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="view">View Entries</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="mt-0">
                <JournalEntryForm 
                  onSubmit={handleNewEntry} 
                  promptText={dailyPrompt?.text || "How was your day?"}
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
                          setIsWriting(true);
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
      </main>
    </div>
  );
};

export default Index;
