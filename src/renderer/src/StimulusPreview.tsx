import { useEffect, useState } from 'react';
import { StimTypeName, Stimulus, stimConstructors } from './Stimulus';
import Button from './components/Button';
import InputField from './components/InputField';
import CloseButton from './components/CloseButton';
import { useTheStimSequence } from './StateContext';

// Pane to preview one single Stimulus
export default function StimulusPreview(props: {
  className?: string;
  stimIndex: number;
  onClose?: () => void;
}) {
  const { theStimSequence } = useTheStimSequence();
  const indexedStim = theStimSequence?.stimuli[props.stimIndex];
  // TODO: simplify below by using imported newStimulus()
  const isValidStimType =
    indexedStim && Object.values(StimTypeName).includes(indexedStim.name);
  let constructor = stimConstructors['Solid'];
  if (isValidStimType) {
    constructor = stimConstructors[indexedStim.name];
  } else {
    console.log(
      `ERROR from StimulusPreview: '${indexedStim?.name}' invalid StimTypeName`
    );
  }
  const [stimulus, setStimulus] = useState<Stimulus | undefined>(
    isValidStimType ? indexedStim && new constructor(indexedStim) : undefined
  );

  useEffect(() => {
    setStimulus(indexedStim && new constructor(indexedStim));
  }, [props.stimIndex, indexedStim, constructor]);

  return stimulus && isValidStimType ? (
    <div className={`flex flex-col ${props.className || ''}`}>
      <div className="flex flex-row items-center p-1 gap-2 ml-auto text-gray-200">
        <Button onClick={() => PreviewStim(stimulus)}>Preview</Button>
        <CloseButton onClick={() => props.onClose && props.onClose()} />
      </div>
      <div className="flex flex-row p-1 gap-2">
        <StimForm
          initialStim={stimulus}
          onNewStim={(newStim) => setStimulus(newStim)}
        />
        <PreviewCanvas />
      </div>
    </div>
  ) : (
    <div className="text-blue-500">{`Unimplemented stimulus with StimType '${indexedStim?.name}'`}</div>
  );
}

function StimForm(props: {
  initialStim: Stimulus;
  onNewStim?: (newStim: Stimulus) => void;
}) {
  const [stimulus, setStimulus] = useState<Stimulus>(props.initialStim);

  useEffect(() => {
    setStimulus(props.initialStim);
  }, [props.initialStim]);

  // Dropdown options
  const stimTypeNames = Object.keys(StimTypeName); //.filter((key) => isNaN(Number(key)));

  function setNewStimulus(stimTypeName: StimTypeName, overrides?: object) {
    const newStim = new stimConstructors[stimTypeName]({
      ...stimulus, // properties that remain the same
      ...overrides, // last properties win
    });
    setStimulus(newStim);
    if (props.onNewStim) {
      props.onNewStim(newStim);
    }
  }

  function handleStimNameChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setNewStimulus(value as StimTypeName);
  }

  function handleStimPropChange(propName, newValue) {
    const overrides = {};
    overrides[propName] = newValue;
    setNewStimulus(stimulus.name, overrides);
  }

  const rowStyle = 'p-1 text-left border-b-1 h-7 border-gray-900';
  //const formStyle = `${rowStyle} bg-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500`;
  const formStyle = `${rowStyle} bg-gray-800 focus:outline-blue-500 `;

  const stimKeys = Reflect.ownKeys(stimulus) // Subclass and superclass props including symbols
    .filter((k) => typeof k !== 'symbol');

  return (
    <div className="flex flex-row gap-4 text-gray-400">
      <div className="flex flex-col gap-0.5 text-gray-500">
        <div className={`${rowStyle} text-white`}>TypeName:</div>
        {stimKeys
          .filter((n) => n !== 'name')
          .map((propName) => (
            <div key={propName} className={rowStyle}>
              {propName + ': '}
            </div>
          ))}
      </div>

      <div className="flex flex-col gap-0.5">
        <select
          value={stimulus.name}
          onChange={handleStimNameChange}
          className={formStyle}
        >
          {stimTypeNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {stimKeys
          .filter((n) => n !== 'name')
          .map((propName) => (
            <InputField
              key={propName}
              value={stimulus[propName]}
              className={formStyle}
              formatNumber={propName === 'duration'}
              onChange={(newValue) => handleStimPropChange(propName, newValue)}
            />
          ))}
      </div>
    </div>
  );
}

function PreviewCanvas() {
  return (
    <div id="canvas-container" className="grow bg-gray-400 border">
      <canvas id="preview-canvas" />
    </div>
  );
}

function PreviewStim(stimulus: Stimulus) {
  // console.log('>>>>> handlePreviewClick() with stim=' + JSON.stringify(stim));
  const canvasContainer = document.getElementById('canvas-container');
  const canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
  if (!canvasContainer || !canvas) {
    throw new Error('Invalid HTML canvas');
  }
  canvas.width = canvasContainer.offsetWidth - 2;
  canvas.height = canvasContainer.offsetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Invalid context from canvas');
  }
  stimulus.preview(ctx, () => {
    // Clear back to default
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}
