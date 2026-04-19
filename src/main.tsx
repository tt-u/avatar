import { Buffer } from 'buffer';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import './globals.css';

if (!('Buffer' in globalThis)) {
  Object.assign(globalThis, { Buffer });
}

const root = document.getElementById('root');

if (!(root instanceof HTMLElement)) {
  throw new Error('Missing #root element');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
