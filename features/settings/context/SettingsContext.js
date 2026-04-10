import React, { createContext, useState, useEffect } from 'react';
import { saveData, loadData, STORAGE_KEYS } from '../../../shared/utils/storageHelper';

export const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
    theme: 'auto', // 'dark' | 'light' | 'auto'
    notificationsEnabled: true,
    weekStartDay: 'Monday',
    cloudBackup: false,
    appLock: false,
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    // Load settings from storage on mount
    useEffect(() => {
        const loadSettings = async () => {
            const savedSettings = await loadData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
            setSettings(savedSettings);
            setLoading(false);
        };
        loadSettings();
    }, []);

    // Save settings to storage whenever they change
    useEffect(() => {
        if (!loading) {
            saveData(STORAGE_KEYS.SETTINGS, settings);
        }
    }, [settings, loading]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};
