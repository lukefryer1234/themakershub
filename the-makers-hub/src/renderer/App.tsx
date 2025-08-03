import React from 'react';
import FilamentManager from './components/FilamentManager';
import DesiccantTracker from './components/DesiccantTracker';
import PrinterManager from './components/PrinterManager';
import PrintFailureLog from './components/PrintFailureLog';
import Settings from './components/Settings';
import Shop from './components/Shop';
import Tabs from './components/Tabs';

const App = () => {
  const tabs = [
    { label: 'Filament Inventory', content: <FilamentManager /> },
    { label: 'Desiccant Tracker', content: <DesiccantTracker /> },
    { label: 'Printer Manager', content: <PrinterManager /> },
    { label: 'Failure Log', content: <PrintFailureLog /> },
    { label: 'Shop', content: <Shop /> },
    { label: 'Settings', content: <Settings /> },
  ];

  return (
    <div className="app-container">
      <Tabs tabs={tabs} />
    </div>
  );
};

export default App;
