import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';

export const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('Route Error:', error);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
        <p className="text-gray-500 mb-8">
          {error?.statusText || error?.message || "An unexpected error occurred while loading this page."}
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left overflow-auto max-h-40 border border-gray-100">
          <code className="text-sm text-red-600 block whitespace-pre-wrap font-mono">
            {error?.stack || 'No stack trace available'}
          </code>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors focus:ring-4 focus:ring-gray-100"
          >
            <RefreshCcw className="w-5 h-5 mr-2" />
            Reload Page
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm focus:ring-4 focus:ring-indigo-100"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
