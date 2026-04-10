import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageHelper';

/**
 * Data Migration System
 * Handles versioning and migration of data structures
 */

// Current app version
export const CURRENT_VERSION = '1.0.0';
const VERSION_KEY = '@trackmind_data_version';

/**
 * Version comparison utility
 */
const compareVersions = (v1, v2) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
        if (parts1[i] > parts2[i]) return 1;
        if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
};

/**
 * Get current data version
 */
export const getDataVersion = async () => {
    try {
        const version = await AsyncStorage.getItem(VERSION_KEY);
        return version || '0.0.0'; // No version = fresh install
    } catch (error) {
        console.error('Error getting data version:', error);
        return '0.0.0';
    }
};

/**
 * Set data version
 */
export const setDataVersion = async (version) => {
    try {
        await AsyncStorage.setItem(VERSION_KEY, version);
        return true;
    } catch (error) {
        console.error('Error setting data version:', error);
        return false;
    }
};

// ============================================
// MIGRATION DEFINITIONS
// ============================================

/**
 * Migration: 0.0.0 -> 1.0.0
 * Initial migration for existing users
 */
const migrate_0_0_0_to_1_0_0 = async (data) => {
    console.log('Running migration: 0.0.0 -> 1.0.0');

    // Add missing fields to existing tasks
    if (data.tasks) {
        data.tasks = data.tasks.map(task => ({
            ...task,
            tags: task.tags || [],
            recurrence: task.recurrence || 'None',
            updatedAt: task.updatedAt || task.createdAt || new Date().toISOString()
        }));
    }

    // Add missing fields to planner blocks
    if (data.plannerBlocks) {
        data.plannerBlocks = data.plannerBlocks.map(block => ({
            ...block,
            type: block.type || (block.linkedTaskId ? 'task' :
                block.linkedHabitId ? 'habit' :
                    block.linkedSkillId ? 'skill' : 'task'),
            date: block.date || new Date(block.startTime).toISOString().split('T')[0],
            updatedAt: block.updatedAt || new Date().toISOString()
        }));
    }

    return data;
};

/**
 * Example: Future migration 1.0.0 -> 1.1.0
 */
const migrate_1_0_0_to_1_1_0 = async (data) => {
    console.log('Running migration: 1.0.0 -> 1.1.0');
    // Add new features or transform data
    return data;
};

// Migration registry: version -> migration function
const MIGRATIONS = {
    '1.0.0': migrate_0_0_0_to_1_0_0,
    // '1.1.0': migrate_1_0_0_to_1_1_0,
    // Add future migrations here
};

/**
 * Run all necessary migrations
 */
export const runMigrations = async () => {
    try {
        const currentVersion = await getDataVersion();
        console.log('Current data version:', currentVersion);

        // If already at latest version, no migration needed
        if (currentVersion === CURRENT_VERSION) {
            console.log('Data is up to date');
            return { success: true, migrationsRun: 0 };
        }

        // Load all data
        const data = {
            tasks: JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.TASKS) || '[]'),
            habits: JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.HABITS) || '[]'),
            skills: JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.SKILLS) || '[]'),
            plannerBlocks: JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.PLANNER_BLOCKS) || '[]'),
            journalEntries: JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES) || '[]'),
            journalBadges: JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL_BADGES) || '[]'),
            settings: JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}')
        };

        let migratedData = { ...data };
        let migrationsRun = 0;

        // Run migrations in order
        const versions = Object.keys(MIGRATIONS).sort(compareVersions);

        for (const version of versions) {
            // Only run migrations newer than current version
            if (compareVersions(version, currentVersion) > 0 &&
                compareVersions(version, CURRENT_VERSION) <= 0) {

                console.log(`Running migration to version ${version}`);
                migratedData = await MIGRATIONS[version](migratedData);
                migrationsRun++;
            }
        }

        // Save migrated data
        if (migrationsRun > 0) {
            await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(migratedData.tasks));
            await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(migratedData.habits));
            await AsyncStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(migratedData.skills));
            await AsyncStorage.setItem(STORAGE_KEYS.PLANNER_BLOCKS, JSON.stringify(migratedData.plannerBlocks));
            await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(migratedData.journalEntries));
            await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL_BADGES, JSON.stringify(migratedData.journalBadges));
            await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(migratedData.settings));

            // Update version
            await setDataVersion(CURRENT_VERSION);

            console.log(`Successfully ran ${migrationsRun} migrations`);
        }

        return { success: true, migrationsRun };
    } catch (error) {
        console.error('Migration error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if migration is needed
 */
export const needsMigration = async () => {
    const currentVersion = await getDataVersion();
    return currentVersion !== CURRENT_VERSION;
};

/**
 * Reset data version (for testing)
 */
export const resetDataVersion = async () => {
    await AsyncStorage.removeItem(VERSION_KEY);
};

export default {
    CURRENT_VERSION,
    getDataVersion,
    setDataVersion,
    runMigrations,
    needsMigration,
    resetDataVersion
};
