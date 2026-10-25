import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initGlobalHaptics } from './utils/haptics';
import { initBackButtonHandler } from './utils/backButtonHandler';
import { installConsoleSanitizer } from './utils/privacySanitizer';

// Initialize Global Console Privacy Sanitizer (masks customer PII like phone, email, name in console)
installConsoleSanitizer();

// Initialize Android & Touch Haptics Engine
initGlobalHaptics();

// Initialize Android Hardware & Browser Back Button Interceptor
initBackButtonHandler();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);