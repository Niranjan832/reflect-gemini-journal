
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { JournalEntry as JournalEntryType, MoodType } from '@/types/journal';
import { useAsyncData } from '@/utils/asyncUtils';
import { addJournalEntry, getAllJournalEntries, getDailyPrompt, getMoodTrends, getJournalEntriesByDate } from '@/utils/journalUtils';
import CalendarView from '@/components/CalendarView';
import MoodVisualization from '@/components/MoodVisualization';
import DailyPrompt from '@/components/DailyPrompt';
import ScrollableTabs from '@/components/ScrollableTabs';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SystemPromptConfig from '@/components/SystemPromptConfig';
import WritingStreak from '@/components/WritingStreak';
import { getWritingStreak } from '@/utils/journal/streak';
import SidePanel from '@/components/SidePanel';
import MainContent from '@/components/MainContent';
import TodoListView from '@/components/TodoListView';
import NotesView from '@/components/NotesView';

/**
 * Main index page component
 * Displays journal entries, calendar, and writing interface
 */
const Index = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isWriting, setIsWriting] = useState(false);
  const [activeView, setActiveView] = useState('diary');

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

  // Fetch writing streak data
  const { 
    data: streakData = { currentStreak: 0, longestStreak: 0 },
    loading: streakLoading 
  } = useAsyncData(getWritingStreak, []);

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
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Sidebar with Icons */}
      <SidePanel onViewChange={setActiveView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
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

          {activeView === 'diary' && (
            <MainContent
              activeView={activeView}
              selectedDate={selectedDate}
              filteredEntries={filteredEntries}
              filteredEntriesLoading={filteredEntriesLoading}
              filteredEntriesError={filteredEntriesError}
              promptText={dailyPrompt?.text || "How was your day?"}
              onNewEntry={handleNewEntry}
              isWriting={isWriting}
            />
          )}
          
          {activeView === 'todo' && <TodoListView />}
          
          {activeView === 'notes' && <NotesView />}
        </div>
      </div>

      {/* Right Sidebar - Journal Dashboard */}
      <aside className="hidden md:block w-[340px] lg:w-[380px] min-h-screen flex-shrink-0 bg-journal-surface border-l border-journal-primary/10">
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
          {!streakLoading && (
            <WritingStreak 
              currentStreak={streakData.currentStreak}
              longestStreak={streakData.longestStreak}
            />
          )}
        </div>
      </aside>
    </div>
  );
};

export default Index;
