import React, { useState } from 'react';
import FilamentManager from './components/FilamentManager';
import DesiccantTracker from './components/DesiccantTracker';
import PrinterManager from './components/PrinterManager';
import PrintFailureLog from './components/PrintFailureLog';
import Settings from './components/Settings';
import Shop from './components/Shop';

const App = () => {
  const [activeTab, setActiveTab] = useState('filaments');

  const renderTab = () => {
    switch (activeTab) {
      case 'filaments':
        return <FilamentManager />;
      case 'desiccant':
        return <DesiccantTracker />;
      case 'printers':
        return <PrinterManager />;
      case 'failures':
        return <PrintFailureLog />;
      case 'shop':
        return <Shop />;
      case 'settings':
        return <Settings />;
      default:
        return <FilamentManager />;
    }
  };

  return (
    <div className="app-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('filaments')} className={activeTab === 'filaments' ? 'active' : ''}>Filament Inventory</button>
        <button onClick={() => setActiveTab('desiccant')} className={activeTab === 'desiccant' ? 'active' : ''}>Desiccant Tracker</button>
        <button onClick={() => setActiveTab('printers')} className={activeTab === 'printers' ? 'active' : ''}>Printer Manager</button>
        <button onClick={() => setActiveTab('failures')} className={activeTab === 'failures' ? 'active' : ''}>Failure Log</button>
        <button onClick={() => setActiveTab('shop')} className={activeTab === 'shop' ? 'active' : ''}>Shop</button>
        <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>Settings</button>
      </div>
      <div className="tab-content">
        {renderTab()}
      </div>
    </div>
  );
};

export default App;
