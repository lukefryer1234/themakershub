import React, { useState, useEffect } from 'react';
import { PrintFailureLog, Printer, FilamentSpool } from '../../db/models';

interface Props {
  log?: PrintFailureLog;
  printers: Printer[];
  filaments: FilamentSpool[];
  onSubmit: (log: Omit<PrintFailureLog, 'id'>) => void;
}

const PrintFailureForm: React.FC<Props> = ({ log, printers, filaments, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [dateOfFailure, setDateOfFailure] = useState(new Date());
  const [printerId, setPrinterId] = useState<number | null>(null);
  const [filamentId, setFilamentId] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [gcodeFile, setGcodeFile] = useState<string | null>(null);
  const [stlFile, setStlFile] = useState<string | null>(null);
  const [suspectedCauseAndNotes, setSuspectedCauseAndNotes] = useState('');
  const [slicerSettings, setSlicerSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (log) {
      setTitle(log.title);
      setDateOfFailure(log.dateOfFailure);
      setPrinterId(log.Printer?.id || null);
      setFilamentId(log.FilamentSpool?.id || null);
      setPhotos(log.photos || []);
      setGcodeFile(log.gcodeFile || null);
      setStlFile(log.stlFile || null);
      setSuspectedCauseAndNotes(log.suspectedCauseAndNotes || '');
      setSlicerSettings(log.slicerSettings || {});
    }
  }, [log]);

  const handleSlicerSettingChange = (key: string, value: string) => {
    setSlicerSettings({ ...slicerSettings, [key]: value });
  };

  const handleAddSlicerSetting = () => {
    setSlicerSettings({ ...slicerSettings, '': '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (path: string) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0].path);
    }
  };

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (paths: string[]) => void) => {
    if (e.target.files) {
      const paths = Array.from(e.target.files).map((file) => file.path);
      setter(paths);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      dateOfFailure,
      photos,
      gcodeFile,
      stlFile,
      suspectedCauseAndNotes,
      slicerSettings,
      PrinterId: printerId,
      FilamentId: filamentId,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic Info */}
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input type="date" value={dateOfFailure.toISOString().split('T')[0]} onChange={(e) => setDateOfFailure(new Date(e.target.value))} required />

      {/* Associations */}
      <select value={printerId || ''} onChange={(e) => setPrinterId(parseInt(e.target.value))} required>
        <option value="" disabled>Select a printer</option>
        {printers.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
      </select>
      <select value={filamentId || ''} onChange={(e) => setFilamentId(parseInt(e.target.value))} required>
        <option value="" disabled>Select a filament</option>
        {filaments.map((f) => (<option key={f.id} value={f.id}>{f.manufacturer} {f.materialType}</option>))}
      </select>

      {/* File Attachments */}
      <label>Photos: <input type="file" multiple onChange={(e) => handleMultipleFileChange(e, setPhotos)} /></label>
      <label>.gcode File: <input type="file" onChange={(e) => handleFileChange(e, setGcodeFile)} /></label>
      <label>.stl File: <input type="file" onChange={(e) => handleFileChange(e, setStlFile)} /></label>

      {/* Notes */}
      <textarea placeholder="Suspected Cause & Notes" value={suspectedCauseAndNotes} onChange={(e) => setSuspectedCauseAndNotes(e.target.value)} />

      {/* Slicer Settings */}
      <div>
        <h3>Slicer Settings</h3>
        {Object.entries(slicerSettings).map(([key, value]) => (
          <div key={key}>
            <input type="text" placeholder="Setting Name" value={key} onChange={(e) => { const newKey = e.target.value; setSlicerSettings(prev => { const { [key]: _, ...rest } = prev; return { ...rest, [newKey]: value }; }); }} />
            <input type="text" placeholder="Value" value={value} onChange={(e) => handleSlicerSettingChange(key, e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={handleAddSlicerSetting}>Add Setting</button>
      </div>

      <button type="submit">{log ? 'Update' : 'Add'} Failure Log</button>
    </form>
  );
};

export default PrintFailureForm;
