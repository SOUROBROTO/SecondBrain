import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Helper Utility
 * Centralized module for all AsyncStorage operations with error handling
 */

// Storage Keys
export const STORAGE_KEYS = {
  TASKS: '@trackmind_tasks',
  HABITS: '@trackmind_habits',
  SKILLS: '@trackmind_skills',
  PLANNER_BLOCKS: '@trackmind_planner_blocks',
  JOURNAL_ENTRIES: '@trackmind_journal_entries',
  JOURNAL_BADGES: '@trackmind_journal_badges',
  SETTINGS: '@trackmind_settings',
  LAST_RESET_DATE: '@trackmind_last_reset_date',
  LAST_ACTIVE_DATE: '@trackmind_last_active_date',
};

/**
 * Save data to AsyncStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save (will be JSON stringified)
 * @returns {Promise<boolean>} - Success status
 */
export const saveData = async (key, data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    return false;
  }
};

/**
 * Load data from AsyncStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {Promise<any>} - Parsed data or default value
 */
export const loadData = async (key, defaultValue = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} - Success status
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};

/**
 * Clear all app data from AsyncStorage
 * Useful for testing or user-initiated data reset
 * @returns {Promise<boolean>} - Success status
 */
export const clearAllData = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

/**
 * Get all storage keys currently in use
 * Useful for debugging
 * @returns {Promise<string[]>} - Array of keys
 */
export const getAllKeys = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys;
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};
