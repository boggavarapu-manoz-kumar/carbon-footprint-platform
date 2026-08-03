import React, { useState, useEffect } from "react";
import { Trophy, Medal, Award, Star, Activity, Target, Flame, TrendingUp, AlertCircle, ChevronDown, ChevronUp, History, TrendingDown, Minus, CalendarDays, CheckCircle, Crown, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LeaderboardService from "../services/LeaderboardService";
import { useTranslation } from 'react-i18next';

const Leaderboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('yearly'); // 'global', 'weekly', 'monthly', 'yearly'
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Filters
  const [category, setCategory] = useState('Overall');
  const [sortBy, setSortBy] = useState('Highest Sustainability Score');

  useEffect(() => {
    if (activeTab === 'global') {
      loadGlobalLeaderboard();
    } else if (activeTab === 'weekly') {
      loadWeeklyLeaderboard();
    } else if (activeTab === 'monthly') {
      loadMonthlyLeaderboard();
    } else {
      loadYearlyLeaderboard();
    }
  }, [activeTab, category, sortBy]);

  const loadGlobalLeaderboard = async () => {
    try {
      setLoading(true); setError(null);
      const data = await LeaderboardService.getLeaderboard(
        category === 'Overall' ? null : category,
        sortBy
      );
      setLeaderboardData(data);
    } catch (err) {
      setError(t('leaderboard.error_global'));
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyLeaderboard = async () => {
    try {
      setLoading(true); setError(null);
      const data = await LeaderboardService.getWeeklyLeaderboard(
        null, null,
        category === 'Overall' ? null : category,
        sortBy
      );
      setWeeklyData(data);
    } catch (err) {
      setError(t('leaderboard.error_weekly'));
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyLeaderboard = async () => {
    try {
      setLoading(true); setError(null);
      const data = await LeaderboardService.getMonthlyLeaderboard(
        null, null,
        category === 'Overall' ? null : category,
        sortBy
      );
      setMonthlyData(data);
    } catch (err) {
      setError(t('leaderboard.error_monthly'));
    } finally {
      setLoading(false);
    }
  };

  const loadYearlyLeaderboard = async () => {
    try {
      setLoading(true); setError(null);
      const data = await LeaderboardService.getYearlyLeaderboard(
        null,
        category === 'Overall' ? null : category,
        sortBy
      );
      setYearlyData(data);
    } catch (err) {
      setError(t('leaderboard.error_yearly'));
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-slate-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="font-semibold text-slate-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return "bg-yellow-50 border-yellow-200";
      case 2: return "bg-slate-50 border-slate-200";
      case 3: return "bg-amber-50 border-amber-200";
      default: return "bg-white border-slate-100 hover:bg-slate-50";
    }
  };

  if (loading && !leaderboardData && !weeklyData && !monthlyData && !yearlyData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('leaderboard.error_title')}</h3>
        <p className="text-slate-500 max-w-md">{error}</p>
        <button 
          onClick={() => activeTab === 'global' ? loadGlobalLeaderboard() : activeTab === 'weekly' ? loadWeeklyLeaderboard() : activeTab === 'monthly' ? loadMonthlyLeaderboard() : loadYearlyLeaderboard()}
          className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {t('common.try_again')}
        </button>
      </div>
    );
  }

  const PodiumItem = ({ user, rank, height, scoreField }) => {
    if (!user) return null;
    const isFirst = rank === 1;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: rank * 0.1, type: "spring", bounce: 0.4 }}
        className="flex flex-col items-center justify-end h-full w-24 sm:w-32 md:w-48 relative group"
      >
        {isFirst && (
          <div className="absolute top-0 -mt-10 sm:-mt-16 text-yellow-400 opacity-80 animate-pulse">
            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
        )}
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="relative mb-2 sm:mb-4 z-20 cursor-pointer"
        >
          <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-xl sm:text-3xl font-black shadow-2xl transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] ${
            isFirst ? 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 text-white ring-4 ring-yellow-200 ring-offset-4 ring-offset-slate-50' : 
            rank === 2 ? 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 text-white ring-4 ring-slate-200 ring-offset-2' : 
            'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white ring-4 ring-amber-200 ring-offset-2'
          }`}>
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</>
            )}
          </div>
          {isFirst && (
            <div className="absolute -bottom-2 right-0 bg-white p-2 rounded-full shadow-lg border border-yellow-100">
              <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </div>
          )}
        </motion.div>
        
        <div className="text-center mb-4 sm:mb-6 z-20 w-full px-1 sm:px-2">
          <p className="font-black text-slate-900 truncate text-sm sm:text-lg group-hover:text-emerald-600 transition-colors">{user.firstName} {user.lastName}</p>
          <p className="text-xs sm:text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
            {user[scoreField]?.toLocaleString()} {t('leaderboard.pts')}
          </p>
        </div>
        
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${height}px` }}
          transition={{ duration: 1, delay: 0.5, type: "spring" }}
          className={`w-full rounded-t-3xl flex justify-center pt-6 shadow-2xl relative overflow-hidden backdrop-blur-xl ${
            rank === 1 ? 'bg-gradient-to-t from-yellow-500/20 to-yellow-300/40 border-t border-yellow-200/50' :
            rank === 2 ? 'bg-gradient-to-t from-slate-400/20 to-slate-200/40 border-t border-slate-200/50' :
            'bg-gradient-to-t from-amber-600/20 to-amber-400/40 border-t border-amber-300/50'
          }`}
        >
          <div className="absolute inset-0 bg-white/40 glassmorphism-overlay"></div>
          <span className={`text-4xl sm:text-6xl font-black relative z-10 ${
            rank === 1 ? 'text-yellow-600/80 drop-shadow-md' : 
            rank === 2 ? 'text-slate-600/80' : 'text-amber-700/80'
          }`}>
            {rank}
          </span>
        </motion.div>
      </motion.div>
    );
  };

  const renderGlobalTable = () => {
    if (!leaderboardData) return null;
    const { topUsers, currentUser } = leaderboardData;

    return (
      <>
        {topUsers.length >= 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 pt-12 shadow-sm overflow-hidden relative">
            <div className="flex justify-center items-end h-[300px] gap-2 sm:gap-6 md:gap-12 relative z-10">
              <PodiumItem user={topUsers[1]} rank={2} height={160} scoreField="totalSustainabilityScore" />
              <PodiumItem user={topUsers[0]} rank={1} height={220} scoreField="totalSustainabilityScore" />
              <PodiumItem user={topUsers[2]} rank={3} height={120} scoreField="totalSustainabilityScore" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">{t('leaderboard.all_time_rankings')}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Award className="w-4 h-4" /> {t('leaderboard.top_50')}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-4 w-24 text-center">{t('leaderboard.columns.rank')}</th>
                  <th className="px-6 py-4">{t('leaderboard.columns.user')}</th>
                  <th className="px-6 py-4 text-right">{t('leaderboard.columns.score')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topUsers.map((user) => (
                  <tr key={user.userId} className={`transition-colors cursor-pointer ${getRankColor(user.rank)}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center h-full">
                        {getRankIcon(user.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${currentUser?.userId === user.userId ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {user.profilePictureUrl && user.profilePictureUrl.startsWith('http') ? (
                            <img src={user.profilePictureUrl} alt={user.firstName} className="w-full h-full rounded-full object-cover border-2 border-transparent hover:border-primary-400 transition-colors" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors flex items-center gap-2">
                            {user.firstName} {user.lastName} 
                            {currentUser?.userId === user.userId && <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">{t('leaderboard.you')}</span>}
                          </p>
                          <p className="text-xs text-slate-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 group relative">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 font-black shadow-sm ring-1 ring-emerald-200">
                          {user.totalSustainabilityScore.toLocaleString()} {t('leaderboard.pts')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const renderWeeklyTable = () => {
    if (!weeklyData) return null;
    const { topUsers, currentUser } = weeklyData;

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">{t('leaderboard.weekly_top_100')}</h2>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <History className="w-4 h-4" /> {t('leaderboard.resets_sunday')}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4 w-24 text-center">{t('leaderboard.columns.rank')}</th>
                <th className="px-6 py-4">{t('leaderboard.columns.user')}</th>
                <th className="px-6 py-4 text-center">{t('leaderboard.columns.trend')}</th>
                <th className="px-6 py-4 text-center">{t('leaderboard.columns.carbon_logged')}</th>
                <th className="px-6 py-4 text-right">{t('leaderboard.columns.points')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topUsers.map((user) => (
                <tr key={user.userId} className={`transition-colors ${getRankColor(user.rank)}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center h-full">
                      {getRankIcon(user.rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${currentUser?.userId === user.userId ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {user.profilePictureUrl ? (
                          <img src={user.profilePictureUrl} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {user.firstName} {user.lastName} 
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {user.trend === 'UP' && <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto" />}
                    {user.trend === 'DOWN' && <TrendingDown className="w-5 h-5 text-red-500 mx-auto" />}
                    {user.trend === 'STABLE' && <Minus className="w-5 h-5 text-slate-400 mx-auto" />}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-slate-600 font-medium">
                    {user.carbonSaved ? user.carbonSaved.toFixed(2) : '0'} {t('leaderboard.kg')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-bold">
                        {user.weeklyScore.toLocaleString()} {t('leaderboard.pts')}
                      </span>
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

  const renderMonthlyTable = () => {
    if (!monthlyData) return null;
    const { topUsers, currentUser } = monthlyData;

    const topImprover = topUsers.find(u => u.awards?.includes("Top Improver"));
    const bestPerformer = topUsers.find(u => u.awards?.includes("Best Performer"));
    const mostConsistent = topUsers.find(u => u.awards?.includes("Most Consistent User"));
    const highestGoals = topUsers.find(u => u.awards?.includes("Highest Goal Completion"));

    const AwardCard = ({ title, user, icon: Icon, color, value }) => {
      if (!user) return null;
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            <p className="font-bold text-slate-900 text-lg leading-tight">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-slate-500 font-medium">{value}</p>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AwardCard title={t('leaderboard.awards.best_performer')} user={bestPerformer} icon={Trophy} color="bg-yellow-500" value={`${bestPerformer?.monthlyScore?.toLocaleString() || 0} ${t('leaderboard.pts')}`} />
          <AwardCard title={t('leaderboard.awards.top_improver')} user={topImprover} icon={TrendingUp} color="bg-emerald-500" value={t('leaderboard.highest_growth')} />
          <AwardCard title={t('leaderboard.awards.most_consistent')} user={mostConsistent} icon={CalendarDays} color="bg-blue-500" value={`${mostConsistent?.activityCount || 0} ${t('leaderboard.columns.activities')}`} />
          <AwardCard title={t('leaderboard.awards.goal_crusher')} user={highestGoals} icon={Target} color="bg-purple-500" value={`${highestGoals?.goalsCompleted || 0} ${t('leaderboard.columns.goals')}`} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">{t('leaderboard.monthly_top_100')}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <CalendarDays className="w-4 h-4" /> {t('leaderboard.resets_month')}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-4 w-24 text-center">{t('leaderboard.columns.rank')}</th>
                  <th className="px-6 py-4">{t('leaderboard.columns.user')}</th>
                  <th className="px-6 py-4 text-center">{t('leaderboard.columns.activities')}</th>
                  <th className="px-6 py-4 text-center">{t('leaderboard.columns.goals')}</th>
                  <th className="px-6 py-4 text-center">{t('leaderboard.columns.carbon_logged')}</th>
                  <th className="px-6 py-4 text-right">{t('leaderboard.columns.points')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topUsers.map((user) => (
                  <tr key={user.userId} className={`transition-colors ${getRankColor(user.rank)}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center h-full">
                        {getRankIcon(user.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${currentUser?.userId === user.userId ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {user.profilePictureUrl && user.profilePictureUrl.startsWith('http') ? (
                            <img src={user.profilePictureUrl} alt={user.firstName} className="w-full h-full rounded-full object-cover border-2 border-transparent hover:border-primary-400 transition-colors" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-2 group-hover:text-primary-600 transition-colors">
                            {user.firstName} {user.lastName} 
                            {user.awards?.includes("Best Performer") && <Trophy className="w-4 h-4 text-yellow-500" title={t('leaderboard.awards.best_performer')} />}
                            {user.awards?.includes("Top Improver") && <TrendingUp className="w-4 h-4 text-emerald-500" title={t('leaderboard.awards.top_improver')} />}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-700 font-medium">
                      {user.activityCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-700 font-medium">
                      {user.goalsCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-600 font-medium">
                      {user.carbonSaved ? user.carbonSaved.toFixed(2) : '0'} {t('leaderboard.kg')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 group relative">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 text-primary-800 font-black shadow-sm ring-1 ring-primary-200">
                          {user.monthlyScore.toLocaleString()} {t('leaderboard.pts')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderYearlyTable = () => {
    if (!yearlyData) return null;
    const { topUsers, currentUser } = yearlyData;

    return (
      <div className="space-y-6 mt-8">
        {/* Podium for top 3 */}
        {topUsers.length >= 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 pt-12 shadow-sm overflow-hidden relative">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wider flex items-center justify-center gap-3">
                <Crown className="w-8 h-8 text-yellow-500" />
                {t('leaderboard.sustainability_champions')} {yearlyData.year}
                <Crown className="w-8 h-8 text-yellow-500" />
              </h2>
            </div>
            <div className="flex justify-center items-end h-[300px] gap-2 sm:gap-6 md:gap-12 relative z-10">
              <PodiumItem user={topUsers[1]} rank={2} height={160} scoreField="yearlyScore" />
              <PodiumItem user={topUsers[0]} rank={1} height={220} scoreField="yearlyScore" />
              <PodiumItem user={topUsers[2]} rank={3} height={120} scoreField="yearlyScore" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">{t('leaderboard.yearly_top_100')}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <History className="w-4 h-4" /> {t('leaderboard.resets_dec_31')}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-4 w-24 text-center">{t('leaderboard.columns.rank')}</th>
                  <th className="px-6 py-4">{t('leaderboard.columns.user')}</th>
                  <th className="px-6 py-4 text-center">{t('leaderboard.columns.award')}</th>
                  <th className="px-6 py-4 text-center">{t('leaderboard.columns.goals')}</th>
                  <th className="px-6 py-4 text-center">{t('leaderboard.columns.badge_points')}</th>
                  <th className="px-6 py-4 text-center">{t('leaderboard.columns.carbon_logged')}</th>
                  <th className="px-6 py-4 text-right">{t('leaderboard.columns.points')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topUsers.map((user) => (
                  <tr key={user.userId} className={`transition-colors cursor-pointer ${getRankColor(user.rank)}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center h-full">
                        {getRankIcon(user.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${currentUser?.userId === user.userId ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {user.profilePictureUrl && user.profilePictureUrl.startsWith('http') ? (
                            <img src={user.profilePictureUrl} alt={user.firstName} className="w-full h-full rounded-full object-cover border-2 border-transparent hover:border-primary-400 transition-colors" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                            {user.firstName} {user.lastName} 
                            {currentUser?.userId === user.userId && <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">{t('leaderboard.you')}</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.award === 'Gold' && <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold text-xs"><Trophy className="w-3 h-3 mr-1"/> {t('leaderboard.badges.gold')}</span>}
                        {user.award === 'Silver' && <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-bold text-xs"><Medal className="w-3 h-3 mr-1"/> {t('leaderboard.badges.silver')}</span>}
                        {user.award === 'Bronze' && <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs"><Medal className="w-3 h-3 mr-1"/> {t('leaderboard.badges.bronze')}</span>}
                        {user.award === 'Top 10' && <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">{t('leaderboard.badges.top_10')}</span>}
                        {user.award === 'Top 100' && <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-50 text-slate-600 font-semibold text-xs">{t('leaderboard.badges.top_100')}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-700 font-medium">
                      {user.goalsCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-700 font-medium">
                      {user.badgePoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-600 font-medium">
                      {user.carbonSaved ? user.carbonSaved.toFixed(2) : '0'} {t('leaderboard.kg')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 group relative">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 font-black shadow-sm ring-1 ring-emerald-200">
                          {user.yearlyScore.toLocaleString()} {t('leaderboard.pts')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-700 font-bold text-sm mb-4 border border-emerald-200/50"
          >
            <Trophy className="w-4 h-4" /> {t('leaderboard.hall_of_fame')}
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-900 drop-shadow-sm mb-4">
            {t('leaderboard.title')}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
            {t('leaderboard.subtitle')}
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">{t('leaderboard.category')}</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2"
              >
                <option value="Overall">{t('leaderboard.categories.Overall')}</option>
                <option value="Transport">{t('leaderboard.categories.Transport')}</option>
                <option value="Electricity">{t('leaderboard.categories.Electricity')}</option>
                <option value="Food">{t('leaderboard.categories.Food')}</option>
                <option value="Shopping">{t('leaderboard.categories.Shopping')}</option>
                <option value="Other">{t('leaderboard.categories.Other')}</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">{t('leaderboard.sort_by')}</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2"
              >
                <option value="Highest Sustainability Score">{t('leaderboard.sort_options.Highest Sustainability Score')}</option>
                <option value="Most Goals Completed">{t('leaderboard.sort_options.Most Goals Completed')}</option>
                <option value="Most Improved">{t('leaderboard.sort_options.Most Improved')}</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-100 p-1 rounded-xl inline-flex shadow-inner">
          <button
            onClick={() => setActiveTab('yearly')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'yearly' 
                ? 'bg-white text-primary-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('leaderboard.tabs.yearly')}
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'monthly' 
                ? 'bg-white text-primary-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('leaderboard.tabs.monthly')}
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'weekly' 
                ? 'bg-white text-primary-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('leaderboard.tabs.weekly')}
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'global' 
                ? 'bg-white text-primary-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('leaderboard.tabs.global')}
          </button>
        </div>
      </div>

      {activeTab === 'global' && renderGlobalTable()}
      {activeTab === 'weekly' && renderWeeklyTable()}
      {activeTab === 'monthly' && renderMonthlyTable()}
      {activeTab === 'yearly' && renderYearlyTable()}
      
    </div>
  );
};

export default Leaderboard;
