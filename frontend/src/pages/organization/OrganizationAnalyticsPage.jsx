import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { Leaf, Users, TrendingDown, Activity, Lock, BarChart3, ArrowUp, Target } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, CartesianGrid, Cell, PieChart, Pie, Legend
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const StatCard = ({ label, value, suffix, icon: Icon, gradient, delay = 0 }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 ${gradient}`}
    style={{ animation: `fadeInUp 0.5s ease-out ${delay}s both` }}
  >
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
    <div className="absolute -right-2 -top-2 w-14 h-14 bg-white/10 rounded-full pointer-events-none" />
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-semibold text-white/80 uppercase tracking-wide">{label}</p>
        <div className="p-2 bg-white/20 rounded-xl">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-black text-white tracking-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && <span className="text-base font-semibold ml-1 text-white/80">{suffix}</span>}
      </p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-xl px-4 py-3 shadow-lg">
        <p className="text-xs font-bold text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-extrabold text-slate-800">{payload[0].value.toFixed(2)} kg CO₂e</p>
      </div>
    );
  }
  return null;
};

export const OrganizationAnalyticsPage = () => {
  const { id: orgId } = useParams();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['orgAnalytics', orgId],
    queryFn: async () => {
      const res = await api.get(`/v1/organizations/${orgId}/analytics`);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  if (analytics.privacyStatus === 'INSUFFICIENT_DATA') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><BarChart3 className="w-6 h-6" /></div>
            Organization Analytics
          </h2>
        </div>
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 border border-amber-200 rounded-3xl p-10 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse">
            <Lock className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-amber-900 mb-3 tracking-tight">Data Masked for Privacy</h3>
          <p className="text-amber-700/80 max-w-lg font-medium leading-relaxed mb-8">{analytics.message}</p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <div className="bg-white/70 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-3xl font-black text-amber-900">{analytics.totalMembers}</p>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mt-1">Total Members</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-3xl font-black text-amber-900">{analytics.activeMembers}</p>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mt-1">Active Members</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const deptData = analytics.departmentEmissions
    ? Object.entries(analytics.departmentEmissions).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    : [];

  const pieData = deptData.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          Organization Analytics
        </h2>
        <p className="text-slate-500 mt-1 font-medium ml-1">
          Aggregated sustainability insights — individual data is always protected.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Emissions"
          value={(analytics.totalCarbonFootprint || 0).toFixed(2)}
          suffix="kg CO₂e"
          icon={Leaf}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          delay={0.05}
        />
        <StatCard
          label="Active Members"
          value={analytics.activeMembers || 0}
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          delay={0.1}
        />
        <StatCard
          label="Avg per Member"
          value={(analytics.avgCarbonPerMember || 0).toFixed(2)}
          suffix="kg CO₂e"
          icon={TrendingDown}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          delay={0.15}
        />
        <StatCard
          label="Total Activities"
          value={analytics.totalActivities || 0}
          icon={Activity}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          delay={0.2}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
          <h3 className="text-base font-bold text-slate-800 mb-6">Emissions by Department</h3>
          {deptData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Emissions" radius={[6, 6, 0, 0]}>
                    {deptData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                <p className="font-medium">No department data yet</p>
                <p className="text-xs mt-1">Activity data will appear here as members log activities</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] space-y-4">
          <h3 className="text-base font-bold text-slate-800">Analytics Snapshot</h3>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                This view aggregates data from <strong>{analytics.activeMembers}</strong> active members. Individual data is never exposed.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 font-medium leading-relaxed">
                A minimum of <strong>3 active members</strong> is required before aggregate data is visible.
              </p>
            </div>
          </div>

          {pieData.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Department Distribution</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
