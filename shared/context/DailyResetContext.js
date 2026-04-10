/**
 * DailyResetContext — Global New Day Transition Orchestrator
 *
 * Responsibilities:
 *   1. On app mount: compare today with lastResetDate
 *   2. If new day → run reset engine → push results to Habit/Task contexts
 *   3. On AppState change (background→active): re-check date (midnight guard)
 *   4. Prevent duplicate resets within the same calendar day
 *
 * This is the ONLY place that calls runDailyReset().
 */

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storageHelper';
import { getTodayKey } from '../utils/DateService';
import { runDailyReset } from '../utils/DailyReset';
import { HabitContext } from './HabitContext';
import { TaskContext } from './TaskContext';

export const DailyResetContext = createContext({
    lastResetDate: null,
    isResetting: false,
});

export const DailyResetProvider = ({ children }) => {
    const { habits, applyHabitReset } = useContext(HabitContext);
    const { tasks, applyTaskReset } = useContext(TaskContext);

    // Refs so the AppState handler always sees fresh data without stale closures
    const habitsRef = useRef(habits);
    const tasksRef = useRef(tasks);
    useEffect(() => { habitsRef.current = habits; }, [habits]);
    useEffect(() => { tasksRef.current = tasks; }, [tasks]);

    const lastResetDateRef = useRef(null);
    const isResettingRef = useRef(false);

    // ─── Core Reset Logic ─────────────────────────────────────────────────────
    const maybeRunReset = useCallback(async () => {
        if (isResettingRef.current) return; // guard against concurrent calls

        const todayKey = getTodayKey();

        // Load the persisted last reset date (fast path re-check)
        if (!lastResetDateRef.current) {
            lastResetDateRef.current = await loadData(STORAGE_KEYS.LAST_RESET_DATE, null);
        }

        if (lastResetDateRef.current === todayKey) {
            // Already reset today → nothing to do
            return;
        }

        try {
            isResettingRef.current = true;
            console.log(`🔄 [DailyReset] New day detected. Running reset for ${todayKey}…`);

            // Run the pure reset engine
            const { habits: nextHabits, tasks: nextTasks } = runDailyReset(
                {
                    habits: habitsRef.current,
                    tasks: tasksRef.current,
                },
                todayKey
            );

            // Push results into each context (they handle their own persistence)
            applyHabitReset(nextHabits);
            applyTaskReset(nextTasks);

            // Persist the reset date so we never run twice on the same day
            await saveData(STORAGE_KEYS.LAST_RESET_DATE, todayKey);
            await saveData(STORAGE_KEYS.LAST_ACTIVE_DATE, todayKey);
            lastResetDateRef.current = todayKey;

            console.log(`✅ [DailyReset] Reset complete for ${todayKey}`);
        } catch (err) {
            console.error('[DailyReset] Error during daily reset:', err);
        } finally {
            isResettingRef.current = false;
        }
    }, [applyHabitReset, applyTaskReset]);

    // ─── On Mount: Initial Check ──────────────────────────────────────────────
    useEffect(() => {
        // We wait one tick so HabitContext and TaskContext have finished loading
        const timer = setTimeout(() => {
            maybeRunReset();
        }, 500);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── AppState: Midnight / Wake Guard ─────────────────────────────────────
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
                // App just came to foreground (from background or device unlock)
                maybeRunReset();
            }
        });
        return () => subscription.remove();
    }, [maybeRunReset]);

    return (
        <DailyResetContext.Provider value={{}}>
            {children}
        </DailyResetContext.Provider>
    );
};
