import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
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
  gpsHistory: GPSData[];
  error: string | null;
}

const MAX_PITCH_HISTORY = 200;
const MAX_GPS_HISTORY = 100;

let globalState: BluetoothState = {
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
  gpsHistory: [],
  error: null,
};

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

function updateGlobalState(updater: (prev: BluetoothState) => BluetoothState) {
  globalState = updater(globalState);
  notifyListeners();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return globalState;
}

let initialized = false;

function initializeBluetoothListeners() {
  if (initialized) return;
  initialized = true;

  updateGlobalState(prev => ({
    ...prev,
    isSupported: bluetoothService.isSupported(),
  }));

  bluetoothService.onConnectionChange((connected) => {
    updateGlobalState(prev => ({
      ...prev,
      isConnected: connected,
      isConnecting: false,
      pitchHistory: connected ? prev.pitchHistory : [],
      gpsHistory: connected ? prev.gpsHistory : [],
    }));
  });

  bluetoothService.onBatteryData((data: BatteryData) => {
    updateGlobalState(prev => ({
      ...prev,
      batteryLevel: data.percentage,
      batteryVoltage: data.voltage,
    }));
  });

  bluetoothService.onSensorData((data: SensorData) => {
    updateGlobalState(prev => ({
      ...prev,
      sensorData: data,
    }));
  });

  bluetoothService.onPitchData((data: PitchData) => {
    updateGlobalState(prev => {
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
    updateGlobalState(prev => {
      const newHistory = [...prev.gpsHistory, data];
      if (newHistory.length > MAX_GPS_HISTORY) {
        newHistory.shift();
      }
      return {
        ...prev,
        gpsData: data,
        gpsHistory: newHistory,
      };
    });
  });
}

export function useBluetooth() {
  useEffect(() => {
    initializeBluetoothListeners();
  }, []);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const scanAndConnect = useCallback(async () => {
    updateGlobalState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
      pitchHistory: [],
      gpsHistory: [],
    }));

    try {
      const deviceInfo = await bluetoothService.requestDevice();
      
      if (!deviceInfo) {
        updateGlobalState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'No device selected',
        }));
        return false;
      }

      updateGlobalState(prev => ({
        ...prev,
        device: deviceInfo,
      }));

      await bluetoothService.connect();
      
      updateGlobalState(prev => ({
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
      updateGlobalState(prev => ({
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
      updateGlobalState(prev => ({
        ...prev,
        isConnected: false,
        device: null,
        batteryLevel: null,
        batteryVoltage: null,
        sensorData: null,
        pitchData: null,
        pitchHistory: [],
        gpsData: null,
        gpsHistory: [],
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
