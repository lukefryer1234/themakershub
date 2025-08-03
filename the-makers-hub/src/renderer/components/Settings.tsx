import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [electricityCost, setElectricityCost] = useState('');
  const [printerPower, setPrinterPower] = useState('');

  useEffect(() => {
    window.electron.getSettings().then((settings) => {
      if (settings) {
        setElectricityCost(settings.electricityCost || '');
        setPrinterPower(settings.printerPower || '');
      }
    });
  }, []);

  const handleSave = () => {
    window.electron.setSettings({ electricityCost, printerPower });
  };

  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    const user = await window.electron.login();
    setUser(user);
  };

  const handleLogout = async () => {
    await window.electron.logout();
    setUser(null);
  };

  return (
    <div>
      <h2>Settings</h2>
      <form>
        <div>
          <label>Electricity Cost ($/kWh)</label>
          <input
            type="number"
            value={electricityCost}
            onChange={(e) => setElectricityCost(e.target.value)}
          />
        </div>
        <div>
          <label>Printer Power Consumption (Watts)</label>
          <input
            type="number"
            value={printerPower}
            onChange={(e) => setPrinterPower(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleSave}>Save Settings</button>
      </form>
      <hr />
      <div>
        <h2>Cloud Sync</h2>
        {user ? (
          <div>
            <p>Welcome, {user.name}!</p>
            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <p>Login to sync your data to the cloud.</p>
            <button type="button" onClick={handleLogin}>Login</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
