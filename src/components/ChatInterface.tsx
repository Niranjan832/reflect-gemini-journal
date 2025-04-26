import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, X, Image, Video, RefreshCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MediaUploader from './MediaUploader';
import { Message } from '@/types/chat';
import { 
  getRecentJournalEntries, 
  generatePersonalizedPrompts, 
  saveChatMessage,
  getRecentChatLogs
} from '@/utils/journal/personalization';
import { supabase } from '@/lib/supabase';

/**
 * Props for ChatInterface component
 */
interface ChatInterfaceProps {
  onSummarize: (messages: Message[]) => void;
}

/**
 * Chat interface component for journal assistant
 * Supports text and media uploads with AI responses
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSummarize }) => {
  // State management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: "Hello! I'm your journal assistant. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date(),
      mediaFiles: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [personalizedPrompts, setPersonalizedPrompts] = useState<string[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Media file support in chat mode
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  // Load personalized prompts and chat history when component mounts
  useEffect(() => {
    loadPersonalizedPrompts();
    loadChatHistory();
  }, []);

  // Load chat history from Supabase
  const loadChatHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Not authenticated

      const { data, error } = await supabase
        .from('chat_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      if (data && data.length > 0) {
        // Convert Supabase chat logs to Message format
        const chatMessages: Message[] = data.map(log => ({
          id: log.id,
          text: log.message,
          sender: log.role === 'assistant' ? 'ai' : 'user',
          timestamp: new Date(log.timestamp),
          mediaFiles: [],
        }));

        setMessages(prev => {
          // Keep the welcome message if no history exists
          return prev.length === 1 && prev[0].id === '0' && chatMessages.length > 0 
            ? chatMessages 
            : [...prev, ...chatMessages];
        });
      }
    } catch (error) {
      console.error('Error in loadChatHistory:', error);
    }
  };

  // Load personalized prompts based on journal history
  const loadPersonalizedPrompts = async () => {
    setIsLoadingPrompts(true);
    try {
      const recentEntries = await getRecentJournalEntries(7);
      if (recentEntries.length > 0) {
        const prompts = await generatePersonalizedPrompts(recentEntries, messages);
        setPersonalizedPrompts(prompts);
      } else {
        // Fallback prompts if no entries exist
        setPersonalizedPrompts([
          "How are you feeling today? 😊",
          "What's one thing you accomplished today? 🌟",
          "Is there anything on your mind that you'd like to reflect on? 💭",
        ]);
      }
    } catch (error) {
      console.error('Error loading personalized prompts:', error);
      toast({
        title: "Couldn't load personalized prompts",
        description: "Using default prompts instead",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  /**
   * Handle sending a new message
   */
  const handleSendMessage = async () => {
    if (!input.trim() && mediaFiles.length === 0) return;

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to use the chat feature",
        variant: "destructive",
      });
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
      mediaFiles: mediaFiles.length ? mediaFiles : [],
      user_id: user.id,
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setMediaFiles([]);
    setIsLoading(true);

    try {
      // Save user message to database
      await saveChatMessage(userMessage);

      // Format conversation history for the AI model
      const conversationHistory = messages
        .filter(msg => !msg.mediaFiles?.length) // Filter out messages with media for now
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
        .slice(-5); // Only use last 5 messages for context
      
      // Add user's current message
      conversationHistory.push({
        role: 'user',
        content: input
      });
      
      // Get API key
      const apiKey = process.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found');
      }
      
      // Generate response using OpenAI
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
              content: 'You are a helpful journaling assistant that helps users reflect on their day and thoughts. Be empathetic, insightful, and encourage self-reflection.'
            },
            ...conversationHistory
          ],
          temperature: 0.7,
        }),
      });

      const responseData = await response.json();
      
      if (!responseData.choices || !responseData.choices[0]) {
        throw new Error('Invalid response from OpenAI');
      }

      const aiResponseText = responseData.choices[0].message.content;

      // Add AI response to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        mediaFiles: [],
        user_id: user.id,
      };

      // Save AI response to database
      await saveChatMessage(aiMessage);

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Couldn't get a response",
        description: "There was an error communicating with the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle using a personalized prompt
   */
  const handleUsePrompt = (prompt: string) => {
    setInput(prompt);
  };

  /**
   * Handle enter key for sending messages
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Handle media file uploads
   */
  const handleMediaAdded = (files: File[]) => {
    setMediaFiles(files);
  };

  /**
   * Remove a media file from the upload queue
   */
  const handleRemoveMedia = (idx: number) => {
    setMediaFiles(prev => {
      const updated = [...prev];
      updated.splice(idx, 1);
      return updated;
    });
  };

  return (
    <Card className="w-full h-[min(430px,55vw)] flex flex-col bg-white overflow-hidden">
      <CardHeader className="pt-4 pb-2">
        <CardTitle className="text-lg sm:text-xl font-serif">Journal Assistant</CardTitle>
        {personalizedPrompts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {personalizedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs text-left truncate max-w-[200px]"
                onClick={() => handleUsePrompt(prompt)}
              >
                {prompt}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={loadPersonalizedPrompts}
              disabled={isLoadingPrompts}
            >
              <RefreshCcw className={`h-4 w-4 ${isLoadingPrompts ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[180px] sm:h-[270px] px-2" ref={scrollAreaRef}>
          <div className="space-y-4 pt-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-lg px-4 py-2 
                    ${msg.sender === 'user'
                    ? 'bg-journal-primary text-white'
                    : 'bg-gray-100 text-gray-800'}
                    break-words
                  `}
                >
                  <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                  {(msg.mediaFiles && msg.mediaFiles.length > 0) && (
                    <div className="flex mt-2 gap-2 flex-wrap">
                      {msg.mediaFiles.map((file, idx) => (
                        file.type.startsWith('image/') ? (
                          <img 
                            key={idx}
                            src={URL.createObjectURL(file)}
                            alt="uploaded media"
                            className="h-14 w-14 rounded object-cover border"
                          />
                        ) : (
                          <video 
                            key={idx}
                            src={URL.createObjectURL(file)}
                            className="h-14 w-20 rounded object-cover border bg-gray-200"
                            controls
                          >
                            Your browser does not support the video tag.
                          </video>
                        )
                      ))}
                    </div>
                  )}
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[86%] rounded-lg px-4 py-2 bg-gray-100 text-gray-800">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-0 flex-col gap-2 bg-white flex-shrink-0">
        {mediaFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mb-1">
            {mediaFiles.map((file, idx) =>
              file.type.startsWith('image/') ? (
                <div className="relative" key={idx}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="h-12 w-12 object-cover rounded border"
                  />
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 bg-white rounded-full border p-0.5"
                    onClick={() => handleRemoveMedia(idx)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="relative" key={idx}>
                  <Video className="h-12 w-12 text-gray-500 border" />
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 bg-white rounded-full border p-0.5"
                    onClick={() => handleRemoveMedia(idx)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )
            )}
          </div>
        )}
        <div className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading}
          />
          <MediaUploader onMediaAdded={handleMediaAdded} mediaFiles={mediaFiles} />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || (!input.trim() && mediaFiles.length === 0)}
            size="icon"
            type="button"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => onSummarize(messages)}
            disabled={messages.length <= 1}
            type="button"
          >
            Summarize
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
