import * as tf from '@tensorflow/tfjs';

export type ActivityType = 'still' | 'walking' | 'running' | 'stairs';

export interface PitchData {
  pitch: number;
  timestamp: number;
}

interface ActivitySample {
  activity: ActivityType;
  timestamps: number[];
  pitches: number[];
  collectedAt: number;
}

export interface ClassificationResult {
  still: number;
  walking: number;
  running: number;
  stairs: number;
  currentActivity: ActivityType;
  confidence: number;
  timestamp: number;
}

// Configuration matching the reference implementation
const TRAIN_SEC = 20;          // 20 seconds collection per activity
const WIN_SEC = 3.0;           // 3-second sliding window for features
const HOP_SEC = 0.5;           // 0.5-second hop between windows
const NUM_FEATURES = 4;        // vel_rms, pitch_sd, jerk_rms, zcr
const CLASSIFICATION_INTERVAL_MS = 100;

// Temporal smoothing parameters
const ALPHA_EMA = 0.15;        // EMA smoothing factor
const DWELL_MS = 100;          // Hold time before switching class
const SWITCH_MARGIN = 0.06;    // New class must beat old by 6%

const ACTIVITIES: ActivityType[] = ['still', 'walking', 'running', 'stairs'];

class ActivityTrainingService {
  private model: tf.LayersModel | null = null;
  private collectedData: ActivitySample[] = [];
  private normMean: number[] | null = null;
  private normStd: number[] | null = null;
  
  // Temporal smoothing state
  private probEMA: number[] = new Array(ACTIVITIES.length).fill(0);
  private lastLabel: number | null = null;
  private lastChangeMs: number = 0;
  
  // Collection state
  private isCollecting: boolean = false;
  private collectionActivity: ActivityType | null = null;
  private collectionStartTime: number = 0;
  private collectionTimestamps: number[] = [];
  private collectionPitches: number[] = [];
  private collectionCallback: ((progress: number, remaining: number) => void) | null = null;
  
  // Classification state
  private classificationTimer: ReturnType<typeof setInterval> | null = null;
  private onClassificationResult: ((result: ClassificationResult) => void) | null = null;

  isModelTrained(): boolean {
    return this.model !== null;
  }

  isCurrentlyCollecting(): boolean {
    return this.isCollecting;
  }

  getCollectionProgress(): { progress: number; remaining: number; activity: ActivityType | null } {
    if (!this.isCollecting) {
      return { progress: 0, remaining: 0, activity: null };
    }
    const elapsed = (Date.now() - this.collectionStartTime) / 1000;
    const progress = Math.min(1, elapsed / TRAIN_SEC);
    const remaining = Math.max(0, TRAIN_SEC - elapsed);
    return { progress, remaining, activity: this.collectionActivity };
  }

  // Start collecting data for an activity (20 seconds)
  startCollection(
    activity: ActivityType, 
    onProgress: (progress: number, remaining: number) => void,
    onComplete: (success: boolean, message: string) => void
  ): void {
    if (this.isCollecting) {
      onComplete(false, 'Already collecting data');
      return;
    }

    this.isCollecting = true;
    this.collectionActivity = activity;
    this.collectionStartTime = Date.now();
    this.collectionTimestamps = [];
    this.collectionPitches = [];
    this.collectionCallback = onProgress;

    // Set timer for collection end
    setTimeout(() => {
      this.finishCollection(onComplete);
    }, TRAIN_SEC * 1000);
  }

  // Feed pitch data during collection
  feedPitchData(pitch: number, timestamp: number): void {
    if (!this.isCollecting) return;
    
    if (pitch !== undefined && !isNaN(pitch)) {
      this.collectionTimestamps.push(timestamp / 1000); // Convert to seconds
      this.collectionPitches.push(pitch);
    }

    // Update progress
    if (this.collectionCallback) {
      const { progress, remaining } = this.getCollectionProgress();
      this.collectionCallback(progress, remaining);
    }
  }

