import React, { useState, useEffect } from 'react';
import { DryBox } from '../../db/models';
import DryBoxList from './DryBoxList';
import DryBoxForm from './DryBoxForm';

const DesiccantTracker = () => {
  const [dryBoxes, setDryBoxes] = useState<DryBox[]>([]);
  const [selectedDryBox, setSelectedDryBox] = useState<DryBox | undefined>(undefined);

  const fetchDryBoxes = () => {
    window.electron.getDryBoxes().then(setDryBoxes);
  };

  useEffect(() => {
    fetchDryBoxes();
  }, []);

  const handleAdd = async (dryBox: Omit<DryBox, 'id' | 'lastRecharged'>) => {
    await window.electron.addDryBox({ ...dryBox, lastRecharged: new Date() });
    fetchDryBoxes();
  };

  const handleUpdate = async (dryBox: Omit<DryBox, 'id' | 'lastRecharged'>) => {
    if (selectedDryBox) {
      await window.electron.updateDryBox({ ...selectedDryBox, ...dryBox });
      setSelectedDryBox(undefined);
      fetchDryBoxes();
    }
  };

  const handleDelete = async (id: number) => {
    await window.electron.deleteDryBox(id);
    fetchDryBoxes();
  };

  const handleRecharge = async (id: number) => {
    await window.electron.rechargeDryBox(id);
    fetchDryBoxes();
  };

  const handleSubmit = (dryBox: Omit<DryBox, 'id' | 'lastRecharged'>) => {
    if (selectedDryBox) {
      handleUpdate(dryBox);
    } else {
      handleAdd(dryBox);
    }
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
