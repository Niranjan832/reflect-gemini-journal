
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DailyPrompt as DailyPromptType } from '@/types/journal';

interface DailyPromptProps {
  prompt: DailyPromptType;
  onClick?: () => void;
}

const DailyPrompt: React.FC<DailyPromptProps> = ({ prompt, onClick }) => {
  return (
    <Card 
      className="w-full bg-journal-light border-journal-primary/20 cursor-pointer hover:bg-journal-light/80 transition-colors animate-scale-in"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💭</div>
          <div>
            <h3 className="text-journal-secondary font-medium mb-1">Today's Prompt</h3>
            <p className="text-gray-700 font-serif">{prompt.text}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyPrompt;
