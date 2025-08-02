import React from 'react';
import { FilamentSpool } from '../../db/models';

interface Props {
  filaments: FilamentSpool[];
  onEdit: (filament: FilamentSpool) => void;
  onDelete: (id: number) => void;
}

const FilamentList: React.FC<Props> = ({ filaments, onEdit, onDelete }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Manufacturer</th>
          <th>Material</th>
          <th>Color</th>
          <th>Spool Weight (g)</th>
          <th>Remaining (g)</th>
          <th>Price</th>
          <th>Purchase Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filaments.map((filament) => (
          <tr key={filament.id}>
            <td>{filament.manufacturer}</td>
            <td>{filament.materialType}</td>
            <td>{filament.color}</td>
            <td>{filament.spoolWeight}</td>
            <td>{filament.remainingWeight}</td>
            <td>{filament.purchasePrice}</td>
            <td>{new Date(filament.purchaseDate).toLocaleDateString()}</td>
            <td>
              <button onClick={() => onEdit(filament)}>Edit</button>
              <button onClick={() => onDelete(filament.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FilamentList;
