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
import { useTranslation } from 'react-i18next';

const Goals = () => {
  const { t } = useTranslation();
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
      setError(t('goals.error_load'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const startStr = window.goalStartDate || new Date().toISOString().split('T')[0];
      const targetDate = new Date(startStr);
      targetDate.setDate(targetDate.getDate() + parseInt(periodDays));

      const payload = {
        name: goalName,
        description: goalDesc,
        goalType,
        startDate: startStr,
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
      alert(t('goals.error_create'));
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
    return <div className="p-8 flex justify-center text-slate-500">{t('goals.loading')}</div>;
  }

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('goals.title')}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {t('goals.subtitle')}
            </p>
          </div>
          {!showWizard && (
            <Button onClick={() => setShowWizard(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('goals.new_goal')}
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
                {t(`goals.tabs.${tab}`)}
              </button>
            ))}
          </div>
        )}

        {showWizard && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 transition-all">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('goals.create_new')}</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4 max-w-2xl">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('goals.goal_name')}</label>
                  <input 
                    type="text" 
                    required 
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder={t('goals.goal_name_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('goals.goal_type')}</label>
                  <select 
                    value={goalType}
                    onChange={e => setGoalType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white"
                  >
                    <option value="PERCENTAGE_REDUCTION">{t('goals.types.PERCENTAGE_REDUCTION')}</option>
                    <option value="TARGET_CARBON_VALUE">{t('goals.types.TARGET_CARBON_VALUE')}</option>
                    <option value="TRANSPORT">{t('goals.types.TRANSPORT')}</option>
                    <option value="ELECTRICITY">{t('goals.types.ELECTRICITY')}</option>
                    <option value="FOOD">{t('goals.types.FOOD')}</option>
                    <option value="SHOPPING">{t('goals.types.SHOPPING')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('goals.description')}</label>
                <textarea 
                  value={goalDesc}
                  onChange={e => setGoalDesc(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder={t('goals.description_placeholder')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('goals.start_date')}</label>
                  <input 
                    type="date"
                    required
                    value={window.goalStartDate || new Date().toISOString().split('T')[0]}
                    onChange={e => { window.goalStartDate = e.target.value; setPeriodDays(periodDays); /* force re-render */ }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('goals.time_period')}</label>
                  <select 
                    value={periodDays}
                    onChange={e => setPeriodDays(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white"
                  >
                    <option value="7">{t('goals.periods.7')}</option>
                    <option value="30">{t('goals.periods.30')}</option>
                    <option value="60">{t('goals.periods.60')}</option>
                    <option value="90">{t('goals.periods.90')}</option>
                    <option value="180">{t('goals.periods.180')}</option>
                    <option value="365">{t('goals.periods.365')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {goalType === 'PERCENTAGE_REDUCTION' ? t('goals.target_reduction') : t('goals.target_kg')}
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    step="0.1"
                    value={targetVal}
                    onChange={e => setTargetVal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder={goalType === 'PERCENTAGE_REDUCTION' ? t('goals.target_placeholder_percent') : t('goals.target_placeholder_kg')}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowWizard(false)}>{t('goals.cancel')}</Button>
                <Button type="submit">{t('goals.create_btn')}</Button>
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
                        {t(`goals.tabs.${goal.status}`)}
                      </span>
                      <span className="flex items-center text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        <Target className="w-3.5 h-3.5 mr-1" />
                        {t(`goals.types.${goal.goalType}`)}
                      </span>
                    </div>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-slate-600 mb-6">{goal.description}</p>
                )}

                <div className="mt-auto space-y-5">
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
                    <div>
                      <span className="flex items-center text-slate-500 mb-1 font-medium text-xs uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" /> {t('goals.start')}
                      </span>
                      <span className="text-slate-900 font-semibold">{goal.startDate}</span>
                    </div>
                    <div>
                      <span className="flex items-center text-slate-500 mb-1 font-medium text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {t('goals.target_date_label')}
                      </span>
                      <span className="text-slate-900 font-semibold">{goal.targetDate}</span>
                    </div>
                    {goal.estimatedCompletionDate && !isCompleted && !isFailed && (
                      <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                        <span className="flex items-center text-blue-700 font-medium text-xs">
                          <Clock className="w-4 h-4 mr-1.5" /> 
                          {t('goals.est_completion')} {goal.estimatedCompletionDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {goals.length === 0 && !showWizard && !loading && (
            <div className="col-span-1 lg:col-span-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('goals.no_goals')}</h3>
              <p className="text-slate-500 mb-6">{t('goals.no_goals_subtitle')}</p>
              <Button onClick={() => setShowWizard(true)}>{t('goals.create_first_goal')}</Button>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Goals;
