import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize Telegram Web App
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  
  // Set header color to match theme
  if (window.Telegram.WebApp.themeParams?.bg_color) {
    window.Telegram.WebApp.setHeaderColor(window.Telegram.WebApp.themeParams.bg_color);
  }
  
  // Enable closing confirmation
  window.Telegram.WebApp.enableClosingConfirmation();
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Handle errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Service Worker registration (optional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}