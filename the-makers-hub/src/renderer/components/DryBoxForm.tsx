import React, { useState, useEffect } from 'react';
import { DryBox } from '../../db/models';

interface Props {
  dryBox?: DryBox;
  onSubmit: (dryBox: Omit<DryBox, 'id' | 'lastRecharged'>) => void;
}

const DryBoxForm: React.FC<Props> = ({ dryBox, onSubmit }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (dryBox) {
      setName(dryBox.name);
    }
  }, [dryBox]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
    setName('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Dry Box Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit">{dryBox ? 'Update' : 'Add'} Dry Box</button>
    </form>
  );
};

export default DryBoxForm;
