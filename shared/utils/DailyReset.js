/**
 * DailyReset — New Day Transition Engine
 *
 * Responsibilities:
 *   1. Recalculate habit streaks using lastCompletionDate (not a raw boolean)
 *   2. Generate recurring task clones for today (dedup-safe)
 *   3. Skills: nothing to store — daysActive is always computed dynamically
 *
 * This module is PURE:
 *   - Takes current state, returns transformed state
 *   - Does NOT call setState or AsyncStorage directly
 *   - Callers are responsible for persisting the result
 */

import { getTodayKey, getYesterdayKey } from './DateService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// ─── Streak Logic ─────────────────────────────────────────────────────────────

/**
 * Compute the correct streak for a habit at the start of a new day.
 *
 * Rules:
 *   - If lastCompletionDate was yesterday or today → keep current streak
 *   - Anything older → streak resets to 0
 *
 * NOTE:
 *   Streak increments happen in HabitContext when the user logs today.
 *   Daily reset only validates whether the existing streak is still valid.
 */
export const computeStreak = (habit, todayKey) => {
    const yesterdayKey = getYesterdayKey();
    const lcd = habit.lastCompletionDate; // YYYY-MM-DD or null/undefined

    if (!lcd) return 0;
    if (lcd === yesterdayKey) return habit.streak || 0;
    if (lcd === todayKey) return habit.streak || 0; // already logged today before reset ran
    return 0; // missed a day → broken streak
};

// ─── Habit Reset ──────────────────────────────────────────────────────────────

/**
 * Reset habits for a new day.
 *
 * What changes:
 *   - Recompute streak from lastCompletionDate (reliable, not guessed)
 *   - todayProgress is always read from logs[todayKey], so nothing to reset
 *
 * What does NOT change:
 *   - history / logs (those are the source of truth)
 *   - lastCompletionDate (that was set when the user last logged)
 */
export const resetHabitsForNewDay = (habits, todayKey) => {
    return habits.map(habit => {
        const newStreak = computeStreak(habit, todayKey);
        return {
            ...habit,
            streak: newStreak,
        };
    });
};

// ─── Task Recurrence ──────────────────────────────────────────────────────────

/** Supported recurrence values (case-insensitive) */
const RECURRENCE_DAILY = ['daily', 'everyday'];
const RECURRENCE_WEEKLY = ['weekly'];

/**
 * Determines if a recurring task should be cloned for todayKey.
 *
 * Avoids duplicates by checking whether a clone for today already exists
 * in the tasks array.
 */
const shouldCloneTask = (task, existingTasks, todayKey) => {
    const rec = (task.recurrence || '').toLowerCase();
    if (RECURRENCE_DAILY.includes(rec)) {
        // Clone daily tasks → check nothing already cloned for today
        const alreadyExists = existingTasks.some(
            t => t.originalId === task.id && t.clonedForDate === todayKey
        );
        return !alreadyExists;
    }
    if (RECURRENCE_WEEKLY.includes(rec)) {
        const originalDay = new Date(task.createdAt + (task.createdAt.includes('T') ? '' : 'T00:00:00')).getDay();
        const todayDay = new Date(todayKey + 'T00:00:00').getDay();
        if (originalDay !== todayDay) return false;
        const alreadyExists = existingTasks.some(
            t => t.originalId === task.id && t.clonedForDate === todayKey
        );
        return !alreadyExists;
    }
    return false;
};

/**
 * Clone a recurring task for today.
 * The clone is marked with originalId + clonedForDate for deduplication.
 */
const cloneTaskForToday = (task, todayKey) => ({
    ...task,
    id: uuidv4(),
    originalId: task.id,
    clonedForDate: todayKey,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Strip recurrence from clone so it doesn't recurse itself
    recurrence: 'none',
    _isClone: true,
});

/**
 * Generate recurring task clones for today.
 * Only the BASE task (not clones) is used as a template.
 */
export const generateRecurringTasks = (tasks, todayKey) => {
    const baseTasks = tasks.filter(t => !t._isClone); // only originals are templates
    const newClones = [];

    for (const task of baseTasks) {
        if (shouldCloneTask(task, tasks, todayKey)) {
            newClones.push(cloneTaskForToday(task, todayKey));
        }
    }

    return newClones.length > 0 ? [...tasks, ...newClones] : tasks;
};

// ─── Main Reset Entry Point ───────────────────────────────────────────────────

/**
 * runDailyReset(currentState) → nextState
 *
 * Pure function — takes the current app state, returns the new state.
 * The caller must persist the result.
 *
 * @param {{ habits: Habit[], tasks: Task[] }} currentState
 * @param {string} todayKey  YYYY-MM-DD
 * @returns {{ habits: Habit[], tasks: Task[] }}
 */
export const runDailyReset = (currentState, todayKey) => {
    const { habits = [], tasks = [] } = currentState;

    const nextHabits = resetHabitsForNewDay(habits, todayKey);
    const nextTasks = generateRecurringTasks(tasks, todayKey);

    return {
        habits: nextHabits,
        tasks: nextTasks,
    };
};

// ─── Selectors (Derived Data — Never Stored) ──────────────────────────────────

/**
 * Get a habit's progress for a specific day from its logs object.
 * Returns a number (0 if no entry).
 */
export const selectHabitProgressForDay = (habit, dateKey) => {
    return habit.history?.[dateKey]?.value ?? habit.history?.[dateKey] ?? 0;
};

/**
 * Is the habit completed for the given day?
 */
export const selectHabitCompletedForDay = (habit, dateKey) => {
    const progress = selectHabitProgressForDay(habit, dateKey);
    const goal = typeof habit.goal === 'object' ? habit.goal.value : (habit.goal || 1);
    return progress >= goal;
};

/**
 * Percentage completion of a habit for a given day (0-100).
 */
export const selectHabitProgressPercent = (habit, dateKey) => {
    const progress = selectHabitProgressForDay(habit, dateKey);
    const goal = typeof habit.goal === 'object' ? habit.goal.value : (habit.goal || 1);
    return Math.min(100, Math.round((progress / goal) * 100));
};

/**
 * Skill progress percentage from currentLevel → targetLevel.
 * Computed dynamically, never stored.
 */
export const selectSkillProgressPercent = (skill) => {
    const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const ci = LEVELS.indexOf(skill.currentLevel);
    const ti = LEVELS.indexOf(skill.targetLevel);
    if (ci <= 0 && ti <= 0) return 0;
    if (ti === 0) return 100;
    return Math.round((Math.max(0, ci) / ti) * 100);
};

/**
 * Task status selector.
 */
export const selectTaskStatus = (task) => ({
    isCompleted: !!task.completed,
    isOverdue: !task.completed && task.dueDate && task.dueDate < getTodayKey(),
    isRecurring: !!(task.recurrence && task.recurrence !== 'none' && task.recurrence !== 'None'),
});
