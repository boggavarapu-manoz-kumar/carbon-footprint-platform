import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import ActivityMonitorApi from '../api/ActivityMonitorApi';
import { ActivityMonitorFilters } from './ActivityMonitorFilters';
import ActivityDetailsDrawer from './ActivityDetailsDrawer';

export const ActivityMonitor = () => {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const size = 20;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState({ id: null, type: null });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-activity-monitor', filters, page],
    queryFn: () => ActivityMonitorApi.getMonitoringActivities(filters, page, size),
    keepPreviousData: true,
  });

  const activities = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const handleRowClick = (activity) => {
    setSelectedActivity({
      id: activity.id,
      type: activity.logType
    });
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Activity Monitoring Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor all user activities across the platform in real-time.
          </p>
        </div>
      </div>

      <ActivityMonitorFilters 
        filters={filters} 
        setFilters={setFilters} 
        onApply={(newFilters) => {
          setFilters(newFilters);
          setPage(0);
        }} 
      />

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Loading activities...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Failed to load activities: {error?.message}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emission
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No activities found for this filter.
                    </td>
                  </tr>
                ) : (
                  activities.map((activity, idx) => (
                    <motion.tr 
                      key={`${activity.logType}-${activity.id}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(activity)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.activityName}</div>
                        <div className="text-xs text-gray-500">{activity.logType === 'OTHER' ? 'Custom Activity' : 'Standard Activity'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.category === 'Other Activities' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {activity.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{activity.userName}</div>
                        <div className="text-xs text-gray-500">{activity.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{activity.quantity} {activity.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{activity.carbonEmission?.toFixed(2)} kg</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {activity.logDate} {activity.logTime ? activity.logTime : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          Logged: {format(new Date(activity.createdAt), 'MMM dd, HH:mm')}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ActivityDetailsDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        activityId={selectedActivity.id} 
        logType={selectedActivity.type} 
      />
    </div>
  );
};

export default ActivityMonitor;
