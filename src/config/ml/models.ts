
export interface MLModel {
  id: string;
  name: string;
  provider: 'huggingface' | 'local';
  task: 'text-generation' | 'feature-extraction' | 'speech-recognition' | 'sentiment-analysis';
  path: string;
  maxTokens?: number;
  temperature?: number;
}

export const models: Record<string, MLModel> = {
  sentimentAnalysis: {
    id: 'sentiment-local',
    name: 'Sentiment Analysis Model',
    provider: 'huggingface',
    task: 'sentiment-analysis',
    path: 'onnx-community/distilbert-base-uncased-finetuned-sst-2-english',
  },
  speechRecognition: {
    id: 'whisper-local',
    name: 'Whisper Speech Recognition',
    provider: 'huggingface',
    task: 'speech-recognition',
    path: 'onnx-community/whisper-tiny.en',
  },
  textGeneration: {
    id: 'text-gen-local',
    name: 'Text Generation Model',
    provider: 'huggingface',
    task: 'text-generation',
    path: 'onnx-community/gpt2',
    maxTokens: 100,
    temperature: 0.7,
  },
  featureExtraction: {
    id: 'embeddings-local',
    name: 'Text Embeddings Model',
    provider: 'huggingface',
    task: 'feature-extraction',
    path: 'mixedbread-ai/mxbai-embed-xsmall-v1',
  },
};

