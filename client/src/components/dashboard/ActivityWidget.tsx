import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp } from "lucide-react";

interface ActivityWidgetProps {
  className?: string;
}

export default function ActivityWidget({ className }: ActivityWidgetProps) {
  // todo: remove mock functionality
  const activities = [
    { name: "Walking", percentage: 45, color: "bg-blue-500" },
    { name: "Sitting", percentage: 30, color: "bg-orange-500" },
    { name: "Standing", percentage: 15, color: "bg-emerald-500" },
    { name: "Exercise", percentage: 10, color: "bg-violet-500" },
  ];

  const currentActivity = "Walking";

  return (
    <Card className={className} data-testid="widget-activity">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Activity Tracking</CardTitle>
        <Activity className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Currently: {currentActivity}</span>
          </div>
          <p className="text-xs text-muted-foreground">TinyML Activity Classification</p>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Today's Activity Breakdown
          </div>
          
          {activities.map((activity, index) => (
            <div key={index} data-testid={`activity-${activity.name.toLowerCase()}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{activity.name}</span>
                <span className="text-sm text-muted-foreground">{activity.percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className={`h-full ${activity.color} transition-all duration-500`}
                  style={{ width: `${activity.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-foreground">847</div>
              <div className="text-xs text-muted-foreground">Calories Burned</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">6.2h</div>
              <div className="text-xs text-muted-foreground">Active Time</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
