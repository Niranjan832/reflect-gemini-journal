
/**
 * Convert speech to text using browser's Web Speech API and ML model
 * @param audioData Optional audio data for ML model transcription
 * @returns Transcribed text
 */
export const speechToText = async (audioData?: any): Promise<string> => {
  // First try browser's native speech recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      let finalTranscript = '';
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Return final transcript when we have content
        if (finalTranscript) {
          recognition.stop();
          resolve(finalTranscript);
        }
      };
      
      recognition.onerror = (error) => {
        console.error('Speech recognition error:', error);
        reject(error);
      };
      
      recognition.start();
    });
  }
  
  // Fallback to transcription model if browser API fails
  try {
    if (!audioData) {
      return "Please enable microphone access or provide audio data.";
    }
    
    // Use Ollama model for transcription
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'whisper',
        prompt: audioData,
        stream: false
      })
    });
    
    const result = await response.json();
    return result.response || "Could not transcribe audio.";
  } catch (error) {
    console.error('Error in speech-to-text conversion:', error);
    return "Error transcribing audio. Please try again.";
  }
};
