import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import GoalService from '../services/GoalService';
import { Target, TrendingDown, TrendingUp, Zap, Clock } from 'lucide-react';

const WeeklyProgressCard = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['weeklyProgress'],
    queryFn: GoalService.getWeeklyProgress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-48 flex items-center justify-center">
        <p className="text-slate-500">Failed to load weekly progress.</p>
      </div>
    );
  }

  const {
    currentWeekCarbon,
    previousWeekCarbon,
    goalTarget,
    weeklyReduction,
    remainingReduction,
    progressPercent,
    weeklyImprovementPercent,
    carbonSaved,
    remainingCarbon
  } = data;

  const isImproving = currentWeekCarbon < previousWeekCarbon;
  const progressColor = progressPercent > 100 ? 'bg-red-500' : 'bg-emerald-500';

  return (
    <div 
      onClick={() => navigate('/dashboard/goals')}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md hover:border-emerald-200 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          Current Goal Progress
        </h3>
        <span className="text-sm font-bold text-slate-900">{progressPercent.toFixed(1)}%</span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
        <div 
          className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>
      <p className="text-sm text-slate-500 mt-3 text-center flex items-center justify-center gap-1">
        Click to view detailed goal projection and intelligence <span aria-hidden="true">&rarr;</span>
      </p>
    </div>
  );
};

export default WeeklyProgressCard;
