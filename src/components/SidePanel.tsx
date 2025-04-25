
import React, { useState, useEffect } from 'react';
import { 
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent 
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  PanelLeft, 
  Plus, 
  Check,
  Trash,
  Edit,
  Note
} from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const SidePanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('notes') || '';
  });

  // Persist todos
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Persist notes
  useEffect(() => {
    localStorage.setItem('notes', notes);
  }, [notes]);

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

  return (
    <div className="min-h-screen border-r border-gray-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Workspace</h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon">
              <PanelLeft className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="p-4 space-y-6">
          {/* To-do List Section */}
          <section className="space-y-4">
            <h3 className="font-medium">To-Do List</h3>
            <div className="flex gap-2">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Add a new task..."
              />
              <Button onClick={addTodo} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2">
              {todos.map(todo => (
                <li key={todo.id} className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <Check className={`h-4 w-4 ${todo.completed ? 'text-green-500' : 'text-gray-300'}`} />
                  </Button>
                  <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                    {todo.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          </section>

          {/* Notes Section */}
          <section className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Note className="h-4 w-4" />
              Quick Notes
            </h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your notes here..."
              className="min-h-[200px]"
            />
          </section>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SidePanel;
