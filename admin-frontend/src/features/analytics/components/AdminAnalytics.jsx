import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Activity, Leaf, BarChart3,
  Target, Award, ChevronRight, AlertTriangle, Loader2, Calendar, CalendarDays, CalendarRange, Zap, Star
} from 'lucide-react';
import { analyticsApi } from '../api/analyticsApi';

// ─── Colour Palettes ─────────────────────────────────────────────
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
const GRADIENT_FROM = { platform: '#6366f1', carbon: '#10b981', user: '#06b6d4', activity: '#f59e0b' };

// ─── Shared Components ───────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'indigo', loading }) => {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    sky: 'from-sky-500 to-sky-600',
    amber: 'from-amber-500 to-amber-600',
    violet: 'from-violet-500 to-violet-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-lg shadow-${color}-100`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        )}
        <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, loading, actions }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions}
    </div>
    {loading ? (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    ) : (
      <div className="h-64">{children}</div>
    )}
  </div>
);

const SectionHeader = ({ title, description, icon: Icon }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="p-2.5 rounded-xl bg-indigo-50">
      <Icon className="h-5 w-5 text-indigo-600" />
    </div>
    <div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const EmptyState = ({ message = 'No data available' }) => (
  <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
    <AlertTriangle className="h-8 w-8" />
    <span className="text-sm">{message}</span>
  </div>
);

const fmt = (n) => {
  if (n === null || n === undefined) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Number(n).toLocaleString();
};

const fmtKg = (n) => `${fmt(n)} kg`;

// ─── TAB DEFINITIONS ────────────────────────────────────────────
const TABS = [
  { id: 'daily',       label: 'Daily',       icon: Calendar  },
  { id: 'weekly',      label: 'Weekly',      icon: CalendarDays },
  { id: 'monthly',     label: 'Monthly',     icon: CalendarRange },
  { id: 'platform',   label: 'Platform',    icon: BarChart3  },
  { id: 'carbon',     label: 'Carbon',      icon: Leaf       },
  { id: 'users',      label: 'Users',       icon: Users      },
  { id: 'activity',   label: 'Activity',    icon: Activity   },
  { id: 'leaderboard',label: 'Leaderboard', icon: Award      },
  { id: 'trends',     label: 'Trends',      icon: TrendingUp },
];

// ──────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────
export const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [activityDays, setActivityDays] = useState(30);
  const [carbonDays, setCarbonDays] = useState(30);
  const [userDays, setUserDays] = useState(30);

  // ─── Data Fetching ──────────────────────────────────────────
  const { data: platform, isLoading: platformLoading } = useQuery({
    queryKey: ['admin-analytics-platform'],
    queryFn: analyticsApi.getPlatformAnalytics,
    staleTime: 5 * 60 * 1000,
  });

  const { data: trendComparison, isLoading: trendCompLoading } = useQuery({
    queryKey: ['admin-analytics-trend-comparison'],
    queryFn: analyticsApi.getTrendComparison,
    staleTime: 5 * 60 * 1000,
  });

  const { data: userGrowth, isLoading: userGrowthLoading } = useQuery({
    queryKey: ['admin-analytics-user-growth', userDays],
    queryFn: () => analyticsApi.getUserGrowth(userDays),
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'users' || activeTab === 'platform',
  });

  const { data: userDemographics, isLoading: demogLoading } = useQuery({
    queryKey: ['admin-analytics-user-demographics'],
    queryFn: analyticsApi.getUserDemographics,
    staleTime: 10 * 60 * 1000,
    enabled: activeTab === 'users',
  });

  const { data: activityTrends, isLoading: actTrendsLoading } = useQuery({
    queryKey: ['admin-analytics-activity-trends', activityDays],
    queryFn: () => analyticsApi.getActivityTrends(activityDays),
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'activity' || activeTab === 'platform',
  });

  const { data: activityDetails, isLoading: actDetailsLoading } = useQuery({
    queryKey: ['admin-analytics-activity-details'],
    queryFn: analyticsApi.getActivityAnalytics,
    staleTime: 10 * 60 * 1000,
    enabled: activeTab === 'activity',
  });

  const { data: carbonTrends, isLoading: carbonLoading } = useQuery({
    queryKey: ['admin-analytics-carbon-trends', carbonDays],
    queryFn: () => analyticsApi.getCarbonTrends(carbonDays),
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'carbon' || activeTab === 'platform',
  });

  const { data: carbonMonthly, isLoading: carbonMonthlyLoading } = useQuery({
    queryKey: ['admin-analytics-carbon-monthly'],
    queryFn: analyticsApi.getCarbonMonthlyTrends,
    staleTime: 10 * 60 * 1000,
    enabled: activeTab === 'carbon',
  });

  const { data: leaderboard, isLoading: lbLoading } = useQuery({
    queryKey: ['admin-analytics-leaderboard'],
    queryFn: () => analyticsApi.getLeaderboardAnalytics(20),
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'leaderboard',
  });

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['admin-analytics-categories'],
    queryFn: analyticsApi.getCategoryAnalytics,
    staleTime: 10 * 60 * 1000,
  });

  // ─── Shared chart tooltip ────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
        <p className="font-semibold text-gray-700 mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="flex justify-between gap-4">
            <span>{p.name}</span>
            <span className="font-bold">{typeof p.value === 'number' && p.value > 10 ? fmt(p.value) : p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  const DaySelector = ({ value, onChange }) => (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {[7, 30, 90].map(d => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${value === d ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {d}d
        </button>
      ))}
    </div>
  );

  // ─── PLATFORM TAB ──────────────────────────────────────────
  const renderPlatform = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={fmt(platform?.totalUsers)} icon={Users} color="indigo" loading={platformLoading} trend={trendComparison?.userChangePercent} />
        <StatCard title="Total Activities" value={fmt(platform?.totalActivities)} icon={Activity} color="sky" loading={platformLoading} trend={trendComparison?.activityChangePercent} />
        <StatCard title="Total CO₂ (kg)" value={fmtKg(platform?.totalEmissions)} icon={Leaf} color="emerald" loading={platformLoading} trend={trendComparison?.emissionChangePercent} />
        <StatCard title="New Users (30d)" value={fmt(platform?.activeUsers)} icon={TrendingUp} color="amber" loading={platformLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="User Growth" subtitle="Cumulative registrations" loading={userGrowthLoading}>
          {userGrowth?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="totalUsers" name="Total Users" stroke="#6366f1" fill="url(#gradUsers)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

        <ChartCard title="Activity Trends" subtitle="Daily activity volume" loading={actTrendsLoading}>
          {activityTrends?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityTrends} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="activityCount" name="Activities" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>
      </div>

      <ChartCard title="Carbon Emissions by Category" subtitle="Platform-wide category breakdown" loading={catLoading}>
        {categories?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <YAxis dataKey="categoryName" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalEmissions" name="Total CO₂ (kg)" radius={[0, 4, 4, 0]}>
                {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState />}
      </ChartCard>
    </div>
  );

  // ─── CARBON TAB ──────────────────────────────────────────────
  const renderCarbon = () => (
    <div className="space-y-6">
      <SectionHeader title="Carbon Analytics" description="Platform-wide CO₂ emission analysis" icon={Leaf} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard title="Total Emissions" value={fmtKg(platform?.totalEmissions)} icon={Leaf} color="emerald" loading={platformLoading} trend={trendComparison?.emissionChangePercent} subtitle="All time" />
        <StatCard title="This Month" value={fmtKg(trendComparison?.thisMonthEmissions)} icon={TrendingUp} color="sky" loading={trendCompLoading} />
        <StatCard title="Last Month" value={fmtKg(trendComparison?.lastMonthEmissions)} icon={TrendingDown} color="amber" loading={trendCompLoading} />
      </div>

      <ChartCard
        title="Daily Emission Trends"
        subtitle="Total CO₂ across all users"
        loading={carbonLoading}
        actions={<DaySelector value={carbonDays} onChange={setCarbonDays} />}
      >
        {carbonTrends?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={carbonTrends} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gradCarbon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="totalEmissions" name="CO₂ (kg)" stroke="#10b981" fill="url(#gradCarbon)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <EmptyState />}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Emissions (This Year)" subtitle="Month-over-month CO₂ breakdown" loading={carbonMonthlyLoading}>
          {carbonMonthly?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carbonMonthly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalEmissions" name="CO₂ (kg)" radius={[4, 4, 0, 0]}>
                  {carbonMonthly.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

        <ChartCard title="Emissions by Category" subtitle="Category share of total platform CO₂" loading={catLoading}>
          {categories?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="totalEmissions" nameKey="categoryName" cx="50%" cy="50%" outerRadius={90} label={({ categoryName, percent }) => `${categoryName} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>
      </div>
    </div>
  );

  // ─── USERS TAB ───────────────────────────────────────────────
  const renderUsers = () => (
    <div className="space-y-6">
      <SectionHeader title="User Analytics" description="Registration trends and demographics" icon={Users} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={fmt(platform?.totalUsers)} icon={Users} color="indigo" loading={platformLoading} />
        <StatCard title="New This Month" value={fmt(trendComparison?.thisMonthUsers)} icon={TrendingUp} color="emerald" loading={trendCompLoading} trend={trendComparison?.userChangePercent} />
        <StatCard title="Last Month" value={fmt(trendComparison?.lastMonthUsers)} icon={Users} color="sky" loading={trendCompLoading} />
      </div>

      <ChartCard
        title="User Registration Trend"
        subtitle="Daily new registrations"
        loading={userGrowthLoading}
        actions={<DaySelector value={userDays} onChange={setUserDays} />}
      >
        {userGrowth?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowth} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="newRegistrations" name="New Registrations" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="totalUsers" name="Total Users" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyState />}
      </ChartCard>

      <ChartCard title="Gender Distribution" subtitle="User demographic breakdown" loading={demogLoading}>
        {userDemographics?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={userDemographics} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={100} label={({ gender, count }) => `${gender}: ${count}`}>
                {userDemographics.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : <EmptyState />}
      </ChartCard>
    </div>
  );

  // ─── ACTIVITY TAB ────────────────────────────────────────────
  const renderActivity = () => (
    <div className="space-y-6">
      <SectionHeader title="Activity Analytics" description="Platform-wide activity patterns and emissions" icon={Activity} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Activities" value={fmt(platform?.totalActivities)} icon={Activity} color="sky" loading={platformLoading} />
        <StatCard title="This Month" value={fmt(trendComparison?.thisMonthActivities)} icon={TrendingUp} color="emerald" loading={trendCompLoading} trend={trendComparison?.activityChangePercent} />
        <StatCard title="Last Month" value={fmt(trendComparison?.lastMonthActivities)} icon={Activity} color="amber" loading={trendCompLoading} />
      </div>

      <ChartCard
        title="Activity Volume Over Time"
        subtitle="Daily logged activities across all users"
        loading={actTrendsLoading}
        actions={<DaySelector value={activityDays} onChange={setActivityDays} />}
      >
        {activityTrends?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityTrends} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="activityCount" name="Activities" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState />}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Activity Count by Category" subtitle="Which categories are used most" loading={actDetailsLoading}>
          {activityDetails?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityDetails} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 90 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalActivities" name="Activities" radius={[0, 4, 4, 0]}>
                  {activityDetails.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

        <ChartCard title="Avg Emissions per Activity" subtitle="Average CO₂ per logged activity" loading={actDetailsLoading}>
          {activityDetails?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityDetails} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 90 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}kg`} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgEmissions" name="Avg CO₂ (kg)" radius={[0, 4, 4, 0]}>
                  {activityDetails.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>
      </div>
    </div>
  );

  // ─── LEADERBOARD TAB ─────────────────────────────────────────
  const renderLeaderboard = () => (
    <div className="space-y-6">
      <SectionHeader title="Leaderboard Analytics" description="Top users by carbon emission volume" icon={Award} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Top 20 Users by Total Emissions</h3>
          <p className="text-xs text-gray-500 mt-0.5">Ranked highest to lowest carbon footprint</p>
        </div>
        {lbLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : leaderboard?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total CO₂</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Activities</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg per Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leaderboard.map((user, i) => {
                  const avg = user.totalActivities > 0 ? (parseFloat(user.totalEmissions) / user.totalActivities).toFixed(2) : 0;
                  const rankColors = ['text-amber-500', 'text-gray-400', 'text-amber-700'];
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`font-bold text-lg ${i < 3 ? rankColors[i] : 'text-gray-400'}`}>#{i + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {(user.firstName?.[0] || user.username?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">{fmtKg(user.totalEmissions)}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{fmt(user.totalActivities)}</td>
                      <td className="px-6 py-4 text-right text-gray-500">{avg} kg</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400 text-sm">No leaderboard data available</div>
        )}
      </div>
    </div>
  );

  // ─── TRENDS TAB ──────────────────────────────────────────────
  const renderTrends = () => (
    <div className="space-y-6">
      <SectionHeader title="Trend Analytics" description="Month-over-month platform comparison" icon={TrendingUp} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Emission Change MoM</p>
          {trendCompLoading ? <div className="h-10 bg-gray-100 animate-pulse rounded-lg mt-3" /> : (
            <>
              <p className={`text-3xl font-bold mt-2 ${trendComparison?.emissionChangePercent >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {trendComparison?.emissionChangePercent >= 0 ? '+' : ''}{trendComparison?.emissionChangePercent?.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">vs last month</p>
            </>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Activity Change MoM</p>
          {trendCompLoading ? <div className="h-10 bg-gray-100 animate-pulse rounded-lg mt-3" /> : (
            <>
              <p className={`text-3xl font-bold mt-2 ${trendComparison?.activityChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {trendComparison?.activityChangePercent >= 0 ? '+' : ''}{trendComparison?.activityChangePercent?.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">vs last month</p>
            </>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">User Growth MoM</p>
          {trendCompLoading ? <div className="h-10 bg-gray-100 animate-pulse rounded-lg mt-3" /> : (
            <>
              <p className={`text-3xl font-bold mt-2 ${trendComparison?.userChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {trendComparison?.userChangePercent >= 0 ? '+' : ''}{trendComparison?.userChangePercent?.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">vs last month</p>
            </>
          )}
        </div>
      </div>

      <ChartCard title="Carbon vs Activity Correlation" subtitle="Overlay of emission volume and activity count" loading={carbonLoading || actTrendsLoading}>
        {carbonTrends?.length ? (() => {
          const merged = carbonTrends.map((c, i) => ({
            period: c.period,
            emissions: parseFloat(c.totalEmissions) || 0,
            activities: activityTrends?.[i]?.activityCount || 0,
          }));
          return (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={merged} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="emissions" name="CO₂ (kg)" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="activities" name="Activities" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          );
        })() : <EmptyState />}
      </ChartCard>

      <ChartCard title="Annual Emissions (Monthly)" subtitle="Full year CO₂ trend" loading={carbonMonthlyLoading}>
        {carbonMonthly?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={carbonMonthly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gradTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="totalEmissions" name="CO₂ (kg)" stroke="#8b5cf6" fill="url(#gradTrend)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <EmptyState />}
      </ChartCard>
    </div>
  );

  // ─── DAILY TAB ───────────────────────────────────────────────
  const { data: daily, isLoading: dailyLoading, refetch: refetchDaily } = useQuery({
    queryKey: ['admin-analytics-daily'],
    queryFn: analyticsApi.getDailyAnalytics,
    staleTime: 60 * 1000,           // refresh every 60 s
    refetchInterval: 2 * 60 * 1000, // auto-refresh every 2 min
  });

  const renderDaily = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const hourly = daily?.hourlyData || [];

    const KPI_CARDS = [
      { title: 'Active Users Today',     value: fmt(daily?.activeUsersToday),   icon: Users,    color: 'indigo',  subtitle: 'Users who logged activity' },
      { title: 'Activities Logged Today',value: fmt(daily?.activitiesToday),    icon: Activity, color: 'sky',     subtitle: 'Total logs since midnight' },
      { title: 'CO₂ Emitted Today',      value: fmtKg(daily?.emissionsToday),  icon: Leaf,     color: 'emerald', subtitle: 'Platform total (kg CO₂)' },
      { title: 'Goals Achieved Today',   value: fmt(daily?.goalsAchievedToday),icon: Target,   color: 'amber',   subtitle: 'Status changed to Achieved' },
      { title: 'Badges Earned Today',    value: fmt(daily?.badgesEarnedToday), icon: Star,     color: 'violet',  subtitle: 'Awarded since midnight' },
      { title: 'New Users Today',        value: fmt(daily?.newUsersToday),     icon: Zap,      color: 'indigo',  subtitle: 'Registered since midnight' },
    ];

    return (
      <div className="space-y-6">
        {/* Header Strip */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Daily Platform Analytics</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-3.5 w-3.5" /> {today}
            </p>
          </div>
          <button
            onClick={() => refetchDaily()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Activity className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* KPI Cards — 6 cards in 3 × 2 grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {KPI_CARDS.map(k => (
            <StatCard key={k.title} title={k.title} value={k.value} subtitle={k.subtitle}
              icon={k.icon} color={k.color} loading={dailyLoading} />
          ))}
        </div>

        {/* Hourly Activity Graph */}
        <ChartCard
          title="Hourly Activity Volume"
          subtitle="Activities logged every hour today (12 AM – 11 PM)"
          loading={dailyLoading}
        >
          {hourly.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="gradDailyAct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} angle={-35} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="activities" name="Activities" fill="url(#gradDailyAct)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState message="No activities logged yet today" />}
        </ChartCard>

        {/* Hourly Carbon Emissions Graph */}
        <ChartCard
          title="Hourly Carbon Emissions"
          subtitle="CO₂ (kg) emitted per hour today"
          loading={dailyLoading}
        >
          {hourly.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="gradDailyCarbon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} angle={-35} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${parseFloat(v).toFixed(1)}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="emissions" name="CO₂ (kg)" stroke="#10b981"
                  fill="url(#gradDailyCarbon)" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState message="No emissions data yet today" />}
        </ChartCard>

        {/* Hourly Active User Trend */}
        <ChartCard
          title="Hourly Active User Trend"
          subtitle="Distinct users active per hour today"
          loading={dailyLoading}
        >
          {hourly.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} angle={-35} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="activeUsers" name="Active Users"
                  stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#6366f1', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState message="No user activity yet today" />}
        </ChartCard>

        {/* Hourly Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Full Hourly Breakdown</h3>
            <p className="text-xs text-gray-500 mt-0.5">All 24 hours — actual timestamps, all users aggregated</p>
          </div>
          {dailyLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hour</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Activities</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">CO₂ (kg)</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {hourly.map(slot => (
                    <tr key={slot.hour}
                      className={`transition-colors ${ slot.activities > 0 ? 'hover:bg-indigo-50/30' : 'opacity-50' }`}
                    >
                      <td className="px-6 py-3 font-medium text-gray-700">
                        <span className={`inline-flex items-center gap-2 ${ slot.activities > 0 ? 'text-indigo-700' : 'text-gray-400' }`}>
                          {slot.activities > 0 && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                          {slot.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">{slot.activities || '—'}</td>
                      <td className="px-6 py-3 text-right text-emerald-700 font-medium">
                        {slot.emissions > 0 ? `${parseFloat(slot.emissions).toFixed(3)} kg` : '—'}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-600">{slot.activeUsers || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── WEEKLY TAB ───────────────────────────────────────────────
  const { data: weekly, isLoading: weeklyLoading, refetch: refetchWeekly } = useQuery({
    queryKey: ['admin-analytics-weekly'],
    queryFn: analyticsApi.getWeeklyAnalytics,
    staleTime: 5 * 60 * 1000,
  });

  const renderWeekly = () => {
    const wData = weekly?.weeklyData || [];

    const KPI_CARDS = [
      { title: 'Activities This Week', value: fmt(weekly?.totalActivities), icon: Activity, color: 'sky',     trend: weekly?.activitiesChangePct },
      { title: 'Active Users',         value: fmt(weekly?.totalUsers),      icon: Users,    color: 'indigo',  trend: weekly?.usersChangePct },
      { title: 'CO₂ Emitted (kg)',     value: fmtKg(weekly?.totalEmissions),icon: Leaf,     color: 'emerald', trend: weekly?.emissionsChangePct },
      { title: 'Goals Achieved',       value: fmt(weekly?.totalGoals),      icon: Target,   color: 'amber',   trend: weekly?.goalsChangePct },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Weekly Platform Analytics</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <CalendarDays className="h-3.5 w-3.5" /> Current Week (Monday - Sunday)
            </p>
          </div>
          <button
            onClick={() => refetchWeekly()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${weeklyLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map(k => (
            <StatCard key={k.title} title={k.title} value={k.value} trend={k.trend}
              icon={k.icon} color={k.color} loading={weeklyLoading} subtitle="vs previous week" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trend Graph (Activities) */}
          <ChartCard title="Weekly Trend Graph" subtitle="Activities logged per day" loading={weeklyLoading}>
            {wData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="gradWeeklyAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dayOfWeek" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="activities" name="Activities" fill="url(#gradWeeklyAct)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No data for this week" />}
          </ChartCard>

          {/* Weekly Carbon Graph */}
          <ChartCard title="Weekly Carbon Graph" subtitle="Total CO₂ emitted (kg) per day" loading={weeklyLoading}>
            {wData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="gradWeeklyCarbon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dayOfWeek" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${parseFloat(v).toFixed(1)}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="emissions" name="CO₂ (kg)" stroke="#10b981"
                    fill="url(#gradWeeklyCarbon)" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No data for this week" />}
          </ChartCard>

          {/* Weekly User Growth Graph */}
          <ChartCard title="Weekly User Growth Graph" subtitle="Active users per day" loading={weeklyLoading}>
            {wData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dayOfWeek" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="activeUsers" name="Active Users"
                    stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No data for this week" />}
          </ChartCard>

          {/* Weekly Activity Heatmap (Using ComposedChart/Bar for visualization) */}
          <ChartCard title="Weekly Activity Heatmap" subtitle="Activities vs Goals Achieved" loading={weeklyLoading}>
            {wData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dayOfWeek" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="activities" name="Activities" fill="#818cf8" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="goalsAchieved" name="Goals" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No data for this week" />}
          </ChartCard>
        </div>

        {/* Weekly Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Weekly Breakdown (Mon-Sun)</h3>
          </div>
          {weeklyLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-indigo-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Day</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Activities</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Users</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">CO₂ (kg)</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Goals Achieved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {wData.map(slot => (
                    <tr key={slot.dayOfWeek} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-700">
                        {slot.dayOfWeek} <span className="text-gray-400 text-xs ml-2">({slot.dateLabel})</span>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">{slot.activities || '—'}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{slot.activeUsers || '—'}</td>
                      <td className="px-6 py-3 text-right text-emerald-700 font-medium">{slot.emissions > 0 ? `${parseFloat(slot.emissions).toFixed(2)} kg` : '—'}</td>
                      <td className="px-6 py-3 text-right text-amber-600 font-medium">{slot.goalsAchieved || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── MONTHLY TAB ───────────────────────────────────────────────
  const { data: monthly, isLoading: monthlyLoading, refetch: refetchMonthly } = useQuery({
    queryKey: ['admin-analytics-monthly'],
    queryFn: analyticsApi.getMonthlyAnalytics,
    staleTime: 5 * 60 * 1000,
  });

  const renderMonthly = () => {
    const mData = monthly?.weeklyData || [];
    const catData = monthly?.categoryData || [];

    const KPI_CARDS = [
      { title: 'Activities This Month', value: fmt(monthly?.totalActivities), icon: Activity, color: 'sky',     trend: monthly?.activitiesChangePct },
      { title: 'Active Users',          value: fmt(monthly?.totalUsers),      icon: Users,    color: 'indigo',  trend: monthly?.usersChangePct },
      { title: 'CO₂ Emitted (kg)',      value: fmtKg(monthly?.totalEmissions),icon: Leaf,     color: 'emerald', trend: monthly?.emissionsChangePct },
      { title: 'Goals Achieved',        value: fmt(monthly?.totalGoals),      icon: Target,   color: 'amber',   trend: monthly?.goalsChangePct },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Monthly Platform Analytics</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <CalendarRange className="h-3.5 w-3.5" /> Current Month (Weeks 1 - 5)
            </p>
          </div>
          <button
            onClick={() => refetchMonthly()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${monthlyLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map(k => (
            <StatCard key={k.title} title={k.title} value={k.value} trend={k.trend}
              icon={k.icon} color={k.color} loading={monthlyLoading} subtitle="vs prev month" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend Graph (Activities & Carbon) */}
          <ChartCard title="Monthly Trend" subtitle="Activities vs CO₂ over the weeks" loading={monthlyLoading}>
            {mData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="activities" name="Activities" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="emissions" name="CO₂ (kg)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No data for this month" />}
          </ChartCard>

          {/* Weekly Breakdown (Users) */}
          <ChartCard title="Weekly Breakdown" subtitle="Active users per week" loading={monthlyLoading}>
            {mData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="gradMonthlyUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="activeUsers" name="Active Users" stroke="#6366f1"
                    fill="url(#gradMonthlyUsers)" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No data for this month" />}
          </ChartCard>

          {/* Category Distribution */}
          <ChartCard title="Category Distribution" subtitle="Emissions by category this month" loading={monthlyLoading}>
            {catData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} dataKey="emissions" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {catData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} kg CO₂`} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No category data" />}
          </ChartCard>

          {/* Goal Performance */}
          <ChartCard title="Goal Performance" subtitle="Goals achieved per week" loading={monthlyLoading}>
            {mData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="goalsAchieved" name="Goals Achieved" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No data for this month" />}
          </ChartCard>
        </div>

        {/* Monthly Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Monthly Breakdown (Weeks)</h3>
          </div>
          {monthlyLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-indigo-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Week</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Activities</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Users</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">CO₂ (kg)</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Goals Achieved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mData.map(slot => (
                    <tr key={slot.weekLabel} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-700">{slot.weekLabel}</td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">{slot.activities || '—'}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{slot.activeUsers || '—'}</td>
                      <td className="px-6 py-3 text-right text-emerald-700 font-medium">{slot.emissions > 0 ? `${parseFloat(slot.emissions).toFixed(2)} kg` : '—'}</td>
                      <td className="px-6 py-3 text-right text-amber-600 font-medium">{slot.goalsAchieved || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabContent = {
    monthly: renderMonthly(),
    weekly: renderWeekly(),
    daily: renderDaily(),
    platform: renderPlatform(),
    carbon: renderCarbon(),
    users: renderUsers(),
    activity: renderActivity(),
    leaderboard: renderLeaderboard(),
    trends: renderTrends(),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span>Admin</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-indigo-600 font-medium">Analytics Center</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Enterprise Analytics</h1>
              <p className="text-sm text-gray-500">Platform-wide sustainability intelligence</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Data
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mt-4 -mb-px overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {tabContent[activeTab]}
      </div>
    </div>
  );
};
