import React from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

export const SuspensionList = ({ 
  suspensions, 
  isLoading, 
  selectedUsers, 
  onToggleSelect, 
  onToggleAll,
  onViewHistory
}) => {
  if (isLoading) {
    return <div className="text-center py-12 text-slate-400">Loading suspensions...</div>;
  }

  if (!suspensions?.length) {
    return (
      <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
        <Shield className="w-12 h-12 text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-1">No Suspensions Found</h3>
        <p className="text-slate-400 text-sm">Adjust your filters to view more records.</p>
      </div>
    );
  }

  const allSelected = suspensions.length > 0 && selectedUsers.length === suspensions.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleAll(e.target.checked, suspensions)}
                  className="rounded bg-slate-800 border-slate-700 text-primary-500 focus:ring-primary-500/20"
                />
              </th>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Reason</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Start Date</th>
              <th className="px-6 py-4 font-medium">End Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {suspensions.map((suspension) => (
              <tr key={suspension.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(suspension.userId)}
                    onChange={() => onToggleSelect(suspension.userId)}
                    className="rounded bg-slate-800 border-slate-700 text-primary-500 focus:ring-primary-500/20"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center font-bold text-primary-300 text-sm shrink-0">
                      {suspension.firstName ? suspension.firstName[0].toUpperCase() : '#'}
                      {suspension.lastName ? suspension.lastName[0].toUpperCase() : ''}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {suspension.firstName || suspension.lastName
                          ? `${suspension.firstName || ''} ${suspension.lastName || ''}`.trim()
                          : suspension.username || `User #${suspension.userId}`}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {suspension.email || '—'}
                      </p>
                      {suspension.username && (
                        <p className="text-xs text-slate-500 truncate">@{suspension.username}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300 max-w-xs truncate" title={suspension.reason}>
                  {suspension.reason}
                </td>
                <td className="px-6 py-4">
                  {suspension.active ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : suspension.revokedDate ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="w-3.5 h-3.5" /> Revoked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      <Clock className="w-3.5 h-3.5" /> Expired
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {format(new Date(suspension.startDate), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {suspension.endDate ? format(new Date(suspension.endDate), 'MMM d, yyyy HH:mm') : 'Permanent'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onViewHistory(suspension.userId)}
                      className="text-xs font-medium text-primary-400 hover:text-primary-300 px-2 py-1 rounded hover:bg-primary-500/10 transition-colors"
                    >
                      View History
                    </button>
                    <button className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
