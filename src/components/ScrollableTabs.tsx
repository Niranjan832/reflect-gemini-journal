
import React from 'react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollableTabsProps {
  dates: Date[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const ScrollableTabs: React.FC<ScrollableTabsProps> = ({
  dates,
  selectedDate,
  onDateSelect,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex items-center w-full bg-white border-b border-gray-200">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 z-10 h-full rounded-none border-r"
        onClick={() => scrollTabs('left')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <ScrollArea className="w-full mx-8" orientation="horizontal">
        <div 
          ref={scrollContainerRef}
          className="flex items-center min-w-full space-x-1 px-2 py-1"
        >
          {dates.map((date) => (
            <Button
              key={date.toISOString()}
              variant="ghost"
              className={cn(
                "min-w-[120px] h-12 px-4",
                selectedDate.toDateString() === date.toDateString() && 
                "bg-journal-surface text-journal-primary border-b-2 border-journal-primary"
              )}
              onClick={() => onDateSelect(date)}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs font-medium">
                  {format(date, 'EEE')}
                </span>
                <span className="text-sm">
                  {format(date, 'MMM d')}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 z-10 h-full rounded-none border-l"
        onClick={() => scrollTabs('right')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ScrollableTabs;
