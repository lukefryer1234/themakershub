import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './renderer/App';
import './index.css';
import './renderer/styles/main.css';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
