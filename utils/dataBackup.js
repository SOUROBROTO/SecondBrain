import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { STORAGE_KEYS, loadData, saveData } from './storageHelper';
import { CURRENT_VERSION } from './dataMigration';

/**
 * Data Backup and Export Utility
 * Handles exporting, importing, and backing up user data
 */

/**
 * Export all app data to JSON
 */
export const exportAllData = async () => {
    try {
        const data = {
            version: CURRENT_VERSION,
            exportDate: new Date().toISOString(),
            tasks: await loadData(STORAGE_KEYS.TASKS, []),
            habits: await loadData(STORAGE_KEYS.HABITS, []),
            skills: await loadData(STORAGE_KEYS.SKILLS, []),
            plannerBlocks: await loadData(STORAGE_KEYS.PLANNER_BLOCKS, []),
            journalEntries: await loadData(STORAGE_KEYS.JOURNAL_ENTRIES, []),
            journalBadges: await loadData(STORAGE_KEYS.JOURNAL_BADGES, []),
            settings: await loadData(STORAGE_KEYS.SETTINGS, {})
        };

        return { success: true, data };
    } catch (error) {
        console.error('Error exporting data:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Save backup file to device
 */
export const saveBackupToFile = async () => {
    try {
        const { success, data, error } = await exportAllData();

        if (!success) {
            return { success: false, error };
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `trackmind-backup-${timestamp}.json`;
        const fileUri = `${FileSystem.documentDirectory}${filename}`;

        // Write JSON to file
        await FileSystem.writeAsStringAsync(
            fileUri,
            JSON.stringify(data, null, 2),
            { encoding: FileSystem.EncodingType.UTF8 }
        );

        return { success: true, fileUri, filename };
    } catch (error) {
        console.error('Error saving backup file:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Share backup file
 */
export const shareBackupFile = async () => {
    try {
        const { success, fileUri, filename, error } = await saveBackupToFile();

        if (!success) {
            return { success: false, error };
        }

        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();

        if (!isAvailable) {
            return {
                success: false,
                error: 'Sharing is not available on this device',
                fileUri // Return fileUri so user knows where file is saved
            };
        }

        // Share the file
        await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export TrackMind Data',
            UTI: 'public.json'
        });

        return { success: true, fileUri, filename };
    } catch (error) {
        console.error('Error sharing backup:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Validate imported data structure
 */
const validateImportData = (data) => {
    const errors = [];

    // Check required fields
    if (!data.version) {
        errors.push('Missing version information');
    }

    // Check data structure
    const requiredFields = ['tasks', 'habits', 'skills', 'plannerBlocks', 'journalEntries', 'settings'];
    for (const field of requiredFields) {
        if (!data.hasOwnProperty(field)) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Check arrays are actually arrays
    const arrayFields = ['tasks', 'habits', 'skills', 'plannerBlocks', 'journalEntries', 'journalBadges'];
    for (const field of arrayFields) {
        if (data[field] && !Array.isArray(data[field])) {
            errors.push(`${field} must be an array`);
        }
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Import data from JSON
 */
export const importData = async (jsonData, options = { merge: false }) => {
    try {
        // Parse if string
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

        // Validate structure
        const { valid, errors } = validateImportData(data);
        if (!valid) {
            return { success: false, error: 'Invalid data format', details: errors };
        }

        if (options.merge) {
            // Merge with existing data
            const existing = {
                tasks: await loadData(STORAGE_KEYS.TASKS, []),
                habits: await loadData(STORAGE_KEYS.HABITS, []),
                skills: await loadData(STORAGE_KEYS.SKILLS, []),
                plannerBlocks: await loadData(STORAGE_KEYS.PLANNER_BLOCKS, []),
                journalEntries: await loadData(STORAGE_KEYS.JOURNAL_ENTRIES, []),
                journalBadges: await loadData(STORAGE_KEYS.JOURNAL_BADGES, [])
            };

            // Merge arrays (avoid duplicates by ID)
            const mergeById = (existing, imported) => {
                const existingIds = new Set(existing.map(item => item.id));
                const newItems = imported.filter(item => !existingIds.has(item.id));
                return [...existing, ...newItems];
            };

            data.tasks = mergeById(existing.tasks, data.tasks || []);
            data.habits = mergeById(existing.habits, data.habits || []);
            data.skills = mergeById(existing.skills, data.skills || []);
            data.plannerBlocks = mergeById(existing.plannerBlocks, data.plannerBlocks || []);
            data.journalEntries = mergeById(existing.journalEntries, data.journalEntries || []);
            data.journalBadges = mergeById(existing.journalBadges, data.journalBadges || []);
        }

        // Save imported data
        await saveData(STORAGE_KEYS.TASKS, data.tasks || []);
        await saveData(STORAGE_KEYS.HABITS, data.habits || []);
        await saveData(STORAGE_KEYS.SKILLS, data.skills || []);
        await saveData(STORAGE_KEYS.PLANNER_BLOCKS, data.plannerBlocks || []);
        await saveData(STORAGE_KEYS.JOURNAL_ENTRIES, data.journalEntries || []);
        await saveData(STORAGE_KEYS.JOURNAL_BADGES, data.journalBadges || []);

        // Only import settings if replace mode
        if (!options.merge) {
            await saveData(STORAGE_KEYS.SETTINGS, data.settings || {});
        }

        return {
            success: true,
            imported: {
                tasks: data.tasks?.length || 0,
                habits: data.habits?.length || 0,
                skills: data.skills?.length || 0,
                plannerBlocks: data.plannerBlocks?.length || 0,
                journalEntries: data.journalEntries?.length || 0
            }
        };
    } catch (error) {
        console.error('Error importing data:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create automatic backup
 */
export const createAutoBackup = async () => {
    try {
        const { success, data, error } = await exportAllData();

        if (!success) {
            return { success: false, error };
        }

        // Save to AsyncStorage with timestamp
        const backupKey = `@trackmind_auto_backup_${Date.now()}`;
        await AsyncStorage.setItem(backupKey, JSON.stringify(data));

        // Keep only last 3 backups
        const allKeys = await AsyncStorage.getAllKeys();
        const backupKeys = allKeys
            .filter(key => key.startsWith('@trackmind_auto_backup_'))
            .sort()
            .reverse();

        // Remove old backups
        if (backupKeys.length > 3) {
            const keysToRemove = backupKeys.slice(3);
            await AsyncStorage.multiRemove(keysToRemove);
        }

        return { success: true, backupKey };
    } catch (error) {
        console.error('Error creating auto backup:', error);
        return { success: false, error: error.message };
    }
};

/**
 * List all auto backups
 */
export const listAutoBackups = async () => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const backupKeys = allKeys
            .filter(key => key.startsWith('@trackmind_auto_backup_'))
            .sort()
            .reverse();

        const backups = await Promise.all(
            backupKeys.map(async (key) => {
                const timestamp = parseInt(key.split('_').pop());
                const data = await AsyncStorage.getItem(key);
                const parsed = JSON.parse(data);

                return {
                    key,
                    date: new Date(timestamp),
                    version: parsed.version,
                    itemCount: {
                        tasks: parsed.tasks?.length || 0,
                        habits: parsed.habits?.length || 0,
                        skills: parsed.skills?.length || 0,
                        plannerBlocks: parsed.plannerBlocks?.length || 0,
                        journalEntries: parsed.journalEntries?.length || 0
                    }
                };
            })
        );

        return { success: true, backups };
    } catch (error) {
        console.error('Error listing backups:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Restore from auto backup
 */
export const restoreAutoBackup = async (backupKey) => {
    try {
        const backupData = await AsyncStorage.getItem(backupKey);
        if (!backupData) {
            return { success: false, error: 'Backup not found' };
        }

        const data = JSON.parse(backupData);
        return await importData(data, { merge: false });
    } catch (error) {
        console.error('Error restoring backup:', error);
        return { success: false, error: error.message };
    }
};

export default {
    exportAllData,
    saveBackupToFile,
    shareBackupFile,
    importData,
    createAutoBackup,
    listAutoBackups,
    restoreAutoBackup
};
