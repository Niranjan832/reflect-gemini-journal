
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, Save, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const NotesView = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes-list');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Persist notes
  useEffect(() => {
    localStorage.setItem('notes-list', JSON.stringify(notes));
  }, [notes]);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addNote = () => {
    if (noteTitle.trim() || noteContent.trim()) {
      const newNote = {
        id: crypto.randomUUID(),
        title: noteTitle.trim() || 'Untitled',
        content: noteContent.trim(),
        createdAt: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      setNoteTitle('');
      setNoteContent('');
      setIsCreating(false);
    }
  };

  const startEditing = (note: Note) => {
    setActiveNote(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  const updateNote = () => {
    if (activeNote) {
      setNotes(notes.map(note => 
        note.id === activeNote 
          ? { ...note, title: noteTitle, content: noteContent } 
          : note
      ));
      setActiveNote(null);
      setNoteTitle('');
      setNoteContent('');
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (activeNote === id) {
      setActiveNote(null);
      setNoteTitle('');
      setNoteContent('');
    }
  };

  const cancelEditing = () => {
    setActiveNote(null);
    setNoteTitle('');
    setNoteContent('');
    setIsCreating(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-journal-secondary">Notes</h1>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search notes..." 
            className="pl-8"
          />
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>
      
      {isCreating && (
        <Card className="border border-journal-primary/20">
          <CardContent className="p-4 space-y-3">
            <Input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title..."
              className="font-medium text-lg"
              autoFocus
            />
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-[150px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button onClick={addNote}>
                Save Note
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeNote && (
        <Card className="border border-journal-primary/20">
          <CardContent className="p-4 space-y-3">
            <Input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title..."
              className="font-medium text-lg"
            />
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-[150px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button onClick={updateNote}>
                Update Note
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {filteredNotes.length === 0 && !isCreating && !activeNote ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No notes yet. Create one using the button above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map(note => (
            <Card 
              key={note.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => activeNote !== note.id && startEditing(note)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium line-clamp-1">
                    {note.title}
                  </h3>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(note);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-1">{formatDate(note.createdAt)}</p>
                <p className="mt-2 text-sm line-clamp-3">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesView;
