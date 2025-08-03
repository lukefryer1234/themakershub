import React from 'react';
import { FilamentSpool } from '../../db/models';
import FilamentList from './FilamentList';
import FilamentForm from './FilamentForm';
import { useCrud } from '../hooks/useCrud';

const FilamentManager = () => {
  const {
    items: filaments,
    selectedItem: selectedFilament,
    setSelectedItem: setSelectedFilament,
    handleSubmit,
    handleDelete,
  } = useCrud<FilamentSpool>({
    getAll: window.electron.getFilaments,
    add: window.electron.addFilament,
    update: window.electron.updateFilament,
    delete: window.electron.deleteFilament,
  });

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
