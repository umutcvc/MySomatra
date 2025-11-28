import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Trash2, 
  Brain, 
  Loader2,
  CheckCircle2,
  PersonStanding,
  Waves,
  Footprints,
  Zap,
  Camera,
  X
} from "lucide-react";
import { 
  activityTrainingService, 
  ActivityType, 
  TrainingProgress, 
  ClassificationResult 
} from "@/lib/activityTraining";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { useToast } from "@/hooks/use-toast";

const ACTIVITIES: { id: ActivityType; label: string; icon: typeof Activity; color: string }[] = [
  { id: 'walking', label: 'Walking', icon: Footprints, color: 'hsl(142, 76%, 50%)' },
  { id: 'running', label: 'Running', icon: Activity, color: 'hsl(25, 85%, 58%)' },
  { id: 'swimming', label: 'Swimming', icon: Waves, color: 'hsl(200, 85%, 55%)' },
  { id: 'standing', label: 'Standing', icon: PersonStanding, color: 'hsl(280, 70%, 60%)' },
];

interface ActivityTrainingWidgetProps {
  className?: string;
}

export default function ActivityTrainingWidget({ className }: ActivityTrainingWidgetProps) {
  const { toast } = useToast();
  const { isConnected, pitchHistory } = useBluetooth();
  
  const [sampleCounts, setSampleCounts] = useState<Record<ActivityType, number>>({
    walking: 0, running: 0, swimming: 0, standing: 0,
  });
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [canTrain, setCanTrain] = useState(false);
  const [classificationPaused, setClassificationPaused] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  
  const pitchHistoryRef = useRef(pitchHistory);
  pitchHistoryRef.current = pitchHistory;

  useEffect(() => {
    setSampleCounts(activityTrainingService.getSampleCountByActivity());
    setIsModelTrained(activityTrainingService.isModelTrained());
    setCanTrain(activityTrainingService.canTrain());
  }, []);

  useEffect(() => {
    if (!isConnected && isClassifying) {
      activityTrainingService.stopClassification();
      setIsClassifying(false);
      setClassification(null);
      setClassificationPaused(false);
      toast({
        title: "Classification Stopped",
        description: "Device disconnected. Reconnect to resume.",
        variant: "destructive",
      });
    }
  }, [isConnected, isClassifying, toast]);

  useEffect(() => {
    if (isClassifying && pitchHistory.length < 50) {
      setClassificationPaused(true);
    } else if (isClassifying && pitchHistory.length >= 50) {
      setClassificationPaused(false);
    }
  }, [isClassifying, pitchHistory.length]);

  useEffect(() => {
    if (classification) {
      setLastUpdateTime(Date.now());
    }
  }, [classification]);

  const handleCapture = useCallback((activity: ActivityType) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Connect your device first to capture activity data.",
        variant: "destructive",
      });
      return;
    }

    const result = activityTrainingService.captureFromHistory(activity, pitchHistory);
    
    if (result.success) {
      setSampleCounts(activityTrainingService.getSampleCountByActivity());
      setCanTrain(activityTrainingService.canTrain());
      toast({
        title: "Captured!",
        description: result.message,
      });
    } else {
      toast({
        title: "Need More Data",
        description: result.message,
        variant: "destructive",
      });
    }
  }, [isConnected, pitchHistory, toast]);

  const handleClearAll = useCallback(() => {
    activityTrainingService.clearAllData();
    setSampleCounts({ walking: 0, running: 0, swimming: 0, standing: 0 });
    setCanTrain(false);
    setIsModelTrained(false);
    setClassification(null);
    if (isClassifying) {
      activityTrainingService.stopClassification();
      setIsClassifying(false);
    }
    toast({
      title: "Data Cleared",
      description: "All training data has been removed.",
    });
  }, [isClassifying, toast]);

  const handleTrain = useCallback(async () => {
    if (!canTrain) return;
    
    setIsTraining(true);
    setTrainingProgress(null);

    try {
      await activityTrainingService.train((progress) => {
        setTrainingProgress(progress);
      });
      setIsModelTrained(true);
      toast({
        title: "Model Ready",
        description: "Your activity classifier is trained and ready!",
      });
    } catch (error) {
      console.error('Training error:', error);
      toast({
        title: "Training Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  }, [canTrain, toast]);

  const handleToggleClassification = useCallback(() => {
    if (!isConnected || !isModelTrained) return;

    if (isClassifying) {
      activityTrainingService.stopClassification();
      setIsClassifying(false);
      setClassification(null);
    } else {
      activityTrainingService.startClassification(
        () => pitchHistoryRef.current,
        (result) => setClassification(result)
      );
      setIsClassifying(true);
    }
  }, [isConnected, isModelTrained, isClassifying]);

  const totalSamples = Object.values(sampleCounts).reduce((a, b) => a + b, 0);
  const uniqueActivities = Object.values(sampleCounts).filter(c => c > 0).length;

  return (
    <div className={`flex flex-col gap-4 ${className || ''}`} data-testid="widget-activity-training">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">Activity Training</h3>
        </div>
        {totalSamples > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-destructive"
            data-testid="button-clear-all"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {!isConnected && (
        <div className="text-center py-6 text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Connect device to train activities</p>
        </div>
      )}

      {isConnected && !isClassifying && (
        <>
          <div className="text-xs text-muted-foreground text-center">
            Perform an activity, then tap to capture the current motion data
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITIES.map((activity) => {
              const count = sampleCounts[activity.id];
              const Icon = activity.icon;
              
              return (
                <Button
                  key={activity.id}
                  variant="outline"
                  className="h-auto py-3 flex flex-col gap-1 relative overflow-visible"
                  onClick={() => handleCapture(activity.id)}
                  data-testid={`button-capture-${activity.id}`}
                >
                  <Icon className="w-5 h-5" style={{ color: activity.color }} />
                  <span className="text-xs font-medium">{activity.label}</span>
                  {count > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                      style={{ backgroundColor: activity.color }}
                    >
                      {count}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>{pitchHistory.length} samples in buffer</span>
            <span>{uniqueActivities}/4 activities captured</span>
          </div>

          {isTraining && trainingProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Training...
                </span>
                <span className="font-mono text-xs">
                  {trainingProgress.epoch}/{trainingProgress.totalEpochs}
                </span>
              </div>
              <Progress 
                value={(trainingProgress.epoch / trainingProgress.totalEpochs) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Loss: {trainingProgress.loss.toFixed(4)}</span>
                <span>Acc: {(trainingProgress.accuracy * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleTrain}
              disabled={!canTrain || isTraining}
              data-testid="button-train-model"
            >
              {isTraining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Training...
                </>
              ) : isModelTrained ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Retrain Model
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Train Model
                </>
              )}
            </Button>
            
            {isModelTrained && (
              <Button
                variant={isClassifying ? "destructive" : "secondary"}
                onClick={handleToggleClassification}
                disabled={!isConnected}
                data-testid="button-toggle-classification"
              >
                {isClassifying ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>

          {!canTrain && !isModelTrained && (
            <p className="text-xs text-muted-foreground text-center">
              Capture at least 2 different activities to train
            </p>
          )}
        </>
      )}

      {isClassifying && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${classificationPaused ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
              <span className="text-sm font-medium text-foreground">
                {classificationPaused ? 'Waiting for data...' : 'Live Classification'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleClassification}
              className="text-muted-foreground hover:text-destructive"
              data-testid="button-stop-classification"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {classificationPaused && (
            <div className="text-center py-4 text-muted-foreground">
              <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin opacity-50" />
              <p className="text-sm">Waiting for IMU data stream...</p>
              <p className="text-xs mt-1">{pitchHistory.length}/50 samples</p>
            </div>
          )}

          {!classificationPaused && classification && (
            <>
              <div className="text-center py-4">
                {(() => {
                  const currentActivity = ACTIVITIES.find(a => a.id === classification.currentActivity);
                  const Icon = currentActivity?.icon || Activity;
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{ 
                          backgroundColor: `${currentActivity?.color}20`,
                          boxShadow: `0 0 20px ${currentActivity?.color}40`
                        }}
                      >
                        <Icon 
                          className="w-8 h-8 transition-all duration-300" 
                          style={{ color: currentActivity?.color }}
                        />
                      </div>
                      <div className="text-xl font-semibold text-foreground capitalize">
                        {classification.currentActivity}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {classification.confidence.toFixed(0)}% confidence
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2">
                {ACTIVITIES.map((activity) => {
                  const prob = classification[activity.id];
                  const isActive = classification.currentActivity === activity.id;
                  const Icon = activity.icon;
                  
                  return (
                    <div key={activity.id} className="flex items-center gap-3">
                      <Icon 
                        className="w-4 h-4 flex-shrink-0 transition-all duration-200"
                        style={{ 
                          color: isActive ? activity.color : 'hsl(var(--muted-foreground))',
                          opacity: isActive ? 1 : 0.5
                        }} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-200 ease-out"
                            style={{ 
                              width: `${prob}%`,
                              backgroundColor: activity.color,
                              opacity: isActive ? 1 : 0.4
                            }}
                          />
                        </div>
                      </div>
                      <span 
                        className="text-xs font-mono w-12 text-right transition-all duration-200"
                        style={{ 
                          color: isActive ? activity.color : 'hsl(var(--muted-foreground))',
                          fontWeight: isActive ? 600 : 400
                        }}
                      >
                        {prob.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
