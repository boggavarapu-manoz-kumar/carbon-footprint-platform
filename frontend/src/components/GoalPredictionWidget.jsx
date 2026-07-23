import React from 'react';
import { useQuery } from '@tanstack/react-query';
import GoalService from '../services/GoalService';
import { LineChart, CalendarDays, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

const GoalPredictionWidget = ({ goalId, targetEmission }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['goalPrediction', goalId],
    queryFn: () => GoalService.getGoalPrediction(goalId),
    refetchInterval: 300000, // Refresh every 5 mins
  });

  if (isLoading) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-center items-center h-32 mt-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mt-4 flex items-center justify-center">
        <p className="text-sm text-rose-600">Failed to load prediction engine.</p>
      </div>
    );
  }

  const {
    predictionStatus,
    projectedCompletionDate,
    currentCarbon,
    targetCarbon,
    remainingCarbon,
    daysRemaining,
    averageDailyEmission,
    averageWeeklyEmission,
    currentReductionRate,
    projectedFinalCarbon
  } = data;

  const statusConfig = {
    'AHEAD_OF_SCHEDULE': { label: 'Ahead of Schedule', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: CheckCircle2 },
    'ON_TRACK': { label: 'On Track', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
    'SLIGHTLY_BEHIND': { label: 'Slightly Behind', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertCircle },
    'BEHIND_SCHEDULE': { label: 'Behind Schedule', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertCircle },
    'ACHIEVED': { label: 'Achieved', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
    'FAILED': { label: 'Goal Failed (Target Exceeded)', color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-300', icon: AlertCircle },
    'UNKNOWN': { label: 'Insufficient Data', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: AlertCircle }
  };

  const config = statusConfig[predictionStatus] || statusConfig['UNKNOWN'];
  const StatusIcon = config.icon;

  return (
    <div className={`mt-4 rounded-xl border p-5 transition-all ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className={`w-5 h-5 ${config.color}`} />
          <h4 className={`text-sm font-bold uppercase tracking-wider ${config.color}`}>Goal Projection Engine</h4>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border ${config.border} shadow-sm`}>
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Current Carbon */}
        <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Current</div>
          <div className="text-xl font-black text-slate-900">{currentCarbon?.toFixed(2)} <span className="text-xs text-slate-500">kg</span></div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className={`h-full rounded-full ${predictionStatus === 'FAILED' ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((currentCarbon / (targetCarbon || 1)) * 100, 100)}%` }}></div>
          </div>
        </div>

        {/* Target Carbon */}
        <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Target</div>
          <div className="text-xl font-black text-slate-900">{targetCarbon?.toFixed(2)} <span className="text-xs text-slate-500">kg</span></div>
          <div className="text-xs text-slate-500 mt-1">Goal baseline</div>
        </div>

        {/* Remaining Carbon */}
        <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Remaining</div>
          <div className="text-xl font-black text-slate-900">{remainingCarbon?.toFixed(2)} <span className="text-xs text-slate-500">kg</span></div>
          <div className="text-xs text-slate-500 mt-1">{daysRemaining} days left</div>
        </div>

        {/* Avg Daily */}
        <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Avg Daily</div>
          <div className="text-xl font-black text-slate-900">{averageDailyEmission?.toFixed(2)} <span className="text-xs text-slate-500">kg/d</span></div>
          <div className="text-xs text-slate-500 mt-1">Historical rate</div>
        </div>

        {/* Avg Weekly */}
        <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Avg Weekly</div>
          <div className="text-xl font-black text-slate-900">{averageWeeklyEmission?.toFixed(2)} <span className="text-xs text-slate-500">kg/w</span></div>
          <div className="text-[10px] text-slate-500 mt-1 leading-tight">
            Reduction rate: {currentReductionRate != null ? (currentReductionRate > 0 ? `-${currentReductionRate.toFixed(1)}%` : `+${Math.abs(currentReductionRate).toFixed(1)}%`) : 'N/A'}
          </div>
        </div>

        {/* Projected Final */}
        <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Projected Final</div>
          <div className="text-xl font-black text-slate-900">{projectedFinalCarbon?.toFixed(2)} <span className="text-xs text-slate-500">kg</span></div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-slate-400" />
            {projectedCompletionDate ? new Date(projectedCompletionDate).toLocaleDateString() : 'N/A'}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GoalPredictionWidget;
