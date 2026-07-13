import { useState, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Filter, Download, MoreVertical, X, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { usersApi } from '../api/usersApi';
import { UserDrawer } from './UserDrawer';
import { Button } from '../../../components/ui/Button';
import { SuspensionModal } from './SuspensionModal';

// ── Status badge helper ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-orange-100 text-orange-800',
    LOCKED: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};

// ── Role badge helper ────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN: 'bg-purple-100 text-purple-800',
    SUPER_ADMIN: 'bg-red-100 text-red-800',
    USER: 'bg-blue-50 text-blue-700',
    MODERATOR: 'bg-yellow-100 text-yellow-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
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

// ── Main Component ───────────────────────────────────────────────────────────
export const UserList = () => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState(''); // debounced/committed search term
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const parentRef = useRef(null);

  const PAGE_SIZE = 20;

  // ── Primary list query ────────────────────────────────────────────────────
  const { data: usersPage, isLoading, isError } = useQuery({
    queryKey: ['users', search, statusFilter, page],
    queryFn: () => usersApi.getUsers({ search, page, size: PAGE_SIZE }),
    keepPreviousData: true,
    staleTime: 30000,
  });

  const users = usersPage?.content || [];
  const totalElements = usersPage?.totalElements || 0;
  const totalPages = usersPage?.totalPages || 0;

  // ── Virtualizer for large lists ───────────────────────────────────────────
  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  // ── Suspend mutation ──────────────────────────────────────────────────────
  const suspendMutation = useMutation({
    mutationFn: (userId) => usersApi.suspendUser(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      // Optimistic update in drawer
      setSelectedUser(prev => prev ? { ...prev, status: 'SUSPENDED' } : prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDrawerOpen(false);
      setActionError(null);
    },
    onError: (err) => {
      // Roll back optimistic update
      setSelectedUser(prev => prev ? { ...prev, status: 'ACTIVE' } : prev);
      setActionError(err?.response?.data?.message || 'Failed to suspend user. Please try again.');
    },
  });

  // ── Restore mutation ──────────────────────────────────────────────────────
  const restoreMutation = useMutation({
    mutationFn: (userId) => usersApi.restoreUser(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      setSelectedUser(prev => prev ? { ...prev, status: 'ACTIVE' } : prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDrawerOpen(false);
      setActionError(null);
    },
    onError: (err) => {
      setSelectedUser(prev => prev ? { ...prev, status: 'SUSPENDED' } : prev);
      setActionError(err?.response?.data?.message || 'Failed to restore user. Please try again.');
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setActionError(null);
    setIsDrawerOpen(true);
  };

  const handleSuspendToggle = (user) => {
    if (user.status === 'ACTIVE') {
      setIsSuspendModalOpen(true);
    } else {
      restoreMutation.mutate(user.id);
    }
  };

  const isActionPending = suspendMutation.isPending || restoreMutation.isPending;

  const startItem = page * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE + users.length, totalElements);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading ? 'Loading...' : `${totalElements.toLocaleString()} total users`}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="hidden sm:flex" onClick={() => usersApi.exportUsers().then(() => {})}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or username…"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button type="submit" variant="primary" className="shrink-0">Search</Button>
          </form>

          {/* Status Filter */}
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="LOCKED">Locked</option>
          </select>
        </div>

        {/* Active search indicator */}
        {search && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Results for:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary-50 text-primary-700">
              "{search}"
              <button type="button" onClick={handleClearSearch} className="ml-1.5 text-primary-400 hover:text-primary-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          Failed to load users. Please check your connection or try refreshing.
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[580px]">
        <div ref={parentRef} className="overflow-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-20">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-30">
                  User
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="relative px-6 py-3.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">No users found</p>
                    {search && (
                      <p className="text-xs text-gray-400 mt-1">
                        No results for "{search}". Try a different search term.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                <>
                  {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} />
                  )}
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const user = users[virtualRow.index];
                    if (!user) return null;
                    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email;
                    return (
                      <tr
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        className="hover:bg-gray-50 transition-colors cursor-pointer group h-14"
                        onClick={() => handleRowClick(user)}
                      >
                        <td className="px-6 py-2 whitespace-nowrap sticky left-0 bg-white group-hover:bg-gray-50 transition-colors z-10">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {(user.firstName || user.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{displayName}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                          {user.provider}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-gray-400 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                            onClick={(e) => { e.stopPropagation(); handleRowClick(user); }}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tr style={{ height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0)}px` }} />
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
              <>Showing <span className="font-semibold">{startItem}</span>–<span className="font-semibold">{endItem}</span> of <span className="font-semibold">{totalElements.toLocaleString()}</span> users</>
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

      {/* Slide-out Drawer */}
      <UserDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setActionError(null); }}
        user={selectedUser}
        onSuspendToggle={handleSuspendToggle}
        isActionPending={isActionPending}
        actionError={actionError}
      />

      {isSuspendModalOpen && selectedUser && (
        <SuspensionModal
          user={selectedUser}
          onClose={() => setIsSuspendModalOpen(false)}
        />
      )}
    </div>
  );
};
