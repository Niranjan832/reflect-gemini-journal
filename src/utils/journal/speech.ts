
import { localML } from '@/utils/ml/localInference';

export const speechToText = async (audioData?: any): Promise<string> => {
  try {
    if (!audioData) {
      return "Please provide audio data for transcription.";
    }
    
    const result = await localML.transcribeSpeech(audioData);
    return result.text || "Could not transcribe audio.";
  } catch (error) {
    console.error('Error in speech-to-text conversion:', error);
    return "Error transcribing audio. Please try again.";
  }
};

