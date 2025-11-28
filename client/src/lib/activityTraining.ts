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

// Configuration matching the reference implementation EXACTLY
const TRAIN_SEC = 20;          // 20 seconds collection per activity
const WIN_SEC = 3.0;           // 3-second sliding window for features
const HOP_SEC = 0.2;           // 0.2-second hop between windows (reference uses 0.2)
const NUM_FEATURES = 4;        // vel_rms, pitch_sd, jerk_rms, zcr
const CLASSIFICATION_INTERVAL_MS = 200; // Reference uses 200ms

// Temporal smoothing parameters (matching reference)
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
      // Store timestamps in seconds (relative to collection start)
      const relativeTime = (timestamp - this.collectionStartTime) / 1000;
      this.collectionTimestamps.push(relativeTime);
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
  // Matches reference: _featuresFromPitch(ts, p)
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

    // Calculate jerk (second derivative) - from velocity
    const jerk: number[] = [];
    if (vel.length > 1) {
      for (let i = 1; i < vel.length; i++) {
        const dt = timestamps[i] - timestamps[i - 1]; // Use original timestamps
        if (dt > 0) {
          jerk.push((vel[i] - vel[i - 1]) / dt);
        }
      }
    }

    // Zero crossing rate on signed delta pitch (matching reference)
    let zc = 0;
    for (let i = 2; i < n; i++) {
      const a = pitches[i] - pitches[i - 1];
      const b = pitches[i - 1] - pitches[i - 2];
      if (a === 0 || b === 0) continue;
      if ((a > 0 && b < 0) || (a < 0 && b > 0)) zc++;
    }
    const duration = Math.max(0.001, timestamps[n - 1] - timestamps[0]);

    // Calculate RMS and stats (matching reference)
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

  // Create sliding windows and extract features (matching reference: _makeWindows)
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

    // Build tensors - matching reference exactly
    const Xmat = tf.tensor2d(features, [features.length, NUM_FEATURES], 'float32');
    const mean = Xmat.mean(0);
    const variance = tf.moments(Xmat, 0).variance;
    const std = variance.sqrt().add(1e-8); // Match reference: add(1e-8)
    const Xn = Xmat.sub(mean).div(std);
    
    // Sparse labels (integer array) - matching reference
    const yvec = tf.tensor1d(labels, 'float32');

    // Store normalization stats
    this.normMean = Array.from(mean.dataSync());
    this.normStd = Array.from(std.dataSync());

    onProgress?.('Building MLP model...');

    // Build MLP model - matching reference EXACTLY
    // Reference: Dense(8, relu) → Dense(numOut, softmax)
    if (this.model) {
      this.model.dispose();
    }

    const numOut = ACTIVITIES.length;
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          units: 8, 
          inputShape: [NUM_FEATURES], 
          activation: 'relu',
          useBias: true 
        }),
        tf.layers.dense({ 
          units: numOut, 
          activation: 'softmax',
          useBias: true 
        })
      ]
    });

    // Compile with sparseCategoricalCrossentropy and adam(0.02) - matching reference
    this.model.compile({
      optimizer: tf.train.adam(0.02),
      loss: 'sparseCategoricalCrossentropy',
    });

    onProgress?.('Training model...');

    try {
      // Train with 70 epochs, batch 32 - matching reference
      await this.model.fit(Xn, yvec, {
        epochs: 70,
        batchSize: 32,
        shuffle: true,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              onProgress?.(`Epoch ${epoch}/70: loss=${logs?.loss?.toFixed(4)}`);
            }
          },
        },
      });

      // Cleanup tensors
      Xmat.dispose();
      Xn.dispose();
      yvec.dispose();
      mean.dispose();
      std.dispose();
      variance.dispose();

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

  // Classify using the same logic as reference: classifyTick()
  classify(pitchHistory: PitchData[]): ClassificationResult | null {
    if (!this.model || !this.normMean || !this.normStd) return null;

    // Convert to arrays and filter valid data
    const n = pitchHistory.length;
    if (n < 6) return null;

    // Get timestamps in seconds (relative)
    const baseTime = pitchHistory[0].timestamp;
    const timestamps = pitchHistory.map(p => (p.timestamp - baseTime) / 1000);
    const pitches = pitchHistory.map(p => p.pitch);

    // Get the last WIN_SEC seconds (matching reference)
    const tEnd = timestamps[n - 1];
    const tStart = tEnd - WIN_SEC;

    // Collect indices for last WIN_SEC seconds (matching reference logic)
    const idx: number[] = [];
    for (let i = n - 1; i >= 0; i--) {
      if (timestamps[i] >= tStart) idx.push(i);
      else break;
    }
    if (idx.length < 4) return null;

    const sel = idx.reverse();
    const ts = sel.map(i => timestamps[i] - tStart);
    const ps = sel.map(i => pitches[i]);

    // Extract features
    const f = this.extractFeatures(ts, ps);
    if (!f) return null;

    // Normalize using training stats (matching reference)
    const x = f.map((v, i) => (v - this.normMean![i]) / (this.normStd![i] || 1e-8));
    
    // Predict
    const xt = tf.tensor2d([x]);
    const y = this.model.predict(xt) as tf.Tensor;
    const probs = (y.arraySync() as number[][])[0];
    xt.dispose();
    y.dispose();

    const numOut = ACTIVITIES.length;

    // EMA smooth the probabilities (matching reference)
    for (let i = 0; i < numOut; i++) {
      const prev = (this.probEMA[i] == null) ? probs[i] : this.probEMA[i];
      this.probEMA[i] = prev + ALPHA_EMA * (probs[i] - prev);
    }

    // Hysteresis + dwell-time decision (matching reference)
    const now = performance.now();
    const curIdx = (this.lastLabel == null) ? -1 : this.lastLabel;

    // Find current best by smoothed probs
    let bestIdx = 0;
    let bestVal = this.probEMA[0];
    for (let i = 1; i < numOut; i++) {
      if (this.probEMA[i] > bestVal) {
        bestVal = this.probEMA[i];
        bestIdx = i;
      }
    }

    let chosen = curIdx;
    if (curIdx === -1) {
      chosen = bestIdx;
      this.lastChangeMs = now;
    } else if (bestIdx !== curIdx) {
      const gap = this.probEMA[bestIdx] - this.probEMA[curIdx];
      const longEnough = (now - this.lastChangeMs) >= DWELL_MS;
      if (gap >= SWITCH_MARGIN && longEnough) {
        chosen = bestIdx;
        this.lastChangeMs = now;
      }
    }

    this.lastLabel = chosen;

    const currentActivity = ACTIVITIES[chosen];
    const confidence = this.probEMA[chosen] * 100;

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

    // Use 200ms interval like reference
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
