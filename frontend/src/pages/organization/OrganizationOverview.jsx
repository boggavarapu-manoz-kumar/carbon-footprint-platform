import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { useTranslation } from 'react-i18next';
import { Users, UserCheck, Mail, Calendar, Activity, ShieldCheck, Settings, Leaf, TrendingDown, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { OrganizationLeaderboard } from './components/OrganizationLeaderboard';

const fetchOrganizationOverview = async (orgId) => {
  const response = await api.get(`/v1/organizations/${orgId}/overview`);
  return response.data;
};

const fetchOrganizationAnalytics = async (orgId) => {
  const response = await api.get(`/v1/organizations/${orgId}/analytics`);
  return response.data;
};

const MetricCard = ({ title, value, icon: Icon, colorClass, subtitle, delay = 0 }) => (
  <div 
    className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 group"
    style={{ animation: `fadeInUp 0.6s ease-out ${delay}s both` }}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent opacity-50 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
    <div className="relative flex items-start justify-between z-10">
      <div>
        <p className="text-sm font-semibold text-slate-500/80 mb-1 tracking-wide uppercase">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs font-medium text-slate-400 mt-2">{subtitle}</p>}
      </div>
      <div className={`p-3.5 rounded-xl ${colorClass} shadow-inner transition-transform duration-300 group-hover:rotate-6`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const OrganizationOverview = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['organizationOverview', id],
    queryFn: () => fetchOrganizationOverview(id),
    onError: () => toast.error(t('organization.overview.error', 'Failed to load organization overview'))
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['orgAnalytics', id],
    queryFn: () => fetchOrganizationAnalytics(id),
  });

  if (overviewLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (overviewError || !overview) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{t('organization.overview.error', 'Failed to load organization overview')}</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-700"></div>
        
        <div className="relative flex items-center gap-6 z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-lg transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
            <span className="text-3xl font-black">{overview.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">{overview.name}</h1>
              <span className="px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/50 border border-emerald-800/50 rounded-full backdrop-blur-sm shadow-inner uppercase tracking-wider">
                {overview.status}
              </span>
            </div>
            <p className="text-sm text-slate-300 flex items-center gap-5 font-medium">
              <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> {t('organization.code', 'Org Code')}: <span className="text-white font-mono tracking-wider">{overview.organizationCode}</span>
              </span>
              <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-sm hidden sm:flex">
                <Calendar className="w-4 h-4 text-indigo-400" /> {formatDate(overview.createdAt)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Setup Progress */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                <Settings className="w-5 h-5 animate-[spin_4s_linear_infinite]" />
              </div>
              {t('organization.setup_progress', 'Setup Progress')}
            </h3>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {t('organization.setup_desc', 'Complete your organization profile to unlock all features.')}
            </p>
          </div>
          <span className="text-3xl font-black text-indigo-600 drop-shadow-sm">{overview.setupProgress}%</span>
        </div>
        <div className="w-full bg-slate-100/80 rounded-full h-4 mb-2 overflow-hidden border border-slate-200/50 shadow-inner p-0.5">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out relative shadow-sm"
            style={{ width: `${overview.setupProgress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 rounded-full blur-[2px]"></div>
          </div>
        </div>
      </div>

      {/* Analytics Summary Grid */}
      {analytics && analytics.privacyStatus === 'OK' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title={t('organization.total_footprint', 'Organization Footprint')}
            value={`${analytics.totalCarbonFootprint?.toFixed(2) || 0} kg CO2e`}
            icon={Leaf}
            colorClass="bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 border border-emerald-200/50"
            subtitle={t('organization.total_emissions', 'Total verified emissions')}
            delay={0.1}
          />
          <MetricCard
            title={t('organization.avg_footprint', 'Average per Member')}
            value={`${analytics.avgCarbonPerMember?.toFixed(2) || 0} kg CO2e`}
            icon={TrendingDown}
            colorClass="bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 border border-indigo-200/50"
            subtitle={t('organization.avg_emissions', 'Average individual footprint')}
            delay={0.2}
          />
        </div>
      )}

      {analytics && analytics.privacyStatus === 'INSUFFICIENT_DATA' && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/60 p-8 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-200/50 text-amber-600 rounded-2xl shrink-0 shadow-sm border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-amber-900 tracking-tight">{t('organization.privacy_masked', 'Analytics Masked for Privacy')}</h3>
            <p className="text-sm font-medium text-amber-700/80 mt-1 max-w-lg leading-relaxed">
              {analytics.message}
            </p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title={t('organization.total_members', 'Total Members')}
          value={overview.memberCount.toLocaleString()}
          icon={Users}
          colorClass="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 border border-blue-200/50"
          subtitle={t('organization.active_and_suspended', 'Active and suspended users')}
          delay={0.3}
        />
        <MetricCard
          title={t('organization.active_members', 'Active Members')}
          value={overview.activeMembers.toLocaleString()}
          icon={UserCheck}
          colorClass="bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 border border-emerald-200/50"
          subtitle={t('organization.currently_active', 'Currently active on platform')}
          delay={0.4}
        />
        <MetricCard
          title={t('organization.pending_invitations', 'Pending Invitations')}
          value={overview.pendingInvitations.toLocaleString()}
          icon={Mail}
          colorClass="bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 border border-amber-200/50"
          subtitle={t('organization.awaiting_acceptance', 'Awaiting acceptance')}
          delay={0.5}
        />
      </div>
      
      <OrganizationLeaderboard organizationId={id} />

    </div>
  );
};

export default OrganizationOverview;