  // Cancel ongoing collection
  cancelCollection(): void {
    this.isCollecting = false;
    this.collectionActivity = null;
    this.collectionTimestamps = [];
    this.collectionPitches = [];
    this.collectionCallback = null;
  }

  private finishCollection(onComplete: (success: boolean, message: string) => void): void {
    if (!this.isCollecting || !this.collectionActivity) {
      onComplete(false, 'No active collection');
      return;
    }

    const activity = this.collectionActivity;
    const timestamps = [...this.collectionTimestamps];
    const pitches = [...this.collectionPitches];

    // Reset collection state
    this.isCollecting = false;
    this.collectionActivity = null;
    this.collectionTimestamps = [];
    this.collectionPitches = [];
    this.collectionCallback = null;

    // Validate collected data
    if (timestamps.length < 50) {
      onComplete(false, `Not enough data collected (${timestamps.length} samples). Make sure device is streaming.`);
      return;
    }

    // Check if we have enough time span
    const duration = timestamps[timestamps.length - 1] - timestamps[0];
    if (duration < WIN_SEC) {
      onComplete(false, `Data duration too short (${duration.toFixed(1)}s). Need at least ${WIN_SEC}s.`);
      return;
    }

    // Store the collected data
    this.collectedData.push({
      activity,
      timestamps,
      pitches,
      collectedAt: Date.now(),
    });

    onComplete(true, `Captured ${timestamps.length} samples (${duration.toFixed(1)}s) for ${activity}`);
  }

  deleteActivity(index: number): void {
    if (index >= 0 && index < this.collectedData.length) {
      this.collectedData.splice(index, 1);
    }
  }

  getCollectedActivities(): { activity: ActivityType; sampleCount: number; index: number }[] {
    return this.collectedData.map((data, index) => ({
      activity: data.activity,
      sampleCount: data.pitches.length,
      index,
    }));
  }

  clearAllData(): void {
    this.collectedData = [];
    this.model = null;
    this.normMean = null;
    this.normStd = null;
    this.probEMA = new Array(ACTIVITIES.length).fill(0);
  }

  // Extract 4 physics-based features from a window of pitch data
  private extractFeatures(timestamps: number[], pitches: number[]): number[] | null {
    const n = pitches.length;
    if (n < 4) return null;

    // Calculate velocity (first derivative of pitch)
    const vel: number[] = [];
    for (let i = 1; i < n; i++) {
      const dt = timestamps[i] - timestamps[i - 1];
      if (dt > 0) {
        vel.push((pitches[i] - pitches[i - 1]) / dt);
      }
    }

    // Calculate jerk (second derivative)
    const jerk: number[] = [];
    if (vel.length > 1) {
      for (let i = 1; i < vel.length; i++) {
        const dt = timestamps[i + 1] - timestamps[i];
        if (dt > 0) {
          jerk.push((vel[i] - vel[i - 1]) / dt);
        }
      }
    }

    // Zero crossing rate on signed delta pitch
    let zc = 0;
    for (let i = 2; i < n; i++) {
      const a = pitches[i] - pitches[i - 1];
      const b = pitches[i - 1] - pitches[i - 2];
      if (a === 0 || b === 0) continue;
      if ((a > 0 && b < 0) || (a < 0 && b > 0)) zc++;
    }
    const duration = Math.max(0.001, timestamps[n - 1] - timestamps[0]);

    // Calculate RMS values
    const velRms = vel.length > 0 
      ? Math.sqrt(vel.reduce((s, x) => s + x * x, 0) / vel.length) 
      : 0;
    
    const meanP = pitches.reduce((s, x) => s + x, 0) / n;
    const pitchSd = Math.sqrt(pitches.reduce((s, x) => s + (x - meanP) ** 2, 0) / n);
    
    const jerkRms = jerk.length > 0 
      ? Math.sqrt(jerk.reduce((s, x) => s + x * x, 0) / jerk.length) 
      : 0;
    
    const zcr = zc / duration;

    return [velRms, pitchSd, jerkRms, zcr];
  }

