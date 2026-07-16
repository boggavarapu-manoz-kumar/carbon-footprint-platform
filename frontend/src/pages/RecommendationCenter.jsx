import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import RecommendationService from '../services/RecommendationService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  BarChart2, 
  CheckCircle2, 
  ChevronRight, 
  Target, 
  TrendingDown, 
  TrendingUp, 
  Zap,
  Activity,
  AlertCircle
} from 'lucide-react';

const RecommendationCenter = () => {
  const [activeTab, setActiveTab] = useState('recommendations');

  const { data: recommendations, isLoading: isRecLoading, error: recError } = useQuery({
    queryKey: ['personalizedRecommendations'],
    queryFn: RecommendationService.getPersonalizedRecommendations
  });

  const { data: effectiveness, isLoading: isEffLoading, error: effError } = useQuery({
    queryKey: ['recommendationEffectiveness'],
    queryFn: RecommendationService.getRecommendationEffectiveness
  });

  const isLoading = isRecLoading || isEffLoading;
  const error = recError || effError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-8 mt-8">
        <div className="bg-white border border-red-200 p-6 rounded-lg shadow-sm flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Failed to load data</h3>
            <p className="text-sm text-slate-500 mt-1">{error.message || 'Please try again later.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedRecs = recommendations ? [...recommendations].sort((a, b) => {
    const priorityMap = { high: 3, medium: 2, low: 1 };
    const aP = priorityMap[a.impactLevel?.toLowerCase()] || 0;
    const bP = priorityMap[b.impactLevel?.toLowerCase()] || 0;
    return bP - aP;
  }) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50">
      
      {/* Professional Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Recommendation Center</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Dynamically generated action plans and performance tracking based on your specific 30-day emission profile.
        </p>
      </div>

      {/* Clean Segmented Control / Tabs */}
      <div className="mb-8 flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-max">
        {['recommendations', 'effectiveness'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-6 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              activeTab === tab ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-md shadow-sm border border-slate-200/60"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tab === 'recommendations' ? 'Action Plan' : 'Performance Tracking'}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              {sortedRecs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sortedRecs.map((rec, i) => (
                    <ActionCard key={i} rec={rec} delay={i * 0.05} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No pending actions" desc="Your emission profile is currently optimized." />
              )}
            </div>
          )}

          {activeTab === 'effectiveness' && (
            <div className="space-y-6">
              {effectiveness?.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {effectiveness.map((item, i) => (
                    <TrackingCard key={i} item={item} delay={i * 0.05} />
                  ))}
                </div>
              ) : (
                <EmptyState title="Insufficient data" desc="We need more historical data to generate tracking insights." />
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const EmptyState = ({ title, desc }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
    <Activity className="w-8 h-8 text-slate-300 mx-auto mb-4" />
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    <p className="text-sm text-slate-500 mt-1">{desc}</p>
  </div>
);

const ActionCard = ({ rec, delay }) => {
  const isHigh = rec.impactLevel?.toLowerCase() === 'high';
  const badgeColor = isHigh ? 'bg-red-50 text-red-700 border-red-200/60' : 'bg-slate-100 text-slate-700 border-slate-200';
  const progressPercent = rec.reductionPercentageTarget ? (rec.reductionPercentageTarget * 100).toFixed(0) : 0;
  const recommendationsList = rec.recommendation?.split('\n').filter(r => r.trim() !== '') || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 400, damping: 30 }}
      className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
    >
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-lg text-slate-900 capitalize tracking-tight">{rec.activity}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${badgeColor}`}>
                {rec.impactLevel} Impact
              </span>
            </div>
            <p className="text-xs text-slate-500 capitalize">{rec.difficultyLevel} Effort Required</p>
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
    </motion.div>
  );
};

const TrackingCard = ({ item, delay }) => {
  const isSuccess = item.status === 'SUCCESS';
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring", stiffness: 400, damping: 30 }}
      className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-base text-slate-900 capitalize tracking-tight">{item.category}</h3>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {isSuccess ? 'Optimized' : 'Action Needed'}
          </span>
        </div>
        
        <div className="flex items-center gap-6 mt-4">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Previous</div>
            <div className="text-lg font-semibold text-slate-900">{item.beforeEmission?.toFixed(1) || '0'} <span className="text-xs text-slate-500 font-normal">kg</span></div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Current</div>
            <div className="text-lg font-semibold text-slate-900">{item.afterEmission?.toFixed(1) || '0'} <span className="text-xs text-slate-500 font-normal">kg</span></div>
          </div>
        </div>
      </div>

      <div className="hidden md:block w-px h-16 bg-slate-200"></div>

      <div className="flex items-center gap-8 md:min-w-[300px]">
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Net Change</div>
          <div className={`flex items-center gap-1.5 text-lg font-semibold ${isSuccess ? 'text-emerald-600' : 'text-red-600'}`}>
            {isSuccess ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            {Math.abs(item.emissionReduction || 0).toFixed(1)} <span className="text-xs font-normal opacity-70">kg</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Optimization Score</span>
            <span className="text-xs font-semibold text-slate-900">{item.improvementScore}/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div 
              className={`h-full rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`} 
              style={{ width: `${Math.max(0, Math.min(100, item.improvementScore || 0))}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationCenter;
