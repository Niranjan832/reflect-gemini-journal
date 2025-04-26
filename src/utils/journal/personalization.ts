
import { JournalEntry } from '@/types/journal';
import { supabase } from '@/lib/supabase';
import { Message } from '@/types/chat';

/**
 * Fetch the user's most recent journal entries
 * @param limit Number of entries to fetch
 * @returns Array of recent journal entries
 */
export const getRecentJournalEntries = async (limit = 7): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
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

    // System instructions for the AI
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

    // API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
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
      return Array.isArray(questions) ? questions : [];
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      return [
        "How has your week been going? 📝",
        "What's something you accomplished recently that you're proud of? 🌟",
        "Is there anything that's been on your mind lately that you'd like to explore? 🤔",
      ];
    }
  } catch (error) {
    console.error('Error generating personalized prompts:', error);
    // Fallback questions if API call fails
    return [
      "How has your week been going? 📝",
      "What's something you accomplished recently that you're proud of? 🌟",
      "Is there anything that's been on your mind lately that you'd like to explore? 🤔",
    ];
  }
};
