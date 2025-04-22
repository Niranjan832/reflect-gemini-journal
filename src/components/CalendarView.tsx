
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JournalEntry, MoodType } from '@/types/journal';
import { getJournalEntriesByDate } from '@/utils/journalUtils';
import { format } from 'date-fns';

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

  // Create a map of dates to mood colors for the calendar
  const moodDates = entries.reduce<Record<string, MoodType>>((acc, entry) => {
    const dateStr = format(entry.date, 'yyyy-MM-dd');
    acc[dateStr] = entry.mood;
    return acc;
  }, {});

  // Custom day render function to show mood colors
  const customDayRender = (day: Date, isSelected: boolean) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const mood = moodDates[dateStr];
    
    let moodColorClass = '';
    if (mood) {
      switch(mood) {
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
    
    return (
      <div className={`w-full h-full flex items-center justify-center rounded-full ${moodColorClass} ${isSelected ? 'text-white font-bold' : ''}`}>
        {day.getDate()}
      </div>
    );
  };

  return (
    <Card className="w-full">
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
            Day: ({ date, selected }) => customDayRender(date, selected),
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarView;
