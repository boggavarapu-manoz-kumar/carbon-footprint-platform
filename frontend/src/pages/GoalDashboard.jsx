import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GoalService from '../services/GoalService';
import ErrorBoundary from '../components/common/ErrorBoundary';
import Button from '../components/common/Button';
import { 
  ArrowLeft, 
  Target, 
  CalendarDays, 
  Activity, 
  TrendingUp, 
  Clock,
  History,
  Edit2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import GoalActions from '../components/goals/GoalActions';
import GoalEditModal from '../components/goals/GoalEditModal';
import GoalHistoryModal from '../components/goals/GoalHistoryModal';
import GoalPredictionWidget from '../components/GoalPredictionWidget';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const GoalDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { data: goal, isLoading: isGoalLoading, refetch: refetchGoal } = useQuery({
    queryKey: ['goal', id],
    queryFn: () => GoalService.getGoalById(id),
  });

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['goalAnalytics', id],
    queryFn: () => GoalService.getGoalAnalytics(id),
  });

  if (isGoalLoading || isAnalyticsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!goal || !analytics) {
    return (
      <div className="text-center p-12">
        <p className="text-slate-500 mb-4">Goal data could not be loaded.</p>
        <Button onClick={() => navigate('/dashboard/goals')}>Return to Goals</Button>
      </div>
    );
  }

  const progressColor = goal.status === 'FAILED' ? 'text-rose-500' : goal.status === 'ACHIEVED' ? 'text-emerald-500' : 'text-blue-500';
  const progressBg = goal.status === 'FAILED' ? 'bg-rose-50' : goal.status === 'ACHIEVED' ? 'bg-emerald-50' : 'bg-blue-50';

  // Format data for timeline
  const formattedTimeline = analytics.timeline.map(pt => {
    const dateObj = new Date(pt.date);
    return {
      ...pt,
      formattedDate: `${dateObj.getMonth()+1}/${dateObj.getDate()}`
    };
  });

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/dashboard/goals')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{goal.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${progressBg} ${progressColor}`}>
                {goal.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{goal.description || 'Enterprise Goal Dashboard'}</p>
          </div>
          
          <div className="ml-auto flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowHistory(true)} className="flex items-center gap-2">
              <History className="w-4 h-4" /> History
            </Button>
            <Button variant="outline" onClick={() => setShowEdit(true)} className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit
            </Button>
            <GoalActions goal={goal} onUpdate={refetchGoal} onDelete={() => navigate('/dashboard/goals')} />
          </div>
        </div>

        {showHistory && <GoalHistoryModal goalId={goal.id} onClose={() => setShowHistory(false)} />}
        {showEdit && <GoalEditModal goal={goal} onClose={() => setShowEdit(false)} onUpdate={refetchGoal} />}

        {/* Predictive Engine Widget */}
        {goal.status !== 'ACHIEVED' && goal.status !== 'FAILED' && goal.status !== 'CANCELLED' && (
          <div className="mb-8">
            <GoalPredictionWidget goalId={goal.id} targetEmission={goal.targetEmission} />
          </div>
        )}

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Progress Ring Card */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors"></div>
            <div className="relative w-32 h-32 flex items-center justify-center z-10">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-slate-100" strokeWidth="8" fill="none" />
                <circle 
                  cx="50" cy="50" r="40" 
                  className={`transition-all duration-1500 ease-out ${goal.status === 'FAILED' ? 'stroke-rose-500' : 'stroke-emerald-500'}`} 
                  strokeWidth="8" fill="none" 
                  strokeDasharray={`${Math.min(analytics.progressPercent, 100) * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 tracking-tight">{analytics.progressPercent}%</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 z-10">Completion</span>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
            <div className="flex items-center gap-2 mb-2 z-10">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target vs Current</span>
            </div>
            <div className="flex items-baseline gap-2 mt-4 z-10">
              <span className="text-4xl font-black text-slate-900 tracking-tight">{analytics.currentProgress}</span>
              <span className="text-sm text-slate-500 font-semibold">/ {analytics.targetEmission} kg CO₂</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-5 overflow-hidden z-10">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(analytics.progressPercent, 100)}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors"></div>
            <div className="flex items-center gap-2 mb-2 z-10">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining Time</span>
            </div>
            <div className="flex items-baseline gap-2 mt-4 z-10">
              <span className="text-4xl font-black text-slate-900 tracking-tight">{analytics.remainingDays}</span>
              <span className="text-sm text-slate-500 font-semibold">days left</span>
            </div>
            <div className="text-xs text-slate-400 mt-3 font-medium z-10">Out of {analytics.totalDays} total days</div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
            <div className="flex items-center gap-2 mb-2 z-10">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Pace</span>
            </div>
            <div className="flex items-baseline gap-2 mt-4 z-10">
              <span className="text-4xl font-black text-slate-900 tracking-tight">{analytics.weeklyProgress}</span>
              <span className="text-sm text-slate-500 font-semibold">kg CO₂</span>
            </div>
            <div className="text-xs text-slate-400 mt-3 font-medium z-10">Logged in the last 7 days</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Timeline Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-slate-900">Goal Progress Timeline</h3>
              <p className="text-sm text-slate-500 mt-1">Cumulative emissions vs Ideal burn-down rate.</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedTimeline} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="formattedDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                    dy={10}
                    minTickGap={20}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                  <Line 
                    type="monotone" 
                    name="Actual Emissions"
                    dataKey="cumulativeEmissions" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      // Only show a dot if there is an actual emission value
                      if (payload.cumulativeEmissions !== null && payload.cumulativeEmissions !== undefined) {
                        return <circle cx={cx} cy={cy} r={4} fill="#fff" stroke="#10b981" strokeWidth={2} />;
                      }
                      return null;
                    }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981' }}
                    style={{ filter: 'drop-shadow(0px 4px 6px rgba(16, 185, 129, 0.2))' }}
                  />
                  <Line 
                    type="linear" 
                    name="Ideal Pace"
                    dataKey="idealBurn" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    strokeDasharray="6 6" 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-slate-900">Category Breakdown</h3>
              <p className="text-sm text-slate-500 mt-1">Where emissions come from.</p>
            </div>
            
            {analytics.categoryShares.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No data yet</p>
              </div>
            ) : (
              <>
                <div className="h-48 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryShares}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="emissions"
                        nameKey="category"
                      >
                        {analytics.categoryShares.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => `${value} kg CO₂`}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  {analytics.categoryShares.map((share, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="text-sm font-medium text-slate-700 capitalize">{share.category.replace('_', ' ').toLowerCase()}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{share.percentage}%</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </ErrorBoundary>
  );
};

export default GoalDashboard;
