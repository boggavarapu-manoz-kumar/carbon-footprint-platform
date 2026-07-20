import React, { useState } from 'react';
import { MoreVertical, Edit2, PauseCircle, PlayCircle, XCircle, CheckCircle, Trash2 } from 'lucide-react';
import GoalService from '../../services/GoalService';
import toast from 'react-hot-toast';

const GoalActions = ({ goal, onUpdate, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = async (status, reason) => {
    try {
      await GoalService.changeGoalStatus(goal.id, status, reason);
      toast.success(`Goal marked as ${status.replace('_', ' ')}`);
      onUpdate();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to completely delete this goal? This cannot be undone.')) {
      try {
        await GoalService.deleteGoal(goal.id);
        toast.success('Goal deleted successfully');
        if (onDelete) onDelete();
        else onUpdate();
      } catch (err) {
        toast.error('Failed to delete goal');
      } finally {
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-20">
            {goal.status === 'IN_PROGRESS' && (
              <>
                <button onClick={(e) => { e.stopPropagation(); handleStatusChange('PAUSED', 'Paused by user'); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <PauseCircle className="w-4 h-4" /> Pause Goal
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleStatusChange('ACHIEVED', 'Manually marked as completed'); }} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Complete Goal
                </button>
              </>
            )}
            
            {goal.status === 'PAUSED' && (
              <button onClick={(e) => { e.stopPropagation(); handleStatusChange('IN_PROGRESS', 'Resumed by user'); }} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                <PlayCircle className="w-4 h-4" /> Resume Goal
              </button>
            )}

            {['IN_PROGRESS', 'PAUSED'].includes(goal.status) && (
              <button onClick={(e) => { e.stopPropagation(); handleStatusChange('CANCELLED', 'Cancelled by user'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Cancel Goal
              </button>
            )}

            <div className="border-t border-slate-100 my-1"></div>

            <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Goal
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GoalActions;
