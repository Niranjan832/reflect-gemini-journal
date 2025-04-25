import { pipeline, Pipeline } from '@huggingface/transformers';
import { models, MLModel } from '@/config/ml/models';
import { prompts } from '@/config/ml/prompts';
import ollama from 'ollama/browser';

/**
 * LocalMLManager extends machine learning capabilities 
 * to support multiple inference backends including Ollama
 */
export class LocalMLManager {
  // Existing pipeline cache mechanism
  private pipelines: Map<string, Pipeline> = new Map();
  
  /**
   * Load a model from predefined configurations or Ollama
   * @param modelId Unique identifier for the model
   * @param backend Specify the inference backend (default: 'transformers')
   */
  async loadModel(modelId: string, backend: 'transformers' | 'ollama' = 'transformers') {
    // Use existing Hugging Face pipeline loading
    if (backend === 'transformers') {
      if (this.pipelines.has(modelId)) {
        return this.pipelines.get(modelId);
      }

      const model = models[modelId];
      if (!model) {
        throw new Error(`Model ${modelId} not found in configuration`);
      }

      const pipe = await pipeline(model.task as any, model.path, {
        device: 'webgpu'
      });

      this.pipelines.set(modelId, pipe);
      return pipe;
    }
    
    // Ollama model loading
    if (backend === 'ollama') {
      // Direct Ollama model interaction
      return async (prompt: string) => {
        try {
          const response = await ollama.chat({
            model: modelId,
            messages: [{ role: 'user', content: prompt }]
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
   * Generate text responses using either Transformers or Ollama
   * @param text Input text for generation
   * @param modelId Model identifier
   * @param promptId Predefined prompt template
   * @param backend Inference backend
   */
  async generateText(
    text: string, 
    modelId: string, 
    promptId: string,
    backend: 'transformers' | 'ollama' = 'transformers'
  ) {
    const model = await this.loadModel(modelId, backend);
    
    if (backend === 'transformers') {
      const prompt = prompts[promptId];
      
      if (!prompt) {
        throw new Error(`Prompt ${promptId} not found in configuration`);
      }

      const fullPrompt = `${prompt.content}\n\n${text}`;
      return model(fullPrompt, {
        max_new_tokens: models[modelId].maxTokens,
        temperature: models[modelId].temperature,
      });
    }

    // Ollama text generation
    if (backend === 'ollama') {
      return model(text);
    }
  }

  async analyzeMood(text: string): Promise<'happy' | 'neutral' | 'reflective' | 'sad'> {
    const model = await this.loadModel('sentimentAnalysis');
    const result = await model(text);
    
    // Map sentiment scores to mood
    if (result[0].score > 0.6) {
      return 'happy';
    } else if (result[0].score > 0.4) {
      return 'neutral';
    } else if (result[0].score > 0.2) {
      return 'reflective';
    }
    return 'sad';
  }

  async transcribeSpeech(audioData: any) {
    const model = await this.loadModel('speechRecognition');
    return await model(audioData);
  }

  async getEmbeddings(text: string) {
    const model = await this.loadModel('featureExtraction');
    return await model(text, { pooling: 'mean', normalize: true });
  }
}

// Singleton instance for global access
export const localML = new LocalMLManager();
