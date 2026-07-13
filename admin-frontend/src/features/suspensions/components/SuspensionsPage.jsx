import React, { useState } from 'react';
import { ShieldAlert, Download, Ban } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { suspensionsApi } from '../api/suspensionsApi';
import { SuspensionFilters } from './SuspensionFilters';
import { SuspensionList } from './SuspensionList';
import { BulkActionModal } from './BulkActionModal';
import { SuspensionHistoryModal } from './SuspensionHistoryModal';

export default function SuspensionsPage() {
  const [filters, setFilters] = useState({
    status: 'All',
    dateRange: 'All Time'
  });
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isBulkModalOpen, setBulkModalOpen] = useState(false);
  const [historyUserId, setHistoryUserId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suspensions', filters],
    queryFn: () => suspensionsApi.getGlobalSuspensions({
      ...filters,
      page: 0,
      size: 50
    })
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleAll = (checked, suspensions) => {
    if (checked) {
      setSelectedUsers(suspensions.map(s => s.userId));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await suspensionsApi.exportSuspensions();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suspensions_export_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary-500" />
            Enterprise Suspension Management
          </h1>
          <p className="text-slate-400 mt-1">
            Global view of all user suspensions, audits, and bulk actions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setBulkModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-lg border border-red-500/20 transition-all"
            >
              <Ban className="w-4 h-4" />
              Bulk Suspend ({selectedUsers.length})
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <SuspensionFilters filters={filters} onFilterChange={handleFilterChange} />

      <SuspensionList
        suspensions={data?.content}
        isLoading={isLoading}
        selectedUsers={selectedUsers}
        onToggleSelect={toggleUserSelection}
        onToggleAll={toggleAll}
        onViewHistory={setHistoryUserId}
      />

      <BulkActionModal
        isOpen={isBulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        selectedUsers={selectedUsers}
        onClearSelection={() => setSelectedUsers([])}
      />

      <SuspensionHistoryModal 
        userId={historyUserId} 
        isOpen={!!historyUserId} 
        onClose={() => setHistoryUserId(null)} 
      />
    </div>
  );
}
