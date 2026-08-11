import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axiosConfig';
import { Trophy, Medal, Star, TrendingUp, Search, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar } from 'antd';
import toast from 'react-hot-toast';

const getRankBadge = (rank) => {
  if (rank === 1) return {
    icon: <Trophy className="w-5 h-5 text-amber-500" />,
    bg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
    ring: 'ring-2 ring-amber-400 ring-offset-2',
    cardBg: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
  };
  if (rank === 2) return {
    icon: <Medal className="w-5 h-5 text-slate-500" />,
    bg: 'bg-gradient-to-br from-slate-400 to-slate-500',
    ring: 'ring-2 ring-slate-300 ring-offset-2',
    cardBg: 'bg-gradient-to-r from-slate-50 to-slate-100/50 border-slate-200',
  };
  if (rank === 3) return {
    icon: <Medal className="w-5 h-5 text-amber-700" />,
    bg: 'bg-gradient-to-br from-amber-700 to-amber-800',
    ring: 'ring-2 ring-amber-600/40 ring-offset-2',
    cardBg: 'bg-gradient-to-r from-orange-50 to-amber-50/50 border-orange-200',
  };
  return {
    icon: <span className="text-xs font-bold text-slate-500">#{rank}</span>,
    bg: 'bg-gradient-to-br from-slate-200 to-slate-300',
    ring: '',
    cardBg: 'bg-white/70 border-slate-200/60',
  };
};

export const OrganizationLeaderboard = ({ organizationId }) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = React.useState('');

  const { data: leaderboardData, isLoading, error } = useQuery({
    queryKey: ['organization-leaderboard', organizationId],
    queryFn: async () => {
      const response = await api.get(`/v1/organizations/${organizationId}/leaderboard`);
      return response.data?.data || {};
    },
    onError: () => toast.error(t('organization.leaderboard.error', 'Failed to load leaderboard')),
  });

  const allUsers = leaderboardData?.topUsers || [];
  const filteredUsers = allUsers.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchText.toLowerCase())
  );

  if (error) return null;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2.5 tracking-tight">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            Company Leaderboard
          </h3>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            {allUsers.length > 0 ? `Top ${allUsers.length} sustainability champions` : 'Earn points by logging activities'}
          </p>
        </div>
        <div className="relative w-full md:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search member..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
          />
        </div>
      </div>

      {/* Leaderboard Rows */}
      <div className="p-4 space-y-2">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="font-semibold text-slate-500">No data yet</p>
            <p className="text-xs mt-1">Members will appear here as they log sustainability activities.</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => {
            const rank = user.rank || index + 1;
            const badge = getRankBadge(rank);
            const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

            return (
              <div
                key={user.userId}
                className={`flex items-center gap-4 p-4 border rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${badge.cardBg}`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                {/* Rank */}
                <div className={`w-9 h-9 rounded-xl ${badge.bg} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
                  {badge.icon}
                </div>

                {/* Avatar */}
                <Avatar
                  size={40}
                  src={user.avatarUrl}
                  className={`bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold flex-shrink-0 shadow-sm ${badge.ring}`}
                >
                  {initials}
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.department || 'Member'}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 flex-shrink-0 text-right">
                  <div className="hidden md:block">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Carbon Saved</p>
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 justify-end">
                      <Leaf className="w-3.5 h-3.5" />
                      {(user.totalCarbonSaved || 0).toFixed(1)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Score</p>
                    <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1 justify-end">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {(user.totalSustainabilityScore || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {allUsers.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Showing top {filteredUsers.length} of {allUsers.length} members
          </p>
        </div>
      )}
    </div>
  );
};
