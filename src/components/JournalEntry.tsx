
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JournalEntry as JournalEntryType } from '@/types/journal';

interface JournalEntryProps {
  entry: JournalEntryType;
  isDetailed?: boolean;
}

const getMoodEmoji = (mood: string): string => {
  const emojis: Record<string, string> = {
    'happy': '😊',
    'neutral': '😐',
    'reflective': '🤔',
    'sad': '😔'
  };
  return emojis[mood] || '📝';
};

const getMoodColor = (mood: string): string => {
  const colors: Record<string, string> = {
    'happy': 'bg-mood-happy border-green-200 text-green-800',
    'neutral': 'bg-mood-neutral border-blue-200 text-blue-800',
    'reflective': 'bg-mood-reflective border-yellow-200 text-yellow-800',
    'sad': 'bg-mood-sad border-pink-200 text-pink-800'
  };
  return colors[mood] || 'bg-gray-100 border-gray-200 text-gray-800';
};

const JournalEntryComponent: React.FC<JournalEntryProps> = ({ entry, isDetailed = false }) => {
  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl font-serif">{format(entry.date, 'MMMM d, yyyy')}</CardTitle>
          <Badge className={`${getMoodColor(entry.mood)} font-normal`}>
            {getMoodEmoji(entry.mood)} {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
          </Badge>
        </div>
        <CardDescription>{format(entry.date, 'h:mm a')}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {isDetailed ? (
            <p className="whitespace-pre-wrap text-gray-700">{entry.content}</p>
          ) : (
            <p className="line-clamp-3 text-gray-700">{entry.content}</p>
          )}
          
          {isDetailed && entry.summary && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-1">AI Summary</h4>
              <p className="text-sm text-gray-600">{entry.summary}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      {isDetailed && entry.aiReflection && (
        <CardFooter className="bg-journal-surface p-4 border-t border-gray-100">
          <div className="w-full">
            <h4 className="text-sm font-medium text-journal-secondary mb-1">Reflection</h4>
            <p className="text-sm text-gray-700">{entry.aiReflection}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default JournalEntryComponent;
