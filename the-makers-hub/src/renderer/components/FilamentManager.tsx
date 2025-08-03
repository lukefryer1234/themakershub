import React, { useState, useEffect } from 'react';
import { FilamentSpool } from '../../db/models';
import FilamentList from './FilamentList';
import FilamentForm from './FilamentForm';

const FilamentManager = () => {
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
      <h2>Filament Inventory</h2>
      <FilamentForm onSubmit={handleSubmit} filament={selectedFilament} />
      <FilamentList
        filaments={filaments}
        onEdit={setSelectedFilament}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default FilamentManager;
