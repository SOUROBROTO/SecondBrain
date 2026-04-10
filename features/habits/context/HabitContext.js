import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { saveData, loadData, STORAGE_KEYS } from '../../../shared/utils/storageHelper';
import { getTodayKey, getYesterdayKey } from '../../../shared/utils/DateService';

export const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    // Keep a ref so async callbacks always see latest habits without stale closure
    const habitsRef = useRef(habits);
    useEffect(() => { habitsRef.current = habits; }, [habits]);

    // ─── Load ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            const saved = await loadData(STORAGE_KEYS.HABITS, []);
            setHabits(saved);
            setLoading(false);
        };
        load();
    }, []);

    // ─── Transactional Save ──────────────────────────────────────────────────
    // Every write goes through this. This guarantees:
    //   • setState and AsyncStorage are always in sync (no race condition)
    //   • A single place to add logging / error recovery later
    const updateHabits = useCallback((updaterFn) => {
        setHabits(prev => {
            const next = updaterFn(prev);
            saveData(STORAGE_KEYS.HABITS, next); // fire-and-forget is fine here
            return next;
        });
    }, []);

    // ─── CRUD ────────────────────────────────────────────────────────────────
    const addHabit = useCallback((habit) => {
        updateHabits(prev => [
            ...prev,
            {
                id: uuidv4(),
                streak: 0,
                history: {},
                lastCompletionDate: null,
                createdAt: new Date().toISOString(),
                ...habit,
            },
        ]);
    }, [updateHabits]);

    const updateHabit = useCallback((id, updatedFields) => {
        updateHabits(prev =>
            prev.map(h => h.id === id ? { ...h, ...updatedFields } : h)
        );
    }, [updateHabits]);

    const deleteHabit = useCallback((id) => {
        updateHabits(prev => prev.filter(h => h.id !== id));
    }, [updateHabits]);

    const clearAllHabits = useCallback(() => {
        updateHabits(() => []);
    }, [updateHabits]);

    // ─── Logging ─────────────────────────────────────────────────────────────
    /**
     * Log progress for a habit on today.
     *
     * Uses habit.history[todayKey] as the source of truth.
     * Correctly maintains lastCompletionDate so streak survives midnight.
     */
    const logHabit = useCallback((id, value = 1) => {
        const todayKey = getTodayKey();

        updateHabits(prev => prev.map(habit => {
            if (habit.id !== id) return habit;

            const goal = typeof habit.goal === 'object'
                ? habit.goal.value
                : (habit.goal || 1);

            const newHistory = {
                ...habit.history,
                [todayKey]: { completed: value >= goal, value },
            };

            // Streak: only recalculate if this is the first log of today
            const wasAlreadyLoggedToday = !!habit.history?.[todayKey];
            let newStreak = habit.streak;
            let newLastCompletionDate = habit.lastCompletionDate;

            if (!wasAlreadyLoggedToday && value > 0) {
                const yesterdayKey = getYesterdayKey();
                const completedYesterday =
                    habit.history?.[yesterdayKey]?.completed ||
                    habit.lastCompletionDate === yesterdayKey;

                newStreak = completedYesterday ? (habit.streak || 0) + 1 : 1;
            }

            // Track lastCompletionDate whenever goal is hit
            if (value >= goal) {
                newLastCompletionDate = todayKey;
            }

            return {
                ...habit,
                history: newHistory,
                streak: newStreak,
                lastCompletionDate: newLastCompletionDate,
            };
        }));
    }, [updateHabits]);

    /**
     * Unlog today's entry for a habit.
     */
    const unlogHabit = useCallback((id) => {
        const todayKey = getTodayKey();

        updateHabits(prev => prev.map(habit => {
            if (habit.id !== id) return habit;
            if (!habit.history?.[todayKey]) return habit;

            const newHistory = { ...habit.history };
            delete newHistory[todayKey];

            // Undo streak only if we're removing a today completion
            const newStreak = Math.max(0, (habit.streak || 0) - 1);
            const newLastCompletionDate =
                habit.lastCompletionDate === todayKey
                    ? getYesterdayKey() // roll back to yesterday
                    : habit.lastCompletionDate;

            return {
                ...habit,
                history: newHistory,
                streak: newStreak,
                lastCompletionDate: newLastCompletionDate,
            };
        }));
    }, [updateHabits]);

    // ─── Daily Reset Application ──────────────────────────────────────────────
    /**
     * Called by DailyResetContext after running the reset engine.
     * Accepts the already-computed next habits array and persists it.
     */
    const applyHabitReset = useCallback((nextHabits) => {
        updateHabits(() => nextHabits);
    }, [updateHabits]);

    return (
        <HabitContext.Provider value={{
            habits,
            loading,
            addHabit,
            updateHabit,
            deleteHabit,
            clearAllHabits,
            logHabit,
            unlogHabit,
            applyHabitReset,
        }}>
            {children}
        </HabitContext.Provider>
    );
};
