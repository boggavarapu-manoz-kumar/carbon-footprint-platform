import React, { useMemo } from 'react';
import { X, UserPlus, Ban, CheckCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { suspensionsApi } from '../api/suspensionsApi';
import { usersApi } from '../../users/api/usersApi';
import { format } from 'date-fns';

export const SuspensionHistoryModal = ({ userId, isOpen, onClose }) => {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getUserById(userId),
    enabled: !!userId && isOpen
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['suspensions', userId],
    queryFn: () => suspensionsApi.getSuspensionHistory(userId),
    enabled: !!userId && isOpen
  });

  const timelineEvents = useMemo(() => {
    if (!user || !history) return [];

    const events = [];

    // User Creation Event
    events.push({
      id: 'creation',
      type: 'created',
      date: new Date(user.createdAt),
      title: 'User Created',
      description: 'Account registered on the platform.',
      icon: UserPlus,
      colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    });

    // Suspension Events
    history.forEach(s => {
      // Suspend Event
      events.push({
        id: `suspend-${s.id}`,
        type: 'suspended',
        date: new Date(s.startDate),
        title: 'Account Suspended',
        description: `Reason: ${s.reason}`,
        meta: `Suspended by Admin ID: ${s.suspendedBy} | Duration: ${s.endDate ? format(new Date(s.endDate), 'MMM d, yyyy HH:mm') : 'Permanent'}`,
        icon: Ban,
        colorClass: 'text-red-500 bg-red-500/10 border-red-500/20'
      });

      // Revoke Event
      if (s.revokedDate) {
        events.push({
          id: `revoke-${s.id}`,
          type: 'revoked',
          date: new Date(s.revokedDate),
          title: 'Suspension Revoked',
          description: s.revokedBy === 0 ? 'Suspension automatically expired.' : 'Suspension manually revoked.',
          meta: s.revokedBy !== 0 ? `Revoked by Admin ID: ${s.revokedBy}` : 'SYSTEM ACTION',
          icon: CheckCircle,
          colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
        });
      }
    });

    // Sort chronologically (oldest first)
    return events.sort((a, b) => a.date - b.date);
  }, [user, history]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full shadow-2xl overflow-hidden flex flex-col transform transition-transform">
        <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Audit Timeline</h2>
            <p className="text-sm text-slate-400">User ID: {userId}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {(isUserLoading || isHistoryLoading) ? (
            <div className="flex justify-center items-center h-32 text-slate-400">
              Loading timeline...
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 pb-8">
              {timelineEvents.map((event, index) => {
                const Icon = event.icon;
                const isLast = index === timelineEvents.length - 1;
                
                return (
                  <div key={event.id} className="relative pl-6">
                    {/* Node Dot */}
                    <div className={`absolute -left-[13px] top-1 h-6 w-6 rounded-full border flex items-center justify-center ${event.colorClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* Content */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap ml-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(event.date, 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mt-1">{event.description}</p>
                      {event.meta && (
                        <p className="text-xs text-slate-500 mt-2 font-medium">{event.meta}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
