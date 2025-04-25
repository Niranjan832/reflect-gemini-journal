
import { pipeline } from '@huggingface/transformers';
import { models } from '@/config/ml/models';
import { prompts } from '@/config/ml/prompts';
import type { MLModel, SystemPrompt } from '@/config/ml/models';

export class LocalMLManager {
  private pipelines: Map<string, any> = new Map();

  async loadModel(modelId: string) {
    if (this.pipelines.has(modelId)) {
      return this.pipelines.get(modelId);
    }

    const model = models[modelId];
    if (!model) {
      throw new Error(`Model ${modelId} not found in configuration`);
    }

    const pipe = await pipeline(
      model.task,
      model.path,
      { device: 'webgpu' }
    );

    this.pipelines.set(modelId, pipe);
    return pipe;
  }

  async generateText(text: string, modelId: string, promptId: string) {
    const model = await this.loadModel(modelId);
    const prompt = prompts[promptId];
    
    if (!prompt) {
      throw new Error(`Prompt ${promptId} not found in configuration`);
    }

    const fullPrompt = `${prompt.content}\n\n${text}`;
    const result = await model(fullPrompt, {
      max_new_tokens: models[modelId].maxTokens,
      temperature: models[modelId].temperature,
    });

    return result;
  }

  async analyzeSentiment(text: string) {
    const model = await this.loadModel('sentimentAnalysis');
    return await model(text);
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

export const localML = new LocalMLManager();

