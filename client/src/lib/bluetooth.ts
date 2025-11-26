export interface DeviceInfo {
  id: string;
  name: string;
  device: BluetoothDevice | null;
  connected: boolean;
}

export interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  activityType: string;
  timestamp: number;
}

export interface PitchData {
  pitch: number;
  timestamp: number;
}

export interface GPSData {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  satellites: number;
  hdop: number;
  course: number;
  fix: boolean;
  timestamp: number;
}

export interface BatteryData {
  voltage: number;
  percentage: number;
  timestamp: number;
}

export interface TherapyCommand {
  mode: string;
  intensity: number;
  pattern?: number[];
}

const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

type ConnectionCallback = (connected: boolean) => void;
type PitchCallback = (data: PitchData) => void;
type GPSCallback = (data: GPSData) => void;
type BatteryCallback = (data: BatteryData) => void;
type SensorCallback = (data: SensorData) => void;
type RawMessageCallback = (message: string) => void;

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private pitchCallbacks: Set<PitchCallback> = new Set();
  private gpsCallbacks: Set<GPSCallback> = new Set();
  private batteryCallbacks: Set<BatteryCallback> = new Set();
  private sensorCallbacks: Set<SensorCallback> = new Set();
  private rawMessageCallbacks: Set<RawMessageCallback> = new Set();

  private messageBuffer: string = '';
  private _isConnected: boolean = false;

  isSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  async requestDevice(): Promise<DeviceInfo | null> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser');
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [NUS_SERVICE_UUID],
      });

      if (!this.device) {
        return null;
      }

      this.device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnect();
      });

      return {
        id: this.device.id,
        name: this.device.name || 'Unknown Device',
        device: this.device,
        connected: false,
      };
    } catch (error) {
      if ((error as Error).name === 'NotFoundError') {
        return null;
      }
      throw error;
    }
  }

  async connect(): Promise<boolean> {
    if (!this.device) {
      throw new Error('No device selected');
    }

    try {
      this.server = await this.device.gatt?.connect() || null;
      
      if (!this.server) {
        throw new Error('Failed to connect to GATT server');
      }

      const nusService = await this.server.getPrimaryService(NUS_SERVICE_UUID);
      
      this.writeCharacteristic = await nusService.getCharacteristic(NUS_RX_CHARACTERISTIC_UUID);
      this.notifyCharacteristic = await nusService.getCharacteristic(NUS_TX_CHARACTERISTIC_UUID);
      
      await this.notifyCharacteristic.startNotifications();
      this.notifyCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
        this.handleNotification(event);
      });

      this._isConnected = true;
      this.notifyConnectionChange(true);

      try {
        await this.sendCommand('STREAM,ON');
      } catch (e) {
        console.log('Could not enable streaming, continuing anyway');
      }

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this._isConnected) {
      try {
        await this.sendCommand('STREAM,OFF');
        await this.sendCommand('STOP');
      } catch (e) {
        console.log('Could not send disconnect commands');
      }
    }
    
    if (this.server?.connected) {
      this.server.disconnect();
    }
    this.handleDisconnect();
  }

  private handleDisconnect(): void {
    this.server = null;
    this.writeCharacteristic = null;
    this.notifyCharacteristic = null;
    this.messageBuffer = '';
    this._isConnected = false;
    this.notifyConnectionChange(false);
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(cb => cb(connected));
  }

  private handleNotification(event: Event): void {
    const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const decoder = new TextDecoder();
    const chunk = decoder.decode(value);
    this.messageBuffer += chunk;

    const lines = this.messageBuffer.split('\n');
    this.messageBuffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        this.parseMessage(trimmed);
      }
    }
  }

  private parseMessage(message: string): void {
    this.rawMessageCallbacks.forEach(cb => cb(message));

    if (message.startsWith('PITCH,')) {
      const pitchStr = message.substring(6);
      const pitch = parseFloat(pitchStr);
      if (!isNaN(pitch)) {
        const data: PitchData = { pitch, timestamp: Date.now() };
        this.pitchCallbacks.forEach(cb => cb(data));
      }
    }
    else if (message.startsWith('GPS,')) {
      const parts = message.substring(4).split(',');
      if (parts.length >= 5) {
        const gpsData: GPSData = {
          fix: parts[0] === '1',
          latitude: parseFloat(parts[1]) || 0,
          longitude: parseFloat(parts[2]) || 0,
          altitude: parseFloat(parts[3]) || 0,
          satellites: parts.length > 4 ? (parseInt(parts[4]) || 0) : 0,
          hdop: parts.length > 5 ? (parseFloat(parts[5]) || 0) : 0,
          speed: parts.length > 6 ? (parseFloat(parts[6]) || 0) : 0,
          course: parts.length > 7 ? (parseFloat(parts[7]) || 0) : 0,
          timestamp: Date.now(),
        };
        this.gpsCallbacks.forEach(cb => cb(gpsData));
      }
    }
    else if (message.startsWith('BATT,')) {
      const parts = message.substring(5).split(',');
      if (parts.length >= 2) {
        const data: BatteryData = {
          voltage: parseFloat(parts[0]) || 0,
          percentage: parseInt(parts[1]) || 0,
          timestamp: Date.now(),
        };
        this.batteryCallbacks.forEach(cb => cb(data));
      }
    }
    else if (message.startsWith('ACK ') || message.startsWith('ERR ') || message.startsWith('RX:') || message.startsWith('RATE ')) {
      console.log('Device response:', message);
    }
  }

  async sendCommand(command: string): Promise<void> {
    if (!this.writeCharacteristic) {
      console.log('Write characteristic not available');
      return;
    }

    if (!this._isConnected) {
      console.log('Device not connected');
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(command);
    await this.writeCharacteristic.writeValue(data);
    console.log('Sent command:', command);
  }

  async sendPWM(frequency: number, duty: number): Promise<void> {
    const freq = Math.max(1, Math.min(20000, Math.round(frequency)));
    const d = Math.max(0, Math.min(100, Math.round(duty)));
    await this.sendCommand(`PWM,${freq},${d}`);
  }

  async stopPWM(): Promise<void> {
    await this.sendCommand('STOP');
  }

  async calibrateIMU(durationMs: number = 3000): Promise<void> {
    await this.sendCommand(`CAL,${durationMs}`);
  }

  async setStreaming(enabled: boolean): Promise<void> {
    await this.sendCommand(`STREAM,${enabled ? 'ON' : 'OFF'}`);
  }

  async startTherapy(mode: string, intensity: number): Promise<void> {
    const freqMap: { [key: string]: number } = {
      'relax': 40,
      'sleep': 30,
      'focus': 60,
      'hype': 80,
      'meditate': 35,
      'recovery': 45,
    };
    
    const freq = freqMap[mode.toLowerCase()] || 40;
    const duty = Math.round(intensity * 0.8);
    await this.sendPWM(freq, duty);
  }

  async stopTherapy(): Promise<void> {
    await this.stopPWM();
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  onPitchData(callback: PitchCallback): () => void {
    this.pitchCallbacks.add(callback);
    return () => this.pitchCallbacks.delete(callback);
  }

  onGPSData(callback: GPSCallback): () => void {
    this.gpsCallbacks.add(callback);
    return () => this.gpsCallbacks.delete(callback);
  }

  onBatteryData(callback: BatteryCallback): () => void {
    this.batteryCallbacks.add(callback);
    return () => this.batteryCallbacks.delete(callback);
  }

  onSensorData(callback: SensorCallback): () => void {
    this.sensorCallbacks.add(callback);
    return () => this.sensorCallbacks.delete(callback);
  }

  onRawMessage(callback: RawMessageCallback): () => void {
    this.rawMessageCallbacks.add(callback);
    return () => this.rawMessageCallbacks.delete(callback);
  }

  onBatteryChange(callback: (level: number) => void): () => void {
    return this.onBatteryData((data) => callback(data.percentage));
  }

  isConnected(): boolean {
    return this._isConnected;
  }

  getDeviceName(): string {
    return this.device?.name || 'Unknown Device';
  }

  getDeviceId(): string {
    return this.device?.id || '';
  }
}

export const bluetoothService = new BluetoothService();
