import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Crown, Sparkles, Building2, Users, TrendingUp, Star, Award, Flame } from 'lucide-react';

const OrgLeaderboardService = {
  getLeaderboard: async (organizationId, timeframe = 'ALL_TIME', page = 0) => {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `/api/org/${organizationId}/leaderboard?timeframe=${timeframe}&page=${page}&size=25`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data.data;
  }
};

const timeframes = [
  { key: 'WEEKLY',   label: 'This Week',   icon: Flame },
  { key: 'MONTHLY',  label: 'This Month',  icon: TrendingUp },
  { key: 'YEARLY',   label: 'This Year',   icon: Star },
  { key: 'ALL_TIME', label: 'All Time',    icon: Crown },
];

const getRankStyles = (rank) => {
  if (rank === 1) return {
    bg: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
    badge: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-200',
    icon: <Trophy className="w-4 h-4 text-yellow-600" />,
  };
  if (rank === 2) return {
    bg: 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200',
    badge: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-md',
    icon: <Medal className="w-4 h-4 text-slate-500" />,
  };
  if (rank === 3) return {
    bg: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200',
    badge: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md',
    icon: <Medal className="w-4 h-4 text-amber-600" />,
  };
  return {
    bg: 'bg-white border-slate-100 hover:bg-slate-50',
    badge: 'bg-slate-100 text-slate-600',
    icon: null,
  };
};

const PodiumItem = ({ entry, rank, height }) => {
  if (!entry) return null;
  const isFirst = rank === 1;
  const colors = {
    1: 'from-yellow-300 via-yellow-500 to-yellow-600 ring-yellow-200',
    2: 'from-slate-300 via-slate-400 to-slate-500 ring-slate-200',
    3: 'from-amber-400 via-amber-500 to-amber-700 ring-amber-300',
  };
  const podiumColors = {
    1: 'from-yellow-400/30 to-yellow-200/50 border-yellow-300/50',
    2: 'from-slate-400/20 to-slate-200/40 border-slate-200/50',
    3: 'from-amber-500/20 to-amber-300/40 border-amber-300/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: rank * 0.12, type: 'spring', bounce: 0.35 }}
      className="flex flex-col items-center justify-end w-28 sm:w-36 md:w-44 relative group"
      style={{ height: `${height + 120}px` }}
    >
      {isFirst && (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute -top-8 text-yellow-400"
        >
          <Sparkles className="w-10 h-10" />
        </motion.div>
      )}

      {/* Avatar */}
      <motion.div whileHover={{ scale: 1.08 }} className="mb-3 relative z-10">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${colors[rank]} ring-4 ring-offset-2 flex items-center justify-center text-white text-xl font-black shadow-2xl transition-all`}>
          {entry.profilePictureUrl ? (
            <img src={entry.profilePictureUrl} alt={entry.firstName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <>{entry.firstName?.[0]}{entry.lastName?.[0]}</>
          )}
        </div>
        {isFirst && (
          <div className="absolute -bottom-2 -right-1 bg-white rounded-full p-1.5 shadow-lg border border-yellow-100">
            <Crown className="w-5 h-5 text-yellow-500 fill-yellow-400" />
          </div>
        )}
      </motion.div>

      {/* Name & Score */}
      <div className="text-center mb-4 z-10 px-1 w-full">
        <p className="font-black text-slate-900 text-sm sm:text-base truncate group-hover:text-emerald-600 transition-colors">
          {entry.firstName} {entry.lastName}
        </p>
        <p className="text-xs sm:text-sm font-bold text-emerald-600 mt-0.5">
          {entry.totalSustainabilityScore?.toLocaleString()} pts
        </p>
      </div>

      {/* Podium block */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${height}px` }}
        transition={{ duration: 0.9, delay: 0.4, type: 'spring' }}
        className={`w-full rounded-t-2xl border-t bg-gradient-to-t ${podiumColors[rank]} flex justify-center pt-4 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-white/30" />
        <span className={`text-4xl sm:text-5xl font-black relative z-10 ${rank === 1 ? 'text-yellow-600/80' : rank === 2 ? 'text-slate-600/70' : 'text-amber-700/70'}`}>
          {rank}
        </span>
      </motion.div>
    </motion.div>
  );
};

const OrgLeaderboard = () => {
  const { orgContext, user } = useAuth();
  const [activeTimeframe, setActiveTimeframe] = useState('ALL_TIME');
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orgContext?.organizationId) return;
    loadLeaderboard();
  }, [activeTimeframe, orgContext]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrgLeaderboardService.getLeaderboard(orgContext.organizationId, activeTimeframe);
      setLeaderboardData(data);
    } catch (err) {
      setError('Failed to load organization leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  if (!orgContext) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center py-12">
        <Building2 className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-700 mb-2">Not in an Organization</h3>
        <p className="text-slate-500">Join an organization to see the team leaderboard.</p>
      </div>
    );
  }

  const entries = leaderboardData?.content ?? [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const currentUserEntry = entries.find(e => e.userId === user?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-700 font-bold text-sm mb-3 border border-emerald-200/60"
          >
            <Building2 className="w-4 h-4" />
            {orgContext.organizationName}
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-900">
            Organization Leaderboard
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            <Users className="w-4 h-4 inline mr-1" />
            Compete with your teammates — your personal data stays private
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 shadow-inner flex-wrap">
          {timeframes.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTimeframe(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTimeframe === key
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Current User Rank Banner */}
      {currentUserEntry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-emerald-100"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-lg">
            #{currentUserEntry.rank}
          </div>
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium">
              Your Ranking — {timeframes.find(t => t.key === activeTimeframe)?.label ?? activeTimeframe}
            </p>
            <p className="text-white font-black text-lg">{currentUserEntry.firstName} {currentUserEntry.lastName}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-2xl">{currentUserEntry.totalSustainabilityScore?.toLocaleString()}</p>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">points</p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 font-semibold">{error}</div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy className="w-14 h-14 text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-1">No data yet</h3>
          <p className="text-slate-400">Start logging activities to appear on the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 pt-16 shadow-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none" />
              <div className="flex justify-center items-end gap-4 sm:gap-8 md:gap-14 relative z-10">
                {/* 2nd, 1st, 3rd order */}
                <PodiumItem entry={top3[1]} rank={2} height={140} />
                <PodiumItem entry={top3[0]} rank={1} height={200} />
                {top3[2] && <PodiumItem entry={top3[2]} rank={3} height={100} />}
              </div>
            </div>
          )}

          {/* Full Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Full Rankings</h2>
              <span className="text-xs text-slate-500 font-medium">
                {(leaderboardData?.totalElements ?? entries.length).toLocaleString()} active members
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              <AnimatePresence>
                {entries.map((entry, index) => {
                  const styles = getRankStyles(entry.rank);
                  const isMe = entry.userId === user?.id;
                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className={`flex items-center gap-4 px-6 py-3.5 border ${styles.bg} transition-all ${isMe ? 'ring-1 ring-inset ring-emerald-300' : ''}`}
                    >
                      {/* Rank */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black ${styles.badge} flex-shrink-0`}>
                        {styles.icon || entry.rank}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0 overflow-hidden">
                        {entry.profilePictureUrl ? (
                          <img src={entry.profilePictureUrl} alt={entry.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <>{entry.firstName?.[0]}{entry.lastName?.[0]}</>
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold truncate ${isMe ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {entry.firstName} {entry.lastName}
                          {isMe && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">You</span>}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">@{entry.username}</p>
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-1">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 font-black text-sm ring-1 ring-emerald-200">
                          {entry.totalSustainabilityScore?.toLocaleString()} pts
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrgLeaderboard;
