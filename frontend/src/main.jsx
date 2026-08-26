import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// Load only the Latin subset to avoid bundling 100+ woff files for unused locales
import '@fontsource/roboto/latin-300.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import 'react-phone-number-input/style.css';
import './index.css';
import './i18n';
import { registerSW } from 'virtual:pwa-register';

// Auto-register service worker
registerSW({ immediate: true });

import GlobalErrorBoundary from './components/common/GlobalErrorBoundary';

const InitialFallback = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
    <div className="text-sm font-medium text-slate-300">Loading Carbon Platform...</div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <Suspense fallback={<InitialFallback />}>
        <App />
      </Suspense>
    </GlobalErrorBoundary>
  </React.StrictMode>,
);

