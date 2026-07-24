import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initPWA } from './sw-register';
import './assets/styles/ai-animations.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (!window.__PWA_INITIALIZED__) {
  window.__PWA_INITIALIZED__ = true;
  initPWA();
}