import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Play, 
  Square, 
  Trash2, 
  Brain, 
  Loader2,
  CheckCircle2,
  PersonStanding,
  Waves,
  Footprints
} from "lucide-react";
import { 
  activityTrainingService, 
  ActivityType, 
  ActivitySample, 
  TrainingProgress, 
  ClassificationResult 
} from "@/lib/activityTraining";
import { bluetoothService } from "@/lib/bluetooth";
import { useToast } from "@/hooks/use-toast";

const ACTIVITIES: { id: ActivityType; label: string; icon: typeof Activity }[] = [
  { id: 'walking', label: 'Walking', icon: Footprints },
  { id: 'running', label: 'Running', icon: Activity },
  { id: 'swimming', label: 'Swimming', icon: Waves },
  { id: 'standing', label: 'Standing', icon: PersonStanding },
];

export default function ActivityTrainingWidget() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(bluetoothService.isConnected());
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectingActivity, setCollectingActivity] = useState<ActivityType | null>(null);
  const [collectionProgress, setCollectionProgress] = useState(0);
  const [collectedData, setCollectedData] = useState<ActivitySample[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);

  useEffect(() => {
    const unsubscribe = bluetoothService.onConnectionChange((connected) => {
      setIsConnected(connected);
      if (!connected && isClassifying) {
        activityTrainingService.stopClassification();
        setIsClassifying(false);
      }
    });

    setCollectedData(activityTrainingService.getCollectedActivities());
    setIsModelTrained(activityTrainingService.isModelTrained());

    return unsubscribe;
  }, [isClassifying]);

  const handleStartCollection = useCallback(async (activity: ActivityType) => {
    if (!isConnected) return;
    
    setIsCollecting(true);
    setCollectingActivity(activity);
    setCollectionProgress(0);

    try {
      const result = await activityTrainingService.startCollection(activity, (elapsed, total) => {
        setCollectionProgress((elapsed / total) * 100);
      });
      
      if (result.success) {
        setCollectedData(activityTrainingService.getCollectedActivities());
        toast({
          title: "Data Collected",
          description: `Successfully captured ${result.sampleCount} samples for ${activity}.`,
        });
      } else {
        toast({
          title: "Collection Failed",
          description: `Only received ${result.sampleCount} samples. Make sure the device is streaming IMU data.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Collection error:', error);
      toast({
        title: "Collection Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsCollecting(false);
      setCollectingActivity(null);
      setCollectionProgress(0);
    }
  }, [isConnected, toast]);

  const handleCancelCollection = useCallback(() => {
    activityTrainingService.cancelCollection();
    setIsCollecting(false);
    setCollectingActivity(null);
    setCollectionProgress(0);
  }, []);

  const handleDeleteSample = useCallback((index: number) => {
    activityTrainingService.deleteActivity(index);
    setCollectedData(activityTrainingService.getCollectedActivities());
    if (activityTrainingService.getCollectedActivities().length < 2) {
      setIsModelTrained(false);
    }
  }, []);

  const handleTrain = useCallback(async () => {
    setIsTraining(true);
    setTrainingProgress(null);

    try {
      await activityTrainingService.train((progress) => {
        setTrainingProgress(progress);
      });
      setIsModelTrained(true);
      toast({
        title: "Model Trained",
        description: "Activity classification model is ready for real-time predictions.",
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
  }, [toast]);

  const handleStartClassification = useCallback(() => {
    if (!isConnected || !isModelTrained) return;
    
    setIsClassifying(true);
    activityTrainingService.startClassification((result) => {
      setClassification(result);
    });
  }, [isConnected, isModelTrained]);

  const handleStopClassification = useCallback(() => {
    activityTrainingService.stopClassification();
    setIsClassifying(false);
    setClassification(null);
  }, []);

  const canTrain = activityTrainingService.canTrain();
  const uniqueActivities = activityTrainingService.getUniqueActivityCount();

  const getActivityColor = (activity: ActivityType) => {
    const colors: Record<ActivityType, string> = {
      walking: 'bg-emerald-500',
      running: 'bg-orange-500',
      swimming: 'bg-blue-500',
      standing: 'bg-purple-500',
    };
    return colors[activity];
  };

  const getActivityIcon = (activity: ActivityType) => {
    const icons: Record<ActivityType, typeof Activity> = {
      walking: Footprints,
      running: Activity,
      swimming: Waves,
      standing: PersonStanding,
    };
    return icons[activity];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-white" data-testid="text-activity-training-title">Activity Training</h3>
            <p className="text-sm text-white/50">Train TinyML model for activity recognition</p>
          </div>
        </div>
      </div>

      {!isConnected && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-sm text-yellow-400" data-testid="text-connection-warning">
            Connect your MySomatra device to start collecting activity data.
          </p>
        </div>
      )}

      {isCollecting && collectingActivity && (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getActivityColor(collectingActivity)}`}>
                {(() => {
                  const Icon = getActivityIcon(collectingActivity);
                  return <Icon className="w-5 h-5 text-white" />;
                })()}
              </div>
              <div>
                <p className="font-medium text-white">Collecting {collectingActivity} data...</p>
                <p className="text-sm text-white/50">Keep performing the activity</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCancelCollection}
              data-testid="button-cancel-collection"
            >
              <Square className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
          <Progress value={collectionProgress} className="h-3" data-testid="progress-collection" />
          <p className="text-center text-sm text-white/60">
            {Math.ceil((100 - collectionProgress) / 100 * 20)} seconds remaining
          </p>
        </div>
      )}

      {!isCollecting && !isClassifying && (
        <>
          <div className="space-y-3">
            <p className="text-sm text-white/60">
              Collect 20-second samples for each activity. Need at least 2 different activities to train.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ACTIVITIES.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={() => handleStartCollection(id)}
                  disabled={!isConnected || isTraining}
                  data-testid={`button-collect-${id}`}
                >
                  <div className={`p-2 rounded-lg ${getActivityColor(id)}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white">{label}</span>
                  <span className="text-xs text-white/40">20 sec</span>
                </Button>
              ))}
            </div>
          </div>

          {collectedData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">
                  Collected Data ({uniqueActivities}/2 activities required)
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    activityTrainingService.clearAllData();
                    setCollectedData([]);
                    setIsModelTrained(false);
                  }}
                  className="text-red-400 hover:text-red-300"
                  data-testid="button-clear-all"
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {collectedData.map((sample, index) => {
                  const Icon = getActivityIcon(sample.activity);
                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      data-testid={`row-sample-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${getActivityColor(sample.activity)}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white capitalize">{sample.activity}</p>
                          <p className="text-xs text-white/40">{sample.samples.length} samples</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSample(index)}
                        className="text-white/40 hover:text-red-400"
                        data-testid={`button-delete-sample-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isTraining && trainingProgress && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <p className="text-sm font-medium text-primary">
                  Training model... Epoch {trainingProgress.epoch}/{trainingProgress.totalEpochs}
                </p>
              </div>
              <Progress value={(trainingProgress.epoch / trainingProgress.totalEpochs) * 100} className="h-2" />
              <div className="flex justify-between text-xs text-white/50">
                <span>Loss: {trainingProgress.loss.toFixed(4)}</span>
                <span>Accuracy: {(trainingProgress.accuracy * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleTrain}
              disabled={!canTrain || isTraining || !isConnected}
              className="flex-1"
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
                variant="outline"
                onClick={handleStartClassification}
                disabled={!isConnected}
                className="flex-1"
                data-testid="button-start-classify"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Classification
              </Button>
            )}
          </div>
        </>
      )}

      {isClassifying && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-sm font-medium text-white">Real-time Classification Active</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopClassification}
              data-testid="button-stop-classify"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>

          {classification && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                <div className="flex items-center justify-center gap-3">
                  {(() => {
                    const Icon = getActivityIcon(classification.currentActivity);
                    return (
                      <>
                        <div className={`p-3 rounded-xl ${getActivityColor(classification.currentActivity)}`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white capitalize" data-testid="text-current-activity">
                            {classification.currentActivity}
                          </p>
                          <p className="text-lg text-primary" data-testid="text-activity-confidence">
                            {classification[classification.currentActivity].toFixed(1)}% confidence
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-3">
                {ACTIVITIES.map(({ id, label, icon: Icon }) => {
                  const percentage = classification[id];
                  const isActive = classification.currentActivity === id;
                  return (
                    <div key={id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-white/50'}`} />
                          <span className={`text-sm ${isActive ? 'text-white font-medium' : 'text-white/60'}`}>
                            {label}
                          </span>
                        </div>
                        <span 
                          className={`text-sm font-mono ${isActive ? 'text-primary' : 'text-white/50'}`}
                          data-testid={`text-probability-${id}`}
                        >
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isActive ? 'bg-primary' : getActivityColor(id)
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
