
/**
 * Interface for Machine Learning model configuration
 * Defines common properties for both local and Ollama models
 */
export interface MLModel {
  id?: string;                                  // Unique identifier for the model
  name: string;                                 // Display name
  provider?: 'huggingface' | 'local' | 'ollama'; // Where the model is hosted/run
  task: 'text-generation' | 'feature-extraction' | 'speech-recognition' | 'sentiment-analysis' | 'summarization' | 'chat'; // Model capability
  path: string;                                 // Path/identifier for the model
  maxTokens?: number;                           // Maximum tokens for text generation
  temperature?: number;                         // Randomness parameter (higher = more creative)
  backend?: 'transformers' | 'ollama';          // Inference backend to use
  systemPrompt?: string;                        // Default system prompt for the model
}

/**
 * Collection of available ML models for the application
 * Includes both Hugging Face Transformers models and Ollama models
 */
export const models = {
  // Sentiment analysis for mood detection
  sentimentAnalysis: {
    id: 'sentiment-local',
    name: 'Sentiment Analysis Model',
    provider: 'huggingface',
    task: 'sentiment-analysis',
    path: 'onnx-community/distilbert-base-uncased-finetuned-sst-2-english',
  },
  
  // Speech recognition for audio journal entries
  speechRecognition: {
    id: 'whisper-local',
    name: 'Whisper Speech Recognition',
    provider: 'huggingface',
    task: 'speech-recognition',
    path: 'onnx-community/whisper-tiny.en',
  },
  
  // Text generation for reflections
  textGeneration: {
    id: 'text-gen-local',
    name: 'Text Generation Model',
    provider: 'huggingface',
    task: 'text-generation',
    path: 'onnx-community/gpt2',
    maxTokens: 100,
    temperature: 0.7,
  },
  
  // Feature extraction for text embeddings/similarity
  featureExtraction: {
    id: 'embeddings-local',
    name: 'Text Embeddings Model',
    provider: 'huggingface',
    task: 'feature-extraction',
    path: 'mixedbread-ai/mxbai-embed-xsmall-v1',
  },
  
  // Ollama models for more powerful text generation
  'ollama-mistral': {
    name: 'Mistral',
    path: 'mistral:latest',
    task: 'text-generation',
    maxTokens: 200,
    temperature: 0.7,
    backend: 'ollama',
    systemPrompt: 'You are a helpful, empathetic journal assistant. Help the user reflect on their thoughts and feelings.',
  },
  
  'ollama-llama2': {
    name: 'Llama 2',
    path: 'llama2:latest',
    task: 'text-generation',
    maxTokens: 250,
    temperature: 0.6,
    backend: 'ollama',
    systemPrompt: 'You are a helpful, empathetic journal assistant. Help the user reflect on their thoughts and feelings.',
  },
  
  // Dedicated Ollama model for chat interactions
  'ollama-chat': {
    name: 'Chat Assistant',
    path: 'mistral:latest', // Can be changed to other models
    task: 'chat',
    maxTokens: 500,
    temperature: 0.7,
    backend: 'ollama',
    systemPrompt: 'You are a supportive journal assistant that helps users explore their thoughts and feelings. Be empathetic, insightful, and provide thoughtful responses.',
  },
  
  // Dedicated Ollama model for text summarization
  'ollama-summarize': {
    name: 'Text Summarizer',
    path: 'mistral:latest', // Can be changed to other models
    task: 'summarization',
    maxTokens: 150,
    temperature: 0.3, // Lower temperature for more focused summaries
    backend: 'ollama',
    systemPrompt: 'Summarize the following journal entry concisely, focusing on key emotions and events. Be brief but insightful.',
  }
};
