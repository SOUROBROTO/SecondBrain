import React, { createContext, useState, useEffect } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { saveData, loadData, STORAGE_KEYS } from '../../../shared/utils/storageHelper';

export const JournalContext = createContext();

const DEFAULT_BADGES = [
    { id: '1', name: '7 Day Streak', icon: '🔥', description: 'Complete habits for 7 days in a row', unlocked: false },
    { id: '2', name: 'Task Master', icon: '✅', description: 'Complete 100 tasks', unlocked: false },
    { id: '3', name: 'Early Bird', icon: '🌅', description: 'Complete a task before 8 AM', unlocked: false },
];

export const JournalProvider = ({ children }) => {
    const [entries, setEntries] = useState([]);
    const [badges, setBadges] = useState(DEFAULT_BADGES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadJournalData = async () => {
            const savedEntries = await loadData(STORAGE_KEYS.JOURNAL_ENTRIES, []);
            const savedBadges = await loadData(STORAGE_KEYS.JOURNAL_BADGES, DEFAULT_BADGES);

            // Migrate old flat text entries to Notion-style block arrays if they exist
            const migratedEntries = savedEntries.map(e => {
                if (e.text !== undefined && !e.blocks) {
                    return {
                        id: e.id,
                        title: 'Untitled Page',
                        icon: '📄',
                        date: e.date,
                        blocks: [
                            { id: uuidv4(), type: 'text', content: e.text }
                        ]
                    };
                }
                return e;
            });

            setEntries(migratedEntries);
            setBadges(savedBadges);
            setLoading(false);
        };
        loadJournalData();
    }, []);

    useEffect(() => {
        if (!loading) {
            saveData(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
        }
    }, [entries, loading]);

    useEffect(() => {
        if (!loading) {
            saveData(STORAGE_KEYS.JOURNAL_BADGES, badges);
        }
    }, [badges, loading]);

    // Notion-style page creation
    const addPage = () => {
        const newPage = {
            id: uuidv4(),
            title: '',
            icon: '📄',
            date: new Date().toISOString(),
            blocks: [{ id: uuidv4(), type: 'text', content: '' }]
        };
        setEntries([newPage, ...entries]);
        return newPage;
    };

    const updatePage = (id, updatedData) => {
        setEntries(entries.map(e => e.id === id ? { ...e, ...updatedData } : e));
    };

    const deletePage = (id) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    const unlockBadge = (badgeId) => {
        setBadges(badges.map(b => b.id === badgeId ? { ...b, unlocked: true } : b));
    };

    return (
        <JournalContext.Provider value={{ entries, badges, addPage, updatePage, deletePage, unlockBadge, loading }}>
            {children}
        </JournalContext.Provider>
    );
};
