
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// registerSW is injected by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Use the PWA helper to manage updates and offline-ready notifications
const updateSW = registerSW({
  onNeedRefresh() {
    // notify app that an update is available
    window.dispatchEvent(new CustomEvent('sw-update'));
  },
  onOfflineReady() {
    window.dispatchEvent(new CustomEvent('sw-offline-ready'));
  }
});
// expose update function (call with true to reload after update)
(window as any).__updatePWA = updateSW;
