// index.tsx

import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const removeLoader = () => {
  const loader = document.querySelector('.initial-loader');
  if (loader) {
    loader.addEventListener('transitionend', () => loader.remove());
    loader.style.opacity = '0';
  }
};

// Use a root component to handle side effects like removing the loader
function Root() {
  useEffect(() => {
    removeLoader(); // Remove the loader once the component is mounted
  }, []);

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
