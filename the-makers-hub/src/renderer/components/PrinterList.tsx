import React from 'react';
import { Printer } from '../../db/models';

interface Props {
  printers: Printer[];
  onEdit: (printer: Printer) => void;
  onDelete: (id: number) => void;
}

const PrinterList: React.FC<Props> = ({ printers, onEdit, onDelete }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Model</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {printers.map((printer) => (
          <tr key={printer.id}>
            <td>{printer.name}</td>
            <td>{printer.model}</td>
            <td>
              <button onClick={() => onEdit(printer)}>Edit</button>
              <button onClick={() => onDelete(printer.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PrinterList;
