import React, { useState, useEffect } from 'react';
import { FilamentSpool } from '../../db/models';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardStats {
  successfulPrints: number;
  failedPrints: number;
  totalCost: number;
  lowFilaments: FilamentSpool[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    window.electron.getDashboardStats().then(setStats);
  }, []);

  if (!stats) {
    return <div>Loading...</div>;
  }

  const chartData = [
    { name: 'Prints', successful: stats.successfulPrints, failed: stats.failedPrints },
  ];

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <h3>Key Statistics</h3>
        <p>Successful Prints: {stats.successfulPrints}</p>
        <p>Failed Prints: {stats.failedPrints}</p>
        <p>Total Print Cost: ${stats.totalCost.toFixed(2)}</p>
      </div>
      <div>
        <h3>Print Success Rate</h3>
        <BarChart width={600} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="successful" fill="#82ca9d" />
          <Bar dataKey="failed" fill="#8884d8" />
        </BarChart>
      </div>
      <div>
        <h3>Low Filament Spools</h3>
        <ul>
          {stats.lowFilaments.map((filament) => (
            <li key={filament.id}>
              {filament.manufacturer} {filament.materialType} ({filament.color}) - {filament.remainingWeight}g remaining
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
