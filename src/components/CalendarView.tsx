
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JournalEntry, MoodType } from '@/types/journal';
import { format, isSameDay } from 'date-fns';
import WritingStreak from './WritingStreak';

interface CalendarViewProps {
  onDateSelect: (date: Date) => void;
  entries: JournalEntry[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ onDateSelect, entries }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };

  // Map of string date to mood for coloring
  const moodDates = entries.reduce<Record<string, MoodType>>((acc, entry) => {
    const dateStr = format(entry.date, 'yyyy-MM-dd');
    acc[dateStr] = entry.mood;
    return acc;
  }, {});

  const customDayRender = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const mood = moodDates[dateStr];

    let moodColorClass = '';
    if (mood) {
      switch (mood) {
        case 'happy':
          moodColorClass = 'bg-mood-happy';
          break;
        case 'neutral':
          moodColorClass = 'bg-mood-neutral';
          break;
        case 'reflective':
          moodColorClass = 'bg-mood-reflective';
          break;
        case 'sad':
          moodColorClass = 'bg-mood-sad';
          break;
      }
    }

    const isSelected = selectedDate && isSameDay(date, selectedDate);

    return (
      <div
        className={`w-full h-full flex items-center justify-center rounded-full 
        ${moodColorClass} 
        ${isSelected ? 'text-white font-bold ring-2 ring-journal-primary' : ''}`}
        style={{ aspectRatio: "1/1", minWidth: 28, minHeight: 28 }}
      >
        {date.getDate()}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-serif">Journal Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border max-w-full"
            components={{
              Day: ({ date }) => customDayRender(date),
            }}
          />
        </CardContent>
      </Card>

      <WritingStreak 
        currentStreak={5} 
        longestStreak={10} 
      />
    </div>
  );
};

export default CalendarView;
