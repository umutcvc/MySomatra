import * as tf from '@tensorflow/tfjs';
import type { PitchData } from './bluetooth';

export type ActivityType = 'walking' | 'running' | 'swimming' | 'standing';

export interface ActivitySample {
  activity: ActivityType;
  samples: number[];
  timestamp: number;
}

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
}

export interface ClassificationResult {
  walking: number;
  running: number;
  swimming: number;
  standing: number;
  currentActivity: ActivityType;
  confidence: number;
  timestamp: number;
}

const WINDOW_SIZE = 100;
const WINDOW_OVERLAP = 0.5;
const MIN_SAMPLES_FOR_CAPTURE = 100;
const CLASSIFICATION_INTERVAL_MS = 100;
const SMOOTHING_FACTOR = 0.4;
const MIN_SAMPLES_FOR_CLASSIFICATION = 50;

class ActivityTrainingService {
  private model: tf.LayersModel | null = null;
  private collectedData: ActivitySample[] = [];
  private isTraining: boolean = false;
  private isClassifying: boolean = false;
  
  private classificationInterval: ReturnType<typeof setInterval> | null = null;
  private smoothedProbs: number[] = [0.25, 0.25, 0.25, 0.25];
  private lastClassificationTime: number = 0;
  private pendingPrediction: boolean = false;
  
  private onClassificationCallback: ((result: ClassificationResult) => void) | null = null;

  getCollectedActivities(): ActivitySample[] {
    return [...this.collectedData];
  }

  getUniqueActivityCount(): number {
    const unique = new Set(this.collectedData.map(d => d.activity));
    return unique.size;
  }

  getSampleCountByActivity(): Record<ActivityType, number> {
    const counts: Record<ActivityType, number> = {
      walking: 0,
      running: 0,
      swimming: 0,
      standing: 0,
    };
    for (const sample of this.collectedData) {
      counts[sample.activity]++;
    }
    return counts;
  }

  canTrain(): boolean {
    return this.getUniqueActivityCount() >= 2 && this.collectedData.length >= 2;
  }

  isModelTrained(): boolean {
    return this.model !== null;
  }

  captureFromHistory(activity: ActivityType, pitchHistory: PitchData[]): { success: boolean; sampleCount: number; message: string } {
    const validSamples = pitchHistory.filter(p => p.pitch !== undefined && !isNaN(p.pitch));
    
    if (validSamples.length < MIN_SAMPLES_FOR_CAPTURE) {
      const needed = MIN_SAMPLES_FOR_CAPTURE - validSamples.length;
      const secondsNeeded = Math.ceil(needed / 100);
      return { 
        success: false, 
        sampleCount: validSamples.length,
        message: `Need ${MIN_SAMPLES_FOR_CAPTURE} samples (${validSamples.length} now). Wait ${secondsNeeded}s.`
      };
    }

    const samples = validSamples.map(p => p.pitch);
    
    this.collectedData.push({
      activity,
      samples: [...samples],
      timestamp: Date.now(),
    });

    return { 
      success: true, 
      sampleCount: samples.length,
      message: `Captured ${samples.length} samples for ${activity}`
    };
  }

  deleteActivity(index: number): void {
    if (index >= 0 && index < this.collectedData.length) {
      this.collectedData.splice(index, 1);
    }
  }

  clearAllData(): void {
    this.collectedData = [];
    this.smoothedProbs = [0.25, 0.25, 0.25, 0.25];
  }

  private createWindows(samples: number[]): number[][] {
    const windows: number[][] = [];
    const step = Math.floor(WINDOW_SIZE * (1 - WINDOW_OVERLAP));
    
    for (let i = 0; i <= samples.length - WINDOW_SIZE; i += step) {
      const window = samples.slice(i, i + WINDOW_SIZE);
      windows.push(this.normalizeWindow(window));
    }
    
    return windows;
  }

  private normalizeWindow(window: number[]): number[] {
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / window.length;
    const std = Math.sqrt(variance) || 1;
    return window.map(v => (v - mean) / std);
  }

  private prepareTrainingData(): { xs: tf.Tensor; ys: tf.Tensor } | null {
    const activities: ActivityType[] = ['walking', 'running', 'swimming', 'standing'];
    const allWindows: number[][] = [];
    const allLabels: number[] = [];

    for (const sample of this.collectedData) {
      const windows = this.createWindows(sample.samples);
      const labelIndex = activities.indexOf(sample.activity);
      
      for (const window of windows) {
        allWindows.push(window);
        allLabels.push(labelIndex);
      }
    }

    if (allWindows.length === 0) {
      return null;
    }

    const xs = tf.tensor2d(allWindows).reshape([allWindows.length, WINDOW_SIZE, 1]);
    const ys = tf.oneHot(tf.tensor1d(allLabels, 'int32'), 4);
    
    return { xs, ys };
  }

