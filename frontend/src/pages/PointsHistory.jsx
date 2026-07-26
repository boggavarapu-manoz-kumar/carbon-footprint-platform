import React, { useState, useEffect } from 'react';
import { Award, Flame, Calendar, Activity, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GamificationService from '../services/GamificationService';
const PointsHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState("Eco Beginner");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const pointsData = await GamificationService.getCurrentPoints();
      setPoints(pointsData.totalPoints);
      setLevel(pointsData.currentLevel);

      const historyData = await GamificationService.getPointHistory(0, 50);
      setHistory(historyData.content || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getActionIcon = (actionType) => {
    if (actionType.includes('GOAL')) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (actionType.includes('ACTIVITY')) return <Activity className="w-5 h-5 text-blue-500" />;
    if (actionType.includes('STREAK')) return <Flame className="w-5 h-5 text-orange-500" />;
    return <Award className="w-5 h-5 text-purple-500" />;
  };

  const getActionColor = (actionType) => {
    if (actionType.includes('GOAL')) return 'bg-emerald-50 border-emerald-100';
    if (actionType.includes('ACTIVITY')) return 'bg-blue-50 border-blue-100';
    if (actionType.includes('STREAK')) return 'bg-orange-50 border-orange-100';
    return 'bg-purple-50 border-purple-100';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Points History</h1>
          <p className="text-slate-500">Track your sustainability journey</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/points-guide')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors border border-slate-200 shadow-sm"
        >
          <Award className="w-4 h-4 text-purple-500" />
          How to earn points?
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <p className="text-emerald-100 font-medium mb-1">Total Sustainability Points</p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black">{points.toLocaleString()}</span>
              <span className="text-xl text-emerald-200">pts</span>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Award className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm font-medium">Current Level</p>
              <p className="text-xl font-bold">{level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Ledger */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            Points Ledger
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-lg">No points earned yet.</p>
            <p className="text-slate-400">Log an activity to start earning!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((entry) => (
              <div key={entry.id} className={`p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl border ${getActionColor(entry.actionType)} shadow-sm`}>
                    {getActionIcon(entry.actionType)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{entry.reason}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <span>{new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="uppercase text-xs font-semibold tracking-wider text-slate-400">{entry.sourceModule}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-black ring-1 ring-emerald-200 shadow-sm">
                    +{entry.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsHistory;
