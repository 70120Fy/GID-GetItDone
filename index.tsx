
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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

// Register service worker only in production build to avoid SW issues in dev
if ((import.meta as any).env?.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    const updateSW = registerSW({
      onNeedRefresh() {
        window.dispatchEvent(new CustomEvent('sw-update'));
      },
      onOfflineReady() {
        window.dispatchEvent(new CustomEvent('sw-offline-ready'));
      }
    });
    (window as any).__updatePWA = updateSW;
  }).catch(err => {
    console.warn('PWA register failed', err);
  });
}
