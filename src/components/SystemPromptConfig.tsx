
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prompts } from '@/config/ml/prompts';
import ThemeSelector from './ThemeSelector';
import SubscriptionPlans from './SubscriptionPlans';

const SystemPromptConfig = () => {
  return (
    <Tabs defaultValue="appearance" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="appearance">Theme</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="prompts">AI Prompts</TabsTrigger>
      </TabsList>
      
      <TabsContent value="appearance">
        <Card className="border-0 bg-white">
          <CardContent className="pt-6">
            <ThemeSelector />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subscription">
        <Card className="border-0 bg-white">
          <CardContent className="pt-6">
            <SubscriptionPlans />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="prompts" className="space-y-4">
        <Card className="border-0 bg-white">
          <CardContent>
            <div className="grid gap-4">
              {Object.values(prompts).map((prompt) => (
                <Card key={prompt.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{prompt.name}</CardTitle>
                    <p className="text-sm text-gray-500">Used for {prompt.usage}</p>
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
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SystemPromptConfig;
