import { useState, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Download, Calendar, Filter, Eye, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { auditApi } from '../api/auditApi';
import { AuditDrawer } from './AuditDrawer';
import { Button } from '../../../components/ui/Button';

// ── Status badge helper ──────────────────────────────────────────────────────
const getStatusColor = (status) => {
  switch(status) {
    case 'SUCCESS': return 'text-green-700 bg-green-50 border-green-200';
    case 'WARNING': return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'FAILED': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

// ── Skeleton row for loading ─────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[1,2,3,4,5,6].map(i => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

export const AuditList = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const parentRef = useRef(null);

  const PAGE_SIZE = 20;

  const { data: logsPage, isLoading, isError } = useQuery({
    queryKey: ['audit-logs', search, page],
    queryFn: () => auditApi.getLogs({ search, page, size: PAGE_SIZE }),
    keepPreviousData: true,
    staleTime: 30000,
  });

  const logs = logsPage?.content || [];
  const totalElements = logsPage?.totalElements || 0;
  const totalPages = logsPage?.totalPages || 0;

  const rowVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // 48px height (h-12)
    overscan: 5,
  });

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const startItem = page * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE + logs.length, totalElements);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Security Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Immutable ledger of all platform administrative and security events.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="hidden sm:flex" onClick={() => auditApi.exportLogs().then(() => {})}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Control Bar (Filters & Search) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Debounced Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Event ID, IP, or Actor..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" className="shrink-0">Search</Button>
          </form>

          {/* Date & Filters */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <select className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
                <option>All Time</option>
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <Button variant="secondary">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          Failed to load audit logs. Please check your connection or try refreshing.
        </div>
      )}

      {/* Forensic Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[580px]">
        <div ref={parentRef} className="overflow-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-20">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp (UTC)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Event ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No logs found</p>
                    {search && (
                      <p className="text-xs text-gray-400 mt-1">
                        No results for "{search}".
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                <>
                  {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }}></tr>
                  )}
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const log = logs[virtualRow.index];
                    return (
                      <tr 
                        key={virtualRow.key} 
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group h-12"
                        onClick={() => handleRowClick(log)}
                      >
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-mono text-gray-500">
                          {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold font-mono text-gray-900">
                          {log.action}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider ${getStatusColor(log.status)}`}>
                            {log.status || 'SUCCESS'}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-mono text-gray-600">
                          {log.actor}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-mono text-gray-500">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-mono text-gray-400 text-right group-hover:text-primary-600 transition-colors">
                          <div className="flex items-center justify-end gap-2">
                            <span className="truncate w-24">{log.id}</span>
                            <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tr style={{ height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0)}px` }}></tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {isLoading ? 'Loading…' : totalElements === 0 ? 'No results' : (
              <>Showing <span className="font-semibold">{startItem}</span>–<span className="font-semibold">{endItem}</span> of <span className="font-semibold">{totalElements.toLocaleString()}</span> records</>
            )}
          </p>
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="p-2 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700 border border-gray-200 rounded-md bg-white">
              {page + 1} / {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
              className="p-2 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>

      <AuditDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        log={selectedLog} 
      />
    </div>
  );
};
