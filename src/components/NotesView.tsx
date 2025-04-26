
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, Save, X, Check, Square, Image, AudioWaveform } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import data from '@emoji-mart/data';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface NoteMedia {
  id: string;
  type: 'image' | 'audio';
  data: string; // base64 or URL
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  todos?: TodoItem[];
  media?: NoteMedia[];
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
  const [noteTodos, setNoteTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [noteMedia, setNoteMedia] = useState<NoteMedia[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);

  // Persist notes
  useEffect(() => {
    localStorage.setItem('notes-list', JSON.stringify(notes));
  }, [notes]);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.todos?.some(todo => todo.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addNote = () => {
    if (noteTitle.trim() || noteContent.trim() || noteTodos.length > 0 || noteMedia.length > 0) {
      const newNote = {
        id: crypto.randomUUID(),
        title: noteTitle.trim() || 'Untitled',
        content: noteContent.trim(),
        createdAt: new Date().toISOString(),
        todos: noteTodos.length > 0 ? noteTodos : undefined,
        media: noteMedia.length > 0 ? noteMedia : undefined
      };
      setNotes([newNote, ...notes]);
      setNoteTitle('');
      setNoteContent('');
      setNoteTodos([]);
      setNoteMedia([]);
      setIsCreating(false);
    }
  };

  const startEditing = (note: Note) => {
    setActiveNote(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTodos(note.todos || []);
    setNoteMedia(note.media || []);
  };

  const updateNote = () => {
    if (activeNote) {
      setNotes(notes.map(note => 
        note.id === activeNote 
          ? { 
              ...note, 
              title: noteTitle, 
              content: noteContent,
              todos: noteTodos.length > 0 ? noteTodos : undefined,
              media: noteMedia.length > 0 ? noteMedia : undefined
            } 
          : note
      ));
      setActiveNote(null);
      setNoteTitle('');
      setNoteContent('');
      setNoteTodos([]);
      setNoteMedia([]);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (activeNote === id) {
      setActiveNote(null);
      setNoteTitle('');
      setNoteContent('');
      setNoteTodos([]);
      setNoteMedia([]);
    }
  };

  const cancelEditing = () => {
    setActiveNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTodos([]);
    setNoteMedia([]);
    setIsCreating(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: TodoItem = {
        id: crypto.randomUUID(),
        text: newTodoText.trim(),
        completed: false
      };
      setNoteTodos([...noteTodos, newTodo]);
      setNewTodoText('');
    }
  };

  const handleToggleTodo = (todoId: string) => {
    setNoteTodos(noteTodos.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (todoId: string) => {
    setNoteTodos(noteTodos.filter(todo => todo.id !== todoId));
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNoteContent(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAudioUpload = () => {
    audioInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const newMedia: NoteMedia = {
              id: crypto.randomUUID(),
              type: 'image',
              data: event.target.result as string
            };
            setNoteMedia([...noteMedia, newMedia]);
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('audio/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const newMedia: NoteMedia = {
              id: crypto.randomUUID(),
              type: 'audio',
              data: event.target.result as string
            };
            setNoteMedia([...noteMedia, newMedia]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDeleteMedia = (mediaId: string) => {
    setNoteMedia(noteMedia.filter(media => media.id !== mediaId));
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
            <div className="flex items-center gap-2">
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    😊
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" onClick={handleImageUpload}>
                <Image className="h-4 w-4" />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </Button>
              <Button variant="outline" size="icon" onClick={handleAudioUpload}>
                <AudioWaveform className="h-4 w-4" />
                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="audio/*"
                />
              </Button>
            </div>
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-[120px]"
            />
            
            {/* Media preview */}
            {noteMedia.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {noteMedia.map(media => (
                  <div key={media.id} className="relative">
                    {media.type === 'image' ? (
                      <img 
                        src={media.data} 
                        alt="Note media" 
                        className="h-16 w-16 object-cover rounded border"
                      />
                    ) : (
                      <div className="h-16 w-32 bg-gray-100 rounded border flex items-center justify-center">
                        <audio src={media.data} controls className="w-full h-8" />
                      </div>
                    )}
                    <button
                      className="absolute -top-1 -right-1 bg-white rounded-full border p-0.5"
                      onClick={() => handleDeleteMedia(media.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Checklist/todos */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Checklist</h3>
              
              {noteTodos.map(todo => (
                <div key={todo.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                  />
                  <label 
                    htmlFor={`todo-${todo.id}`}
                    className={`flex-grow ${todo.completed ? 'line-through text-gray-400' : ''}`}
                  >
                    {todo.text}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a todo item..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                  className="flex-grow"
                />
                <Button onClick={handleAddTodo} size="sm" variant="outline">
                  Add
                </Button>
              </div>
            </div>
            
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
            <div className="flex items-center gap-2">
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    😊
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" onClick={handleImageUpload}>
                <Image className="h-4 w-4" />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </Button>
              <Button variant="outline" size="icon" onClick={handleAudioUpload}>
                <AudioWaveform className="h-4 w-4" />
                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="audio/*"
                />
              </Button>
            </div>
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-[120px]"
            />
            
            {/* Media preview */}
            {noteMedia.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {noteMedia.map(media => (
                  <div key={media.id} className="relative">
                    {media.type === 'image' ? (
                      <img 
                        src={media.data} 
                        alt="Note media" 
                        className="h-16 w-16 object-cover rounded border"
                      />
                    ) : (
                      <div className="h-16 w-32 bg-gray-100 rounded border flex items-center justify-center">
                        <audio src={media.data} controls className="w-full h-8" />
                      </div>
                    )}
                    <button
                      className="absolute -top-1 -right-1 bg-white rounded-full border p-0.5"
                      onClick={() => handleDeleteMedia(media.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Checklist/todos */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Checklist</h3>
              
              {noteTodos.map(todo => (
                <div key={todo.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`todo-edit-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                  />
                  <label 
                    htmlFor={`todo-edit-${todo.id}`}
                    className={`flex-grow ${todo.completed ? 'line-through text-gray-400' : ''}`}
                  >
                    {todo.text}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a todo item..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                  className="flex-grow"
                />
                <Button onClick={handleAddTodo} size="sm" variant="outline">
                  Add
                </Button>
              </div>
            </div>
            
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
                
                {/* Media preview */}
                {note.media && note.media.length > 0 && (
                  <div className="flex mt-2 gap-1 overflow-hidden">
                    {note.media.slice(0, 3).map((media, index) => (
                      media.type === 'image' ? (
                        <img 
                          key={media.id}
                          src={media.data} 
                          alt="Note media" 
                          className="h-10 w-10 object-cover rounded border"
                        />
                      ) : (
                        <div key={media.id} className="h-10 w-10 bg-gray-100 rounded border flex items-center justify-center">
                          <AudioWaveform className="h-5 w-5 text-gray-500" />
                        </div>
                      )
                    ))}
                    {note.media.length > 3 && (
                      <div className="h-10 w-10 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                        +{note.media.length - 3}
                      </div>
                    )}
                  </div>
                )}
                
                <p className="mt-2 text-sm line-clamp-2">{note.content}</p>
                
                {/* Todo preview */}
                {note.todos && note.todos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {note.todos.slice(0, 2).map(todo => (
                      <div key={todo.id} className="flex items-center text-xs">
                        {todo.completed ? (
                          <Check className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <Square className="h-3 w-3 text-gray-400 mr-1" />
                        )}
                        <span className={todo.completed ? 'line-through text-gray-400' : ''}>
                          {todo.text.length > 30 ? `${todo.text.substring(0, 30)}...` : todo.text}
                        </span>
                      </div>
                    ))}
                    {note.todos.length > 2 && (
                      <p className="text-xs text-gray-500">+ {note.todos.length - 2} more items</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesView;
