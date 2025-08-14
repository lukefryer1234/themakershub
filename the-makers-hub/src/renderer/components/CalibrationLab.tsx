import React, { useState } from 'react';

const CalibrationLab = () => {
  const [gcodeFile, setGcodeFile] = useState<string | null>(null);
  const [slicerSetting, setSlicerSetting] = useState('');
  const [startValue, setStartValue] = useState('');
  const [endValue, setEndValue] = useState('');
  const [stepValue, setStepValue] = useState('');

  const [generatedGCode, setGeneratedGCode] = useState('');

  const handleGenerate = async () => {
    if (!gcodeFile) {
      alert('Please select a G-code file.');
      return;
    }
    const gcode = await window.electron.generateCalibrationGCode({
      gcodeFile,
      slicerSetting,
      startValue,
      endValue,
      stepValue,
    });
    setGeneratedGCode(gcode);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setGcodeFile(e.target.files[0].path);
    }
  };

  const handleSave = async () => {
    if (generatedGCode) {
      await window.electron.saveGCode(generatedGCode);
      alert('G-code saved successfully!');
    }
  };

  return (
    <div>
      <h2>Slicer Profile A/B Tester (Calibration Lab)</h2>
      <form>
        <div>
          <label>G-code File</label>
          <input type="file" onChange={handleFileChange} />
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
          <button type="button" onClick={handleSave}>Save G-Code</button>
        </div>
      )}
    </div>
  );
};

export default CalibrationLab;
