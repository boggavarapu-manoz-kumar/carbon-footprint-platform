import { useState } from 'react';
import { X, Copy, CheckCircle2, AlertTriangle, ShieldAlert, Terminal } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../../components/ui/Button';

export const AuditDrawer = ({ log, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'FAILED': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      default: return <Terminal className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg transform bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-x-2">
            {getStatusIcon(log.status)}
            <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Summary Section */}
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold font-mono tracking-tight text-gray-900">{log.action}</h3>
                <p className="text-sm text-gray-500 mt-1">{format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss.SSS')}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                log.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {log.status}
              </span>
            </div>

            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Actor ID</dt>
                <dd className="mt-1 text-sm font-mono text-gray-900 break-all">{log.actor}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Target Resource</dt>
                <dd className="mt-1 text-sm font-mono text-gray-900 break-all">{log.resourceId || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-900">{log.ipAddress}</span>
                  <button onClick={() => handleCopy(log.ipAddress)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Event ID</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-900">{log.id}</span>
                  <button onClick={() => handleCopy(log.id)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </dd>
              </div>
            </dl>
          </div>

          {/* Raw JSON Payload */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Raw Payload</h4>
              <button 
                onClick={() => handleCopy(JSON.stringify(log, null, 2))}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 focus:outline-none"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner">
              <pre className="text-xs font-mono text-green-400 leading-relaxed">
                {JSON.stringify(log, null, 2)}
              </pre>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close Inspection
          </Button>
        </div>
      </div>
    </>
  );
};
