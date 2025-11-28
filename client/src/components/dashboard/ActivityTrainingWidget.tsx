import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Activity, Footprints, PersonStanding, Waves, Loader2, Zap, X, Trash2, ArrowUpDown } from 'lucide-react';
import { activityTrainingService, type ActivityType, type ClassificationResult, type PitchData } from '@/lib/activityTraining';
import { useToast } from '@/hooks/use-toast';

interface ActivityTrainingWidgetProps {
  isConnected: boolean;
  isStreaming: boolean;
  pitchHistory: PitchData[];
}

const ACTIVITIES = [
  { id: 'still' as ActivityType, label: 'Still', icon: PersonStanding, color: '#94a3b8' },
  { id: 'walking' as ActivityType, label: 'Walking', icon: Footprints, color: '#22c55e' },
  { id: 'running' as ActivityType, label: 'Running', icon: Activity, color: '#f97316' },
  { id: 'stairs' as ActivityType, label: 'Stairs', icon: ArrowUpDown, color: '#a855f7' },
];

export function ActivityTrainingWidget({ isConnected, isStreaming, pitchHistory }: ActivityTrainingWidgetProps) {
  const { toast } = useToast();
  const [isTraining, setIsTraining] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [collectedActivities, setCollectedActivities] = useState<{ activity: ActivityType; sampleCount: number; index: number; quality: string; windowCount: number }[]>([]);
  const [isModelTrained, setIsModelTrained] = useState(false);
  
  // Collection state
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectingActivity, setCollectingActivity] = useState<ActivityType | null>(null);
  const [collectionProgress, setCollectionProgress] = useState(0);
  const [collectionRemaining, setCollectionRemaining] = useState(0);
  
  // Track previous connection state for disconnect detection
  const wasConnectedRef = useRef(isConnected);
  const lastPitchRef = useRef<PitchData | null>(null);

  // Feed pitch data to the service during collection
  useEffect(() => {
    if (isCollecting && pitchHistory.length > 0) {
      const latestPitch = pitchHistory[pitchHistory.length - 1];
      
      // Only feed new data points
      if (!lastPitchRef.current || latestPitch.timestamp !== lastPitchRef.current.timestamp) {
        activityTrainingService.feedPitchData(latestPitch.pitch, latestPitch.timestamp);
        lastPitchRef.current = latestPitch;
      }
    }
  }, [isCollecting, pitchHistory]);

  // Stop classification if device disconnects
  useEffect(() => {
    if (wasConnectedRef.current && !isConnected && isClassifying) {
      activityTrainingService.stopClassification();
      setIsClassifying(false);
      setClassification(null);
      toast({
        title: "Classification Stopped",
        description: "Device disconnected. Classification has been stopped.",
        variant: "destructive",
      });
    }
    
    // Cancel collection if disconnected
    if (wasConnectedRef.current && !isConnected && isCollecting) {
      activityTrainingService.cancelCollection();
      setIsCollecting(false);
      setCollectingActivity(null);
      setCollectionProgress(0);
      toast({
        title: "Collection Cancelled",
        description: "Device disconnected. Data collection has been cancelled.",
        variant: "destructive",
      });
    }
    
    wasConnectedRef.current = isConnected;
  }, [isConnected, isClassifying, isCollecting, toast]);

  // Update collected activities list
  const refreshCollectedActivities = useCallback(() => {
    setCollectedActivities(activityTrainingService.getCollectedActivities());
    setIsModelTrained(activityTrainingService.isModelTrained());
  }, []);

  useEffect(() => {
    refreshCollectedActivities();
  }, [refreshCollectedActivities]);

  // Get count of samples for each activity type
  const getActivityCount = (activityId: ActivityType): number => {
    return collectedActivities.filter(a => a.activity === activityId).length;
  };

  // Start collecting data for an activity
  const handleStartCollection = useCallback((activity: ActivityType) => {
    if (!isConnected || !isStreaming) {
      toast({
        title: "Cannot Collect",
        description: "Device must be connected and streaming IMU data.",
        variant: "destructive",
      });
      return;
    }

    if (isCollecting) {
      toast({
        title: "Already Collecting",
        description: "Please wait for current collection to finish.",
        variant: "destructive",
      });
      return;
    }

    setIsCollecting(true);
    setCollectingActivity(activity);
    setCollectionProgress(0);
    setCollectionRemaining(10);
    lastPitchRef.current = null;

    activityTrainingService.startCollection(
      activity,
      (progress, remaining) => {
        setCollectionProgress(progress * 100);
        setCollectionRemaining(Math.ceil(remaining));
      },
      (success, message) => {
        setIsCollecting(false);
        setCollectingActivity(null);
        setCollectionProgress(0);
        setCollectionRemaining(0);
        
        if (success) {
          toast({
            title: "Data Captured",
            description: message,
          });
        } else {
          toast({
            title: "Collection Failed",
            description: message,
            variant: "destructive",
          });
        }
        
        refreshCollectedActivities();
      }
    );

    toast({
      title: `Recording ${ACTIVITIES.find(a => a.id === activity)?.label}`,
      description: "Keep performing the activity for 10 seconds...",
    });
  }, [isConnected, isStreaming, isCollecting, toast, refreshCollectedActivities]);

  // Cancel ongoing collection
  const handleCancelCollection = useCallback(() => {
    activityTrainingService.cancelCollection();
    setIsCollecting(false);
    setCollectingActivity(null);
    setCollectionProgress(0);
    setCollectionRemaining(0);
    
    toast({
      title: "Collection Cancelled",
      description: "Data collection has been cancelled.",
    });
  }, [toast]);

  const handleDeleteActivity = useCallback((index: number) => {
    activityTrainingService.deleteActivity(index);
    refreshCollectedActivities();
    toast({
      title: "Recording Deleted",
      description: "Activity recording has been removed.",
    });
  }, [refreshCollectedActivities, toast]);

  const handleTrainModel = useCallback(async () => {
    setIsTraining(true);

    try {
      const result = await activityTrainingService.trainModel((message) => {
        console.log('Training:', message);
      });

      if (result.success) {
        toast({
          title: "Model Trained",
          description: result.message,
        });
        setIsModelTrained(true);
      } else {
        toast({
          title: "Training Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Training Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  }, [toast]);

  const handleToggleClassification = useCallback(() => {
    if (isClassifying) {
      activityTrainingService.stopClassification();
      setIsClassifying(false);
      setClassification(null);
    } else {
      if (!isModelTrained) {
        toast({
          title: "No Model",
          description: "Train a model first before classifying.",
          variant: "destructive",
        });
        return;
      }

      if (!isConnected || !isStreaming) {
        toast({
          title: "Not Streaming",
          description: "Device must be connected and streaming IMU data.",
          variant: "destructive",
        });
        return;
      }

      activityTrainingService.startClassification(
        () => pitchHistory,
        (result) => {
          setClassification(result);
        }
      );
      setIsClassifying(true);
      toast({
        title: "Classification Started",
        description: "Real-time activity classification is now active.",
      });
    }
  }, [isClassifying, isModelTrained, isConnected, isStreaming, pitchHistory, toast]);

  const uniqueActivitiesCount = new Set(collectedActivities.map(a => a.activity)).size;
  const canTrain = uniqueActivitiesCount >= 2 && !isTraining && !isCollecting;

  // Check if we have enough data in buffer for classification
  const hasEnoughData = pitchHistory.length >= 30;

  return (
    <div className="space-y-4" data-testid="widget-activity-training">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Activity Training</h3>
        </div>
        {isModelTrained && (
          <Button
            variant={isClassifying ? "secondary" : "default"}
            size="sm"
            onClick={handleToggleClassification}
            disabled={!isConnected || !isStreaming || isCollecting}
            className="gap-1.5"
            data-testid="button-toggle-classification"
          >
            <Zap className="w-4 h-4" />
            {isClassifying ? 'Stop' : 'Classify'}
          </Button>
        )}
      </div>

      {/* Collection in progress */}
      {isCollecting && collectingActivity && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => {
                  const activity = ACTIVITIES.find(a => a.id === collectingActivity);
                  const Icon = activity?.icon || Activity;
                  return (
                    <>
                      <Icon className="w-5 h-5" style={{ color: activity?.color }} />
                      <span className="font-medium text-foreground">
                        Recording {activity?.label}...
                      </span>
                    </>
                  );
                })()}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelCollection}
                className="text-muted-foreground hover:text-destructive"
                data-testid="button-cancel-collection"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Progress value={collectionProgress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.round(collectionProgress)}%</span>
              <span>{collectionRemaining}s remaining</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Keep performing the activity until recording completes
            </p>
          </CardContent>
        </Card>
      )}

      {/* Activity capture buttons */}
      {!isClassifying && !isCollecting && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Record 10s of each activity while streaming:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITIES.map((activity) => {
              const count = getActivityCount(activity.id);
              const Icon = activity.icon;
              
              return (
                <Button
                  key={activity.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartCollection(activity.id)}
                  disabled={!isConnected || !isStreaming || isTraining}
                  className="justify-start gap-2 h-10 relative"
                  data-testid={`button-capture-${activity.id}`}
                >
                  <Icon 
                    className="w-4 h-4 flex-shrink-0" 
                    style={{ color: activity.color }}
                  />
                  <span className="truncate">{activity.label}</span>
                  {count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-auto text-xs px-1.5 min-w-[1.25rem] h-5"
                      style={{ backgroundColor: `${activity.color}20`, color: activity.color }}
                    >
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Collected recordings list */}
          {collectedActivities.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Recordings ({collectedActivities.length}):
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {collectedActivities.map(({ activity, windowCount, quality, index }) => {
                  const activityInfo = ACTIVITIES.find(a => a.id === activity);
                  const Icon = activityInfo?.icon || Activity;
                  const qualityColor = quality === 'good' ? 'text-emerald-500' : quality === 'fair' ? 'text-amber-500' : 'text-red-500';
                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between py-1 px-2 rounded bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <Icon 
                          className="w-3 h-3" 
                          style={{ color: activityInfo?.color }}
                        />
                        <span className="text-xs text-foreground capitalize">{activity}</span>
                        <span className="text-xs text-muted-foreground">({windowCount} windows)</span>
                        <span className={`text-xs ${qualityColor}`}>{quality}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteActivity(index)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        data-testid={`button-delete-activity-${index}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            onClick={handleTrainModel}
            disabled={!canTrain}
            className="w-full gap-2"
            data-testid="button-train-model"
          >
            {isTraining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Training MLP...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Train Model
                {uniqueActivitiesCount < 2 && (
                  <span className="text-xs opacity-70">
                    (need {2 - uniqueActivitiesCount} more activity)
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Classification results */}
      {isClassifying && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${!hasEnoughData ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
              <span className="text-sm font-medium text-foreground">
                {!hasEnoughData ? 'Waiting for data...' : 'Live Classification'}
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

          {!hasEnoughData && (
            <div className="text-center py-4 text-muted-foreground">
              <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin opacity-50" />
              <p className="text-sm">Waiting for IMU data stream...</p>
              <p className="text-xs mt-1">{pitchHistory.length}/30 samples</p>
            </div>
          )}

          {hasEnoughData && classification && (
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
