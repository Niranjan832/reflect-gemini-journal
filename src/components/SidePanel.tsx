
import React, { useState, useEffect } from 'react';
import { Book, ListTodo, StickyNote, Search, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const SidePanel = ({ onViewChange }: { onViewChange: (view: string) => void }) => {
  const [activeView, setActiveView] = useState<string>('diary');
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes-list');
    return saved ? JSON.parse(saved) : [];
  });
  const [noteText, setNoteText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist todos
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Persist notes
  useEffect(() => {
    localStorage.setItem('notes-list', JSON.stringify(notes));
  }, [notes]);

  const changeView = (view: string) => {
    setActiveView(view);
    onViewChange(view);
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { 
        id: crypto.randomUUID(),
        text: newTodo.trim(),
        completed: false 
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const addNote = () => {
    if (noteTitle.trim() || noteText.trim()) {
      const newNote = {
        id: crypto.randomUUID(),
        title: noteTitle.trim() || 'Untitled',
        content: noteText.trim(),
        createdAt: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      setNoteTitle('');
      setNoteText('');
      setActiveNote(null);
    }
  };

  const updateNote = (id: string) => {
    if (activeNote === id) {
      setNotes(notes.map(note => 
        note.id === id ? { ...note, title: noteTitle, content: noteText } : note
      ));
      setActiveNote(null);
      setNoteTitle('');
      setNoteText('');
    } else {
      const note = notes.find(n => n.id === id);
      if (note) {
        setNoteTitle(note.title);
        setNoteText(note.content);
        setActiveNote(id);
      }
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (activeNote === id) {
      setActiveNote(null);
      setNoteTitle('');
      setNoteText('');
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen flex flex-col border-r border-gray-200 bg-gray-50">
      {/* Sidebar Icons */}
      <div className="flex flex-col items-center py-4 space-y-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={activeView === 'diary' ? 'default' : 'ghost'} 
                size="icon" 
                onClick={() => changeView('diary')}
                className={activeView === 'diary' ? 'bg-journal-primary text-white' : ''}
              >
                <Book className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Diary</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={activeView === 'todo' ? 'default' : 'ghost'} 
                size="icon" 
                onClick={() => changeView('todo')}
                className={activeView === 'todo' ? 'bg-journal-primary text-white' : ''}
              >
                <ListTodo className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">To-Do List</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={activeView === 'notes' ? 'default' : 'ghost'} 
                size="icon" 
                onClick={() => changeView('notes')}
                className={activeView === 'notes' ? 'bg-journal-primary text-white' : ''}
              >
                <StickyNote className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Notes</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default SidePanel;
