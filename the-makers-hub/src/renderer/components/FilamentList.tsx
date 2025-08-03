import React, { useState, useMemo } from 'react';
import { FilamentSpool } from '../../db/models';

interface Props {
  filaments: FilamentSpool[];
  onEdit: (filament: FilamentSpool) => void;
  onDelete: (id: number) => void;
}

const FilamentList: React.FC<Props> = ({ filaments, onEdit, onDelete }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof FilamentSpool; direction: 'ascending' | 'descending' } | null>(null);
  const [filter, setFilter] = useState('');

  const sortedFilaments = useMemo(() => {
    const sortableItems = [...filaments];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filaments, sortConfig]);

  const filteredFilaments = sortedFilaments.filter((filament) =>
    Object.values(filament).some((value) =>
      String(value).toLowerCase().includes(filter.toLowerCase())
    )
  );

  const requestSort = (key: keyof FilamentSpool) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Filter..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th onClick={() => requestSort('manufacturer')}>Manufacturer</th>
            <th onClick={() => requestSort('materialType')}>Material</th>
            <th onClick={() => requestSort('color')}>Color</th>
            <th onClick={() => requestSort('spoolWeight')}>Spool Weight (g)</th>
            <th onClick={() => requestSort('remainingWeight')}>Remaining (g)</th>
            <th onClick={() => requestSort('purchasePrice')}>Price</th>
            <th onClick={() => requestSort('purchaseDate')}>Purchase Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFilaments.map((filament) => (
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
    </div>
  );
};

export default FilamentList;
