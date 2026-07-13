import React, { useState, useEffect } from 'react';
import ActivityService from '../services/ActivityService';
import OtherActivityService from '../services/OtherActivityService';
import toast from 'react-hot-toast';
import ActivityModal from '../components/ActivityModal';
import ErrorState from '../components/ErrorState';
import { formatActivityType, getActivityIcon } from '../utils/formatters';
import { useQueryClient } from '@tanstack/react-query';
import { UserActivityHistoryFilters } from '../components/UserActivityHistoryFilters';

const ActivityHistory = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'

  const [categories, setCategories] = useState(['All']);

  const fetchCategories = async () => {
    try {
      const catalog = await ActivityService.getActivityCatalog();
      const catNames = catalog.map(c => c.name);
      setCategories(['All', ...catNames, 'Other']);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 10,
        ...filters
      };
      
      // The backend uses categories as a List, so we join if needed or pass as is.
      if (params.categories && params.categories.length > 0) {
        params.categories = params.categories.join(',');
      } else {
        delete params.categories;
      }
      
      const data = await ActivityService.getUnifiedActivityHistory(params);
      
      setActivities(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [currentPage, filters]);

  const handleDelete = async (activity) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        if (activity.logType === 'OTHER') {
          await OtherActivityService.deleteLog(activity.id);
        } else {
          await ActivityService.deleteActivity(activity.id);
        }
        toast.success('Activity deleted successfully');
        if (activities.length === 1 && currentPage > 0) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchActivities(); // refresh current page
        }
        await queryClient.invalidateQueries();
      } catch (err) {
        console.error('Error deleting activity:', err);
        toast.error('Failed to delete activity.');
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-12 pt-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Filters and Search Bar */}
        <UserActivityHistoryFilters 
          onFilterChange={handleFilterChange} 
          categoriesList={categories.filter(c => c !== 'All')}
        />

        {/* Table Section */}
        {error ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <ErrorState 
              title="Unable to load history"
              message={error}
              onRetry={() => fetchActivities()}
            />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Activity</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">CO₂ Emission</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                      <p className="mt-2">Loading history...</p>
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500">
                      No activities found.
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                            {getActivityIcon(activity.activityName || activity.activityType, activity.category)}
                          </div>
                          <div className="text-sm font-medium text-slate-900">{formatActivityType(activity.activityName || activity.activityType)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${activity.category === 'TRANSPORT' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            activity.category === 'ENERGY' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                            activity.category === 'DIET' ? 'bg-green-50 text-green-700 border-green-200' : 
                            activity.category === 'SHOPPING' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            activity.category === 'OTHER' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          {activity.category ? activity.category.charAt(0) + activity.category.slice(1).toLowerCase() : 'Activity'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{activity.quantity} {activity.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">{activity.carbonEmission.toFixed(2)} kg</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {activity.logDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setSelectedActivity(activity); setModalMode('view'); setIsModalOpen(true); }}
                            className="text-slate-400 hover:text-blue-600 transition-colors" 
                            title="View"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button 
                            onClick={() => { setSelectedActivity(activity); setModalMode('edit'); setIsModalOpen(true); }}
                            className="text-slate-400 hover:text-emerald-600 transition-colors" 
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(activity)} 
                            className="text-slate-400 hover:text-red-600 transition-colors" 
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && totalPages > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing page <span className="font-medium text-slate-900">{currentPage + 1}</span> of <span className="font-medium text-slate-900">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
      
      <ActivityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={selectedActivity}
        mode={modalMode}
        onSave={() => fetchActivities()}
      />
    </div>
  );
};

export default ActivityHistory;
