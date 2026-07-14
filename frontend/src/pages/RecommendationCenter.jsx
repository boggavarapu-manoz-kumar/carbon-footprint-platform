import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import RecommendationService from '../services/RecommendationService';
import { AlertTriangle, Info, ShieldAlert, CheckCircle, Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading recommendations</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message || 'Please try again later.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const highImpact = recommendations?.filter(r => r.impactLevel?.toLowerCase() === 'high') || [];
  const mediumImpact = recommendations?.filter(r => r.impactLevel?.toLowerCase() === 'medium') || [];
  const lowImpact = recommendations?.filter(r => r.impactLevel?.toLowerCase() === 'low') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-amber-500" />
          Recommendation Center
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-3xl">
          Based on your recent activity, we've identified your top emission sources and generated personalized strategies to help you reduce your carbon footprint.
        </p>
      </div>

      <div className="flex border-b border-slate-200 mb-6 space-x-8">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'recommendations' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Action Plan
        </button>
        <button
          onClick={() => setActiveTab('effectiveness')}
          className={`py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'effectiveness' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Effectiveness Tracker
        </button>
      </div>

      {activeTab === 'recommendations' && (
        <div className="space-y-12">
          {highImpact.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" /> High Impact Areas
              </h2>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {highImpact.map((rec, i) => <RecommendationCard key={i} rec={rec} />)}
              </div>
            </section>
          )}

          {mediumImpact.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Info className="w-5 h-5 text-amber-500" /> Medium Impact Areas
              </h2>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {mediumImpact.map((rec, i) => <RecommendationCard key={i} rec={rec} />)}
              </div>
            </section>
          )}

          {lowImpact.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" /> Quick Wins
              </h2>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {lowImpact.map((rec, i) => <RecommendationCard key={i} rec={rec} />)}
              </div>
            </section>
          )}

          {recommendations?.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">No major emission sources detected</h3>
              <p className="mt-1 text-sm text-slate-500">Log more activities to get personalized recommendations.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'effectiveness' && (
        <div className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {effectiveness?.map((item, i) => <EffectivenessCard key={i} item={item} />)}
          </div>
          {effectiveness?.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Info className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">Not enough data</h3>
              <p className="mt-1 text-sm text-slate-500">We need at least 2 months of activity to track effectiveness.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RecommendationCard = ({ rec }) => {
  const isHigh = rec.impactLevel?.toLowerCase() === 'high';
  const isMedium = rec.impactLevel?.toLowerCase() === 'medium';
  
  const impactColor = isHigh ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                      isMedium ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-emerald-50 text-emerald-700 border-emerald-200';

  const diffColor = rec.difficultyLevel?.toLowerCase() === 'easy' ? 'text-emerald-600 bg-emerald-50' :
                    rec.difficultyLevel?.toLowerCase() === 'medium' ? 'text-amber-600 bg-amber-50' :
                    'text-rose-600 bg-rose-50';

  const recommendationsList = rec.recommendation?.split('\n').filter(r => r.trim() !== '') || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg text-slate-900 capitalize leading-tight">
            {rec.activity}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${impactColor}`}>
            {rec.impactLevel} Impact
          </span>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-slate-500 mb-1">Target Reduction</div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {rec.reductionPercentageTarget ? (rec.reductionPercentageTarget * 100).toFixed(0) : '0'}%
            </span>
            <span className="text-sm font-medium mb-1 text-slate-600">Goal</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Action Plan</h4>
          <ul className="space-y-2">
            {recommendationsList.map((item, idx) => (
              <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                <span>{item.replace(/^- /, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="bg-slate-50 p-5 border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase">Estimated Savings</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${diffColor}`}>
            {rec.difficultyLevel} Effort
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
            <div className="text-lg font-semibold text-emerald-600">{rec.potentialWeeklyReduction?.toFixed(1) || '0'}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Weekly</div>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
            <div className="text-lg font-semibold text-emerald-600">{rec.potentialMonthlyReduction?.toFixed(1) || '0'}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Monthly</div>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
            <div className="text-lg font-semibold text-emerald-600">{rec.potentialYearlyReduction?.toFixed(0) || '0'}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Yearly</div>
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-slate-400">kg CO₂e</div>
      </div>
    </div>
  );
};

const EffectivenessCard = ({ item }) => {
  const isSuccess = item.status === 'SUCCESS';
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-slate-900 capitalize">{item.category}</h3>
        {isSuccess ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Success
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Needs Attention
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="text-xs text-slate-500 mb-1">Previous Month</div>
          <div className="text-xl font-semibold text-slate-900">{item.beforeEmission?.toFixed(1) || '0'} <span className="text-xs font-normal text-slate-500">kg CO₂e</span></div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="text-xs text-slate-500 mb-1">Current Month</div>
          <div className="text-xl font-semibold text-slate-900">{item.afterEmission?.toFixed(1) || '0'} <span className="text-xs font-normal text-slate-500">kg CO₂e</span></div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div>
          <div className="text-sm font-medium text-slate-500">Reduction</div>
          <div className={`flex items-center gap-2 mt-1 ${isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isSuccess ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            <span className="text-2xl font-bold">{Math.abs(item.emissionReduction || 0).toFixed(1)}</span>
            <span className="text-sm">kg CO₂e</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium text-slate-500 mb-1">Progress</div>
          <div className="text-2xl font-bold text-slate-900">{item.progressPercentage?.toFixed(1) || '0'}%</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Improvement Score</span>
          <span className="text-sm font-semibold text-slate-700">{item.improvementScore}/100</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} 
            style={{ width: `${Math.max(0, Math.min(100, item.improvementScore || 0))}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCenter;
