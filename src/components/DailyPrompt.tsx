
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DailyPrompt as DailyPromptType } from '@/types/journal';

interface DailyPromptProps {
  prompt: DailyPromptType;
  onClick?: () => void;
}

// Editable: Change these questions to customize daily prompts
const dailyQuestions = [
  "What emotions did you feel most strongly today?",
  "Was there a moment that stood out to you? Describe it.",
  "Did you learn anything new or have any realizations?",
  "Is there anything you want to improve or try tomorrow?"
];

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
            <p className="text-gray-700 font-serif mb-3">How was your day?</p>
            <ul className="list-disc ml-5 text-gray-700 font-serif space-y-1">
              {dailyQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyPrompt;

