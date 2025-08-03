import React, { useState, useEffect } from 'react';
import { PrintFailureLog as PrintFailureLogModel, Printer, FilamentSpool } from '../../db/models';
import PrintFailureList from './PrintFailureList';
import PrintFailureForm from './PrintFailureForm';

const PrintFailureLog = () => {
  const [logs, setLogs] = useState<PrintFailureLogModel[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filaments, setFilaments] = useState<FilamentSpool[]>([]);
  const [selectedLog, setSelectedLog] = useState<PrintFailureLogModel | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = () => {
    window.electron.getFailureLogs().then(setLogs);
  };

  const fetchPrinters = () => {
    window.electron.getPrinters().then(setPrinters);
  };

  const fetchFilaments = () => {
    window.electron.getFilaments().then(setFilaments);
  };

  useEffect(() => {
    fetchLogs();
    fetchPrinters();
    fetchFilaments();
  }, []);

  const handleAdd = async (log: Omit<PrintFailureLogModel, 'id'>) => {
    await window.electron.addFailureLog(log);
    fetchLogs();
  };

  const handleUpdate = async (log: Omit<PrintFailureLogModel, 'id'>) => {
    if (selectedLog) {
      await window.electron.updateFailureLog({ ...selectedLog, ...log });
      setSelectedLog(undefined);
      fetchLogs();
    }
  };

  const handleDelete = async (id: number) => {
    await window.electron.deleteFailureLog(id);
    fetchLogs();
  };

  const handleSearch = async () => {
    if (searchQuery) {
      const results = await window.electron.searchFailureLogs(searchQuery);
      setLogs(results);
    } else {
      fetchLogs();
    }
  };

  const handleSubmit = (log: {
    title: string;
    dateOfFailure: Date;
    photos: string[];
    gcodeFile: string;
    stlFile: string;
    suspectedCauseAndNotes: string;
    slicerSettings: Record<string, string>;
    PrinterId: number;
    FilamentId: number;
  }) => {
    if (selectedLog) {
      handleUpdate(log as any);
    } else {
      handleAdd(log as any);
    }
  };

  return (
    <div>
      <h2>3D Print Failure Log</h2>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <PrintFailureForm
        onSubmit={handleSubmit}
        log={selectedLog}
        printers={printers}
        filaments={filaments}
      />
      <PrintFailureList
        logs={logs}
        onEdit={setSelectedLog}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PrintFailureLog;
