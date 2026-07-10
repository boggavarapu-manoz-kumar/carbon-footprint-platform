import React, { useState } from 'react';
import { X, AlertTriangle, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usersApi } from '../api/usersApi';

import { toast } from 'react-hot-toast';

export const SuspensionModal = ({ user, onClose }) => {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('POLICY_VIOLATION');
  const [duration, setDuration] = useState('7');
  const [description, setDescription] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await usersApi.suspendUser(user.id, {
        reason,
        description,
        evidenceNotes,
        durationDays: parseInt(duration, 10),
        customEndDate: null
      });
      toast.success('User suspended successfully');
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminUser', user.id]);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error suspending user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-red-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Suspend User</h2>
              <p className="text-xs text-gray-500">
                {user?.firstName} {user?.lastName} ({user?.email})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="suspensionForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Reason for Suspension</label>
              <select 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
              >
                <option value="POLICY_VIOLATION">Policy Violation</option>
                <option value="FRAUDULENT_ACTIVITY">Fraudulent Activity</option>
                <option value="HARASSMENT">Harassment</option>
                <option value="SPAM">Spam</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
              >
                <option value="1">1 Day</option>
                <option value="3">3 Days</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="36500">Permanent</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Provide specific details about the violation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm resize-none"
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Evidence Notes / Internal Links (Optional)</label>
              <textarea 
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                rows={2}
                placeholder="Links to audit logs, reports, or internal tickets..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm resize-none"
              ></textarea>
            </div>
            
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="suspensionForm"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 flex items-center gap-2"
          >
            {isSubmitting ? 'Suspending...' : 'Suspend User'}
          </button>
        </div>

      </div>
    </div>
  );
};
