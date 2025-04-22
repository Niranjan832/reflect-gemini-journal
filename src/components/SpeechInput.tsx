
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { speechToText } from '@/utils/journalUtils';

interface SpeechInputProps {
  onTranscriptReceived: (transcript: string) => void;
}

const SpeechInput: React.FC<SpeechInputProps> = ({ onTranscriptReceived }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartRecording = async () => {
    setIsRecording(true);
    
    // In a real implementation, this would start the recording process
    // For now we'll simulate it with our placeholder function
    setIsProcessing(true);
    try {
      const transcript = await speechToText();
      onTranscriptReceived(transcript);
    } catch (error) {
      console.error('Error during speech to text conversion:', error);
    } finally {
      setIsProcessing(false);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    // In a real implementation, this would stop the recording
    setIsRecording(false);
  };

  return (
    <div className="flex items-center justify-center">
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="lg"
        className={`rounded-full p-3 h-14 w-14 ${
          isRecording ? 'bg-red-100 hover:bg-red-200 text-red-600' : 'bg-journal-light hover:bg-journal-light/80 text-journal-secondary'
        } transition-all`}
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <div className="h-5 w-5 rounded-full border-2 border-journal-primary border-t-transparent animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-700">
          {isProcessing 
            ? 'Processing your speech...' 
            : isRecording 
              ? 'Listening... Click to stop' 
              : 'Click to record your journal entry'
          }
        </p>
        {!isRecording && !isProcessing && (
          <p className="text-xs text-gray-500">Use your voice instead of typing</p>
        )}
      </div>
    </div>
  );
};

export default SpeechInput;
