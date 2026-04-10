import React, { createContext, useState, useEffect, useCallback } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { saveData, loadData, STORAGE_KEYS } from '../utils/storageHelper';
import { getTodayKey } from '../utils/DateService';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // ─── Load ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            const saved = await loadData(STORAGE_KEYS.TASKS, []);
            setTasks(saved);
            setLoading(false);
        };
        load();
    }, []);

    // ─── Transactional Save ──────────────────────────────────────────────────
    const updateTasks = useCallback((updaterFn) => {
        setTasks(prev => {
            const next = updaterFn(prev);
            saveData(STORAGE_KEYS.TASKS, next);
            return next;
        });
    }, []);

    // ─── CRUD ────────────────────────────────────────────────────────────────
    const addTask = useCallback((task) => {
        updateTasks(prev => [
            ...prev,
            {
                id: uuidv4(),
                completed: false,
                completedAt: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                recurrence: 'none',
                _isClone: false,
                originalId: null,
                clonedForDate: null,
                ...task,
            },
        ]);
    }, [updateTasks]);

    const updateTask = useCallback((taskId, updatedFields) => {
        updateTasks(prev =>
            prev.map(t =>
                t.id === taskId
                    ? { ...t, ...updatedFields, updatedAt: new Date().toISOString() }
                    : t
            )
        );
    }, [updateTasks]);

    /**
     * Toggle a task's completion status.
     * Records completedAt when completing; clears it when un-completing.
     */
    const toggleTask = useCallback((id) => {
        updateTasks(prev =>
            prev.map(t => {
                if (t.id !== id) return t;
                const nowCompleted = !t.completed;
                return {
                    ...t,
                    completed: nowCompleted,
                    completedAt: nowCompleted ? new Date().toISOString() : null,
                    updatedAt: new Date().toISOString(),
                };
            })
        );
    }, [updateTasks]);

    // Keep legacy name for backwards compat with existing screens
    const toggleTaskCompletion = toggleTask;

    const deleteTask = useCallback((id) => {
        updateTasks(prev => prev.filter(t => t.id !== id));
    }, [updateTasks]);

    const clearAllTasks = useCallback(() => {
        updateTasks(() => []);
    }, [updateTasks]);

    // ─── Daily Reset Application ──────────────────────────────────────────────
    /**
     * Called by DailyResetContext after cloning recurring tasks.
     * Accepts the computed next tasks array and persists it atomically.
     */
    const applyTaskReset = useCallback((nextTasks) => {
        updateTasks(() => nextTasks);
    }, [updateTasks]);

    // ─── Selectors ────────────────────────────────────────────────────────────
    const getTasksForToday = useCallback(() => {
        const today = getTodayKey();
        return tasks.filter(t =>
            t.clonedForDate === today ||
            (!t._isClone && (t.recurrence === 'none' || !t.recurrence))
        );
    }, [tasks]);

    return (
        <TaskContext.Provider value={{
            tasks,
            loading,
            addTask,
            updateTask,
            toggleTask,
            toggleTaskCompletion,   // legacy alias
            deleteTask,
            clearAllTasks,
            applyTaskReset,
            getTasksForToday,
        }}>
            {children}
        </TaskContext.Provider>
    );
};
