import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bell, ShieldAlert, UserPlus, Server, FileText, Check, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminNotificationsApi } from '../../features/settings/api/adminNotificationsApi';
import { formatDistanceToNow } from 'date-fns';

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const popoverRef = useRef(null);
  const queryClient = useQueryClient();

  // ── Real API data ──────────────────────────────────────────────────────────
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: adminNotificationsApi.getNotifications,
    refetchInterval: 60000,
    select: (raw) =>
      raw.map((n) => ({
        id: n.id,
        type: n.type || 'GENERAL',
        priority: n.priority || 'LOW',
        title: n.title,
        description: n.message,
        timestamp: n.timestamp
          ? formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })
          : 'Just now',
        read: n.isRead ?? n.read ?? false,
      })),
  });

  // ── Optimistic mutations ───────────────────────────────────────────────────
  const markAsReadMutation = useMutation({
    mutationFn: adminNotificationsApi.markAsRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'notifications'] });
      const prev = queryClient.getQueryData(['admin', 'notifications']);
      queryClient.setQueryData(['admin', 'notifications'], (old = []) =>
        old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(['admin', 'notifications'], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: adminNotificationsApi.markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'notifications'] });
      const prev = queryClient.getQueryData(['admin', 'notifications']);
      queryClient.setQueryData(['admin', 'notifications'], (old = []) =>
        old.map((n) => ({ ...n, isRead: true }))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['admin', 'notifications'], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });

  // ── Click outside to close ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasCriticalUnread = notifications.some((n) => !n.read && n.type === 'SECURITY');

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'UNREAD') return notifications.filter((n) => !n.read);
    if (activeTab === 'SECURITY') return notifications.filter((n) => n.type === 'SECURITY');
    return notifications;
  }, [notifications, activeTab]);

  const getIcon = (type) => {
    switch (type) {
      case 'SECURITY': return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'USER':     return <UserPlus    className="w-5 h-5 text-blue-600" />;
      case 'SYSTEM':   return <Server      className="w-5 h-5 text-orange-600" />;
      case 'AUDIT':    return <FileText    className="w-5 h-5 text-gray-600" />;
      default:         return <Bell        className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBgColor = (type, read) => {
    if (read) return 'bg-white hover:bg-gray-50';
    switch (type) {
      case 'SECURITY': return 'bg-red-50 hover:bg-red-100/80';
      case 'USER':     return 'bg-blue-50 hover:bg-blue-100/80';
      case 'SYSTEM':   return 'bg-orange-50 hover:bg-orange-100/80';
      default:         return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="notification-center-btn"
        className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
      >
        <Bell className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white">
            {hasCriticalUnread && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            )}
          </span>
        )}
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 origin-top-right z-50 overflow-hidden flex flex-col max-h-[32rem]">

          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center focus:outline-none disabled:opacity-50"
              >
                {markAllReadMutation.isPending
                  ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  : <Check className="w-3.5 h-3.5 mr-1" />
                }
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 border-b border-gray-100 flex gap-2">
            {['ALL', 'UNREAD', 'SECURITY'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeTab === tab
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'UNREAD' ? `Unread (${unreadCount})` : 'Security'}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-12 text-center flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3" />
                <p className="text-sm font-medium text-gray-900">Loading alerts...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="px-4 py-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-900">You're all caught up</p>
                <p className="text-xs text-gray-500 mt-1">No new notifications to display.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredNotifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-4 relative cursor-pointer transition-colors ${getBgColor(n.type, n.read)}`}
                    onClick={() => !n.read && markAsReadMutation.mutate(n.id)}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r" />
                    )}
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">{getIcon(n.type)}</div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-semibold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium text-gray-400">{n.timestamp}</span>
                          {n.priority === 'HIGH' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                              High Priority
                            </span>
                          )}
                        </div>
                      </div>
                      {!n.read && <span className="flex-shrink-0 ml-2 block h-2 w-2 rounded-full bg-primary-500 mt-1" />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center sticky bottom-0">
            <a href="/audit-logs" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View Full Audit Log →
            </a>
          </div>

        </div>
      )}
    </div>
  );
};
