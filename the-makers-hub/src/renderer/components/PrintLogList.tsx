import React from 'react';
import { PrintLog } from '../../db/models';

interface Props {
  logs: PrintLog[];
  onEdit: (log: PrintLog) => void;
  onDelete: (id: number) => void;
}

const PrintLogList: React.FC<Props> = ({ logs, onEdit, onDelete }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Date</th>
          <th>Printer</th>
          <th>Filament</th>
          <th>Cost</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.id}>
            <td>{log.title}</td>
            <td>{new Date(log.date).toLocaleDateString()}</td>
            <td>{log.Printer?.name}</td>
            <td>{log.FilamentSpool?.manufacturer} {log.FilamentSpool?.materialType}</td>
            <td>${log.printCost?.toFixed(2)}</td>
            <td>
              <button onClick={() => onEdit(log)}>Edit</button>
              <button onClick={() => onDelete(log.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PrintLogList;
