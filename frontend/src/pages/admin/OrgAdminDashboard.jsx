import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axiosConfig';
import { 
  Users, UserCheck, Mail, ArrowUpRight, ArrowDownRight, 
  TrendingUp, TrendingDown, Target, Award, Calendar, BarChart3, PieChart, Plus, X, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const OrgAdminDashboard = () => {
  const { orgContext, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('MONTHLY');
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ firstName: '', lastName: '', email: '' });
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);

  useEffect(() => {
    // Basic org security guard
    if (!orgContext || orgContext.role !== 'ORGANIZATION_ADMIN') {
      navigate('/dashboard');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/v1/organizations/${orgContext.organizationId}/analytics`, {
          params: { period }
        });
        setAnalytics(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [orgContext, navigate, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading organization analytics: {error}
      </div>
    );
  }

  const handleInviteEmployee = async (e) => {
    e.preventDefault();
    setInviteError(null);
    setIsInviting(true);
    try {
      await api.post(`/org/admin/${orgContext.organizationId}/employees/invite`, inviteData);
      import('react-hot-toast').then(m => m.toast.success('Invitation sent successfully!'));
      setInviteData({ firstName: '', lastName: '', email: '' });
      setIsInviteModalOpen(false);
      
      // Refresh analytics to show pending invites update
      const response = await api.get(`/api/v1/organizations/${orgContext.organizationId}/analytics`, {
        params: { period }
      });
      setAnalytics(response.data.data);
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  // Helper for trend icons
  const renderTrend = (change) => {
    if (change === 0) return <span className="text-slate-400 text-sm">-</span>;
    if (change > 0) return (
      <div className="flex items-center text-red-500 text-sm font-medium">
        <TrendingUp className="w-4 h-4 mr-1" />
        +{change.toFixed(1)}%
      </div>
    );
    return (
      <div className="flex items-center text-emerald-500 text-sm font-medium">
        <TrendingDown className="w-4 h-4 mr-1" />
        {change.toFixed(1)}%
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{orgContext.organizationName} Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your organization's sustainability impact.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="inline-flex bg-slate-100 rounded-lg p-1 hidden sm:flex">
            {['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === p 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Invite Employee
          </button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Footprint</p>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><BarChart3 className="w-4 h-4" /></div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{analytics.totalFootprint.toLocaleString(undefined, {maximumFractionDigits:1})} <span className="text-sm font-normal text-slate-500">kg CO2</span></h3>
            </div>
            {renderTrend(analytics.periodOverPeriodChange)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Active Employees</p>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><UserCheck className="w-4 h-4" /></div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <h3 className="text-2xl font-bold text-slate-900">{analytics.activeEmployees} <span className="text-sm font-normal text-slate-500">/ {analytics.totalEmployees}</span></h3>
            <div className="text-sm text-slate-500">{analytics.participationRate.toFixed(0)}% participation</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Avg per Employee</p>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{analytics.averageFootprintPerEmployee.toLocaleString(undefined, {maximumFractionDigits:1})} <span className="text-sm font-normal text-slate-500">kg CO2</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Pending Invites</p>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Mail className="w-4 h-4" /></div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{analytics.pendingInvitations}</h3>
          </div>
        </div>
      </div>

      {/* Goal Progress Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Target className="w-48 h-48 -mr-10 -mt-10" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Organization Reduction Target</h3>
            <p className="text-emerald-100 text-sm mb-4">You have reached {analytics.goalProgressPercentage.toFixed(1)}% of your allowed footprint budget for this period.</p>
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  analytics.goalProgressPercentage > 100 ? 'bg-red-500' : 'bg-white'
                }`}
                style={{ width: `${Math.min(analytics.goalProgressPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-black/20 rounded-lg p-4 text-center min-w-[150px]">
            <div className="text-xs text-emerald-200 uppercase font-bold tracking-wider mb-1">Target Budget</div>
            <div className="text-2xl font-black">{analytics.currentGoalTarget.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-sm font-normal">kg</span></div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Line Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-slate-400" />
            Emissions Trend
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.timeSeriesAnalytics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalEmissions" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{r: 4, strokeWidth: 2, fill: '#fff'}}
                  activeDot={{r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2}}
                  name="Emissions (kg CO2)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-slate-400" />
            Emissions by Category
          </h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={analytics.categoryAnalytics}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="totalEmissions"
                >
                  {analytics.categoryAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `${value.toFixed(1)} kg CO2`} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {analytics.categoryAnalytics.map((cat, idx) => (
              <div key={cat.category} className="flex items-center text-xs">
                <span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                <span className="truncate flex-1" title={cat.category}>{cat.category}</span>
                <span className="font-semibold">{cat.percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Detailed Category Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">Category Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Total Emissions</th>
                <th className="px-6 py-3 text-right">Share</th>
                <th className="px-6 py-3 text-right">Trend vs Prev Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {analytics.categoryAnalytics.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No activity data found for this period.</td></tr>
              ) : (
                analytics.categoryAnalytics.sort((a,b) => b.totalEmissions - a.totalEmissions).map((cat) => (
                  <tr key={cat.category} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">{cat.category}</td>
                    <td className="px-6 py-4 text-right">{cat.totalEmissions.toLocaleString(undefined, {maximumFractionDigits:1})} kg CO2</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{cat.percentage.toFixed(1)}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-400 rounded-full" style={{width: `${cat.percentage}%`}}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end">
                      {renderTrend(cat.percentageChange)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Invite Employee Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Invite Employee</h3>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {inviteError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {inviteError}
                </div>
              )}
              
              <form onSubmit={handleInviteEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      required
                      value={inviteData.firstName}
                      onChange={(e) => setInviteData({...inviteData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      required
                      value={inviteData.lastName}
                      onChange={(e) => setInviteData({...inviteData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={inviteData.email}
                    onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="jane.doe@company.com"
                  />
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-70 flex items-center"
                  >
                    {isInviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgAdminDashboard;
