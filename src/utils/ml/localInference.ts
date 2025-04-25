
import { pipeline, Pipeline } from '@huggingface/transformers';
import { models, MLModel } from '@/config/ml/models';
import { prompts } from '@/config/ml/prompts';
import ollama from 'ollama/browser';
import { MoodType } from '@/types/journal';

/**
 * LocalMLManager provides machine learning capabilities to the application
 * Supporting both local inference via Transformers.js and remote inference via Ollama
 */
export class LocalMLManager {
  // Cache for pipeline instances to avoid reloading models
  private pipelines: Map<string, Pipeline> = new Map();
  
  // Store custom system prompts set at runtime
  private customSystemPrompts: Map<string, string> = new Map();
  
  /**
   * Set a custom system prompt for a specific model
   * @param modelId Model identifier
   * @param systemPrompt The system prompt to use
   */
  setSystemPrompt(modelId: string, systemPrompt: string) {
    this.customSystemPrompts.set(modelId, systemPrompt);
    console.log(`System prompt set for ${modelId}`);
  }
  
  /**
   * Get the system prompt for a model (custom or default)
   * @param modelId Model identifier
   * @returns System prompt string
   */
  getSystemPrompt(modelId: string): string {
    // Check for custom system prompt first
    if (this.customSystemPrompts.has(modelId)) {
      return this.customSystemPrompts.get(modelId) as string;
    }
    
    // Fall back to default system prompt in model config
    return models[modelId]?.systemPrompt || '';
  }
  
  /**
   * Load a model from predefined configurations
   * @param modelId Unique identifier for the model
   * @param backend Specify the inference backend (default: 'transformers')
   * @returns A loaded model instance ready for inference
   */
  async loadModel(modelId: string, backend?: 'transformers' | 'ollama') {
    // Determine backend from model config if not explicitly specified
    const modelBackend = backend || models[modelId]?.backend || 'transformers';
    
    // Load Transformers.js model
    if (modelBackend === 'transformers') {
      if (this.pipelines.has(modelId)) {
        return this.pipelines.get(modelId);
      }

      const model = models[modelId];
      if (!model) {
        throw new Error(`Model ${modelId} not found in configuration`);
      }

      // Create pipeline with WebGPU acceleration when available
      const pipe = await pipeline(model.task as any, model.path, {
        device: 'webgpu'
      });

      this.pipelines.set(modelId, pipe);
      return pipe;
    }
    
    // Set up Ollama model
    if (modelBackend === 'ollama') {
      // Return a function that handles Ollama inference
      return async (prompt: string) => {
        try {
          // Get system prompt for the model
          const systemPrompt = this.getSystemPrompt(modelId);
          
          // Create message array for chat
          const messages = [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ];
          
          console.log(`Sending request to Ollama model: ${modelId}`, { messages });
          
          // Make API call to Ollama
          const response = await ollama.chat({
            model: models[modelId].path,
            messages: messages
          });
          
          return response.message.content;
        } catch (error) {
          console.error('Ollama model inference failed:', error);
          return null;
        }
      };
    }
  }

  /**
   * Generate text responses using the specified model
   * @param text Input text for generation
   * @param modelId Model identifier
   * @param promptId Optional prompt template ID
   * @param backend Override the inference backend
   * @returns Generated text response
   */
  async generateText(
    text: string, 
    modelId: string, 
    promptId?: string,
    backend?: 'transformers' | 'ollama'
  ) {
    // Determine which backend to use
    const modelBackend = backend || models[modelId]?.backend || 'transformers';
    const model = await this.loadModel(modelId, modelBackend);
    
    // Transformers.js text generation
    if (modelBackend === 'transformers') {
      let fullPrompt = text;
      
      // Apply prompt template if specified
      if (promptId) {
        const prompt = prompts[promptId];
        if (!prompt) {
          throw new Error(`Prompt ${promptId} not found in configuration`);
        }
        fullPrompt = `${prompt.content}\n\n${text}`;
      }
      
      // Generate text with the model
      return model(fullPrompt, {
        max_new_tokens: models[modelId].maxTokens,
        temperature: models[modelId].temperature,
      });
    }

    // Ollama text generation
    if (modelBackend === 'ollama') {
      // For Ollama, the prompt template is handled in the system prompt
      return model(text);
    }
  }

