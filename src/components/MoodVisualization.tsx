
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoodTrend, MoodType } from '@/types/journal';

interface MoodVisualizationProps {
  trends: MoodTrend[];
}

const getMoodColor = (mood: MoodType): string => {
  const colors: Record<MoodType, string> = {
    'happy': 'bg-mood-happy',
    'neutral': 'bg-mood-neutral',
    'reflective': 'bg-mood-reflective',
    'sad': 'bg-mood-sad'
  };
  return colors[mood];
};

const getMoodEmoji = (mood: MoodType): string => {
  const emojis: Record<MoodType, string> = {
    'happy': '😊',
    'neutral': '😐',
    'reflective': '🤔',
    'sad': '😔'
  };
  return emojis[mood];
};

const MoodVisualization: React.FC<MoodVisualizationProps> = ({ trends }) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-serif">Your Mood Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trends.map((trend) => (
            <div key={trend.mood} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center">
                  {getMoodEmoji(trend.mood)} {trend.mood.charAt(0).toUpperCase() + trend.mood.slice(1)}
                </span>
                <span className="text-sm text-gray-500">{trend.percentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`${getMoodColor(trend.mood)} h-2 rounded-full`}
                  style={{ width: `${trend.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodVisualization;
