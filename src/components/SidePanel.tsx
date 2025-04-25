
import React, { useState, useEffect } from 'react';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Check,
  Trash,
  Notebook,
  ListTodo
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const SidePanel = () => {
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
    <Sidebar>
      <SidebarContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="todos">
            <AccordionTrigger className="py-2">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                <span>To-Do List</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <div className="space-y-4">
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
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notes">
            <AccordionTrigger className="py-2">
              <div className="flex items-center gap-2">
                <Notebook className="h-4 w-4" />
                <span>Quick Notes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your notes here..."
                    className="min-h-[200px]"
                  />
                </SidebarGroupContent>
              </SidebarGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SidebarContent>
    </Sidebar>
  );
};

export default SidePanel;
