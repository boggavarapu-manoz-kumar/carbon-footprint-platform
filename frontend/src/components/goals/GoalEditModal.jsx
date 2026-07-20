import React, { useState } from 'react';
import { X } from 'lucide-react';
import GoalService from '../../services/GoalService';
import toast from 'react-hot-toast';
import Button from '../common/Button';

const GoalEditModal = ({ goal, onClose, onUpdate }) => {
  const [goalName, setGoalName] = useState(goal.name);
  const [goalDesc, setGoalDesc] = useState(goal.description || '');
  const [targetDate, setTargetDate] = useState(goal.targetDate);
  const [targetEmission, setTargetEmission] = useState(goal.targetEmission || '');
  const [targetReductionPercent, setTargetReductionPercent] = useState(goal.targetReductionPercent || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: goalName,
        description: goalDesc,
        targetDate: targetDate
      };
      
      if (goal.goalType === 'PERCENTAGE_REDUCTION') {
        payload.targetReductionPercent = parseFloat(targetReductionPercent);
      } else {
        payload.targetEmission = parseFloat(targetEmission);
      }

      await GoalService.updateGoal(goal.id, payload);
      toast.success('Goal updated successfully');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error('Failed to update goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Goal</h2>
            <p className="text-sm text-slate-500 mt-1">Update details for {goal.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
              <input 
                type="text" 
                required 
                value={goalName}
                onChange={e => setGoalName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                value={goalDesc}
                onChange={e => setGoalDesc(e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
                <input 
                  type="date" 
                  required 
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {goal.goalType === 'PERCENTAGE_REDUCTION' ? 'Target Reduction (%)' : 'Target Emission (kg CO₂e)'}
                </label>
                <input 
                  type="number" 
                  required 
                  min="0.1"
                  step="0.1"
                  value={goal.goalType === 'PERCENTAGE_REDUCTION' ? targetReductionPercent : targetEmission}
                  onChange={e => {
                    if (goal.goalType === 'PERCENTAGE_REDUCTION') {
                      setTargetReductionPercent(e.target.value);
                    } else {
                      setTargetEmission(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalEditModal;
