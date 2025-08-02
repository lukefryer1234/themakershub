import React, { useState, useEffect } from 'react';
import { FilamentSpool } from '../../db/models';

interface Props {
  filament?: FilamentSpool;
  onSubmit: (filament: Omit<FilamentSpool, 'id'>) => void;
}

const FilamentForm: React.FC<Props> = ({ filament, onSubmit }) => {
  const [manufacturer, setManufacturer] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [color, setColor] = useState('');
  const [spoolWeight, setSpoolWeight] = useState(1000);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [remainingWeight, setRemainingWeight] = useState(1000);

  useEffect(() => {
    if (filament) {
      setManufacturer(filament.manufacturer);
      setMaterialType(filament.materialType);
      setColor(filament.color);
      setSpoolWeight(filament.spoolWeight);
      setPurchasePrice(filament.purchasePrice);
      setPurchaseDate(filament.purchaseDate);
      setRemainingWeight(filament.remainingWeight);
    }
  }, [filament]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      manufacturer,
      materialType,
      color,
      spoolWeight,
      purchasePrice,
      purchaseDate,
      remainingWeight,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Manufacturer"
        value={manufacturer}
        onChange={(e) => setManufacturer(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Material Type"
        value={materialType}
        onChange={(e) => setMaterialType(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Spool Weight (g)"
        value={spoolWeight}
        onChange={(e) => setSpoolWeight(parseInt(e.target.value))}
        required
      />
      <input
        type="number"
        placeholder="Remaining Weight (g)"
        value={remainingWeight}
        onChange={(e) => setRemainingWeight(parseInt(e.target.value))}
        required
      />
      <input
        type="number"
        placeholder="Purchase Price"
        value={purchasePrice}
        onChange={(e) => setPurchasePrice(parseFloat(e.target.value))}
        required
      />
      <input
        type="date"
        placeholder="Purchase Date"
        value={purchaseDate.toISOString().split('T')[0]}
        onChange={(e) => setPurchaseDate(new Date(e.target.value))}
        required
      />
      <button type="submit">{filament ? 'Update' : 'Add'} Filament</button>
    </form>
  );
};

export default FilamentForm;
