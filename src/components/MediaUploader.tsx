
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Video, Plus, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MediaUploaderProps {
  onMediaAdded: (files: File[]) => void;
  mediaFiles: File[];
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onMediaAdded, mediaFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles: File[] = Array.from(files);
    const validFiles = newFiles.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image or video file.`,
          variant: "destructive",
        });
      }
      return isValid;
    });
    
    if (validFiles.length > 0) {
      onMediaAdded(validFiles);
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveMedia = (index: number) => {
    const updatedFiles = [...mediaFiles];
    updatedFiles.splice(index, 1);
    onMediaAdded(updatedFiles);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Media</span>
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept="image/*,video/*"
          multiple
        />
      </div>
      
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {mediaFiles.map((file, index) => (
            <Card key={index} className="relative overflow-hidden h-24">
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 z-10" 
                onClick={() => handleRemoveMedia(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              {file.type.startsWith('image/') ? (
                <CardContent className="p-0 h-full flex items-center justify-center">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={`Uploaded ${index}`} 
                    className="w-full h-full object-cover"
                  />
                </CardContent>
              ) : (
                <CardContent className="p-0 h-full flex items-center justify-center bg-gray-200">
                  <Video className="h-10 w-10 text-gray-500" />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
