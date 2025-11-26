import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface JournalWidgetProps {
  className?: string;
}

export default function JournalWidget({ className }: JournalWidgetProps) {
  const [newEntry, setNewEntry] = useState("");
  
  // todo: remove mock functionality
  const [entries, setEntries] = useState([
    { id: 1, text: "Morning meditation session was very calming. Felt centered.", time: "Today, 7:30 AM", mood: "calm" },
    { id: 2, text: "Used hype mode before workout - great energy boost!", time: "Yesterday, 6:00 PM", mood: "energetic" },
  ]);

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      setEntries([
        { 
          id: Date.now(), 
          text: newEntry, 
          time: "Just now", 
          mood: "neutral" 
        },
        ...entries
      ]);
      setNewEntry("");
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "calm": return "text-blue-500";
      case "energetic": return "text-orange-500";
      case "focused": return "text-emerald-500";
      default: return "text-muted-foreground";
    }
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
            disabled={!newEntry.trim()}
            data-testid="button-add-entry"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary"
              data-testid={`entry-${entry.id}`}
            >
              <p className="text-sm text-foreground mb-2">{entry.text}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{entry.time}</span>
                <span className={`capitalize ${getMoodColor(entry.mood)}`}>{entry.mood}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
