import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import ActivityService from '../services/ActivityService';
import ErrorState from '../components/ErrorState';
import { formatActivityType, getActivityIcon } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: userProfile } = useProfile();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsData = await ActivityService.getDashboardStatistics();
        
        // Map the backend structure to our UI structure
        const mappedStats = [
          { 
            name: 'Total Activities', 
            value: (statsData?.totalActivities || 0).toString(), 
            change: 'Lifetime', 
            trend: 'up',
            icon: ActivityIcon
          },
          { 
            name: 'Total CO₂ Emissions', 
            value: `${(statsData?.totalEmissions || 0).toFixed(1)} kg`, 
            change: 'Lifetime',
            trend: 'up',
            icon: CloudIcon
          },
          { 
            name: 'Monthly Emissions', 
            value: `${(statsData?.currentMonthEmissions || 0).toFixed(1)} kg`, 
            change: (statsData?.previousMonthEmissions || 0) > 0 
              ? `${((((statsData?.currentMonthEmissions || 0) - (statsData?.previousMonthEmissions || 0)) / (statsData?.previousMonthEmissions || 1)) * 100).toFixed(1)}% vs last month`
              : 'New month started',
            trend: (statsData?.currentMonthEmissions || 0) >= (statsData?.previousMonthEmissions || 0) ? 'up' : 'down',
            icon: ChartIcon
          },
          { 
            name: 'Weekly Emissions', 
            value: `${(statsData?.weeklyEmissions || 0).toFixed(1)} kg`, 
            change: 'Past 7 days',
            trend: 'up',
            icon: CloudIcon
          },
          { 
            name: 'Sustainability Score', 
            value: (statsData?.sustainabilityScore || 0).toString(), 
            change: 'Top 20%',
            trend: 'up',
            icon: ShieldIcon
          },
        ];
        setStats(mappedStats);

        // Fetch recent activities (page 0, size 5)
        const activitiesData = await ActivityService.getActivities({ page: 0, size: 5, sort: 'logDate,desc' });
        setRecentActivities(activitiesData.content || []);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen font-sans text-slate-900 pb-12 pt-8">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen font-sans bg-slate-50 text-slate-900 pb-12 pt-8">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorState 
            title="Unable to load dashboard"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-12 pt-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome & Quick Actions Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {userProfile?.firstName || user?.firstName || 'Manoj'}</h1>
            <p className="mt-1 text-sm text-slate-500">Here's your carbon footprint overview for today.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/log-activity')} className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Log Activity
            </button>
            <button onClick={() => navigate('/activity-history')} className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
              View History
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {stats?.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
                <div className="text-sm">
                  <span className={`font-medium ${stat.trend === 'up' && stat.name !== 'Sustainability Score' && stat.name !== 'Total Activities' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activities Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Recent Activities</h3>
            <button onClick={() => navigate('/activity-history')} className="text-sm font-medium text-emerald-600 hover:text-emerald-500">View all</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivities.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <h3 className="text-sm font-medium text-slate-900">No activities</h3>
                <p className="mt-1 text-sm text-slate-500">Get started by logging your first activity.</p>
                <div className="mt-6">
                  <button onClick={() => navigate('/log-activity')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
                    Log Activity
                  </button>
                </div>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                      {getActivityIcon(activity.activityType, activity.category)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{formatActivityType(activity.activityType)}</p>
                      <p className="text-xs font-medium text-slate-500">{activity.category ? formatActivityType(activity.category) : 'Activity'} • {new Date(activity.logDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full inline-block">{activity.emissionValue.toFixed(2)} kg CO₂</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.quantity} {activity.unit}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

// Icons (unchanged)
const ActivityIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const CloudIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
);
const ChartIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
);
const ShieldIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);

export default Dashboard;
