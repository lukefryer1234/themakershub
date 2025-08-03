import React from 'react';
import { Printer } from '../../db/models';
import PrinterList from './PrinterList';
import PrinterForm from './PrinterForm';
import { useCrud } from '../hooks/useCrud';

const PrinterManager = () => {
  const {
    items: printers,
    selectedItem: selectedPrinter,
    setSelectedItem: setSelectedPrinter,
    handleSubmit,
    handleDelete,
  } = useCrud<Printer>({
    getAll: window.electron.getPrinters,
    add: window.electron.addPrinter,
    update: window.electron.updatePrinter,
    delete: window.electron.deletePrinter,
  });

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
