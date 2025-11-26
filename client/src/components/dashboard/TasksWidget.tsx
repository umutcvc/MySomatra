import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, Circle, X, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

interface TasksWidgetProps {
  className?: string;
}

export default function TasksWidget({ className }: TasksWidgetProps) {
  const [newTask, setNewTask] = useState("");
  
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { text: string; category: string }) => {
      return apiRequest('POST', '/api/tasks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setNewTask("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return apiRequest('PATCH', `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const handleAddTask = () => {
    if (newTask.trim()) {
      createMutation.mutate({ text: newTask, category: "wellness" });
    }
  };

  const toggleTask = (id: string, currentCompleted: boolean) => {
    updateMutation.mutate({ id, completed: !currentCompleted });
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <Card className={`${className} flex flex-col`} data-testid="widget-tasks">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Daily Tasks</CardTitle>
        </div>
        <ListTodo className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium text-primary">{completedCount}/{tasks.length}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            className="flex-1 h-9 text-sm"
            data-testid="input-new-task"
          />
          <Button 
            size="icon"
            onClick={handleAddTask}
            disabled={!newTask.trim() || createMutation.isPending}
            data-testid="button-add-task"
            className="h-9 w-9"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Circle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs opacity-60">Add your first task above</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all group ${
                  task.completed 
                    ? 'bg-muted/30 border-transparent' 
                    : 'bg-card border-border hover:border-primary/30'
                }`}
                data-testid={`task-${task.id}`}
              >
                <button
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'bg-primary border-primary' 
                      : 'border-muted-foreground/40 hover:border-primary'
                  }`}
                  onClick={() => toggleTask(task.id, task.completed)}
                >
                  {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>
                <span className={`text-sm flex-1 transition-all ${
                  task.completed 
                    ? 'line-through text-muted-foreground' 
                    : 'text-foreground'
                }`}>
                  {task.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => deleteMutation.mutate(task.id)}
                  data-testid={`button-delete-task-${task.id}`}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
