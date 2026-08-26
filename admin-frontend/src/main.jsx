import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n';
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary';

const InitialFallback = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
    <div className="text-sm font-medium text-slate-300">Loading Admin Portal...</div>
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <Suspense fallback={<InitialFallback />}>
        <App />
      </Suspense>
    </GlobalErrorBoundary>
  </StrictMode>,
)
