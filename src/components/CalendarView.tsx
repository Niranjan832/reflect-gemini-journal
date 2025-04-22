
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JournalEntry, MoodType } from '@/types/journal';
import { format, isSameDay } from 'date-fns';

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

  // The customDayRender function now receives only the Date for the day cell:
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
    // Highlight the selected day
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
    <Card className="w-full max-w-full">
      <CardHeader>
        <CardTitle className="text-xl font-serif">Journal Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md border"
          components={{
            Day: ({ date }) => customDayRender(date),
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarView;

