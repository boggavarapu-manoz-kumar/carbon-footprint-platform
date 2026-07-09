import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORY_COLORS = {
  'transport': '#059669', // Emerald 600
  'electricity': '#2563EB', // Blue 600
  'food': '#D97706', // Amber 600
  'shopping': '#7C3AED', // Violet 600
  'default': '#64748B' // Slate 500
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 px-3 py-2 rounded shadow-sm text-sm">
        <p className="font-medium text-slate-900">{data.name}</p>
        <p className="text-slate-600">{data.value.toLocaleString()} kg CO2e</p>
        <p className="text-slate-500 text-xs mt-1">{data.percentage}%</p>
      </div>
    );
  }
  return null;
};

const EnterpriseDistributionChart = ({ data = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const formattedData = data.map(item => ({
    key: item.category || 'Unknown',
    name: (item.category || 'Unknown').replace('_', ' ').charAt(0).toUpperCase() + (item.category || 'Unknown').replace('_', ' ').slice(1),
    value: Number(item.emissions || 0),
    percentage: item.percentage || 0
  })).sort((a, b) => b.value - a.value);

  if (formattedData.length === 0 || formattedData.every(d => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
        No distribution data available
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full min-h-[300px] gap-8">
      {/* Chart Area */}
      <div className="relative w-[250px] h-[250px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              stroke="none"
            >
              {formattedData.map((entry, index) => {
                const color = CATEGORY_COLORS[entry.key.toLowerCase()] || CATEGORY_COLORS.default;
                const isHovered = activeIndex === index;
                const isFaded = activeIndex !== null && !isHovered;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={color}
                    opacity={isFaded ? 0.3 : 1}
                    style={{ transition: 'opacity 0.2s ease, transform 0.2s ease', transform: isHovered ? 'scale(1.02)' : 'scale(1)', transformOrigin: 'center' }}
                  />
                );
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           {activeIndex !== null ? (
             <div className="text-center">
               <p className="text-xs text-slate-500">{formattedData[activeIndex].name}</p>
               <p className="text-lg font-semibold text-slate-900">{formattedData[activeIndex].percentage}%</p>
             </div>
           ) : (
             <div className="text-center">
               <p className="text-xs text-slate-500">Total</p>
               <p className="text-base font-medium text-slate-900">
                  {formattedData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString(undefined, {maximumFractionDigits: 1})}
               </p>
             </div>
           )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-[200px]">
        {formattedData.map((entry, index) => {
          const color = CATEGORY_COLORS[entry.key.toLowerCase()] || CATEGORY_COLORS.default;
          const isHovered = activeIndex === index;
          
          return (
            <div 
              key={`legend-${index}`}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${isHovered ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-slate-700">
                  {entry.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-slate-900">
                  {entry.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(EnterpriseDistributionChart);
