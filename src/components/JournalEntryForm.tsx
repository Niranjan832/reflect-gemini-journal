
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MoodSelector from './MoodSelector';
import SpeechInput from './SpeechInput';
import { MoodType } from '@/types/journal';

interface JournalEntryFormProps {
  onSubmit: (content: string, mood: MoodType) => void;
  promptText?: string;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onSubmit, promptText }) => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }
    
    if (!selectedMood) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onSubmit(content, selectedMood);
      setContent('');
      setSelectedMood(null);
    } catch (error) {
      console.error('Error submitting journal entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranscriptReceived = (transcript: string) => {
    setContent((prev) => prev ? `${prev}\n\n${transcript}` : transcript);
  };

  return (
    <Card className="w-full animate-fade-in">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Write in your journal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {promptText && (
            <div className="p-3 bg-journal-light rounded-md">
              <p className="text-sm italic text-gray-700">Today's prompt: {promptText}</p>
            </div>
          )}
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind today?"
            className="min-h-[200px] p-4 text-base resize-none border-journal-primary/20 focus:border-journal-primary"
          />
          
          <SpeechInput onTranscriptReceived={handleTranscriptReceived} />
          
          <MoodSelector
            selectedMood={selectedMood}
            onMoodSelect={setSelectedMood}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={!content.trim() || !selectedMood || isSubmitting}
            className="bg-journal-primary hover:bg-journal-secondary text-white transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving...
              </>
            ) : (
              'Save Entry'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JournalEntryForm;
