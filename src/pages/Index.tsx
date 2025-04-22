import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { JournalEntry as JournalEntryType, MoodType } from '@/types/journal';
import { addJournalEntry, getAllJournalEntries, getDailyPrompt, getMoodTrends, getJournalEntriesByDate } from '@/utils/journalUtils';
import JournalEntryComponent from '@/components/JournalEntry';
import JournalEntryForm from '@/components/JournalEntryForm';
import DailyPrompt from '@/components/DailyPrompt';
import MoodVisualization from '@/components/MoodVisualization';
import CalendarView from '@/components/CalendarView';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredEntries, setFilteredEntries] = useState<JournalEntryType[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  
  useEffect(() => {
    const loadedEntries = getAllJournalEntries();
    setEntries(loadedEntries);
    
    const entriesForDate = getJournalEntriesByDate(selectedDate);
    setFilteredEntries(entriesForDate);
  }, [selectedDate]);
  
  const handleNewEntry = (content: string, mood: MoodType, mediaFiles?: File[]) => {
    const newEntry = addJournalEntry(content, mood, mediaFiles);
    setEntries([newEntry, ...entries]);
    setFilteredEntries([newEntry, ...filteredEntries]);
    setIsWriting(false);
  };
  
  const handlePromptClick = () => {
    setIsWriting(true);
  };
  
  const handleEntryClick = (entry: JournalEntryType) => {
    navigate(`/entry/${entry.id}`);
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const entriesForDate = getJournalEntriesByDate(date);
    setFilteredEntries(entriesForDate);
  };
  
  const dailyPrompt = getDailyPrompt();
  const moodTrends = getMoodTrends();
  
  return (
    <div className="min-h-screen h-screen w-screen bg-white p-0 m-0 overflow-hidden">
      <div className="flex flex-col lg:flex-row w-full h-full">
        <div className="flex flex-col justify-between items-center w-full max-w-full lg:max-w-[370px] h-[320px] sm:h-[350px] lg:h-full bg-journal-surface border-r border-journal-primary/10 p-0">
          <div className="flex flex-col items-center w-full pt-4 lg:pt-12 h-full">
            <CalendarView 
              onDateSelect={handleDateSelect}
              entries={entries}
            />
            <div className="hidden lg:block w-full my-4">
              <MoodVisualization trends={moodTrends} />
            </div>
          </div>
          <div className="hidden lg:block w-full px-6 pb-6">
            <DailyPrompt prompt={dailyPrompt} onClick={handlePromptClick} />
          </div>
        </div>
        <div className="flex flex-col justify-between items-center flex-1 h-full w-full bg-white">
          <header className="w-full p-4 pb-1 flex flex-col items-center bg-white">
            <h1 className="text-3xl md:text-4xl font-serif text-journal-secondary mb-1">Reflect</h1>
            <p className="text-gray-500">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
          </header>
          <div className="flex flex-col justify-center items-center w-full flex-1 px-2 sm:px-6 py-4 h-full">
            <Tabs defaultValue="write" className="w-full max-w-2xl h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="view">View Entries</TabsTrigger>
              </TabsList>
              
              <TabsContent value="write" className="border-none p-0 flex-1 flex flex-col">
                <JournalEntryForm 
                  onSubmit={handleNewEntry} 
                  promptText={dailyPrompt.text}
                />
              </TabsContent>
              
              <TabsContent value="view" className="border-none p-0 flex-1 flex flex-col">
                <div className="space-y-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-serif text-gray-800">
                      {format(selectedDate, 'MMMM d, yyyy')} Entries
                    </h2>
                  </div>
                  
                  {filteredEntries.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-500">No journal entries for this date.</p>
                      <Button
                        className="mt-4 bg-journal-primary hover:bg-journal-secondary text-white"
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
                    <div className="space-y-4 overflow-auto max-h-[240px] sm:max-h-[300px]">
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
          <div className="block lg:hidden w-full bg-journal-surface border-t border-journal-primary/10 px-4 py-4">
            <MoodVisualization trends={moodTrends} />
            <div className="mt-4">
              <DailyPrompt prompt={dailyPrompt} onClick={handlePromptClick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
