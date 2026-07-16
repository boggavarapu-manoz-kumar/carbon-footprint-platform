import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import ActivityService from '../services/ActivityService';
import AnalyticsService from '../services/AnalyticsService';
import ErrorState from '../components/ErrorState';
import EnterpriseDistributionChart from '../components/analytics/EnterpriseDistributionChart';
import EmissionsTrendChart from '../components/analytics/EmissionsTrendChart';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { formatActivityType, getActivityIcon } from '../utils/formatters';
import RecommendationService from '../services/RecommendationService';
import { CheckCircle2 } from 'lucide-react';
import WeeklyProgressCard from '../components/WeeklyProgressCard';
import GoalAlertsWidget from '../components/GoalAlertsWidget';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: userProfile } = useProfile();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch stats and activities in parallel
        const [daily, weekly, monthly, activitiesData, recsData] = await Promise.all([
          AnalyticsService.getDailyAnalytics(today),
          AnalyticsService.getWeeklyAnalytics(today),
          AnalyticsService.getMonthlyAnalytics(today),
          ActivityService.getActivities({ page: 0, size: 5, sort: 'logDate,desc' }),
          RecommendationService.getPersonalizedRecommendations()
        ]);
        
        // Map the backend structure to our UI structure
        const mappedStats = [
          { 
            name: "Today's Activities", 
            value: (daily?.totalActivities || 0).toString(), 
            change: 'Today', 
            trend: 'up',
            icon: ActivityIcon
          },
          { 
            name: "Today's CO₂ Emissions", 
            value: `${(daily?.totalEmissions || 0).toFixed(1)} kg`, 
            change: 'Today',
            trend: 'up',
            icon: CloudIcon
          },
          { 
            name: 'Weekly Emissions', 
            value: `${(weekly?.totalEmissions || 0).toFixed(1)} kg`, 
            change: 'Past 7 days',
            trend: 'up',
            icon: CloudIcon
          },
          { 
            name: 'Monthly Emissions', 
            value: `${(monthly?.totalEmissions || 0).toFixed(1)} kg`, 
            change: 'This Month',
            trend: 'up',
            icon: ChartIcon
          }
        ];
        
        setStats(mappedStats);
        setMonthlyData(monthly);
        setRecentActivities(activitiesData?.content || []);
        
        // Sort recommendations by impact level priority
        const sortedRecs = (recsData || []).sort((a, b) => {
          const priorityMap = { high: 3, medium: 2, low: 1 };
          const aP = priorityMap[a.impactLevel?.toLowerCase()] || 0;
          const bP = priorityMap[b.impactLevel?.toLowerCase()] || 0;
          return bP - aP;
        });
        setRecommendations(sortedRecs);

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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
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

        {/* Goal Alerts Widget */}
        <GoalAlertsWidget />

        {/* Weekly Progress Card */}
        <div className="mb-8">
          <WeeklyProgressCard />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-slate-900">Category Breakdown</h3>
              <p className="text-sm text-slate-500 mt-1">Your emissions distributed by category this month.</p>
            </div>
            <ErrorBoundary>
              <EnterpriseDistributionChart data={monthlyData?.categoryShares || []} />
            </ErrorBoundary>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-slate-900">Emissions Trend</h3>
              <p className="text-sm text-slate-500 mt-1">Your carbon footprint progression this month.</p>
            </div>
            <ErrorBoundary>
              <EmissionsTrendChart
                data={(monthlyData?.timeline || []).map(pt => ({
                  label: pt.label,
                  emissions: Number(pt.emissions || 0)
                }))}
                title="Emissions Trend"
                defaultChartType="labeled"
                isDaily={false}
              />
            </ErrorBoundary>
          </div>
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

        {/* Personalized Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-8 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Personalized Action Plan</h2>
              <p className="mt-1 text-sm text-slate-500">Based on your top 3 highest-emission activities over the last 30 days.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, i) => {
                const isHigh = rec.impactLevel?.toLowerCase() === 'high';
                const badgeColor = isHigh ? 'bg-red-50 text-red-700 border-red-200/60' : 'bg-slate-100 text-slate-700 border-slate-200';
                const progressPercent = rec.reductionPercentageTarget ? (rec.reductionPercentageTarget * 100).toFixed(0) : 0;
                const recommendationsList = rec.recommendation?.split('\n').filter(r => r.trim() !== '') || [];

                return (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg text-slate-900 capitalize tracking-tight">{rec.activity}</h3>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${badgeColor}`}>
                              {rec.impactLevel} Impact
                            </span>
                            <span className="text-xs text-slate-500 capitalize">{rec.difficultyLevel} Effort</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900">{progressPercent}%</div>
                          <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Target</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        {recommendationsList.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-slate-700 leading-relaxed">{item.replace(/^- /, '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 border-t border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Projected Reductions (kg CO₂e)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 divide-x divide-slate-200">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-slate-900">{rec.potentialWeeklyReduction?.toFixed(1) || '0'}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">Weekly</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-slate-900">{rec.potentialMonthlyReduction?.toFixed(1) || '0'}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">Monthly</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-slate-900">{rec.potentialYearlyReduction?.toFixed(1) || '0'}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">Yearly</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
