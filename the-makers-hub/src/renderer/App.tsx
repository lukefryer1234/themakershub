import React, { useState, useEffect } from 'react';
import { FilamentSpool } from '../db/models';
import FilamentList from './components/FilamentList';
import FilamentForm from './components/FilamentForm';
import DesiccantTracker from './components/DesiccantTracker';
import PrinterManager from './components/PrinterManager';
import PrintFailureLog from './components/PrintFailureLog';

const App = () => {
  const [filaments, setFilaments] = useState<FilamentSpool[]>([]);
  const [selectedFilament, setSelectedFilament] = useState<FilamentSpool | undefined>(undefined);

  const fetchFilaments = () => {
    window.electron.getFilaments().then(setFilaments);
  };

  useEffect(() => {
    fetchFilaments();
  }, []);

  const handleAdd = async (filament: Omit<FilamentSpool, 'id'>) => {
    await window.electron.addFilament(filament);
    fetchFilaments();
  };

  const handleUpdate = async (filament: FilamentSpool) => {
    await window.electron.updateFilament(filament);
    setSelectedFilament(undefined);
    fetchFilaments();
  };

  const handleDelete = async (id: number) => {
    await window.electron.deleteFilament(id);
    fetchFilaments();
  };

  const handleSubmit = (filament: Omit<FilamentSpool, 'id'>) => {
    if (selectedFilament) {
      handleUpdate({ ...filament, id: selectedFilament.id });
    } else {
      handleAdd(filament);
    }
  };

  return (
    <div>
      <h1>Filament Inventory</h1>
      <FilamentForm onSubmit={handleSubmit} filament={selectedFilament} />
      <FilamentList
        filaments={filaments}
        onEdit={setSelectedFilament}
        onDelete={handleDelete}
      />
      <hr />
      <DesiccantTracker />
      <hr />
      <PrinterManager />
      <hr />
      <PrintFailureLog />
    </div>
  );
};

export default App;
