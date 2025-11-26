import TherapyModes from '../TherapyModes';

export default function TherapyModesExample() {
  return <TherapyModes onModeSelect={(mode) => console.log('Selected mode:', mode)} />;
}
