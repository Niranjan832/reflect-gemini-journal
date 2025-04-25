
import React, { useState, useEffect } from 'react';
import { 
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Plus, 
  Check,
  Trash,
  ListTodo,
  Notebook
} from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const SidePanel = () => {
  const [expanded, setExpanded] = useState<'todos' | 'notes' | null>(null);
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
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible 
                open={expanded === 'todos'} 
                onOpenChange={() => setExpanded(expanded === 'todos' ? null : 'todos')}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip="To-Do List"
                    className="w-full justify-start"
                  >
                    <ListTodo className="h-4 w-4" />
                    <span>To-Do List</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 py-3 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                      placeholder="Add a new task..."
                      className="flex-1"
                    />
                    <Button onClick={addTodo} size="icon" variant="outline">
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
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Collapsible 
                open={expanded === 'notes'} 
                onOpenChange={() => setExpanded(expanded === 'notes' ? null : 'notes')}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Notes"
                    className="w-full justify-start"
                  >
                    <Notebook className="h-4 w-4" />
                    <span>Notes</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 py-3">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your notes here..."
                    className="min-h-[200px] w-full resize-none"
                  />
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};

export default SidePanel;
