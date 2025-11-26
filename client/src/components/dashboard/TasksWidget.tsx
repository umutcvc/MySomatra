import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Plus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  category: string;
}

interface TasksWidgetProps {
  className?: string;
}

export default function TasksWidget({ className }: TasksWidgetProps) {
  const [newTask, setNewTask] = useState("");
  
  // todo: remove mock functionality
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Morning meditation - 15 min", completed: true, category: "wellness" },
    { id: 2, text: "Use Focus mode during work", completed: false, category: "productivity" },
    { id: 3, text: "Evening relaxation session", completed: false, category: "wellness" },
    { id: 4, text: "Log daily journal entry", completed: false, category: "mindfulness" },
  ]);

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now(), text: newTask, completed: false, category: "general" }
      ]);
      setNewTask("");
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
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
            disabled={!newTask.trim()}
            data-testid="button-add-task"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                task.completed ? 'opacity-60' : ''
              }`}
              onClick={() => toggleTask(task.id)}
              data-testid={`task-${task.id}`}
            >
              {task.completed ? (
                <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
              <span className={`text-sm flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
