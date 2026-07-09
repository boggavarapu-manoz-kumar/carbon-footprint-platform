import React from 'react';

const AdvancedInsights = ({ data, timePeriod }) => {
  if (!data || !data.categoryShares || data.categoryShares.length === 0) {
    return null;
  }

  const topCategory = [...data.categoryShares].sort((a, b) => b.emissions - a.emissions)[0];
  const topName = topCategory.category.charAt(0).toUpperCase() + topCategory.category.slice(1).replace('_', ' ');
  const isHigh = topCategory.percentage > 40;

  return (
    <div className="bg-white border border-blue-200 border-l-4 border-l-blue-500 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-blue-500 mt-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Insight</h4>
          <p className="text-sm text-slate-600 mt-1">
            For {timePeriod}, <strong>{topName}</strong> was the primary source of emissions, accounting for <strong>{topCategory.percentage}%</strong> of the total footprint.
            {isHigh ? " This indicates a significant concentration in a single area." : " Emissions are relatively well-distributed across categories."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedInsights;
