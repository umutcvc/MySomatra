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

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  
  private sensorDataCallback: ((data: SensorData) => void) | null = null;
  private pitchDataCallback: ((data: PitchData) => void) | null = null;
  private gpsDataCallback: ((data: GPSData) => void) | null = null;
  private batteryDataCallback: ((data: BatteryData) => void) | null = null;
  private connectionCallback: ((connected: boolean) => void) | null = null;
  private rawMessageCallback: ((message: string) => void) | null = null;

  private messageBuffer: string = '';

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

      this.connectionCallback?.(true);

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
    if (this.isConnected()) {
      try {
        await this.sendCommand('STREAM,OFF');
      } catch (e) {
        console.log('Could not send STREAM,OFF before disconnect');
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
    this.connectionCallback?.(false);
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
    this.rawMessageCallback?.(message);

    if (message.startsWith('PITCH,')) {
      const pitchStr = message.substring(6);
      const pitch = parseFloat(pitchStr);
      if (!isNaN(pitch)) {
        this.pitchDataCallback?.({
          pitch,
          timestamp: Date.now(),
        });
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
          speed: parseFloat(parts[4]) || 0,
          satellites: parts.length > 5 ? (parseInt(parts[5]) || 0) : 0,
          timestamp: Date.now(),
        };
        this.gpsDataCallback?.(gpsData);
      }
    }
    else if (message.startsWith('BATT,')) {
      const parts = message.substring(5).split(',');
      if (parts.length >= 2) {
        this.batteryDataCallback?.({
          voltage: parseFloat(parts[0]) || 0,
          percentage: parseInt(parts[1]) || 0,
          timestamp: Date.now(),
        });
      }
    }
    else if (message.startsWith('ACK ') || message.startsWith('ERR ') || message.startsWith('RX:')) {
      console.log('Device response:', message);
    }
  }

  async sendCommand(command: string): Promise<void> {
    if (!this.writeCharacteristic) {
      console.log('Write characteristic not available');
      return;
    }

    if (!this.isConnected()) {
      console.log('Device not connected');
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(command);
    await this.writeCharacteristic.writeValue(data);
    console.log('Sent command:', command);
  }

  async sendPWM(frequency: number, duty: number): Promise<void> {
    await this.sendCommand(`PWM,${frequency},${duty}`);
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
    
    const freq = freqMap[mode] || 40;
    const duty = Math.round(intensity * 0.8);
    await this.sendPWM(freq, duty);
  }

  async stopTherapy(): Promise<void> {
    await this.stopPWM();
  }

  onSensorData(callback: (data: SensorData) => void): void {
    this.sensorDataCallback = callback;
  }

  onPitchData(callback: (data: PitchData) => void): void {
    this.pitchDataCallback = callback;
  }

  onGPSData(callback: (data: GPSData) => void): void {
    this.gpsDataCallback = callback;
  }

  onBatteryData(callback: (data: BatteryData) => void): void {
    this.batteryDataCallback = callback;
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallback = callback;
  }

  onRawMessage(callback: (message: string) => void): void {
    this.rawMessageCallback = callback;
  }

  onBatteryChange(callback: (level: number) => void): void {
    this.onBatteryData((data) => callback(data.percentage));
  }

  isConnected(): boolean {
    return this.server?.connected || false;
  }

  getDeviceName(): string {
    return this.device?.name || 'Unknown Device';
  }

  getDeviceId(): string {
    return this.device?.id || '';
  }
}

export const bluetoothService = new BluetoothService();
