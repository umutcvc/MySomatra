import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Plus, Square, Trash2 } from "lucide-react";
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
    <Card className={className} data-testid="widget-tasks">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Daily Tasks</CardTitle>
        <div className="text-sm text-muted-foreground">
          {completedCount}/{tasks.length}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}% complete
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            className="flex-1"
            data-testid="input-new-task"
          />
          <Button 
            size="icon"
            onClick={handleAddTask}
            disabled={!newTask.trim() || createMutation.isPending}
            data-testid="button-add-task"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No tasks yet</div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50 group ${
                  task.completed ? 'opacity-60' : ''
                }`}
                data-testid={`task-${task.id}`}
              >
                <button
                  className="flex-shrink-0"
                  onClick={() => toggleTask(task.id, task.completed)}
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-primary" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                <span className={`text-sm flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={() => deleteMutation.mutate(task.id)}
                  data-testid={`button-delete-task-${task.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
