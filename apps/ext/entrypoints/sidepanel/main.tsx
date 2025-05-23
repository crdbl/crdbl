import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../popup/App.tsx';
import '../popup/style.css';
import '../popup/App.css';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
