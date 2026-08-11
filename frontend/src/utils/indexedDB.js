import { openDB } from 'idb';

const DB_NAME = 'carbon_footprint_db';
const STORE_NAME = 'pending_activities';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'idempotencyKey' });
      }
    },
  });
};

export const savePendingActivity = async (activity) => {
  const db = await initDB();
  return db.put(STORE_NAME, {
    ...activity,
    createdAt: new Date().toISOString()
  });
};

export const getPendingActivities = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const removePendingActivity = async (idempotencyKey) => {
  const db = await initDB();
  return db.delete(STORE_NAME, idempotencyKey);
};

export const clearPendingActivities = async () => {
  const db = await initDB();
  return db.clear(STORE_NAME);
};

export const updatePendingActivityStatus = async (idempotencyKey, syncStatus, errorMessage = null) => {
  const db = await initDB();
  const activity = await db.get(STORE_NAME, idempotencyKey);
  if (activity) {
    activity.syncStatus = syncStatus;
    if (errorMessage) activity.errorMessage = errorMessage;
    return db.put(STORE_NAME, activity);
  }
};
