import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { analyticsApi } from '../../analytics/api/analyticsApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Activity, UserPlus, Leaf, ShieldAlert, Server, ActivitySquare, UserX, Shield } from 'lucide-react';
import { format } from 'date-fns';

// ----------------------------------------------------------------------
// 1. Reusable KPI Card Component
// ----------------------------------------------------------------------
const KPICard = React.memo(({ title, value, trend, icon: Icon, color, isLoading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse flex flex-col space-y-2 mt-auto">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      ) : (
        <div className="mt-auto">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-sm text-gray-400 ml-2">from last month</span>
          </div>
        </div>
      )}
    </div>
  );
});

// ----------------------------------------------------------------------
// 2. Main Dashboard Component
// ----------------------------------------------------------------------
export const Dashboard = () => {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard', 'statistics'],
    queryFn: dashboardApi.getStatistics,
  });

  const { data: trends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: dashboardApi.getTrends,
  });

  const { data: health, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['dashboard', 'health'],
    queryFn: dashboardApi.getSystemHealth,
  });

  const { data: auditEvents = [], isLoading: isLoadingAudit } = useQuery({
    queryKey: ['dashboard', 'auditEvents'],
    queryFn: dashboardApi.getAuditEvents,
  });

  // New Analytics Queries
  const { data: userGrowth, isLoading: isLoadingGrowth } = useQuery({
    queryKey: ['analytics', 'userGrowth'],
    queryFn: () => analyticsApi.getUserGrowth(30),
    staleTime: 300000,
  });

  const { data: activityTrends, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['analytics', 'activityTrends'],
    queryFn: () => analyticsApi.getActivityTrends(30),
    staleTime: 300000,
  });

  const { data: categoryAnalytics, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['analytics', 'categories'],
    queryFn: analyticsApi.getCategoryAnalytics,
    staleTime: 300000,
  });

  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['dashboard', 'leaderboard'],
    queryFn: dashboardApi.getTopEmitters,
    staleTime: 300000,
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Users" 
          value={isLoadingStats ? '-' : (stats?.totalUsers || 0).toLocaleString()} 
          trend={0} 
          icon={Users} 
          color="bg-blue-50 text-blue-600"
          isLoading={isLoadingStats}
        />
        <KPICard 
          title="Active Users" 
          value={isLoadingStats ? '-' : (stats?.activeUsers || 0).toLocaleString()} 
          trend={0} 
          icon={Activity} 
          color="bg-emerald-50 text-emerald-600"
          isLoading={isLoadingStats}
        />
        <KPICard 
          title="New Registrations" 
          value={isLoadingStats ? '-' : (stats?.newUsers || 0).toLocaleString()} 
          trend={0} 
          icon={UserPlus} 
          color="bg-purple-50 text-purple-600"
          isLoading={isLoadingStats}
        />
        <KPICard 
          title="Carbon Emissions (Tons)" 
          value={isLoadingStats ? '-' : (stats?.carbonEmissions || 0).toLocaleString()} 
          trend={0} 
          icon={Leaf} 
          color="bg-green-50 text-green-600"
          isLoading={isLoadingStats}
        />
        <KPICard 
          title="Total Activities" 
          value={isLoadingStats ? '-' : (stats?.totalActivities || 0).toLocaleString()} 
          trend={0} 
          icon={ActivitySquare} 
          color="bg-indigo-50 text-indigo-600"
          isLoading={isLoadingStats}
        />
        <KPICard 
          title="Suspended Users" 
          value={isLoadingStats ? '-' : (stats?.suspendedUsers || 0).toLocaleString()} 
          trend={0} 
          icon={UserX} 
          color="bg-red-50 text-red-600"
          isLoading={isLoadingStats}
        />
        <KPICard 
          title="Security Alerts" 
          value={isLoadingStats ? '-' : (stats?.securityAlerts || 0).toLocaleString()} 
          trend={0} 
          icon={ShieldAlert} 
          color="bg-orange-50 text-orange-600"
          isLoading={isLoadingStats}
        />
        <KPICard 
          title="Admin Count" 
          value={isLoadingStats ? '-' : (stats?.adminCount || 0).toLocaleString()} 
          trend={0} 
          icon={Shield} 
          color="bg-slate-50 text-slate-600"
          isLoading={isLoadingStats}
        />
      </div>

      {/* Row 2: Analytics & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Carbon Emission Trends (Last 30 Days)</h3>
          <div className="h-80 w-full">
            {isLoadingTrends ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val ? format(new Date(val), 'MMM dd') : ''}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}T`} 
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  labelFormatter={(val) => val ? format(new Date(val), 'MMM dd, yyyy') : ''}
                  formatter={(value) => [`${value} Tons`, 'Emissions']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="totalEmission" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* System Health Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-base font-semibold text-gray-900 mb-6">System Health</h3>
          
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${!isLoadingHealth && health?.status === 'healthy' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">API Status</p>
                  <p className="text-xs text-gray-500 capitalize">{isLoadingHealth ? 'Loading...' : (health?.status || 'Unknown')}</p>
                </div>
              </div>
              <span className="relative flex h-3 w-3">
                {!isLoadingHealth && health?.status === 'healthy' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isLoadingHealth ? 'bg-gray-300' : (health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500')}`}></span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">API Latency</p>
                  <p className="text-xs text-gray-500">{isLoadingHealth ? '-' : health?.apiLatency}ms avg</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Security Alerts</p>
                  <p className="text-xs text-gray-500">{isLoadingStats ? '-' : stats?.securityAlerts || 0} alerts found</p>
                </div>
              </div>
              {stats?.securityAlerts > 0 && (
                <span className="bg-red-100 text-red-700 py-0.5 px-2 rounded-full text-xs font-semibold">Action Required</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: New Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-6">User Growth & Registrations (Last 30 Days)</h3>
          <div className="h-80 w-full">
            {isLoadingGrowth ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => val ? format(new Date(val), 'MMM dd') : ''}
                  />
                  <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <Tooltip 
                    labelFormatter={(val) => val ? format(new Date(val), 'MMM dd, yyyy') : ''}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="totalUsers" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Users" />
                  <Line yAxisId="right" type="monotone" dataKey="newRegistrations" stroke="#10b981" strokeWidth={2} dot={false} name="New Registrations" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Activity Volume (Last 30 Days)</h3>
          <div className="h-80 w-full">
            {isLoadingActivity ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityTrends || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => val ? format(new Date(val), 'MMM dd') : ''}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <Tooltip 
                    labelFormatter={(val) => val ? format(new Date(val), 'MMM dd, yyyy') : ''}
                    cursor={{fill: '#f3f4f6'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Bar dataKey="activityCount" fill="#6366f1" radius={[4, 4, 0, 0]} name="Activities" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Category & Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Emissions by Category</h3>
          <div className="h-72 w-full">
            {isLoadingCategory ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryAnalytics || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="totalEmissions"
                    nameKey="category"
                    stroke="none"
                  >
                    {(categoryAnalytics || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} Tons`, 'Emissions']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: '500' }} 
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Top Emitters Leaderboard</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Emissions (Tons)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoadingLeaderboard ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">
                      Loading leaderboard...
                    </td>
                  </tr>
                ) : (leaderboard || []).length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">
                      No data available.
                    </td>
                  </tr>
                ) : (leaderboard || []).slice(0, 5).map((user, index) => (
                  <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">#{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-right">
                      {user.totalEmission}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 5: Audit Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Recent Audit Events</h3>
          <a href="/audit-logs" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingAudit ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading audit events...
                  </td>
                </tr>
              ) : auditEvents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                    No recent audit events found.
                  </td>
                </tr>
              ) : auditEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.admin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {format(new Date(event.timestamp), 'MMM d, h:mm a')}
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
