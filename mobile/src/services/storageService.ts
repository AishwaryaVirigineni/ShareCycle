/**
 * Storage Service
 * Manages active thread persistence for app reentry
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_THREAD_KEY = 'activeThread';

export interface ActiveThread {
  threadId: string;
  requestId: string;
  otherId: string;
  role: 'requester' | 'helper';
  urgency?: 'urgent' | 'normal' | 'low';
  isTopK?: boolean;
}

/**
 * Store active thread for user
 */
export async function setActiveThread(userId: string, thread: ActiveThread): Promise<void> {
  try {
    const key = `${ACTIVE_THREAD_KEY}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(thread));
  } catch (error) {
    console.error('Failed to store active thread:', error);
  }
}

/**
 * Get active thread for user
 */
export async function getActiveThread(userId: string): Promise<ActiveThread | null> {
  try {
    const key = `${ACTIVE_THREAD_KEY}_${userId}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as ActiveThread;
    }
    return null;
  } catch (error) {
    console.error('Failed to get active thread:', error);
    return null;
  }
}

/**
 * Clear active thread for user
 */
export async function clearActiveThread(userId: string): Promise<void> {
  try {
    const key = `${ACTIVE_THREAD_KEY}_${userId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear active thread:', error);
  }
}

