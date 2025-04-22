
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { JournalEntry } from '@/types/journal';

interface ShareBlogButtonProps {
  entry: JournalEntry;
}

const ShareBlogButton: React.FC<ShareBlogButtonProps> = ({ entry }) => {
  const { toast } = useToast();
  
  const handleShare = () => {
    // In a real implementation, this would call an API to publish the blog post
    toast({
      title: "Journal shared as blog post",
      description: "Your journal entry is now published as a blog post.",
    });
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Share className="h-4 w-4" />
          <span>Share as Blog</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share as a Blog Post</DialogTitle>
          <DialogDescription>
            This will publish your journal entry as a public blog post that others can read.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="border p-4 rounded-md">
            <h3 className="font-medium mb-2">Preview:</h3>
            <p className="text-sm text-gray-700">{entry.content.substring(0, 200)}...</p>
            <p className="text-xs text-gray-500 mt-2">
              Posted on {entry.date.toLocaleDateString()}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="mr-2" type="button">
            Cancel
          </Button>
          <Button onClick={handleShare} type="button">
            Publish Blog Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareBlogButton;
