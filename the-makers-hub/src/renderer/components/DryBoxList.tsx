import React from 'react';
import { DryBox } from '../../db/models';

interface Props {
  dryBoxes: DryBox[];
  onEdit: (dryBox: DryBox) => void;
  onDelete: (id: number) => void;
  onRecharge: (id: number) => void;
}

const DryBoxList: React.FC<Props> = ({ dryBoxes, onEdit, onDelete, onRecharge }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Last Recharged</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {dryBoxes.map((dryBox) => (
          <tr key={dryBox.id}>
            <td>{dryBox.name}</td>
            <td>{new Date(dryBox.lastRecharged).toLocaleDateString()}</td>
            <td>
              <button onClick={() => onEdit(dryBox)}>Edit</button>
              <button onClick={() => onDelete(dryBox.id)}>Delete</button>
              <button onClick={() => onRecharge(dryBox.id)}>Recharge</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DryBoxList;
