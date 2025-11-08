import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './Dr-Samy-9087a8851cab06adaf5ff6adeb25b12681f40fc8/App';
import './Dr-Samy-9087a8851cab06adaf5ff6adeb25b12681f40fc8/index.css';

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