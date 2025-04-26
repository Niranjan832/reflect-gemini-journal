
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorTheme, defaultThemes } from '@/types/theme';
import { Check } from 'lucide-react';

const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem('selected-theme');
    return savedTheme || 'default';
  });

  useEffect(() => {
    // Save theme selection to localStorage
    localStorage.setItem('selected-theme', selectedTheme);
    
    // Apply theme to CSS variables
    const theme = defaultThemes.find(t => t.id === selectedTheme) || defaultThemes[0];
    
    document.documentElement.style.setProperty('--color-journal-primary', theme.primary);
    document.documentElement.style.setProperty('--color-journal-secondary', theme.secondary);
    document.documentElement.style.setProperty('--color-journal-accent', theme.accent);
    document.documentElement.style.setProperty('--color-journal-surface', theme.surface);
    
  }, [selectedTheme]);

  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Theme Settings</CardTitle>
        <CardDescription>Choose a color scheme for your journal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {defaultThemes.map(theme => (
            <div 
              key={theme.id}
              className={`
                relative cursor-pointer rounded-md overflow-hidden border-2 transition-all
                ${selectedTheme === theme.id ? 'border-black/50 scale-105' : 'border-transparent hover:border-gray-200'}
              `}
              onClick={() => handleSelectTheme(theme.id)}
            >
              <div className="aspect-video flex flex-col">
                <div className="h-1/2" style={{ backgroundColor: theme.primary }}></div>
                <div className="h-1/2 flex">
                  <div className="w-1/2" style={{ backgroundColor: theme.secondary }}></div>
                  <div className="w-1/2" style={{ backgroundColor: theme.accent }}></div>
                </div>
              </div>
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all"
                style={{ backgroundColor: selectedTheme === theme.id ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0)' }}
              >
                {selectedTheme === theme.id && (
                  <div className="rounded-full bg-white p-1">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                )}
              </div>
              <div className="text-xs p-1 text-center font-medium">{theme.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
