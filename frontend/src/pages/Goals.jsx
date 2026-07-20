import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Calendar, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  Activity,
  AlertCircle
} from 'lucide-react';
import GoalService from '../services/GoalService';
import ErrorBoundary from '../components/common/ErrorBoundary';
import Button from '../components/common/Button';
import GoalPredictionWidget from '../components/GoalPredictionWidget';
import GoalActions from '../components/goals/GoalActions';
import { useNavigate } from 'react-router-dom';

const Goals = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  // Wizard state
  const [goalName, setGoalName] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalType, setGoalType] = useState('TARGET_CARBON_VALUE');
  const [periodDays, setPeriodDays] = useState(30);
  const [targetVal, setTargetVal] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await GoalService.getUserGoals();
      setGoals(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch goals', err);
      setError('Could not load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + parseInt(periodDays));

      const payload = {
        name: goalName,
        description: goalDesc,
        goalType,
        startDate: today.toISOString().split('T')[0],
        targetDate: targetDate.toISOString().split('T')[0],
      };

      if (goalType === 'PERCENTAGE_REDUCTION') {
        payload.targetReductionPercent = parseFloat(targetVal);
      } else {
        payload.targetEmission = parseFloat(targetVal);
      }

      await GoalService.createGoal(payload);
      setShowWizard(false);
      resetWizard();
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal', err);
      alert('Failed to create goal. Check your inputs.');
    }
  };

  const resetWizard = () => {
    setGoalName('');
    setGoalDesc('');
    setGoalType('TARGET_CARBON_VALUE');
    setPeriodDays(30);
    setTargetVal('');
  };

  if (loading && goals.length === 0) {
    return <div className="p-8 flex justify-center text-slate-500">Loading goals...</div>;
  }

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Goals</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track your carbon reduction targets and stay motivated.
            </p>
          </div>
          {!showWizard && (
            <Button onClick={() => setShowWizard(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm border border-red-100">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Tabs for Goal Categories */}
        {!showWizard && goals.length > 0 && (
          <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px scrollbar-hide">
            {['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED', 'FAILED', 'PAUSED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2
                  ${activeTab === tab 
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50 rounded-t-lg' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                `}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {showWizard && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 transition-all">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Create a New Goal</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4 max-w-2xl">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
                  <input 
                    type="text" 
                    required 
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="e.g. Cut transport emissions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Goal Type</label>
                  <select 
                    value={goalType}
                    onChange={e => setGoalType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white"
                  >
                    <option value="PERCENTAGE_REDUCTION">% Reduction</option>
                    <option value="TARGET_CARBON_VALUE">Target Carbon Value</option>
                    <option value="TRANSPORT">Transport Specific</option>
                    <option value="ELECTRICITY">Electricity Specific</option>
                    <option value="FOOD">Food Specific</option>
                    <option value="SHOPPING">Shopping Specific</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={goalDesc}
                  onChange={e => setGoalDesc(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="Why this goal?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time Period</label>
                  <select 
                    value={periodDays}
                    onChange={e => setPeriodDays(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white"
                  >
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                    <option value="180">180 Days</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {goalType === 'PERCENTAGE_REDUCTION' ? 'Target Reduction (%)' : 'Target Carbon Value (kg CO₂e)'}
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    step="0.1"
                    value={targetVal}
                    onChange={e => setTargetVal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder={goalType === 'PERCENTAGE_REDUCTION' ? 'e.g. 15' : 'e.g. 50'}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowWizard(false)}>Cancel</Button>
                <Button type="submit">Create Goal</Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {goals
            .filter(goal => {
              const today = new Date().toISOString().split('T')[0];
              if (activeTab === 'ALL') return true;
              if (activeTab === 'ACTIVE') return goal.status === 'IN_PROGRESS' && goal.startDate <= today;
              if (activeTab === 'UPCOMING') return goal.status === 'IN_PROGRESS' && goal.startDate > today;
              if (activeTab === 'COMPLETED') return goal.status === 'ACHIEVED';
              if (activeTab === 'FAILED') return goal.status === 'FAILED';
              if (activeTab === 'PAUSED') return goal.status === 'PAUSED';
              if (activeTab === 'CANCELLED') return goal.status === 'CANCELLED';
              return true;
            })
            .map((goal) => {
            const isCompleted = goal.status === 'ACHIEVED';
            const isFailed = goal.status === 'FAILED';
            
            let statusColor = 'text-blue-600 bg-blue-50 border-blue-200';
            let barColor = 'bg-blue-500';
            
            if (isCompleted) {
              statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
              barColor = 'bg-emerald-500';
            } else if (isFailed) {
              statusColor = 'text-red-700 bg-red-50 border-red-200';
              barColor = 'bg-red-500';
            } else if (goal.status === 'PAUSED') {
              statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
              barColor = 'bg-amber-500';
            } else if (goal.status === 'CANCELLED') {
              statusColor = 'text-slate-700 bg-slate-50 border-slate-200';
              barColor = 'bg-slate-500';
            }

            return (
              <div 
                key={goal.id} 
                onClick={() => navigate(`/dashboard/goals/${goal.id}`)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow cursor-pointer hover:border-emerald-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">{goal.name}</h3>
                      <div onClick={e => e.stopPropagation()}>
                        <GoalActions goal={goal} onUpdate={fetchGoals} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                      <span className={`px-2.5 py-1 rounded-full border ${statusColor}`}>
                        {goal.status.replace('_', ' ')}
                      </span>
                      <span className="flex items-center text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        <Target className="w-3.5 h-3.5 mr-1" />
                        {goal.goalType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{goal.progressPercent}%</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Progress</div>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-slate-600 mb-6">{goal.description}</p>
                )}

                <div className="mt-auto space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 text-slate-600 font-medium">
                      <span>0%</span>
                      <span>100% Target</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${barColor} transition-all duration-500`} 
                        style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
                    <div>
                      <span className="flex items-center text-slate-500 mb-1 font-medium text-xs uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" /> Start
                      </span>
                      <span className="text-slate-900 font-semibold">{goal.startDate}</span>
                    </div>
                    <div>
                      <span className="flex items-center text-slate-500 mb-1 font-medium text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Target Date
                      </span>
                      <span className="text-slate-900 font-semibold">{goal.targetDate}</span>
                    </div>
                    {goal.estimatedCompletionDate && !isCompleted && !isFailed && (
                      <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                        <span className="flex items-center text-blue-700 font-medium text-xs">
                          <Clock className="w-4 h-4 mr-1.5" /> 
                          Est. Completion: {goal.estimatedCompletionDate}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Goal Prediction Widget */}
                  {!isCompleted && !isFailed && (
                    <GoalPredictionWidget goalId={goal.id} targetEmission={goal.targetEmission} />
                  )}
                </div>
              </div>
            );
          })}
          
          {goals.length === 0 && !showWizard && !loading && (
            <div className="col-span-1 lg:col-span-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No goals yet</h3>
              <p className="text-slate-500 mb-6">Create a goal to start tracking your reduction progress.</p>
              <Button onClick={() => setShowWizard(true)}>Create First Goal</Button>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Goals;
