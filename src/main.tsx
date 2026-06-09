import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ThreeScene from './components/ThreeScene';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThreeScene />
    <App />
  </StrictMode>,
);
