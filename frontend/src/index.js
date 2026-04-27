import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import store from './store';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: "'Plus Jakarta Sans', sans-serif", borderRadius: '12px', fontSize: '14px' },
        success: { style: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' } },
        error: { style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' } },
      }} />
    </BrowserRouter>
  </Provider>
);
