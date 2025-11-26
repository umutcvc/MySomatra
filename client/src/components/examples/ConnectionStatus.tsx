import ConnectionStatus from '../ConnectionStatus';

export default function ConnectionStatusExample() {
  return (
    <div className="p-8 max-w-sm">
      <ConnectionStatus
        deviceName="ZenWear Device #4891"
        batteryLevel={78}
        signalStrength={85}
        lastSync="Just now"
      />
    </div>
  );
}
