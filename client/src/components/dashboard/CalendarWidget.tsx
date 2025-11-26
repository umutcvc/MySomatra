import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CalendarWidgetProps {
  className?: string;
}

export default function CalendarWidget({ className }: CalendarWidgetProps) {
  const [currentDate] = useState(new Date());
  
  // todo: remove mock functionality
  const [events] = useState([
    { id: 1, title: "Morning Meditation", time: "7:00 AM", type: "meditate" },
    { id: 2, title: "Focus Session", time: "10:00 AM", type: "focus" },
    { id: 3, title: "Evening Relaxation", time: "8:00 PM", type: "relax" },
  ]);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = currentDate.getDate();
  
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meditate": return "bg-violet-500";
      case "focus": return "bg-emerald-500";
      case "relax": return "bg-blue-500";
      default: return "bg-primary";
    }
  };

  return (
    <Card className={className} data-testid="widget-calendar">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Calendar</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" data-testid="button-prev-month">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" data-testid="button-next-month">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {days.map((day) => (
            <div key={day} className="text-center text-xs text-muted-foreground py-1">
              {day}
            </div>
          ))}
          {getDaysInMonth().map((day, index) => (
            <div
              key={index}
              className={`text-center py-1.5 text-sm rounded-lg cursor-pointer transition-colors ${
                day === today
                  ? 'bg-primary text-primary-foreground font-medium'
                  : day
                  ? 'hover:bg-muted text-foreground'
                  : ''
              }`}
              data-testid={day ? `day-${day}` : undefined}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Today's Schedule</h4>
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                data-testid={`event-${event.id}`}
              >
                <div className={`w-2 h-2 rounded-full ${getTypeColor(event.type)}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{event.title}</div>
                  <div className="text-xs text-muted-foreground">{event.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
