import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import GoalService from '../services/GoalService';
import { AlertCircle, CheckCircle2, Bell, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const GoalAlertsWidget = () => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const { data: alerts, isLoading, isError } = useQuery({
    queryKey: ['goalAlerts'],
    queryFn: () => GoalService.getGoalAlerts(),
    refetchInterval: 300000, // Refresh every 5 mins
  });

  const allDismissed = alerts && alerts.every((_, i) => dismissedAlerts.has(i));

  if (isLoading || isError || !alerts || alerts.length === 0 || allDismissed) {
    return null; // Don't show if loading, error, empty, or all dismissed
  }

  return (
    <div className="mb-6 space-y-3">
      {alerts.map((alert, index) => {
        if (dismissedAlerts.has(index)) return null;

        let bgColor = 'bg-blue-50';
        let borderColor = 'border-blue-200';
        let textColor = 'text-blue-800';
        let Icon = Info;
        let iconColor = 'text-blue-500';

        if (alert.severity === 'SUCCESS') {
          bgColor = 'bg-emerald-50';
          borderColor = 'border-emerald-200';
          textColor = 'text-emerald-800';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-500';
        } else if (alert.severity === 'WARNING') {
          bgColor = 'bg-rose-50';
          borderColor = 'border-rose-200';
          textColor = 'text-rose-800';
          Icon = AlertCircle;
          iconColor = 'text-rose-500';
        } else if (alert.severity === 'INFO') {
          bgColor = 'bg-amber-50';
          borderColor = 'border-amber-200';
          textColor = 'text-amber-800';
          Icon = Bell;
          iconColor = 'text-amber-500';
        }

        return (
          <div key={index} className={`group relative flex items-start gap-3.5 p-4 rounded-xl border-2 border-dashed ${bgColor} ${borderColor} shadow-sm`}>
            <div className={`mt-0.5 ${iconColor} bg-white p-1.5 rounded-lg shadow-sm border border-slate-100`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 pt-0.5 pr-6">
              <h4 className={`text-sm font-bold mb-1 tracking-tight ${textColor}`}>
                {alert.alertType === 'ENCOURAGEMENT' ? 'Encouraging Progress' :
                 alert.alertType === 'MILESTONE' ? 'Goal Update' :
                 alert.alertType === 'WEEKLY_UPDATE' ? 'Weekly Progress' :
                 alert.alertType === 'GOAL_CREATED' ? 'New Goal Active' :
                 alert.alertType === 'GOAL_COMPLETED' ? 'Goal Achieved!' :
                 alert.alertType === 'GOAL_FAILED' ? 'Goal Review Needed' :
                 'Goal Notification'}
              </h4>
              <p className={`text-sm leading-relaxed ${textColor} font-medium opacity-90`}>{alert.message}</p>
            </div>
            <button
              onClick={() => {
                setDismissedAlerts(prev => {
                  const newSet = new Set(prev);
                  newSet.add(index);
                  return newSet;
                });
              }}
              className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 hover:bg-white focus:opacity-100"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default GoalAlertsWidget;
