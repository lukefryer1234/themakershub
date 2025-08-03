import React, { useState } from 'react';

const CalibrationLab = () => {
  const [testModel, setTestModel] = useState('');
  const [slicerSetting, setSlicerSetting] = useState('');
  const [startValue, setStartValue] = useState('');
  const [endValue, setEndValue] = useState('');
  const [stepValue, setStepValue] = useState('');

  const [generatedGCode, setGeneratedGCode] = useState('');

  const handleGenerate = async () => {
    const gcode = await window.electron.generateCalibrationGCode({
      testModel,
      slicerSetting,
      startValue,
      endValue,
      stepValue,
    });
    setGeneratedGCode(gcode);
  };

  return (
    <div>
      <h2>Slicer Profile A/B Tester (Calibration Lab)</h2>
      <form>
        <div>
          <label>Test Model</label>
          <select value={testModel} onChange={(e) => setTestModel(e.target.value)}>
            <option value="">Select a test model</option>
            <option value="temperature-tower">Temperature Tower</option>
            <option value="retraction-test">Retraction Test</option>
            <option value="bridging-test">Bridging Test</option>
          </select>
        </div>
        <div>
          <label>Slicer Setting</label>
          <select value={slicerSetting} onChange={(e) => setSlicerSetting(e.target.value)}>
            <option value="">Select a slicer setting</option>
            <option value="temperature">Temperature</option>
            <option value="retraction-distance">Retraction Distance</option>
          </select>
        </div>
        <div>
          <label>Start Value</label>
          <input type="number" value={startValue} onChange={(e) => setStartValue(e.target.value)} />
        </div>
        <div>
          <label>End Value</label>
          <input type="number" value={endValue} onChange={(e) => setEndValue(e.target.value)} />
        </div>
        <div>
          <label>Step Value</label>
          <input type="number" value={stepValue} onChange={(e) => setStepValue(e.target.value)} />
        </div>
        <button type="button" onClick={handleGenerate}>Generate G-Code</button>
      </form>
      {generatedGCode && (
        <div>
          <h3>Generated G-Code</h3>
          <textarea value={generatedGCode} readOnly rows={20} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
};

export default CalibrationLab;
