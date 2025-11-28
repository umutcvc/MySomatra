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
  quality: 'good' | 'fair' | 'poor';
  windowCount: number;
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

export interface DataQuality {
  sampleCount: number;
  duration: number;
  sampleRate: number;
  motionRange: number;
  quality: 'good' | 'fair' | 'poor';
  message: string;
}

// Configuration
const TRAIN_SEC = 10;          // 10 seconds collection per activity
const WIN_SEC = 3.0;           // 3-second sliding window for features
const HOP_SEC = 0.2;           // 0.2-second hop between windows
const NUM_FEATURES = 6;        // vel_rms, pitch_sd, jerk_rms, zcr, peak_to_peak, mean_pitch
const CLASSIFICATION_INTERVAL_MS = 200;

// Temporal smoothing parameters
const ALPHA_EMA = 0.15;
const DWELL_MS = 100;
const SWITCH_MARGIN = 0.06;

const ACTIVITIES: ActivityType[] = ['still', 'walking', 'running', 'stairs'];

class ActivityTrainingService {
  private model: tf.LayersModel | null = null;
  private collectedData: ActivitySample[] = [];
  private normMean: number[] | null = null;
  private normStd: number[] | null = null;
  private baselinePitch: number = 0;
  
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

  // Calibrate baseline from resting position
  calibrateBaseline(pitchHistory: PitchData[]): void {
    if (pitchHistory.length > 0) {
      const recent = pitchHistory.slice(-50);
      this.baselinePitch = recent.reduce((s, p) => s + p.pitch, 0) / recent.length;
    }
  }

  startCollection(
    activity: ActivityType, 
    onProgress: (progress: number, remaining: number) => void,
    onComplete: (success: boolean, message: string, quality?: DataQuality) => void
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

    setTimeout(() => {
      this.finishCollection(onComplete);
    }, TRAIN_SEC * 1000);
  }

  feedPitchData(pitch: number, timestamp: number): void {
    if (!this.isCollecting) return;
    
    if (pitch !== undefined && !isNaN(pitch)) {
      const relativeTime = (timestamp - this.collectionStartTime) / 1000;
      this.collectionTimestamps.push(relativeTime);
      // Remove baseline drift
      this.collectionPitches.push(pitch - this.baselinePitch);
    }

    if (this.collectionCallback) {
      const { progress, remaining } = this.getCollectionProgress();
      this.collectionCallback(progress, remaining);
    }
  }

  cancelCollection(): void {
    this.isCollecting = false;
    this.collectionActivity = null;
    this.collectionTimestamps = [];
    this.collectionPitches = [];
    this.collectionCallback = null;
  }

  private assessDataQuality(timestamps: number[], pitches: number[]): DataQuality {
    const n = timestamps.length;
    const duration = n > 0 ? timestamps[n - 1] - timestamps[0] : 0;
    const sampleRate = duration > 0 ? n / duration : 0;
    
    // Calculate motion range (peak-to-peak)
    const minP = Math.min(...pitches);
    const maxP = Math.max(...pitches);
    const motionRange = maxP - minP;
    
    let quality: 'good' | 'fair' | 'poor' = 'good';
    let message = '';

    if (n < 100) {
      quality = 'poor';
      message = 'Not enough samples. Check device connection.';
    } else if (sampleRate < 20) {
      quality = 'poor';
      message = 'Sample rate too low. Move device closer.';
    } else if (duration < WIN_SEC + 1) {
      quality = 'poor';
      message = 'Recording too short.';
    } else if (sampleRate < 50) {
      quality = 'fair';
      message = 'Sample rate is low but usable.';
    } else {
      message = 'Good quality data captured!';
    }

    return { sampleCount: n, duration, sampleRate, motionRange, quality, message };
  }

