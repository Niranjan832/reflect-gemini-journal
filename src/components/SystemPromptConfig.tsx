
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Settings, MessageSquare, FileText, Calendar } from 'lucide-react';
import { models } from '@/config/ml/models';
import { localML } from '@/utils/ml/localInference';
import { useToast } from '@/components/ui/use-toast';

/**
 * System prompt configuration component
 * Allows users to customize how AI models behave for different tasks
 */
const SystemPromptConfig: React.FC = () => {
  const { toast } = useToast();
  
  // State for different prompt types
  const [selectedModel, setSelectedModel] = useState('ollama-chat');
  const [chatPrompt, setChatPrompt] = useState('');
  const [summaryPrompt, setSummaryPrompt] = useState('');
  const [reflectionPrompt, setReflectionPrompt] = useState('');
  
  // Load current system prompts on mount
  useEffect(() => {
    // Initialize with default prompts from model config
    setChatPrompt(models['ollama-chat']?.systemPrompt || '');
    setSummaryPrompt(models['ollama-summarize']?.systemPrompt || '');
    
    const reflectionDefault = 'You are a supportive journal assistant. Provide thoughtful, empathetic reflections on journal entries. Be supportive, insightful, and highlight positive aspects.';
    setReflectionPrompt(models['ollama-mistral']?.systemPrompt || reflectionDefault);
  }, []);
  
  // Save chat prompt
  const handleSaveChatPrompt = () => {
    localML.setSystemPrompt('ollama-chat', chatPrompt);
    toast({
      title: "Chat prompt saved",
      description: "Your custom chat prompt has been applied",
    });
  };
  
  // Save summary prompt
  const handleSaveSummaryPrompt = () => {
    localML.setSystemPrompt('ollama-summarize', summaryPrompt);
    toast({
      title: "Summary prompt saved",
      description: "Your custom summary prompt has been applied",
    });
  };
  
  // Save reflection prompt
  const handleSaveReflectionPrompt = () => {
    localML.setSystemPrompt('ollama-mistral', reflectionPrompt);
    toast({
      title: "Reflection prompt saved",
      description: "Your custom reflection prompt has been applied",
    });
  };
  
  // Get model options for dropdown
  const getModelOptions = () => {
    return Object.entries(models)
      .filter(([id, model]) => model.backend === 'ollama')
      .map(([id, model]) => ({
        id,
        name: model.name
      }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Prompt Configuration
        </CardTitle>
        <CardDescription>
          Customize how the AI models behave for different tasks
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="reflection" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Reflection
            </TabsTrigger>
          </TabsList>
          
          {/* Chat System Prompt */}
          <TabsContent value="chat">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chat-prompt">Chat Assistant System Prompt</Label>
                <Textarea
                  id="chat-prompt"
                  placeholder="Enter system prompt for chat assistant..."
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  className="min-h-[160px]"
                />
              </div>
              <Button onClick={handleSaveChatPrompt}>Save Chat Prompt</Button>
            </div>
          </TabsContent>
          
          {/* Summary System Prompt */}
          <TabsContent value="summary">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary-prompt">Summary Generator System Prompt</Label>
                <Textarea
                  id="summary-prompt"
                  placeholder="Enter system prompt for summary generation..."
                  value={summaryPrompt}
                  onChange={(e) => setSummaryPrompt(e.target.value)}
                  className="min-h-[160px]"
                />
              </div>
              <Button onClick={handleSaveSummaryPrompt}>Save Summary Prompt</Button>
            </div>
          </TabsContent>
          
          {/* Reflection System Prompt */}
          <TabsContent value="reflection">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reflection-prompt">Reflection Generator System Prompt</Label>
                <Textarea
                  id="reflection-prompt"
                  placeholder="Enter system prompt for reflection generation..."
                  value={reflectionPrompt}
                  onChange={(e) => setReflectionPrompt(e.target.value)}
                  className="min-h-[160px]"
                />
              </div>
              <Button onClick={handleSaveReflectionPrompt}>Save Reflection Prompt</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-gray-500">
          Changes apply immediately to new generations
        </div>
      </CardFooter>
    </Card>
  );
};

export default SystemPromptConfig;
