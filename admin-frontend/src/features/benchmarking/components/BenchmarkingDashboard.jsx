import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { benchmarkingApi } from '../api/benchmarkingApi';
import Card from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const BenchmarkingDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, distRes, trendRes] = await Promise.all([
        benchmarkingApi.getSummary(),
        benchmarkingApi.getDistribution(),
        benchmarkingApi.getTrends()
      ]);
      setSummary(sumRes.data);
      setDistribution(distRes.data);
      setTrends(trendRes.data);
    } catch (error) {
      console.error('Error fetching benchmarking data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return <div className="p-6 text-center text-gray-500">Loading Benchmarking Analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Platform Benchmarking</h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise Peer Benchmark Analytics & Distribution</p>
        </div>
        <Button variant="outline" onClick={fetchData}>Refresh Data</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm font-medium text-gray-500">Platform Average</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{summary.platformAverageCarbon} kg</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-500">Platform Median</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{summary.platformMedianCarbon} kg</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-500">Highest Category</div>
          <div className="mt-2 text-xl font-bold text-gray-900 truncate">{summary.highestCategory}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-500">Lowest Category</div>
          <div className="mt-2 text-xl font-bold text-gray-900 truncate">{summary.lowestCategory}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Carbon Footprint Distribution" className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution?.carbonHistogram || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="rangeLabel" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="userCount" name="Users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Platform Improvement Trends" className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="platformAverage" name="Platform Average (kg)" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Category Averages">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Emissions (kg)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.categoryAverages.map((cat) => (
                  <tr key={cat.category}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.averageEmissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Percentile Distribution">
          <div className="space-y-4">
            {distribution?.percentileDistribution.map((pt, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{pt.percentile}</span>
                <span className="text-sm font-bold text-gray-900">{pt.thresholdValue} kg</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BenchmarkingDashboard;