  // Create sliding windows and extract features
  private makeWindows(timestamps: number[], pitches: number[]): number[][] {
    const windows: number[][] = [];
    const t0 = timestamps[0];
    const tEnd = timestamps[timestamps.length - 1];

    for (let cur = t0; cur + WIN_SEC <= tEnd + 0.001; cur += HOP_SEC) {
      // Find indices within this window
      const idx: number[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (timestamps[i] >= cur && timestamps[i] <= cur + WIN_SEC) {
          idx.push(i);
        }
      }

      if (idx.length >= 4) {
        const selT = idx.map(i => timestamps[i] - cur);
        const selP = idx.map(i => pitches[i]);
        const features = this.extractFeatures(selT, selP);
        if (features) {
          windows.push(features);
        }
      }
    }

    return windows;
  }

  private prepareTrainingData(): { 
    features: number[][]; 
    labels: number[];
    activityCounts: Map<ActivityType, number>;
  } | null {
    const allFeatures: number[][] = [];
    const allLabels: number[] = [];
    const activityCounts = new Map<ActivityType, number>();

    for (const sample of this.collectedData) {
      const windows = this.makeWindows(sample.timestamps, sample.pitches);
      const labelIndex = ACTIVITIES.indexOf(sample.activity);
      
      for (const features of windows) {
        allFeatures.push(features);
        allLabels.push(labelIndex);
      }

      const current = activityCounts.get(sample.activity) || 0;
      activityCounts.set(sample.activity, current + windows.length);
    }

    if (allFeatures.length === 0) {
      return null;
    }

    return { features: allFeatures, labels: allLabels, activityCounts };
  }

