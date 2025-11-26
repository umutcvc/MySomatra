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

export interface TherapyCommand {
  mode: string;
  intensity: number;
  pattern?: number[];
}

const ZENWEAR_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const ZENWEAR_TX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const ZENWEAR_RX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

const IMU_SERVICE_UUID = '6e400010-b5a3-f393-e0a9-e50e24dcca9e';
const IMU_DATA_CHARACTERISTIC_UUID = '6e400011-b5a3-f393-e0a9-e50e24dcca9e';

const BATTERY_SERVICE_UUID = 'battery_service';
const BATTERY_LEVEL_UUID = 'battery_level';

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private imuCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  
  private sensorDataCallback: ((data: SensorData) => void) | null = null;
  private connectionCallback: ((connected: boolean) => void) | null = null;
  private batteryCallback: ((level: number) => void) | null = null;

  isSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  async requestDevice(): Promise<DeviceInfo | null> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser');
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'ZenWear' },
          { namePrefix: 'ZENWEAR' },
          { namePrefix: 'Neural' },
        ],
        optionalServices: [
          ZENWEAR_SERVICE_UUID,
          IMU_SERVICE_UUID,
          BATTERY_SERVICE_UUID,
        ],
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

      try {
        const uartService = await this.server.getPrimaryService(ZENWEAR_SERVICE_UUID);
        this.txCharacteristic = await uartService.getCharacteristic(ZENWEAR_TX_CHARACTERISTIC_UUID);
        this.rxCharacteristic = await uartService.getCharacteristic(ZENWEAR_RX_CHARACTERISTIC_UUID);
        
        await this.rxCharacteristic.startNotifications();
        this.rxCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          this.handleRxData(event);
        });
      } catch (e) {
        console.log('UART service not found, device may not support commands');
      }

      try {
        const imuService = await this.server.getPrimaryService(IMU_SERVICE_UUID);
        this.imuCharacteristic = await imuService.getCharacteristic(IMU_DATA_CHARACTERISTIC_UUID);
        
        await this.imuCharacteristic.startNotifications();
        this.imuCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          this.handleIMUData(event);
        });
      } catch (e) {
        console.log('IMU service not found');
      }

      try {
        const batteryService = await this.server.getPrimaryService(BATTERY_SERVICE_UUID);
        this.batteryCharacteristic = await batteryService.getCharacteristic(BATTERY_LEVEL_UUID);
        
        await this.batteryCharacteristic.startNotifications();
        this.batteryCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          this.handleBatteryData(event);
        });

        const batteryValue = await this.batteryCharacteristic.readValue();
        const batteryLevel = batteryValue.getUint8(0);
        this.batteryCallback?.(batteryLevel);
      } catch (e) {
        console.log('Battery service not found');
      }

      this.connectionCallback?.(true);
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.server?.connected) {
      this.server.disconnect();
    }
    this.handleDisconnect();
  }

  private handleDisconnect(): void {
    this.server = null;
    this.txCharacteristic = null;
    this.rxCharacteristic = null;
    this.imuCharacteristic = null;
    this.batteryCharacteristic = null;
    this.connectionCallback?.(false);
  }

  private handleRxData(event: Event): void {
    const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const decoder = new TextDecoder();
    const data = decoder.decode(value);
    console.log('Received from device:', data);
  }

  private handleIMUData(event: Event): void {
    const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const ax = value.getFloat32(0, true);
    const ay = value.getFloat32(4, true);
    const az = value.getFloat32(8, true);
    const gx = value.getFloat32(12, true);
    const gy = value.getFloat32(16, true);
    const gz = value.getFloat32(20, true);

    let activityType = 'Unknown';
    if (value.byteLength > 24) {
      const activityCode = value.getUint8(24);
      activityType = this.decodeActivity(activityCode);
    }

    const sensorData: SensorData = {
      accelerometer: { x: ax, y: ay, z: az },
      gyroscope: { x: gx, y: gy, z: gz },
      activityType,
      timestamp: Date.now(),
    };

    this.sensorDataCallback?.(sensorData);
  }

  private decodeActivity(code: number): string {
    const activities: { [key: number]: string } = {
      0: 'Idle',
      1: 'Walking',
      2: 'Running',
      3: 'Sitting',
      4: 'Standing',
      5: 'Lying Down',
      6: 'Exercise',
      7: 'Meditation',
      8: 'Yoga',
    };
    return activities[code] || 'Unknown';
  }

  private handleBatteryData(event: Event): void {
    const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const batteryLevel = value.getUint8(0);
    this.batteryCallback?.(batteryLevel);
  }

  async sendTherapyCommand(command: TherapyCommand): Promise<void> {
    if (!this.txCharacteristic) {
      console.log('TX characteristic not available, simulating command');
      return;
    }

    const modeMap: { [key: string]: number } = {
      'relax': 1,
      'sleep': 2,
      'focus': 3,
      'hype': 4,
      'meditate': 5,
      'recovery': 6,
    };

    const modeCode = modeMap[command.mode] || 1;
    const data = new Uint8Array([
      0x01,
      modeCode,
      command.intensity,
    ]);

    await this.txCharacteristic.writeValue(data);
  }

  async startTherapy(mode: string, intensity: number): Promise<void> {
    await this.sendTherapyCommand({ mode, intensity });
    
    const startCmd = new Uint8Array([0x02, 0x01]);
    if (this.txCharacteristic) {
      await this.txCharacteristic.writeValue(startCmd);
    }
  }

  async stopTherapy(): Promise<void> {
    if (!this.txCharacteristic) {
      console.log('TX characteristic not available');
      return;
    }

    const stopCmd = new Uint8Array([0x02, 0x00]);
    await this.txCharacteristic.writeValue(stopCmd);
  }

  onSensorData(callback: (data: SensorData) => void): void {
    this.sensorDataCallback = callback;
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallback = callback;
  }

  onBatteryChange(callback: (level: number) => void): void {
    this.batteryCallback = callback;
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
