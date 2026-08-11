import { getPendingActivities, removePendingActivity, updatePendingActivityStatus } from './indexedDB';
import axiosInstance from '../api/axiosConfig';

export const syncOfflineActivities = async (queryClient) => {
  if (!navigator.onLine) return;

  const pendingActivities = await getPendingActivities();
  if (pendingActivities.length === 0) return;

  console.log(`Attempting to sync ${pendingActivities.length} pending activities...`);
  let syncedCount = 0;

  for (const activity of pendingActivities) {
    // Only attempt to sync pending or explicitly retried tasks, don't auto-retry failed immediately
    if (activity.syncStatus === 'FAILED') continue;

    try {
      await updatePendingActivityStatus(activity.idempotencyKey, 'SYNCING');
      
      // Reconstruct payload as expected by backend, plus idempotency key header
      const payload = { ...activity };
      const idempotencyKey = payload.idempotencyKey;
      
      // Clean up local fields before sending to API
      delete payload.idempotencyKey;
      delete payload.createdAt;
      delete payload.isOffline;
      delete payload.syncStatus;
      delete payload.errorMessage;
      delete payload.userId;
      delete payload.id;
      delete payload.status;
      delete payload.carbonAmount;
      
      await axiosInstance.post('/carbon/activities', payload, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      
      // Remove from IDB after successful sync
      await removePendingActivity(idempotencyKey);
      syncedCount++;
    } catch (error) {
      console.error("Failed to sync activity:", error);
      await updatePendingActivityStatus(
        activity.idempotencyKey, 
        'FAILED', 
        error.response?.data?.message || error.message
      );
    }
  }

  if (syncedCount > 0 && queryClient) {
    // Invalidate queries so the dashboard and analytics re-fetch the new data
    queryClient.invalidateQueries({ queryKey: ['activityHistory'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    queryClient.invalidateQueries({ queryKey: ['carbonMetrics'] });
  }
};

export const retrySync = async (idempotencyKey, queryClient) => {
  if (!navigator.onLine) {
    throw new Error('You are still offline. Please connect to the internet to retry.');
  }
  
  await updatePendingActivityStatus(idempotencyKey, 'PENDING');
  await syncOfflineActivities(queryClient);
};
