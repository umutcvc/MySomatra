import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Flame, Timer } from "lucide-react";

interface ActivityWidgetProps {
  className?: string;
}

export default function ActivityWidget({ className }: ActivityWidgetProps) {
  const activities = [
    { name: "Walking", percentage: 45, color: "bg-blue-500" },
    { name: "Sitting", percentage: 30, color: "bg-orange-500" },
    { name: "Standing", percentage: 15, color: "bg-emerald-500" },
    { name: "Exercise", percentage: 10, color: "bg-violet-500" },
  ];

  const currentActivity = "Walking";

  return (
    <Card className={`${className} flex flex-col overflow-hidden`} data-testid="widget-activity">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 flex-shrink-0">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Activity Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="text-center mb-4 flex-shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Currently: {currentActivity}</span>
          </div>
          <p className="text-xs text-muted-foreground">TinyML Activity Classification</p>
        </div>

        <div className="space-y-3 flex-shrink-0">
          <div className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Today's Activity Breakdown
          </div>
          
          {activities.map((activity, index) => (
            <div key={index} data-testid={`activity-${activity.name.toLowerCase()}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{activity.name}</span>
                <span className="text-xs text-muted-foreground">{activity.percentage}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div 
                  className={`h-full ${activity.color} transition-all duration-500`}
                  style={{ width: `${activity.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-3 border-t border-border flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Flame className="w-4 h-4 mx-auto mb-1 text-orange-500" />
              <div className="text-xl font-semibold text-foreground">847</div>
              <div className="text-xs text-muted-foreground">Calories</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Timer className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
              <div className="text-xl font-semibold text-foreground">6.2h</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
