import React, { useState, useEffect } from 'react';
import { FilamentSpool } from '../../db/models';
import QRCodeScanner from './QRCodeScanner';

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
  }) => void;
}

const FilamentForm: React.FC<Props> = ({ filament, onSubmit }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [manufacturer, setManufacturer] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [color, setColor] = useState('');
  const [spoolWeight, setSpoolWeight] = useState(1000);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [remainingWeight, setRemainingWeight] = useState(1000);
  const [density, setDensity] = useState(1.24);

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
    });
  };

  const handleScan = (data: string | null) => {
    if (data) {
      try {
        const scannedData = JSON.parse(data);
        setManufacturer(scannedData.manufacturer || '');
        setMaterialType(scannedData.materialType || '');
        setColor(scannedData.color || '');
        setSpoolWeight(scannedData.spoolWeight || 1000);
        setPurchasePrice(scannedData.purchasePrice || 0);
        setPurchaseDate(new Date(scannedData.purchaseDate) || new Date());
        setRemainingWeight(scannedData.remainingWeight || 1000);
        setDensity(scannedData.density || 1.24);
      } catch (error) {
        console.error('Failed to parse QR code data:', error);
      }
    }
    setShowScanner(false);
  };

  return (
    <div>
      <button type="button" onClick={() => setShowScanner(!showScanner)}>
        {showScanner ? 'Close Scanner' : 'Scan QR Code'}
      </button>
      {showScanner && <QRCodeScanner onScan={handleScan} />}
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
        <button type="submit">{filament ? 'Update' : 'Add'} Filament</button>
      </form>
    </div>
  );
};

export default FilamentForm;
