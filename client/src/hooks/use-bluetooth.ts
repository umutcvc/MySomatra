import { useState, useCallback, useEffect } from 'react';
import { bluetoothService, type DeviceInfo, type SensorData } from '@/lib/bluetooth';

interface BluetoothState {
  isSupported: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  device: DeviceInfo | null;
  batteryLevel: number | null;
  sensorData: SensorData | null;
  error: string | null;
}

export function useBluetooth() {
  const [state, setState] = useState<BluetoothState>({
    isSupported: false,
    isConnecting: false,
    isConnected: false,
    device: null,
    batteryLevel: null,
    sensorData: null,
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
      }));
    });

    bluetoothService.onBatteryChange((level) => {
      setState(prev => ({
        ...prev,
        batteryLevel: level,
      }));
    });

    bluetoothService.onSensorData((data) => {
      setState(prev => ({
        ...prev,
        sensorData: data,
      }));
    });
  }, []);

  const scanAndConnect = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
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
        sensorData: null,
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

  return {
    ...state,
    scanAndConnect,
    disconnect,
    startTherapy,
    stopTherapy,
  };
}
