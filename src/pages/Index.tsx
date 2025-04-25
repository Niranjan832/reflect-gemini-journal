import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScrollableTabs from '@/components/ScrollableTabs';

const Index = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isWriting, setIsWriting] = useState(false);

  const { 
    data: entries = [],
    loading: entriesLoading,
    error: entriesError
  } = useAsyncData(getAllJournalEntries, []);

  const { 
    data: filteredEntries = [],
    loading: filteredEntriesLoading,
    error: filteredEntriesError
  } = useAsyncData(() => getJournalEntriesByDate(selectedDate), [selectedDate]);

  const {
    data: dailyPrompt,
    loading: promptLoading,
    error: promptError
  } = useAsyncData(getDailyPrompt, []);

  const {
    data: moodTrends = [],
    loading: trendsLoading,
    error: trendsError
  } = useAsyncData(getMoodTrends, []);

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

  const handlePromptClick = () => {
    setIsWriting(true);
  };

  const handleEntryClick = (entry: JournalEntryType) => {
    navigate(`/entry/${entry.id}`);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

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
    <div className="bg-white min-h-screen w-full h-screen overflow-hidden flex flex-col">
      <div className="flex flex-1 w-full h-full">
        <div className="hidden lg:flex flex-col justify-between items-center w-[340px] min-w-[260px] h-full bg-journal-surface border-r border-journal-primary/10 p-0 overflow-y-auto">
          <div className="flex flex-col items-center w-full pt-5 pb-2 h-auto flex-shrink-0 min-h-[370px]">
            <CalendarView 
              onDateSelect={handleDateSelect}
              entries={entries || []}
            />
            <div className="w-full my-3">
              {trendsLoading ? (
                <div>Loading trends...</div>
              ) : trendsError ? (
                <div>Error loading trends</div>
              ) : (
                <MoodVisualization trends={moodTrends} />
              )}
            </div>
          </div>
          <div className="w-full p-4">
            {promptLoading ? (
              <div>Loading prompt...</div>
            ) : promptError ? (
              <div>Error loading prompt</div>
            ) : dailyPrompt ? (
              <DailyPrompt prompt={dailyPrompt} onClick={handlePromptClick} />
            ) : null}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between items-center w-full h-full bg-white px-2 sm:px-4 md:px-8 py-2">
          <header className="w-full pt-4 pb-2 flex flex-col items-center flex-shrink-0 bg-white">
            <h1 className="text-2xl md:text-3xl font-serif text-journal-secondary mb-0">Reflect</h1>
            <p className="text-gray-500 text-xs md:text-base whitespace-nowrap">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </header>
          <div className="flex-1 w-full flex flex-col items-center overflow-visible" style={{ minHeight: 0 }}>
            <Tabs defaultValue={isWriting ? 'write' : 'view'} className="w-full max-w-2xl h-full flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="view">View Entries</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="flex-1 flex flex-col h-full p-0 border-none">
                <JournalEntryForm 
                  onSubmit={handleNewEntry} 
                  promptText={dailyPrompt?.text || "How was your day?"}
                />
              </TabsContent>
              <TabsContent value="view" className="flex-1 flex flex-col border-none p-0 h-full">
                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-serif text-gray-800 truncate">
                      {format(selectedDate, 'MMMM d, yyyy')} Entries
                    </h2>
                  </div>
                  {filteredEntriesLoading ? (
                    <div>Loading entries...</div>
                  ) : filteredEntriesError ? (
                    <div>Error loading entries</div>
                  ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-8 px-2 bg-gray-50 rounded-lg border border-gray-100 flex-1 flex flex-col items-center justify-center max-h-[220px]">
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
                    <div className="space-y-2 overflow-y-auto max-h-[160px] sm:max-h-[200px]">
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
          <div className="block lg:hidden w-full bg-journal-surface border-t border-journal-primary/10 px-2 py-3">
            <div className="mb-2">
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
        </div>
      </div>
    </div>
  );
};

export default Index;
