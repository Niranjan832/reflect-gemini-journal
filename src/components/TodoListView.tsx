
import React, { useState, useEffect } from 'react';
import { Check, Trash, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const TodoListView = () => {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');

  // Persist todos
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

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
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif text-journal-secondary">To-Do List</h1>
      
      <div className="flex gap-2">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new task..."
          className="flex-1"
        />
        <Button onClick={addTodo} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {todos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tasks yet. Add one above!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center gap-2 p-2 bg-white rounded-md border border-gray-100 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleTodo(todo.id)}
                className={todo.completed ? "text-green-500" : "text-gray-300"}
              >
                <Check className="h-4 w-4" />
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
      )}
    </div>
  );
};

export default TodoListView;
