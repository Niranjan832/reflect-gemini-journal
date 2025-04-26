
import { JournalEntry } from '@/types/journal';
import { supabase } from '@/lib/supabase';
import { Message, ChatLog } from '@/types/chat';

/**
 * Fetch the user's most recent journal entries
 * @param limit Number of entries to fetch
 * @returns Array of recent journal entries
 */
export const getRecentJournalEntries = async (limit = 7): Promise<JournalEntry[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent journal entries:', error);
    return [];
  }

  return data.map(entry => ({
    ...entry,
    date: new Date(entry.created_at),
    mood: entry.mood,
  }));
};

/**
 * Fetch recent chat logs for the current user
 * @param limit Number of messages to fetch
 * @returns Array of chat log entries
 */
export const getRecentChatLogs = async (limit = 10): Promise<ChatLog[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('chat_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent chat logs:', error);
    return [];
  }

  return data;
};

/**
 * Save a chat message to the database
 * @param message The message to save
 * @returns The saved message or null if an error occurred
 */
export const saveChatMessage = async (message: Message): Promise<ChatLog | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const chatLog: Omit<ChatLog, 'id'> = {
    user_id: user.id,
    message: message.text,
    role: message.sender === 'ai' ? 'assistant' : 'user',
    timestamp: message.timestamp.toISOString()
  };

  const { data, error } = await supabase
    .from('chat_logs')
    .insert([chatLog])
    .select()
    .single();

  if (error) {
    console.error('Error saving chat message:', error);
    return null;
  }

  return data;
};

/**
 * Generate personalized chat prompts based on user's journal history
 * @param journalEntries Recent journal entries
 * @param chatHistory Recent chat messages
 * @returns Array of personalized questions
 */
export const generatePersonalizedPrompts = async (
  journalEntries: JournalEntry[],
  chatHistory: Message[]
): Promise<string[]> => {
  try {
    // Format journal entries for the prompt
    const formattedEntries = journalEntries.map(entry => {
      const date = entry.date.toLocaleDateString();
      return `Entry Date: ${date}\nMood: ${entry.mood}\nContent: ${entry.content}\n\n`;
    }).join('');

    // Format chat history for the prompt
    const formattedChat = chatHistory.map(msg => 
      `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');

    // System instructions for the API call
    const systemPrompt = `
      You are a reflective journaling assistant. Review the user's past journal entries and recent chat conversation.
      Based on this information, generate 3-5 personalized questions that will help them write a meaningful new journal entry.
      Your questions should:
      1. Refer to specific topics, tasks, or emotions mentioned in their previous entries
      2. Follow up on unfinished tasks or thoughts they've mentioned
      3. Help them track their emotional patterns and reflect on changes
      4. Be specific to their actual experiences, not generic
      5. Focus on journaling reflection, not therapy or advice
      6. Include relevant emojis in your questions to make them more engaging

      Format your response as a JSON array of strings, each containing one question.
      Example: ["Question one with emoji?", "Question two with emoji?", "Question three with emoji?"]
    `;

    // Get OpenAI API key from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const apiKey = process.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OpenAI API key not found');
      return getDefaultPrompts();
    }

    // API call to OpenAI (can be moved to a Supabase Edge Function in production)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Here are my last journal entries:\n\n${formattedEntries}\n\nHere's my recent chat:\n\n${formattedChat}\n\nPlease generate personalized journaling questions for me based on this information.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenAI API');
    }

    // Parse the JSON response
    try {
      const content = data.choices[0].message.content;
      const questions = JSON.parse(content);
      return Array.isArray(questions) ? questions : getDefaultPrompts();
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      return getDefaultPrompts();
    }
  } catch (error) {
    console.error('Error generating personalized prompts:', error);
    return getDefaultPrompts();
  }
};

/**
 * Get default prompts when API call fails
 */
const getDefaultPrompts = (): string[] => {
  return [
    "How has your week been going? 📝",
    "What's something you accomplished recently that you're proud of? 🌟",
    "Is there anything that's been on your mind lately that you'd like to explore? 🤔",
  ];
};
