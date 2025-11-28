import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CalendarWidgetProps {
  className?: string;
}

export default function CalendarWidget({ className }: CalendarWidgetProps) {
  const [currentDate] = useState(new Date());

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

  return (
    <Card className={`${className} flex flex-col overflow-hidden`} data-testid="widget-calendar">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 flex-shrink-0">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Calendar
        </CardTitle>
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
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 gap-1 mb-3 flex-shrink-0">
          {days.map((day) => (
            <div key={day} className="text-center text-xs text-muted-foreground py-1">
              {day}
            </div>
          ))}
          {getDaysInMonth().map((day, index) => (
            <div
              key={index}
              className={`text-center py-1 text-sm rounded-md cursor-pointer transition-colors ${
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

      </CardContent>
    </Card>
  );
}
