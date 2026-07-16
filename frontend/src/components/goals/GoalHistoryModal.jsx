import React, { useEffect, useState } from 'react';
import { X, Clock, ArrowRight } from 'lucide-react';
import GoalService from '../../services/GoalService';
import toast from 'react-hot-toast';

const GoalHistoryModal = ({ goalId, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [goalId]);

  const fetchHistory = async () => {
    try {
      const data = await GoalService.getGoalHistory(goalId);
      setHistory(data);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ACHIEVED': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'FAILED': return 'text-red-700 bg-red-50 border-red-200';
      case 'PAUSED': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'CANCELLED': return 'text-slate-700 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Goal History</h2>
            <p className="text-sm text-slate-500 mt-1">Audit trail of status changes</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-8 text-slate-500">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No history available for this goal.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((record, index) => (
                <div key={record.id} className="relative flex gap-4">
                  {/* Timeline connecting line */}
                  {index !== history.length - 1 && (
                    <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-0.5 bg-slate-200"></div>
                  )}
                  
                  <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-500">
                    <Clock className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getStatusColor(record.previousStatus)}`}>
                        {record.previousStatus.replace('_', ' ')}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getStatusColor(record.newStatus)}`}>
                        {record.newStatus.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {record.changeReason && (
                      <p className="text-sm text-slate-700 italic border-l-2 border-slate-300 pl-3 my-2">
                        "{record.changeReason}"
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(record.changedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalHistoryModal;
