import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminBadgeService from '../../services/AdminBadgeService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { Award, Target, Trophy, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];

export default function AdminBadgeAnalytics() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['adminBadgeAnalytics', selectedYear],
    queryFn: () => AdminBadgeService.getBadgeAnalytics(selectedYear),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    toast.error('Failed to load badge analytics');
    return null;
  }

  const analytics = response?.data;
  if (!analytics) return null;

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Total Badges Created</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{analytics.totalBadges}</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Badges Awarded</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{analytics.totalBadgesAwarded}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Most Earned Badge</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 truncate">
            {analytics.mostEarnedBadge?.name || 'N/A'}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {analytics.mostEarnedBadge?.count || 0} awards
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Least Earned Badge</h3>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 truncate">
            {analytics.leastEarnedBadge?.name || 'N/A'}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {analytics.leastEarnedBadge?.count || 0} awards
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Awards Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Badge Awards Trend ({selectedYear})</h3>
              <p className="text-sm text-slate-500">Monthly breakdown of badges distributed to users</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthlyAwards}>
                <defs>
                  <linearGradient id="colorAwards" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="count" stroke="#10B981" fillOpacity={1} fill="url(#colorAwards)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Badge Distribution</h3>
          <p className="text-sm text-slate-500 mb-6">Badges grouped by difficulty</p>
          <div className="h-[300px] flex items-center justify-center">
            {analytics.difficultyDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="label"
                  >
                    {analytics.difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">No distribution data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
