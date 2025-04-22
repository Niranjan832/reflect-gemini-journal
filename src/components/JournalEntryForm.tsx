
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MoodSelector from './MoodSelector';
import SpeechInput from './SpeechInput';
import { MoodType } from '@/types/journal';
import ChatInterface from './ChatInterface';
import MediaUploader from './MediaUploader';
import { useToast } from '@/components/ui/use-toast';

interface JournalEntryFormProps {
  onSubmit: (content: string, mood: MoodType, media?: File[]) => void;
  promptText?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onSubmit, promptText }) => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useChat, setUseChat] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const { toast } = useToast();

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
      onSubmit(content, selectedMood, mediaFiles.length > 0 ? mediaFiles : undefined);
      setContent('');
      setSelectedMood(null);
      setMediaFiles([]);
    } catch (error) {
      console.error('Error submitting journal entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranscriptReceived = (transcript: string) => {
    setContent((prev) => prev ? `${prev}\n\n${transcript}` : transcript);
  };

  const handleSummarize = (messages: Message[]) => {
    // Extract user messages and combine them
    const userContent = messages
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.text)
      .join('\n\n');
    
    setContent(userContent);
    setUseChat(false);
    toast({
      title: "Chat summarized",
      description: "Your conversation has been converted to journal text.",
    });
  };

  const handleMediaAdded = (files: File[]) => {
    setMediaFiles(files);
  };

  return (
    <Card className="w-full animate-fade-in">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Write in your journal</CardTitle>
          <div className="flex space-x-2 mt-2">
            <Button
              type="button"
              variant={useChat ? "default" : "outline"}
              onClick={() => setUseChat(true)}
              className="text-sm"
            >
              Chat Mode
            </Button>
            <Button
              type="button"
              variant={!useChat ? "default" : "outline"}
              onClick={() => setUseChat(false)}
              className="text-sm"
            >
              Direct Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {promptText && (
            <div className="p-3 bg-journal-light rounded-md">
              <p className="text-sm italic text-gray-700">Today's prompt: {promptText}</p>
            </div>
          )}
          
          {useChat ? (
            <ChatInterface onSummarize={handleSummarize} />
          ) : (
            <>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today?"
                className="min-h-[200px] p-4 text-base resize-none border-journal-primary/20 focus:border-journal-primary"
              />
              
              <SpeechInput onTranscriptReceived={handleTranscriptReceived} />
            </>
          )}
          
          {!useChat && (
            <MediaUploader onMediaAdded={handleMediaAdded} mediaFiles={mediaFiles} />
          )}
          
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
