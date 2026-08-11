import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Check if already dismissed
      if (localStorage.getItem('pwaPromptDismissed') !== 'true') {
        setIsVisible(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
      localStorage.setItem('pwaPromptDismissed', 'true');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-white shadow-2xl rounded-xl p-4 border border-emerald-100 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex gap-3 items-start">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Install CarbonApp</h3>
          <p className="text-xs text-slate-500 mt-1">Install our app for a faster experience and offline activity logging.</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <button onClick={handleDismiss} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-md transition-colors">
          Not Now
        </button>
        <button onClick={handleInstall} className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors">
          Install App
        </button>
      </div>
    </div>
  );
};