  private finishCollection(onComplete: (success: boolean, message: string, quality?: DataQuality) => void): void {
    if (!this.isCollecting || !this.collectionActivity) {
      onComplete(false, 'No active collection');
      return;
    }

    const activity = this.collectionActivity;
    const timestamps = [...this.collectionTimestamps];
    const pitches = [...this.collectionPitches];

    this.isCollecting = false;
    this.collectionActivity = null;
    this.collectionTimestamps = [];
    this.collectionPitches = [];
    this.collectionCallback = null;

    const quality = this.assessDataQuality(timestamps, pitches);

    if (quality.quality === 'poor') {
      onComplete(false, quality.message, quality);
      return;
    }

    // Count windows we can extract
    const windows = this.makeWindows(timestamps, pitches);
    
    if (windows.length < 5) {
      onComplete(false, `Not enough motion data. Only ${windows.length} windows extracted.`, quality);
      return;
    }

    this.collectedData.push({
      activity,
      timestamps,
      pitches,
      collectedAt: Date.now(),
      quality: quality.quality,
      windowCount: windows.length,
    });

    onComplete(
      true, 
      `Captured ${activity}: ${windows.length} training windows (${quality.quality} quality)`,
      quality
    );
  }

  deleteActivity(index: number): void {
    if (index >= 0 && index < this.collectedData.length) {
      this.collectedData.splice(index, 1);
    }
  }

  getCollectedActivities(): { activity: ActivityType; sampleCount: number; index: number; quality: string; windowCount: number }[] {
    return this.collectedData.map((data, index) => ({
      activity: data.activity,
      sampleCount: data.pitches.length,
      index,
      quality: data.quality,
      windowCount: data.windowCount,
    }));
  }

  clearAllData(): void {
    this.collectedData = [];
    this.model = null;
    this.normMean = null;
    this.normStd = null;
    this.probEMA = new Array(ACTIVITIES.length).fill(0);
  }

