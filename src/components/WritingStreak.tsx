
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface WritingStreakProps {
  currentStreak: number;
  longestStreak: number;
}

const WritingStreak: React.FC<WritingStreakProps> = ({ currentStreak, longestStreak }) => {
  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your writing streak today!";
    if (streak < 3) return "Great start! Keep writing!";
    if (streak < 7) return "You're building a nice habit!";
    if (streak < 14) return "Impressive dedication!";
    if (streak < 30) return "You're on fire! 🔥";
    return "You're a journaling master! 🌟";
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Writing Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Streak:</span>
            <span className="font-semibold text-lg">{currentStreak} days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Longest Streak:</span>
            <span className="font-semibold text-lg">{longestStreak} days</span>
          </div>
          <p className="text-sm text-gray-600 italic mt-2">
            {getStreakMessage(currentStreak)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WritingStreak;
