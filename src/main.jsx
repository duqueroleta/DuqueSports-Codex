import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SearchProvider>
        <ToastProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </ToastProvider>
      </SearchProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
