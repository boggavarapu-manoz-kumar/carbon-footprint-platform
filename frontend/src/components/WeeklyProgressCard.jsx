import React from 'react';
import { useQuery } from '@tanstack/react-query';
import GoalService from '../services/GoalService';
import { Target, TrendingDown, TrendingUp, Zap, Clock } from 'lucide-react';

const WeeklyProgressCard = () => {
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Weekly Goal Progress
          </h3>
          <p className="text-sm text-slate-500 mt-1">Track your carbon reduction this week</p>
        </div>
        
        {isImproving ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            <TrendingDown className="w-4 h-4" />
            <span>{weeklyImprovementPercent.toFixed(1)}% drop</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>{weeklyImprovementPercent.toFixed(1)}% rise</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Zap className="w-4 h-4" /> Current Week
          </div>
          <p className="text-2xl font-bold text-slate-900">{currentWeekCarbon.toFixed(1)} <span className="text-sm font-medium text-slate-500">kg CO₂e</span></p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Target className="w-4 h-4" /> Weekly Target
          </div>
          <p className="text-2xl font-bold text-slate-900">{goalTarget.toFixed(1)} <span className="text-sm font-medium text-slate-500">kg CO₂e</span></p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Clock className="w-4 h-4" /> Remaining
          </div>
          <p className="text-2xl font-bold text-slate-900">{remainingCarbon.toFixed(1)} <span className="text-sm font-medium text-slate-500">kg CO₂e</span></p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-slate-700">Target Progress</span>
          <span className="text-sm font-bold text-slate-900">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-3 text-center">
          You have saved <span className="font-semibold text-emerald-600">{carbonSaved.toFixed(1)} kg CO₂e</span> compared to last week!
        </p>
      </div>
    </div>
  );
};

export default WeeklyProgressCard;
