
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsyncData } from '@/utils/asyncUtils';
import { getJournalEntryById, shareEntryAsBlog } from '@/utils/journalUtils';
import { JournalEntry as JournalEntryType } from '@/types/journal';
import { generateAISummary, generateAIReflection, detectMood } from '@/utils/journal/analysis';
import JournalEntryComponent from '@/components/JournalEntry';
import ShareBlogButton from '@/components/ShareBlogButton';
import SystemPromptConfig from '@/components/SystemPromptConfig';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Settings, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

/**
 * EntryDetail page component
 * Shows a single journal entry with AI-generated insights
 */
const EntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Track if AI processing is active
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch entry data
  const {
    data: entry,
    loading,
    error,
    refetch
  } = useAsyncData(() => getJournalEntryById(id || ''), [id]);

  /**
   * Handle navigation back to calendar view
   */
  const handleBackToCalendar = () => {
    if (entry) {
      navigate('/', { state: { selectedDate: entry.date } });
    } else {
      navigate('/');
    }
  };

  /**
   * Generate AI summary and reflection for an entry
   */
  const handleAnalyzeEntry = async () => {
    if (!entry) return;
    
    setIsProcessing(true);
    toast({ title: "Analyzing entry", description: "The AI is processing your journal entry..." });
    
    try {
      // Generate summary using Ollama
      const summary = await generateAISummary(entry.content);
      
      // Generate reflection using Ollama
      const reflection = await generateAIReflection(entry.content, entry.mood);
      
      // Update entry in database
      const { error } = await supabase
        .from('journal_entries')
        .update({ 
          summary: summary,
          ai_reflection: reflection
        })
        .eq('id', entry.id);
      
      if (error) {
        throw error;
      }
      
      // Refetch to get updated entry
      await refetch();
      
      toast({ 
        title: "Analysis complete", 
        description: "Your journal entry has been analyzed and insights have been generated."
      });
    } catch (error) {
      console.error('Error analyzing entry:', error);
      toast({ 
        title: "Analysis failed", 
        description: "There was an error analyzing your journal entry.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Update the detected mood for an entry
   */
  const handleAnalyzeMood = async () => {
    if (!entry) return;
    
    setIsProcessing(true);
    toast({ title: "Analyzing mood", description: "The AI is detecting the mood of your entry..." });
    
    try {
      // Use advanced mood detection
      const detectedMood = await detectMood(entry.content);
      
      // Update entry in database
      const { error } = await supabase
        .from('journal_entries')
        .update({ mood: detectedMood })
        .eq('id', entry.id);
      
      if (error) {
        throw error;
      }
      
      // Refetch to get updated entry
      await refetch();
      
      toast({ 
        title: "Mood updated", 
        description: `Entry mood updated to "${detectedMood}".`
      });
    } catch (error) {
      console.error('Error analyzing mood:', error);
      toast({ 
        title: "Mood analysis failed", 
        description: "There was an error detecting the mood of your entry.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-journal-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-gray-800 mb-4">Error: {error.message}</h1>
        <Button onClick={() => navigate('/')}>Return to Journal</Button>
      </div>
    );
  }

  // Not found state
  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-gray-800 mb-4">Entry not found</h1>
        <Button onClick={() => navigate('/')}>Return to Journal</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            className="pl-0 text-journal-secondary"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Journal
          </Button>
          
          <div className="flex space-x-2">
            {/* Settings Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>System Settings</DialogTitle>
                </DialogHeader>
                <SystemPromptConfig />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleBackToCalendar}
            >
              <Calendar className="mr-2 h-4 w-4" />
              View in Calendar
            </Button>
            
            <ShareBlogButton entry={entry} />
          </div>
        </div>
        
        <JournalEntryComponent entry={entry} isDetailed={true} />
        
        {/* AI Analysis Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handleAnalyzeEntry}
            disabled={isProcessing}
          >
            <FileText className="mr-2 h-4 w-4" />
            {isProcessing ? "Analyzing..." : "Generate AI Insights"}
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handleAnalyzeMood}
            disabled={isProcessing}
          >
            {isProcessing ? "Analyzing..." : "Analyze Mood"}
          </Button>
        </div>
        
        {/* Media Attachments */}
        {entry.media && entry.media.length > 0 && (
          <div className="mt-8">
            <h3 className="font-medium text-gray-700 mb-3">Media Attachments</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {entry.media.map((url, index) => {
                const isImage = !url.includes('video');
                return (
                  <div key={index} className="rounded-lg overflow-hidden border h-40">
                    {isImage ? (
                      <img 
                        src={url} 
                        alt={`Attachment ${index}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video 
                        src={url} 
                        controls 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryDetail;
