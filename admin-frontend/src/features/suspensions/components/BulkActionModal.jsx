import React, { useState } from 'react';
import { AlertCircle, Calendar, FileText, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { suspensionsApi } from '../api/suspensionsApi';
import { toast } from 'react-hot-toast';

export const BulkActionModal = ({ isOpen, onClose, selectedUsers, onClearSelection }) => {
  const [duration, setDuration] = useState('7');
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const suspendMutation = useMutation({
    mutationFn: suspensionsApi.bulkSuspend,
    onSuccess: () => {
      toast.success(`Successfully suspended ${selectedUsers.length} users`);
      queryClient.invalidateQueries({ queryKey: ['suspensions'] });
      onClearSelection();
      onClose();
    },
    onError: () => {
      toast.error('Failed to apply bulk suspension');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-white">Bulk Suspend Users</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <p className="text-sm text-slate-300">
              You are about to suspend <span className="font-bold text-white">{selectedUsers.length}</span> users. 
              This action will instantly invalidate their sessions.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" /> Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" /> Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Coordinated Terms Violation"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => suspendMutation.mutate({ userIds: selectedUsers, durationDays: parseInt(duration), reason })}
            disabled={!reason || suspendMutation.isPending}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {suspendMutation.isPending ? 'Applying...' : 'Confirm Suspension'}
          </button>
        </div>
      </div>
    </div>
  );
};
