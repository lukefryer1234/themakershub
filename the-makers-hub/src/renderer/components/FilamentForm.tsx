import React, { useState, useEffect } from 'react';
import { FilamentSpool } from '../../db/models';

interface Props {
  filament?: FilamentSpool;
  onSubmit: (filament: {
    manufacturer: string;
    materialType: string;
    color: string;
    spoolWeight: number;
    purchasePrice: number;
    purchaseDate: Date;
    remainingWeight: number;
    density: number;
    diameter: number;
  }) => void;
}

const FilamentForm: React.FC<Props> = ({ filament, onSubmit }) => {
  const [manufacturer, setManufacturer] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [color, setColor] = useState('');
  const [spoolWeight, setSpoolWeight] = useState(1000);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [remainingWeight, setRemainingWeight] = useState(1000);
  const [density, setDensity] = useState(1.24);
  const [diameter, setDiameter] = useState(1.75);

  useEffect(() => {
    if (filament) {
      setManufacturer(filament.manufacturer);
      setMaterialType(filament.materialType);
      setColor(filament.color);
      setSpoolWeight(filament.spoolWeight);
      setPurchasePrice(filament.purchasePrice);
      setPurchaseDate(filament.purchaseDate);
      setRemainingWeight(filament.remainingWeight);
      setDensity(filament.density);
      setDiameter(filament.diameter);
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
      density,
      diameter,
    });
  };

  return (
    <div>
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
        <input
          type="number"
          placeholder="Density (g/cm³)"
          value={density}
          onChange={(e) => setDensity(parseFloat(e.target.value))}
          required
        />
        <input
          type="number"
          placeholder="Diameter (mm)"
          value={diameter}
          onChange={(e) => setDiameter(parseFloat(e.target.value))}
          required
        />
        <button type="submit">{filament ? 'Update' : 'Add'} Filament</button>
      </form>
    </div>
  );
};

export default FilamentForm;
