
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoodType } from '@/types/journal';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
  const moods: { type: MoodType; emoji: string; label: string }[] = [
    { type: 'happy', emoji: '😊', label: 'Happy' },
    { type: 'neutral', emoji: '😐', label: 'Neutral' },
    { type: 'reflective', emoji: '🤔', label: 'Reflective' },
    { type: 'sad', emoji: '😔', label: 'Sad' },
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">How are you feeling today?</p>
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <Button
            key={mood.type}
            variant={selectedMood === mood.type ? 'default' : 'outline'}
            className={`transition-all px-4 py-2 rounded-full ${
              selectedMood === mood.type 
                ? 'bg-journal-primary text-white' 
                : 'hover:bg-journal-light'
            }`}
            onClick={() => onMoodSelect(mood.type)}
          >
            <span className="mr-2 text-lg">{mood.emoji}</span>
            {mood.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
