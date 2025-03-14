import Button from './components/Button';
import { useSharedState } from './StateContext';

export default function StimSequenceTab() {
  const { sharedState } = useSharedState();

  return (
    <div className="flex flex-col h-[82vh]">
      <div className="text-right p-2">
        <Button onClick={() => window.electron.send('load-file')}>
          Load Sequence
        </Button>
      </div>
      <textarea
        id="file-content"
        className="w-full h-full bg-gray-500"
        value={JSON.stringify(sharedState)}
      />
    </div>
  );
}
