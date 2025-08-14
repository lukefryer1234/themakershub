import React, { useState, useEffect } from 'react';
import { PrintLog as PrintLogModel, Printer, FilamentSpool } from '../../db/models';
import PrintLogList from './PrintLogList';
import PrintLogForm from './PrintLogForm';
import { useCrud } from '../hooks/useCrud';

type PrintLogForm = {
  title: string;
  date: Date;
  photos: string[];
  gcodeFile: string;
  stlFile: string;
  slicerSettings: Record<string, string>;
  PrinterId: number;
  FilamentId: number;
};

const PrintHistory = () => {
  const {
    items: logs,
    setItems: setLogs,
    selectedItem: selectedLog,
    setSelectedItem: setSelectedLog,
    handleSubmit,
    handleDelete,
  } = useCrud<PrintLogModel>({
    getAll: window.electron.getPrintLogs,
    add: window.electron.addPrintLog,
    update: window.electron.updatePrintLog,
    delete: window.electron.deletePrintLog,
  });

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filaments, setFilaments] = useState<FilamentSpool[]>([]);

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

  const handleFormSubmit = (log: PrintLogForm) => {
    handleSubmit(log as unknown as Omit<PrintLogModel, 'id'>);
  };

  return (
    <div>
      <h2>Print History</h2>
      <PrintLogForm
        onSubmit={handleFormSubmit}
        log={selectedLog}
        printers={printers}
        filaments={filaments}
      />
      <PrintLogList
        logs={logs}
        onEdit={setSelectedLog}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PrintHistory;