  async trainModel(onProgress?: (message: string) => void): Promise<{ success: boolean; message: string }> {
    const uniqueActivities = new Set(this.collectedData.map(d => d.activity));
    if (uniqueActivities.size < 2) {
      return { 
        success: false, 
        message: 'Need data from at least 2 different activities to train' 
      };
    }

    onProgress?.('Preparing training data...');

    const prepared = this.prepareTrainingData();
    if (!prepared || prepared.features.length === 0) {
      return { 
        success: false, 
        message: 'No valid training windows could be extracted. Try collecting more data.' 
      };
    }

    const { features, labels, activityCounts } = prepared;

    onProgress?.(`Extracted ${features.length} windows from ${this.collectedData.length} recordings`);

    // Normalize features
    const featureTensor = tf.tensor2d(features);
    const mean = featureTensor.mean(0);
    const std = featureTensor.sub(mean).square().mean(0).sqrt();
    
    this.normMean = Array.from(mean.dataSync());
    this.normStd = Array.from(std.dataSync()).map(s => Math.max(s, 0.001)); // Prevent division by zero
    
    const normalizedFeatures = featureTensor.sub(mean).div(tf.tensor1d(this.normStd));

    // One-hot encode labels
    const labelsTensor = tf.oneHot(tf.tensor1d(labels, 'int32'), ACTIVITIES.length);

    onProgress?.('Building MLP model...');

    // Build MLP model (matching reference implementation)
    if (this.model) {
      this.model.dispose();
    }

    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [NUM_FEATURES],
          units: 32,
          activation: 'relu',
          kernelInitializer: 'heNormal',
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          kernelInitializer: 'heNormal',
        }),
        tf.layers.dense({
          units: ACTIVITIES.length,
          activation: 'softmax',
        }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    onProgress?.('Training model...');

    try {
      await this.model.fit(normalizedFeatures, labelsTensor, {
        epochs: 100,
        batchSize: Math.min(32, Math.floor(features.length / 2)),
        shuffle: true,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 20 === 0) {
              onProgress?.(`Epoch ${epoch}: loss=${logs?.loss?.toFixed(4)}, acc=${(logs?.acc as number * 100)?.toFixed(1)}%`);
            }
          },
        },
      });

      // Cleanup tensors
      featureTensor.dispose();
      mean.dispose();
      normalizedFeatures.dispose();
      labelsTensor.dispose();

      // Reset smoothing state
      this.probEMA = new Array(ACTIVITIES.length).fill(0);
      this.lastLabel = null;
      this.lastChangeMs = 0;

      const activityStats = Array.from(activityCounts.entries())
        .map(([act, count]) => `${act}: ${count}`)
        .join(', ');

      return { 
        success: true, 
        message: `Model trained on ${features.length} windows (${activityStats})` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Training failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  classify(pitchHistory: PitchData[]): ClassificationResult | null {
    if (!this.model || !this.normMean || !this.normStd) return null;

    // Convert to arrays and filter valid data
    const validData = pitchHistory.filter(p => p.pitch !== undefined && !isNaN(p.pitch));
    if (validData.length < 10) return null;

    const timestamps = validData.map(p => p.timestamp / 1000);
    const pitches = validData.map(p => p.pitch);

    // Get the last WIN_SEC seconds
    const tEnd = timestamps[timestamps.length - 1];
    const tStart = tEnd - WIN_SEC;

    const idx: number[] = [];
    for (let i = timestamps.length - 1; i >= 0; i--) {
      if (timestamps[i] >= tStart) idx.push(i);
      else break;
    }

    if (idx.length < 4) return null;

    idx.reverse();
    const selT = idx.map(i => timestamps[i] - tStart);
    const selP = idx.map(i => pitches[i]);

    // Extract features
    const features = this.extractFeatures(selT, selP);
    if (!features) return null;

    // Normalize
    const normalized = features.map((f, i) => (f - this.normMean![i]) / this.normStd![i]);

    // Predict
    const inputTensor = tf.tensor2d([normalized]);
    const prediction = this.model.predict(inputTensor) as tf.Tensor;
    const probs = Array.from(prediction.dataSync());
    inputTensor.dispose();
    prediction.dispose();

    // Apply EMA smoothing
    for (let i = 0; i < probs.length; i++) {
      this.probEMA[i] = ALPHA_EMA * probs[i] + (1 - ALPHA_EMA) * this.probEMA[i];
    }

    // Find best class with hysteresis
    const now = Date.now();
    let bestIdx = this.probEMA.indexOf(Math.max(...this.probEMA));

    // Apply dwell time and switch margin
    if (this.lastLabel !== null && this.lastLabel !== bestIdx) {
      const timeSinceSwitch = now - this.lastChangeMs;
      const currentProb = this.probEMA[bestIdx];
      const lastProb = this.probEMA[this.lastLabel];

      // Only switch if we've exceeded dwell time AND new class beats old by margin
      if (timeSinceSwitch < DWELL_MS || currentProb < lastProb + SWITCH_MARGIN) {
        bestIdx = this.lastLabel;
      } else {
        this.lastLabel = bestIdx;
        this.lastChangeMs = now;
      }
    } else {
      this.lastLabel = bestIdx;
      this.lastChangeMs = now;
    }

    const currentActivity = ACTIVITIES[bestIdx];
    const confidence = this.probEMA[bestIdx] * 100;

    return {
      still: this.probEMA[0] * 100,
      walking: this.probEMA[1] * 100,
      running: this.probEMA[2] * 100,
      stairs: this.probEMA[3] * 100,
      currentActivity,
      confidence,
      timestamp: Date.now(),
    };
  }

  startClassification(
    getPitchHistory: () => PitchData[],
    onResult: (result: ClassificationResult) => void
  ): void {
    if (this.classificationTimer) {
      clearInterval(this.classificationTimer);
    }

    this.onClassificationResult = onResult;

    this.classificationTimer = setInterval(() => {
      const history = getPitchHistory();
      const result = this.classify(history);
      if (result && this.onClassificationResult) {
        this.onClassificationResult(result);
      }
    }, CLASSIFICATION_INTERVAL_MS);
  }

  stopClassification(): void {
    if (this.classificationTimer) {
      clearInterval(this.classificationTimer);
      this.classificationTimer = null;
    }
    this.onClassificationResult = null;
    
    // Reset smoothing state
    this.probEMA = new Array(ACTIVITIES.length).fill(0);
    this.lastLabel = null;
  }

  isClassifying(): boolean {
    return this.classificationTimer !== null;
  }
}

export const activityTrainingService = new ActivityTrainingService();
