import React, { useState, useEffect } from 'react';
import { Printer } from '../../db/models';
import PrinterList from './PrinterList';
import PrinterForm from './PrinterForm';

const PrinterManager = () => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | undefined>(undefined);

  const fetchPrinters = () => {
    window.electron.getPrinters().then(setPrinters);
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  const handleAdd = async (printer: Omit<Printer, 'id'>) => {
    await window.electron.addPrinter(printer);
    fetchPrinters();
  };

  const handleUpdate = async (printer: Omit<Printer, 'id'>) => {
    if (selectedPrinter) {
      await window.electron.updatePrinter({ ...selectedPrinter, ...printer });
      setSelectedPrinter(undefined);
      fetchPrinters();
    }
  };

  const handleDelete = async (id: number) => {
    await window.electron.deletePrinter(id);
    fetchPrinters();
  };

  const handleSubmit = (printer: Omit<Printer, 'id'>) => {
    if (selectedPrinter) {
      handleUpdate(printer);
    } else {
      handleAdd(printer);
    }
  };

  return (
    <div>
      <h2>Printer Manager</h2>
      <PrinterForm onSubmit={handleSubmit} printer={selectedPrinter} />
      <PrinterList
        printers={printers}
        onEdit={setSelectedPrinter}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PrinterManager;
