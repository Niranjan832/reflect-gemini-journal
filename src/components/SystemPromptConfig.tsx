import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prompts } from '@/config/ml/prompts';
import ThemeSelector from './ThemeSelector';

const SystemPromptConfig = () => {
  return (
    <Tabs defaultValue="prompts" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="prompts">AI Prompts</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>
      
      <TabsContent value="prompts" className="space-y-4">
        <div className="grid gap-4">
          {Object.values(prompts).map((prompt) => (
            <Card key={prompt.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{prompt.name}</CardTitle>
                <CardDescription>Used for {prompt.usage}</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full p-2 border rounded-md h-24"
                  defaultValue={prompt.content}
                ></textarea>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="appearance">
        <ThemeSelector />
      </TabsContent>
    </Tabs>
  );
};

export default SystemPromptConfig;
