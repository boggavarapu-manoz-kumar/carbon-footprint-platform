import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

export const SuspensionFilters = ({ filters, onFilterChange }) => {
  const STATUS_OPTIONS = ['All', 'Active', 'Expired', 'Permanent', 'Revoked'];
  const DATE_OPTIONS = ['All Time', 'Today', 'This Week', 'This Month'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Filter */}
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-slate-400">Status</label>
          <div className="flex bg-slate-950 p-1 rounded-lg">
            {STATUS_OPTIONS.map(status => (
              <button
                key={status}
                onClick={() => onFilterChange('status', status)}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filters.status === status
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div className="w-full sm:w-48 space-y-1">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange('dateRange', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
          >
            {DATE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
