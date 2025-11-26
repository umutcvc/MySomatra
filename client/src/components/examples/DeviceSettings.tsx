import DeviceSettings from '../DeviceSettings';

export default function DeviceSettingsExample() {
  return (
    <div className="p-8 max-w-sm">
      <DeviceSettings onDisconnect={() => console.log('Disconnect clicked')} />
    </div>
  );
}
