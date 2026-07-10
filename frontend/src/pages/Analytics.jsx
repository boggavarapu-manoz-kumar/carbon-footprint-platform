import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import AnalyticsService from '../services/AnalyticsService';
import EnterpriseDistributionChart from '../components/analytics/EnterpriseDistributionChart';
import EmissionsTrendChart from '../components/analytics/EmissionsTrendChart';
import { DailyTimelineAnalyticsChart } from '../components/analytics/DailyTimelineAnalyticsChart';
import ErrorBoundary from '../components/common/ErrorBoundary';

const TABS = [
  { id: 'daily',   label: 'Daily' },
  { id: 'weekly',  label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly',  label: 'Yearly' },
];

const toISODate = (date) => date.toISOString().split('T')[0];

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-lg" />)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-[400px] bg-slate-100 rounded-lg" />
      <div className="h-[400px] bg-slate-100 rounded-lg" />
    </div>
  </div>
);

const KpiCard = ({ label, value, unit = 'kg CO2e', change, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors"
  >
    <div className="flex items-start justify-between mb-2">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {change !== undefined && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          change >= 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      )}
    </div>
    <div className="flex items-baseline gap-2">
      <p className="text-2xl font-semibold text-slate-900">
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}
      </p>
      {unit && <p className="text-sm text-slate-500">{unit}</p>}
    </div>
  </motion.div>
);

const SectionCard = ({ title, subtitle, children, className = '', delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white border border-slate-200 rounded-lg p-6 ${className}`}
  >
    <div className="mb-6">
      {typeof title === 'string' ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : title}
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

const Analytics = () => {
  const [activeTab, setActiveTab]       = useState('daily');
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: years = [] } = useQuery({
    queryKey: ['analytics', 'years'],
    queryFn:  () => AnalyticsService.getAvailableYears(),
    staleTime: 1000 * 60 * 10,
  });

  const dailyQ = useQuery({
    queryKey: ['analytics', 'daily', selectedDate],
    queryFn:  () => AnalyticsService.getDailyAnalytics(selectedDate),
    enabled:  activeTab === 'daily',
    staleTime: 1000 * 60 * 2,
  });

  const weeklyQ = useQuery({
    queryKey: ['analytics', 'weekly', selectedDate],
    queryFn:  () => AnalyticsService.getWeeklyAnalytics(selectedDate),
    enabled:  activeTab === 'weekly',
    staleTime: 1000 * 60 * 2,
  });

  const monthlyQ = useQuery({
    queryKey: ['analytics', 'monthly', selectedDate],
    queryFn:  () => AnalyticsService.getMonthlyAnalytics(selectedDate),
    enabled:  activeTab === 'monthly',
    staleTime: 1000 * 60 * 2,
  });

  const yearlyQ = useQuery({
    queryKey: ['analytics', 'yearly', selectedYear],
    queryFn:  () => AnalyticsService.getYearlyAnalytics(selectedYear),
    enabled:  activeTab === 'yearly',
    staleTime: 1000 * 60 * 5,
  });

  const currentQuery = { daily: dailyQ, weekly: weeklyQ, monthly: monthlyQ, yearly: yearlyQ }[activeTab];
  const data = currentQuery?.data;
  const isLoading = currentQuery?.isLoading;
  const isError = currentQuery?.isError;

  const timeline = useMemo(() => {
    if (!data?.timeline) return [];
    return data.timeline.map(pt => ({
      label: pt.label,
      emissions: Number(pt.emissions || 0),
    }));
  }, [data]);

  const getCategoryEmissions = (categoryName) => {
    if (!data?.categoryShares) return 0;
    const cat = data.categoryShares.find(c => c.category.toLowerCase() === categoryName.toLowerCase());
    return cat ? Number(cat.emissions) : 0;
  };

  const isDaily = activeTab === 'daily';

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
              <p className="text-sm text-slate-500 mt-1">Review your carbon footprint data and trends.</p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-md">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

              {activeTab === 'yearly' ? (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors cursor-pointer"
                >
                  {years.length > 0
                    ? years.map(y => <option key={y} value={y}>{y}</option>)
                    : [new Date().getFullYear(), new Date().getFullYear() - 1].map(y => <option key={y} value={y}>{y}</option>)
                  }
                </select>
              ) : (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingSkeleton />
            </motion.div>
          ) : isError ? (
            <motion.div key="error" className="flex flex-col items-center justify-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-slate-500 text-sm">Failed to load analytics data.</p>
            </motion.div>
          ) : !data ? (
            <motion.div key="empty" className="flex flex-col items-center justify-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-slate-500 text-sm">No data available for the selected period.</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab + selectedDate + selectedYear}
              className="space-y-6"
            >
              {/* KPIs Section */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <KpiCard
                  label={isDaily ? "Today's Total Emission" : "Total Emissions"}
                  value={Number(data.totalEmissions || 0)}
                  delay={0.1}
                />
                <KpiCard
                  label={isDaily ? "Today's Activities" : "Total Activities"}
                  value={Number(data.totalActivities || 0)}
                  unit="activities"
                  delay={0.15}
                />
                <KpiCard
                  label="Transport"
                  value={getCategoryEmissions('transport')}
                  delay={0.2}
                />
                <KpiCard
                  label="Electricity"
                  value={getCategoryEmissions('electricity')}
                  delay={0.25}
                />
                <KpiCard
                  label="Food"
                  value={getCategoryEmissions('food')}
                  delay={0.3}
                />
                <KpiCard
                  label="Shopping"
                  value={getCategoryEmissions('shopping')}
                  delay={0.35}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard 
                  title={isDaily ? "Daily Category Breakdown" : "Category Breakdown"} 
                  delay={0.4}
                >
                  <ErrorBoundary>
                    <EnterpriseDistributionChart data={data.categoryShares || []} />
                  </ErrorBoundary>
                </SectionCard>

                <SectionCard delay={0.5}>
                  <ErrorBoundary>
                    {isDaily ? (
                      <DailyTimelineAnalyticsChart 
                        data={data?.rawActivities || []} 
                        date={new Date(selectedDate)}
                      />
                    ) : (
                      <EmissionsTrendChart
                        data={timeline}
                        title="Emissions Trend"
                        defaultChartType="labeled"
                        isDaily={false}
                      />
                    )}
                  </ErrorBoundary>
                </SectionCard>
              </div>

              {/* Data Insights */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Data Insights</h4>
                    <div className="mt-1 text-sm text-blue-800 space-y-1">
                      {data.totalEmissions > 0 ? (
                        <>
                          <p>
                            • Your highest emitting category for this period is <strong>{
                              [...(data.categoryShares || [])].sort((a,b) => b.emissions - a.emissions)[0]?.category || 'N/A'
                            }</strong>.
                          </p>
                          <p>
                            • You've logged <strong>{data.totalActivities || 0}</strong> activities, resulting in a total of <strong>{Number(data.totalEmissions).toLocaleString(undefined, { maximumFractionDigits: 2 })} kg CO2e</strong>.
                          </p>
                          {data.periodOverPeriodChange !== undefined && data.periodOverPeriodChange !== 0 && (
                            <p>
                              • This represents a <strong>{Math.abs(data.periodOverPeriodChange).toFixed(1)}% {data.periodOverPeriodChange > 0 ? 'increase' : 'decrease'}</strong> compared to the previous period.
                            </p>
                          )}
                        </>
                      ) : (
                        <p>No emissions recorded for this period. Try logging an activity!</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Analytics;
