import React from 'react';
import { DryBox } from '../../db/models';
import DryBoxList from './DryBoxList';
import DryBoxForm from './DryBoxForm';
import { useCrud } from '../hooks/useCrud';

const DesiccantTracker = () => {
  const {
    items: dryBoxes,
    setItems: setDryBoxes,
    selectedItem: selectedDryBox,
    setSelectedItem: setSelectedDryBox,
    handleSubmit,
    handleDelete,
  } = useCrud<DryBox>({
    getAll: window.electron.getDryBoxes,
    add: window.electron.addDryBox,
    update: window.electron.updateDryBox,
    delete: window.electron.deleteDryBox,
  });

  const handleRecharge = async (id: number) => {
    await window.electron.rechargeDryBox(id);
    const updatedDryBoxes = await window.electron.getDryBoxes();
    setDryBoxes(updatedDryBoxes);
  };

  return (
    <div>
      <h2>Desiccant Tracker</h2>
      <DryBoxForm onSubmit={handleSubmit} dryBox={selectedDryBox} />
      <DryBoxList
        dryBoxes={dryBoxes}
        onEdit={setSelectedDryBox}
        onDelete={handleDelete}
        onRecharge={handleRecharge}
      />
    </div>
  );
};

export default DesiccantTracker;
