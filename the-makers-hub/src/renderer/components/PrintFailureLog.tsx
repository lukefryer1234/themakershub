import React, { useState, useEffect } from 'react';
import { PrintFailureLog as PrintFailureLogModel, Printer, FilamentSpool } from '../../db/models';
import PrintFailureList from './PrintFailureList';
import PrintFailureForm from './PrintFailureForm';
import { useCrud } from '../hooks/useCrud';

type PrintFailureLogForm = {
  title: string;
  dateOfFailure: Date;
  photos: string[];
  gcodeFile: string;
  stlFile: string;
  suspectedCauseAndNotes: string;
  slicerSettings: Record<string, string>;
  PrinterId: number;
  FilamentId: number;
};

const PrintFailureLog = () => {
  const {
    items: logs,
    setItems: setLogs,
    selectedItem: selectedLog,
    setSelectedItem: setSelectedLog,
    handleSubmit,
    handleDelete,
  } = useCrud<PrintFailureLogModel>({
    getAll: window.electron.getFailureLogs,
    add: window.electron.addFailureLog,
    update: window.electron.updateFailureLog,
    delete: window.electron.deleteFailureLog,
  });

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filaments, setFilaments] = useState<FilamentSpool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrinters = () => {
    window.electron.getPrinters().then(setPrinters);
  };

  const fetchFilaments = () => {
    window.electron.getFilaments().then(setFilaments);
  };

  useEffect(() => {
    fetchPrinters();
    fetchFilaments();
  }, []);

  const handleSearch = async () => {
    if (searchQuery) {
      const results = await window.electron.searchFailureLogs(searchQuery);
      setLogs(results);
    } else {
      // fetchLogs is handled by the useCrud hook
    }
  };

  const handleFormSubmit = (log: PrintFailureLogForm) => {
    handleSubmit(log as unknown as Omit<PrintFailureLogModel, 'id'>);
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
        onSubmit={handleFormSubmit}
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
