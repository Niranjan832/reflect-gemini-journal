
export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  usage: 'summary' | 'reflection' | 'analysis' | 'chat';
}

export const prompts: Record<string, SystemPrompt> = {
  journalSummary: {
    id: 'journal-summary',
    name: 'Journal Summary',
    content: 'Summarize this journal entry concisely, focusing on key emotions and events.',
    usage: 'summary',
  },
  journalReflection: {
    id: 'journal-reflection',
    name: 'Journal Reflection',
    content: 'Provide a thoughtful, empathetic reflection on this journal entry, considering the author\'s emotional state.',
    usage: 'reflection',
  },
  moodAnalysis: {
    id: 'mood-analysis',
    name: 'Mood Analysis',
    content: 'Analyze the emotional tone of this text and identify the primary mood.',
    usage: 'analysis',
  },
  chatAssistant: {
    id: 'chat-assistant',
    name: 'Chat Assistant',
    content: 'You are a supportive journal assistant. Help users express their thoughts and feelings clearly.',
    usage: 'chat',
  },
};