  // Extract 6 features from a window of pitch data
  private extractFeatures(timestamps: number[], pitches: number[]): number[] | null {
    const n = pitches.length;
    if (n < 4) return null;

    // Calculate velocity (first derivative)
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
        const dt = timestamps[i] - timestamps[i - 1];
        if (dt > 0) {
          jerk.push((vel[i] - vel[i - 1]) / dt);
        }
      }
    }

    // Zero crossing rate
    let zc = 0;
    for (let i = 2; i < n; i++) {
      const a = pitches[i] - pitches[i - 1];
      const b = pitches[i - 1] - pitches[i - 2];
      if (a === 0 || b === 0) continue;
      if ((a > 0 && b < 0) || (a < 0 && b > 0)) zc++;
    }
    const duration = Math.max(0.001, timestamps[n - 1] - timestamps[0]);

    // Feature 1: Velocity RMS
    const velRms = vel.length > 0 
      ? Math.sqrt(vel.reduce((s, x) => s + x * x, 0) / vel.length) 
      : 0;
    
    // Feature 2: Pitch standard deviation
    const meanP = pitches.reduce((s, x) => s + x, 0) / n;
    const pitchSd = Math.sqrt(pitches.reduce((s, x) => s + (x - meanP) ** 2, 0) / n);
    
    // Feature 3: Jerk RMS
    const jerkRms = jerk.length > 0 
      ? Math.sqrt(jerk.reduce((s, x) => s + x * x, 0) / jerk.length) 
      : 0;
    
    // Feature 4: Zero crossing rate
    const zcr = zc / duration;

    // Feature 5: Peak-to-peak amplitude
    const peakToPeak = Math.max(...pitches) - Math.min(...pitches);

    // Feature 6: Mean pitch (captures posture/orientation)
    const meanPitch = meanP;

    return [velRms, pitchSd, jerkRms, zcr, peakToPeak, meanPitch];
  }

  private makeWindows(timestamps: number[], pitches: number[]): number[][] {
    const windows: number[][] = [];
    const t0 = timestamps[0];
    const tEnd = timestamps[timestamps.length - 1];

    for (let cur = t0; cur + WIN_SEC <= tEnd + 0.001; cur += HOP_SEC) {
      const idx: number[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (timestamps[i] >= cur && timestamps[i] <= cur + WIN_SEC) {
          idx.push(i);
        }
      }

      if (idx.length >= 10) {
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

    // Build tensors
    const Xmat = tf.tensor2d(features, [features.length, NUM_FEATURES], 'float32');
    const mean = Xmat.mean(0);
    const variance = tf.moments(Xmat, 0).variance;
    const std = variance.sqrt().add(1e-8);
    const Xn = Xmat.sub(mean).div(std);
    const yvec = tf.tensor1d(labels, 'float32');

    this.normMean = Array.from(mean.dataSync());
    this.normStd = Array.from(std.dataSync());

    onProgress?.('Building model...');

    if (this.model) {
      this.model.dispose();
    }

    const numOut = ACTIVITIES.length;
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          units: 12, 
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

    this.model.compile({
      optimizer: tf.train.adam(0.02),
      loss: 'sparseCategoricalCrossentropy',
    });

    onProgress?.('Training model...');

    try {
      await this.model.fit(Xn, yvec, {
        epochs: 100,
        batchSize: 32,
        shuffle: true,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 20 === 0) {
              onProgress?.(`Training: ${epoch}/100 epochs (loss: ${logs?.loss?.toFixed(4)})`);
            }
          },
        },
      });

      Xmat.dispose();
      Xn.dispose();
      yvec.dispose();
      mean.dispose();
      std.dispose();
      variance.dispose();

      this.probEMA = new Array(ACTIVITIES.length).fill(0);
      this.lastLabel = null;
      this.lastChangeMs = 0;

      const activityStats = Array.from(activityCounts.entries())
        .map(([act, count]) => `${act}: ${count}`)
        .join(', ');

      return { 
        success: true, 
        message: `Model trained! (${activityStats})` 
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

    const n = pitchHistory.length;
    if (n < 10) return null;

    const baseTime = pitchHistory[0].timestamp;
    const timestamps = pitchHistory.map(p => (p.timestamp - baseTime) / 1000);
    const pitches = pitchHistory.map(p => p.pitch - this.baselinePitch);

    const tEnd = timestamps[n - 1];
    const tStart = tEnd - WIN_SEC;

    const idx: number[] = [];
    for (let i = n - 1; i >= 0; i--) {
      if (timestamps[i] >= tStart) idx.push(i);
      else break;
    }
    if (idx.length < 10) return null;

    const sel = idx.reverse();
    const ts = sel.map(i => timestamps[i] - tStart);
    const ps = sel.map(i => pitches[i]);

    const f = this.extractFeatures(ts, ps);
    if (!f) return null;

    const x = f.map((v, i) => (v - this.normMean![i]) / (this.normStd![i] || 1e-8));
    
    const xt = tf.tensor2d([x]);
    const y = this.model.predict(xt) as tf.Tensor;
    const probs = (y.arraySync() as number[][])[0];
    xt.dispose();
    y.dispose();

    const numOut = ACTIVITIES.length;

    // EMA smoothing
    for (let i = 0; i < numOut; i++) {
      const prev = (this.probEMA[i] == null) ? probs[i] : this.probEMA[i];
      this.probEMA[i] = prev + ALPHA_EMA * (probs[i] - prev);
    }

    // Hysteresis decision
    const now = performance.now();
    const curIdx = (this.lastLabel == null) ? -1 : this.lastLabel;

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

    return {
      still: this.probEMA[0] * 100,
      walking: this.probEMA[1] * 100,
      running: this.probEMA[2] * 100,
      stairs: this.probEMA[3] * 100,
      currentActivity: ACTIVITIES[chosen],
      confidence: this.probEMA[chosen] * 100,
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
    this.probEMA = new Array(ACTIVITIES.length).fill(0);
    this.lastLabel = null;
  }

  isClassifying(): boolean {
    return this.classificationTimer !== null;
  }
}

export const activityTrainingService = new ActivityTrainingService();
