import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JournalEntry } from "@shared/schema";

interface JournalWidgetProps {
  className?: string;
}

export default function JournalWidget({ className }: JournalWidgetProps) {
  const [newEntry, setNewEntry] = useState("");
  
  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { text: string; mood: string }) => {
      return apiRequest('POST', '/api/journal', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      setNewEntry("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/journal/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
    },
  });

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      createMutation.mutate({ text: newEntry, mood: "neutral" });
    }
  };

  const getMoodColor = (mood: string | null) => {
    switch (mood) {
      case "calm": return "text-blue-500";
      case "energetic": return "text-orange-500";
      case "focused": return "text-emerald-500";
      default: return "text-muted-foreground";
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return d.toLocaleDateString();
  };

  return (
    <Card className={className} data-testid="widget-journal">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Wellness Journal</CardTitle>
        <BookOpen className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Textarea
            placeholder="How are you feeling? Log your wellness journey..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            className="resize-none mb-2"
            rows={2}
            data-testid="input-journal-entry"
          />
          <Button 
            size="sm" 
            className="w-full"
            onClick={handleAddEntry}
            disabled={!newEntry.trim() || createMutation.isPending}
            data-testid="button-add-entry"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createMutation.isPending ? "Adding..." : "Add Entry"}
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No entries yet</div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary group"
                data-testid={`entry-${entry.id}`}
              >
                <p className="text-sm text-foreground mb-2">{entry.text}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{formatTime(entry.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`capitalize ${getMoodColor(entry.mood)}`}>{entry.mood}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteMutation.mutate(entry.id)}
                      data-testid={`button-delete-entry-${entry.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
