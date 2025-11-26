import { useState, useCallback, useEffect } from 'react';
import { bluetoothService, type DeviceInfo, type SensorData, type PitchData, type GPSData, type BatteryData } from '@/lib/bluetooth';

interface BluetoothState {
  isSupported: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  device: DeviceInfo | null;
  batteryLevel: number | null;
  batteryVoltage: number | null;
  sensorData: SensorData | null;
  pitchData: PitchData | null;
  pitchHistory: PitchData[];
  gpsData: GPSData | null;
  error: string | null;
}

const MAX_PITCH_HISTORY = 200;

export function useBluetooth() {
  const [state, setState] = useState<BluetoothState>({
    isSupported: false,
    isConnecting: false,
    isConnected: false,
    device: null,
    batteryLevel: null,
    batteryVoltage: null,
    sensorData: null,
    pitchData: null,
    pitchHistory: [],
    gpsData: null,
    error: null,
  });

  useEffect(() => {
    setState(prev => ({
      ...prev,
      isSupported: bluetoothService.isSupported(),
    }));

    bluetoothService.onConnectionChange((connected) => {
      setState(prev => ({
        ...prev,
        isConnected: connected,
        isConnecting: false,
        pitchHistory: connected ? prev.pitchHistory : [],
      }));
    });

    bluetoothService.onBatteryData((data: BatteryData) => {
      setState(prev => ({
        ...prev,
        batteryLevel: data.percentage,
        batteryVoltage: data.voltage,
      }));
    });

    bluetoothService.onSensorData((data: SensorData) => {
      setState(prev => ({
        ...prev,
        sensorData: data,
      }));
    });

    bluetoothService.onPitchData((data: PitchData) => {
      setState(prev => {
        const newHistory = [...prev.pitchHistory, data];
        if (newHistory.length > MAX_PITCH_HISTORY) {
          newHistory.shift();
        }
        return {
          ...prev,
          pitchData: data,
          pitchHistory: newHistory,
        };
      });
    });

    bluetoothService.onGPSData((data: GPSData) => {
      setState(prev => ({
        ...prev,
        gpsData: data,
      }));
    });
  }, []);

  const scanAndConnect = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
      pitchHistory: [],
    }));

    try {
      const deviceInfo = await bluetoothService.requestDevice();
      
      if (!deviceInfo) {
        setState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'No device selected',
        }));
        return false;
      }

      setState(prev => ({
        ...prev,
        device: deviceInfo,
      }));

      await bluetoothService.connect();
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        device: {
          ...deviceInfo,
          connected: true,
        },
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: message,
      }));
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await bluetoothService.disconnect();
      setState(prev => ({
        ...prev,
        isConnected: false,
        device: null,
        batteryLevel: null,
        batteryVoltage: null,
        sensorData: null,
        pitchData: null,
        pitchHistory: [],
        gpsData: null,
      }));
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, []);

  const startTherapy = useCallback(async (mode: string, intensity: number) => {
    try {
      await bluetoothService.startTherapy(mode, intensity);
    } catch (error) {
      console.error('Failed to start therapy:', error);
    }
  }, []);

  const stopTherapy = useCallback(async () => {
    try {
      await bluetoothService.stopTherapy();
    } catch (error) {
      console.error('Failed to stop therapy:', error);
    }
  }, []);

  const calibrateIMU = useCallback(async (durationMs: number = 3000) => {
    try {
      await bluetoothService.calibrateIMU(durationMs);
    } catch (error) {
      console.error('Failed to calibrate IMU:', error);
    }
  }, []);

  const sendCommand = useCallback(async (command: string) => {
    try {
      await bluetoothService.sendCommand(command);
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  }, []);

  return {
    ...state,
    scanAndConnect,
    disconnect,
    startTherapy,
    stopTherapy,
    calibrateIMU,
    sendCommand,
  };
}