  private buildModel(): tf.LayersModel {
    const model = tf.sequential();
    
    model.add(tf.layers.conv1d({
      inputShape: [WINDOW_SIZE, 1],
      filters: 16,
      kernelSize: 5,
      activation: 'relu',
      padding: 'same',
    }));
    model.add(tf.layers.maxPooling1d({ poolSize: 2 }));
    
    model.add(tf.layers.conv1d({
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
    }));
    model.add(tf.layers.globalAveragePooling1d({}));
    
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 4, activation: 'softmax' }));
    
    model.compile({
      optimizer: tf.train.adam(0.002),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
    
    return model;
  }

  async train(onProgress: (progress: TrainingProgress) => void): Promise<void> {
    if (!this.canTrain()) {
      throw new Error('Need at least 2 different activities to train');
    }

    if (this.isTraining) {
      throw new Error('Already training');
    }

    this.isTraining = true;

    try {
      const data = this.prepareTrainingData();
      
      if (!data) {
        throw new Error('No valid training data. Capture more samples.');
      }

      const { xs, ys } = data;
      
      if (this.model) {
        this.model.dispose();
      }
      
      this.model = this.buildModel();

      const totalEpochs = 25;
      
      await this.model.fit(xs, ys, {
        epochs: totalEpochs,
        batchSize: 16,
        validationSplit: 0.15,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (logs) {
              onProgress({
                epoch: epoch + 1,
                totalEpochs,
                loss: logs.loss || 0,
                accuracy: logs.acc || 0,
              });
            }
          },
        },
      });

      xs.dispose();
      ys.dispose();
      
      this.smoothedProbs = [0.25, 0.25, 0.25, 0.25];
    } finally {
      this.isTraining = false;
    }
  }

  classifyFromHistory(pitchHistory: PitchData[]): ClassificationResult | null {
    if (!this.model) {
      return null;
    }

    const validSamples = pitchHistory.filter(p => p.pitch !== undefined && !isNaN(p.pitch));
    
    if (validSamples.length < MIN_SAMPLES_FOR_CLASSIFICATION) {
      return null;
    }

    const now = Date.now();
    if (now - this.lastClassificationTime < CLASSIFICATION_INTERVAL_MS) {
      return null;
    }
    
    if (this.pendingPrediction) {
      return null;
    }

    this.pendingPrediction = true;
    this.lastClassificationTime = now;

    try {
      const samplesToUse = validSamples.slice(-WINDOW_SIZE);
      const windowData = samplesToUse.map(p => p.pitch);
      
      if (windowData.length < WINDOW_SIZE) {
        const padding = new Array(WINDOW_SIZE - windowData.length).fill(windowData[0] || 0);
        windowData.unshift(...padding);
      }
      
      const normalized = this.normalizeWindow(windowData);
      
      const input = tf.tensor2d([normalized]).reshape([1, WINDOW_SIZE, 1]);
      const prediction = this.model.predict(input) as tf.Tensor;
      const rawProbs = Array.from(prediction.dataSync());
      
      input.dispose();
      prediction.dispose();

      for (let i = 0; i < 4; i++) {
        this.smoothedProbs[i] = SMOOTHING_FACTOR * rawProbs[i] + 
                                (1 - SMOOTHING_FACTOR) * this.smoothedProbs[i];
      }

      const activities: ActivityType[] = ['walking', 'running', 'swimming', 'standing'];
      let maxIdx = 0;
      let maxProb = this.smoothedProbs[0];
      
      for (let i = 1; i < this.smoothedProbs.length; i++) {
        if (this.smoothedProbs[i] > maxProb) {
          maxProb = this.smoothedProbs[i];
          maxIdx = i;
        }
      }

      return {
        walking: this.smoothedProbs[0] * 100,
        running: this.smoothedProbs[1] * 100,
        swimming: this.smoothedProbs[2] * 100,
        standing: this.smoothedProbs[3] * 100,
        currentActivity: activities[maxIdx],
        confidence: maxProb * 100,
        timestamp: now,
      };
    } catch (error) {
      console.error('Classification error:', error);
      return null;
    } finally {
      this.pendingPrediction = false;
    }
  }

  startClassification(
    getPitchHistory: () => PitchData[],
    onClassification: (result: ClassificationResult) => void
  ): void {
    if (!this.model) {
      throw new Error('Model not trained yet');
    }

    if (this.isClassifying) {
      this.stopClassification();
    }

    this.isClassifying = true;
    this.onClassificationCallback = onClassification;
    this.smoothedProbs = [0.25, 0.25, 0.25, 0.25];
    this.lastClassificationTime = 0;

    const classify = () => {
      if (!this.isClassifying) return;
      
      const pitchHistory = getPitchHistory();
      const result = this.classifyFromHistory(pitchHistory);
      
      if (result && this.onClassificationCallback) {
        this.onClassificationCallback(result);
      }
    };

    this.classificationInterval = setInterval(classify, CLASSIFICATION_INTERVAL_MS);
    classify();
  }

  stopClassification(): void {
    this.isClassifying = false;
    if (this.classificationInterval) {
      clearInterval(this.classificationInterval);
      this.classificationInterval = null;
    }
    this.onClassificationCallback = null;
    this.pendingPrediction = false;
  }

  getIsTraining(): boolean {
    return this.isTraining;
  }

  getIsClassifying(): boolean {
    return this.isClassifying;
  }

  disposeModel(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.smoothedProbs = [0.25, 0.25, 0.25, 0.25];
  }
}

export const activityTrainingService = new ActivityTrainingService();
