import React, { useState, useEffect } from 'react';
import ActivityService from '../services/ActivityService';
import toast from 'react-hot-toast';

const ActivityModal = ({ isOpen, onClose, activity, mode, onSave }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    logDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activity) {
      setFormData({
        quantity: activity.quantity || '',
        logDate: activity.logDate || '',
      });
    }
  }, [activity]);

  if (!isOpen || !activity) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'view') {
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        category: activity.category,
        activityType: activity.activityType,
        unit: activity.unit,
        quantity: parseFloat(formData.quantity),
        logDate: formData.logDate
      };
      await ActivityService.updateActivity(activity.id, payload);
      toast.success('Activity updated successfully');
      onSave(); // Refresh the list
      onClose();
    } catch (err) {
      console.error('Failed to update activity:', err);
      toast.error('Failed to update activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">
            {mode === 'view' ? 'View Activity' : 'Edit Activity'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div>
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-1">{activity.category}</p>
              <p className="text-lg font-semibold text-slate-900">{activity.activityType}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Impact</p>
              <p className="text-xl font-bold text-emerald-700">{activity.emissionValue.toFixed(2)} kg</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">Quantity ({activity.unit})</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                disabled={mode === 'view'}
                step="any"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label htmlFor="logDate" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                id="logDate"
                name="logDate"
                value={formData.logDate}
                onChange={handleChange}
                disabled={mode === 'view'}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {mode === 'view' ? 'Close' : 'Cancel'}
              </button>
              {mode === 'edit' && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-70 flex items-center justify-center min-w-[100px]"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
