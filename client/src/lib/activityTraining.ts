import * as tf from '@tensorflow/tfjs';
import { bluetoothService, PitchData } from './bluetooth';

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
  timestamp: number;
}

const SAMPLE_DURATION_MS = 20000;
const SAMPLE_RATE_HZ = 100;
const WINDOW_SIZE = 100;
const WINDOW_OVERLAP = 0.5;

class ActivityTrainingService {
  private model: tf.LayersModel | null = null;
  private collectedData: ActivitySample[] = [];
  private isCollecting: boolean = false;
  private isTraining: boolean = false;
  private isClassifying: boolean = false;
  private currentSamples: number[] = [];
  private classificationBuffer: number[] = [];
  private unsubscribePitch: (() => void) | null = null;
  
  private onProgressCallback: ((progress: TrainingProgress) => void) | null = null;
  private onClassificationCallback: ((result: ClassificationResult) => void) | null = null;
  private onCollectionProgressCallback: ((progress: number, total: number) => void) | null = null;
  private collectionStartTime: number = 0;
  private collectionInterval: number | null = null;

  getCollectedActivities(): ActivitySample[] {
    return [...this.collectedData];
  }

  getUniqueActivityCount(): number {
    const unique = new Set(this.collectedData.map(d => d.activity));
    return unique.size;
  }

  canTrain(): boolean {
    return this.getUniqueActivityCount() >= 2 && this.collectedData.length >= 2;
  }

  isModelTrained(): boolean {
    return this.model !== null;
  }

  async startCollection(activity: ActivityType, onProgress: (elapsed: number, total: number) => void): Promise<void> {
    if (this.isCollecting) {
      throw new Error('Already collecting data');
    }

    if (!bluetoothService.isConnected()) {
      throw new Error('Device not connected');
    }

    this.isCollecting = true;
    this.currentSamples = [];
    this.collectionStartTime = Date.now();
    this.onCollectionProgressCallback = onProgress;

    this.unsubscribePitch = bluetoothService.onPitchData((data: PitchData) => {
      if (this.isCollecting) {
        this.currentSamples.push(data.pitch);
      }
    });

    this.collectionInterval = window.setInterval(() => {
      const elapsed = Date.now() - this.collectionStartTime;
      if (this.onCollectionProgressCallback) {
        this.onCollectionProgressCallback(Math.min(elapsed, SAMPLE_DURATION_MS), SAMPLE_DURATION_MS);
      }
    }, 100);

    return new Promise((resolve) => {
      setTimeout(() => {
        this.stopCollection(activity);
        resolve();
      }, SAMPLE_DURATION_MS);
    });
  }

  private stopCollection(activity: ActivityType): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    
    if (this.unsubscribePitch) {
      this.unsubscribePitch();
      this.unsubscribePitch = null;
    }

    if (this.currentSamples.length > 0) {
      this.collectedData.push({
        activity,
        samples: [...this.currentSamples],
        timestamp: Date.now(),
      });
    }

    this.isCollecting = false;
    this.currentSamples = [];
  }

  cancelCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    
    if (this.unsubscribePitch) {
      this.unsubscribePitch();
      this.unsubscribePitch = null;
    }
    
    this.isCollecting = false;
    this.currentSamples = [];
  }

  deleteActivity(index: number): void {
    if (index >= 0 && index < this.collectedData.length) {
      this.collectedData.splice(index, 1);
    }
  }

  clearAllData(): void {
    this.collectedData = [];
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
    const std = Math.sqrt(window.reduce((a, b) => a + (b - mean) ** 2, 0) / window.length) || 1;
    return window.map(v => (v - mean) / std);
  }

  private prepareTrainingData(): { xs: tf.Tensor; ys: tf.Tensor } {
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
    
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 4, activation: 'softmax' }));
    
    model.compile({
      optimizer: tf.train.adam(0.001),
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
    this.onProgressCallback = onProgress;

    try {
      const { xs, ys } = this.prepareTrainingData();
      this.model = this.buildModel();

      const totalEpochs = 30;
      
      await this.model.fit(xs, ys, {
        epochs: totalEpochs,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (this.onProgressCallback && logs) {
              this.onProgressCallback({
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
    } finally {
      this.isTraining = false;
    }
  }

  startClassification(onClassification: (result: ClassificationResult) => void): void {
    if (!this.model) {
      throw new Error('Model not trained yet');
    }

    if (this.isClassifying) {
      return;
    }

    this.isClassifying = true;
    this.classificationBuffer = [];
    this.onClassificationCallback = onClassification;

    this.unsubscribePitch = bluetoothService.onPitchData((data: PitchData) => {
      if (!this.isClassifying) return;

      this.classificationBuffer.push(data.pitch);

      if (this.classificationBuffer.length > WINDOW_SIZE * 2) {
        this.classificationBuffer = this.classificationBuffer.slice(-WINDOW_SIZE * 2);
      }

      if (this.classificationBuffer.length >= WINDOW_SIZE) {
        this.runClassification();
      }
    });
  }

  private runClassification(): void {
    if (!this.model || !this.onClassificationCallback) return;

    const window = this.classificationBuffer.slice(-WINDOW_SIZE);
    const normalized = this.normalizeWindow(window);
    
    const input = tf.tensor2d([normalized]).reshape([1, WINDOW_SIZE, 1]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const probs = prediction.dataSync();
    
    const activities: ActivityType[] = ['walking', 'running', 'swimming', 'standing'];
    let maxIdx = 0;
    let maxProb = probs[0];
    
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > maxProb) {
        maxProb = probs[i];
        maxIdx = i;
      }
    }

    this.onClassificationCallback({
      walking: probs[0] * 100,
      running: probs[1] * 100,
      swimming: probs[2] * 100,
      standing: probs[3] * 100,
      currentActivity: activities[maxIdx],
      timestamp: Date.now(),
    });

    input.dispose();
    prediction.dispose();
  }

  stopClassification(): void {
    this.isClassifying = false;
    if (this.unsubscribePitch) {
      this.unsubscribePitch();
      this.unsubscribePitch = null;
    }
    this.classificationBuffer = [];
    this.onClassificationCallback = null;
  }

  getIsCollecting(): boolean {
    return this.isCollecting;
  }

  getIsTraining(): boolean {
    return this.isTraining;
  }

  getIsClassifying(): boolean {
    return this.isClassifying;
  }
}

export const activityTrainingService = new ActivityTrainingService();
