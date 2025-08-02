import React from 'react';
import { PrintFailureLog } from '../../db/models';

interface Props {
  logs: PrintFailureLog[];
  onEdit: (log: PrintFailureLog) => void;
  onDelete: (id: number) => void;
}

const PrintFailureList: React.FC<Props> = ({ logs, onEdit, onDelete }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Date</th>
          <th>Printer</th>
          <th>Filament</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.id}>
            <td>{log.title}</td>
            <td>{new Date(log.dateOfFailure).toLocaleDateString()}</td>
            <td>{log.Printer?.name}</td>
            <td>{log.FilamentSpool?.manufacturer} {log.FilamentSpool?.materialType}</td>
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

export default PrintFailureList;
