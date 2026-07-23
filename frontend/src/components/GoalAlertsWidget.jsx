import React from 'react';
import { useQuery } from '@tanstack/react-query';
import GoalService from '../services/GoalService';
import { AlertCircle, CheckCircle2, Bell, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const GoalAlertsWidget = () => {
  const { data: alerts, isLoading, isError } = useQuery({
    queryKey: ['goalAlerts'],
    queryFn: () => GoalService.getGoalAlerts(),
    refetchInterval: 300000, // Refresh every 5 mins
  });

  if (isLoading || isError || !alerts || alerts.length === 0) {
    return null; // Don't show if loading, error, or empty
  }

  return (
    <div className="mb-6 space-y-3">
      {alerts.map((alert, index) => {
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
          <div key={index} className={`flex items-start gap-3 p-4 rounded-xl border ${bgColor} ${borderColor} shadow-sm`}>
            <div className={`mt-0.5 ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-semibold mb-1 ${textColor}`}>
                {alert.alertType === 'ENCOURAGEMENT' ? 'Encouraging Progress' :
                 alert.alertType === 'MILESTONE' ? 'Goal Update' :
                 alert.alertType === 'WEEKLY_UPDATE' ? 'Weekly Progress' :
                 'Goal Correction Needed'}
              </h4>
              <p className={`text-sm leading-relaxed ${textColor} opacity-90`}>{alert.message}</p>
            </div>
            <Link to="/dashboard/goals" className={`text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white ${textColor} hover:bg-slate-50 transition-colors shadow-sm`}>
              View Goals
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default GoalAlertsWidget;
