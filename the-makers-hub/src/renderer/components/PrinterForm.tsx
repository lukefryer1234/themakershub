import React, { useState, useEffect } from 'react';
import { Printer } from '../../db/models';

interface Props {
  printer?: Printer;
  onSubmit: (printer: { name: string; model: string }) => void;
}

const PrinterForm: React.FC<Props> = ({ printer, onSubmit }) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');

  useEffect(() => {
    if (printer) {
      setName(printer.name);
      setModel(printer.model);
    }
  }, [printer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, model });
    setName('');
    setModel('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Printer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Printer Model"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        required
      />
      <button type="submit">{printer ? 'Update' : 'Add'} Printer</button>
    </form>
  );
};

export default PrinterForm;