  /**
   * Create a chat response using an Ollama model
   * @param messages Array of previous messages in the conversation
   * @param modelId Model identifier (default: 'ollama-chat')
   * @returns Generated response text
   */
  async generateChatResponse(messages: Array<{role: string, content: string}>, modelId: string = 'ollama-chat') {
    try {
      // Get system prompt for the model
      const systemPrompt = this.getSystemPrompt(modelId);
      
      // Add system message if available
      const chatMessages = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages
      ];
      
      console.log(`Sending chat request to Ollama model: ${modelId}`, { chatMessages });
      
      // Make API call to Ollama
      const response = await ollama.chat({
        model: models[modelId].path,
        messages: chatMessages
      });
      
      return response.message.content;
    } catch (error) {
      console.error('Chat generation failed:', error);
      return "I'm sorry, I couldn't generate a response at the moment.";
    }
  }

  /**
   * Summarize text using an Ollama model
   * @param text Text to summarize
   * @param modelId Model identifier (default: 'ollama-summarize')
   * @returns Summarized text
   */
  async summarizeText(text: string, modelId: string = 'ollama-summarize') {
    try {
      // Get system prompt for the model
      const systemPrompt = this.getSystemPrompt(modelId);
      
      // Create message array for summarization
      const messages = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: `Please summarize this journal entry:\n\n${text}` }
      ];
      
      console.log(`Sending summarization request to Ollama model: ${modelId}`);
      
      // Make API call to Ollama
      const response = await ollama.chat({
        model: models[modelId].path,
        messages: messages
      });
      
      return response.message.content;
    } catch (error) {
      console.error('Text summarization failed:', error);
      return "Couldn't summarize the text at the moment.";
    }
  }

  /**
   * Analyze text to determine emotional mood
   * @param text Text to analyze
   * @returns Detected mood category
   */
  async analyzeMood(text: string): Promise<MoodType> {
    try {
      // Use sentiment analysis model
      const model = await this.loadModel('sentimentAnalysis');
      const result = await model(text);
      
      console.log('Mood analysis result:', result);
      
      // Map sentiment scores to mood categories
      if (result[0].score > 0.6) {
        return 'happy';
      } else if (result[0].score > 0.4) {
        return 'neutral';
      } else if (result[0].score > 0.2) {
        return 'reflective';
      }
      return 'sad';
    } catch (error) {
      console.error('Error analyzing mood:', error);
      return 'neutral';
    }
  }

  /**
   * Analyze mood using Ollama for more nuanced results
   * @param text Journal entry text
   * @param modelId Model to use (default: 'ollama-mistral')
   * @returns Detected mood
   */
  async analyzeAdvancedMood(text: string, modelId: string = 'ollama-mistral'): Promise<MoodType> {
    try {
      const systemPrompt = "Analyze the emotional tone of the following text. Respond with EXACTLY ONE WORD from these options: happy, neutral, reflective, sad. Choose the option that best fits the overall emotional tone.";
      
      // Create message array for mood analysis
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ];
      
      // Make API call to Ollama
      const response = await ollama.chat({
        model: models[modelId].path,
        messages: messages
      });
      
      const mood = response.message.content.toLowerCase().trim();
      
      // Ensure the response is one of our valid mood types
      if (['happy', 'neutral', 'reflective', 'sad'].includes(mood)) {
        return mood as MoodType;
      }
      
      // Fall back to basic mood analysis if response is invalid
      return await this.analyzeMood(text);
    } catch (error) {
      console.error('Advanced mood analysis failed:', error);
      return await this.analyzeMood(text);
    }
  }

  /**
   * Transcribe speech audio to text
   * @param audioData Audio data for transcription
   * @returns Transcribed text
   */
  async transcribeSpeech(audioData: any) {
    const model = await this.loadModel('speechRecognition');
    return await model(audioData);
  }

  /**
   * Get text embeddings for semantic similarity or search
   * @param text Text to embed
   * @returns Vector embeddings
   */
  async getEmbeddings(text: string) {
    const model = await this.loadModel('featureExtraction');
    return await model(text, { pooling: 'mean', normalize: true });
  }
}

// Singleton instance for global access
export const localML = new LocalMLManager();
