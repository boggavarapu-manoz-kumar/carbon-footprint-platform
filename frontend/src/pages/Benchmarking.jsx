import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Info, Activity } from 'lucide-react';
import BenchmarkingService from '../services/BenchmarkingService';
import ErrorState from '../components/ErrorState';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ReferenceLine, BarChart, Bar, Legend, Cell
} from 'recharts';

const Benchmarking = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBenchmarking = async () => {
      try {
        setLoading(true);
        const result = timeframe === 'monthly' 
          ? await BenchmarkingService.getMonthlyBenchmarking()
          : await BenchmarkingService.getYearlyBenchmarking();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load benchmarking data:', err);
        setError('Unable to load benchmarking data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmarking();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="min-h-screen font-sans text-slate-900 pb-12 pt-8">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen font-sans text-slate-900 pb-12 pt-8">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorState title="Unable to load Benchmarking" message={error} onRetry={() => window.location.reload()} />
        </main>
      </div>
    );
  }

  // Generate bell curve data points
  const generateDistributionData = () => {
    if (!data?.globalStats) return [];
    
    const { average, standardDeviation } = data.globalStats;
    const mean = average || 0;
    const stdDev = standardDeviation || 1; // avoid div by 0
    
    const chartData = [];
    // Generate from -3 to +3 standard deviations
    for (let i = -3; i <= 3; i += 0.2) {
      const x = mean + (i * stdDev);
      if (x < 0) continue; // Emissions cannot be negative
      
      // Normal distribution formula
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
                Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
                
      chartData.push({
        emissions: Math.round(x),
        density: y * 1000, // Scale for visibility
      });
    }
    return chartData;
  };

  const distributionData = generateDistributionData();
  const userTotal = data?.userTotalEmissions || 0;
  const platformAvg = data?.globalStats?.average || 0;
  
  const isBetterThanAverage = userTotal <= platformAvg;

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-12 pt-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Peer Benchmarking</h1>
            <p className="mt-1 text-sm text-slate-500">
              Anonymously compare your carbon footprint against the platform average.
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeframe === 'monthly' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past 30 Days
            </button>
            <button
              onClick={() => setTimeframe('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeframe === 'yearly' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past Year
            </button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                <Users size={20} />
              </div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Your Percentile</h3>
            </div>
            <div className="text-4xl font-bold text-slate-900">
              {data?.userPercentile >= 50 
                ? `Top ${Math.max(1, 100 - Math.round(data?.userPercentile))}%`
                : `Bottom ${Math.max(1, Math.round(data?.userPercentile))}%`}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {data?.userPercentile >= 50 
                ? `Your carbon footprint is lower than ${data?.userPercentile}% of platform users.`
                : `You emit more carbon than ${100 - data?.userPercentile}% of users.`}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                <Activity size={20} />
              </div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Your Footprint</h3>
            </div>
            <div className="text-4xl font-bold text-slate-900">
              {userTotal} <span className="text-xl text-slate-500 font-medium">kg CO₂</span>
            </div>
            <p className={`mt-2 text-sm font-medium ${isBetterThanAverage ? 'text-emerald-600' : 'text-amber-600'}`}>
              {Math.abs((((userTotal - platformAvg) / (platformAvg || 1)) * 100).toFixed(1))}% {isBetterThanAverage ? 'below' : 'above'} average
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Platform Average</h3>
            </div>
            <div className="text-4xl font-bold text-slate-900">
              {platformAvg} <span className="text-xl text-slate-500 font-medium">kg CO₂</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Based on {data?.globalStats?.totalUsers} anonymous users.
            </p>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Emissions Distribution</h3>
              <p className="text-sm text-slate-500 mt-1">
                Visualizing where you stand among the community (Normal Distribution Model).
              </p>
            </div>
          </div>
          
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="emissions" 
                  tickFormatter={(val) => `${val}kg`} 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickMargin={10}
                />
                <YAxis hide />
                <RechartsTooltip 
                  formatter={(value, name, props) => [`${props.payload.emissions} kg CO₂`, 'Emissions']}
                  labelFormatter={() => ''}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="density" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorDensity)" 
                />
                <ReferenceLine 
                  x={platformAvg} 
                  stroke="#94a3b8" 
                  strokeDasharray="3 3"
                  label={{ position: 'top', value: 'Avg', fill: '#64748b', fontSize: 12 }} 
                />
                <ReferenceLine 
                  x={userTotal} 
                  stroke={isBetterThanAverage ? '#10b981' : '#f59e0b'} 
                  strokeWidth={2}
                  label={{ position: 'top', value: 'You', fill: isBetterThanAverage ? '#10b981' : '#f59e0b', fontSize: 14, fontWeight: 'bold' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Benchmarks Section */}
        {data?.categoryBenchmarks && data.categoryBenchmarks.length > 0 && (
          <div className="mb-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Category Breakdown</h3>
              <p className="text-sm text-slate-500 mt-1">See how you compare across different lifestyle areas.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.categoryBenchmarks.map((cat, idx) => {
                const isCatBetter = cat.userEmissions <= cat.platformAverage;
                const isTop = cat.userPercentile >= 50;
                
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-slate-800 capitalize">{cat.categoryName}</h4>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${isTop ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                        {isTop ? `Top ${Math.max(1, 100 - Math.round(cat.userPercentile))}%` : `Bottom ${Math.max(1, Math.round(cat.userPercentile))}%`}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">Your Carbon</span>
                          <span className="font-semibold text-slate-900">{cat.userEmissions} kg</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">Platform Avg</span>
                          <span className="font-semibold text-slate-900">{cat.platformAverage} kg</span>
                        </div>
                      </div>

                      {/* Progress Bar Comparison */}
                      <div className="relative pt-2 pb-2">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          {/* User Bar */}
                          <div 
                            className={`h-full absolute left-0 top-2 rounded-full ${isCatBetter ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                            style={{ width: `${Math.min(100, (cat.userEmissions / (Math.max(cat.userEmissions, cat.platformAverage) || 1)) * 100)}%`, zIndex: 10 }}
                          ></div>
                          {/* Platform Avg Bar */}
                          <div 
                            className="h-full absolute left-0 top-2 bg-slate-300 rounded-full" 
                            style={{ width: `${Math.min(100, (cat.platformAverage / (Math.max(cat.userEmissions, cat.platformAverage) || 1)) * 100)}%`, zIndex: 5 }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Difference</span>
                          <span className={`font-bold ${isCatBetter ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {cat.difference > 0 ? '+' : ''}{cat.difference} kg
                          </span>
                        </div>
                        {cat.improvementNeeded > 0 && (
                          <div className="flex justify-between items-center text-sm mt-1">
                            <span className="text-slate-500">Target Reduction</span>
                            <span className="font-semibold text-amber-600">
                              {cat.improvementNeeded}%
                            </span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Category Chart */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
               <h4 className="text-lg font-bold text-slate-900 mb-6">Category Comparison</h4>
               <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.categoryBenchmarks} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="categoryName" stroke="#94a3b8" fontSize={12} tickMargin={10} style={{ textTransform: 'capitalize' }} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val}kg`} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Legend iconType="circle" />
                    <Bar dataKey="userEmissions" name="Your Emissions" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="platformAverage" name="Platform Average" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {/* Platform Insights Grid */}
        <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden text-white relative">
          <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
            <Activity size={300} />
          </div>
          <div className="p-8 relative z-10">
            <h3 className="text-xl font-bold mb-1">Platform Analytics Engine</h3>
            <p className="text-slate-400 text-sm mb-8 flex items-center gap-2">
              <Info size={16} /> Data is fully anonymized and cached via Redis.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-widest font-semibold mb-1">Median</p>
                <p className="text-2xl font-bold">{data?.globalStats?.median} kg</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-widest font-semibold mb-1">Top 10% Emit Less Than</p>
                <p className="text-2xl font-bold text-emerald-400">{data?.globalStats?.top10Percentile} kg</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-widest font-semibold mb-1">Max Recorded</p>
                <p className="text-2xl font-bold">{data?.globalStats?.maximum} kg</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-widest font-semibold mb-1">Std Deviation</p>
                <p className="text-2xl font-bold">±{data?.globalStats?.standardDeviation}</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Benchmarking;
