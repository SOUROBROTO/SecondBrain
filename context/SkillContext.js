import React, { createContext, useState, useEffect, useCallback } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { saveData, loadData, STORAGE_KEYS } from '../utils/storageHelper';
import { daysElapsedSince } from '../utils/DateService';
import { selectSkillProgressPercent } from '../utils/DailyReset';

export { selectSkillProgressPercent };

export const SkillContext = createContext();

export const SkillProvider = ({ children }) => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    // ─── Load ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            const saved = await loadData(STORAGE_KEYS.SKILLS, []);
            setSkills(saved);
            setLoading(false);
        };
        load();
    }, []);

    // ─── Transactional Save ──────────────────────────────────────────────────
    const updateSkills = useCallback((updaterFn) => {
        setSkills(prev => {
            const next = updaterFn(prev);
            saveData(STORAGE_KEYS.SKILLS, next);
            return next;
        });
    }, []);

    // ─── CRUD ────────────────────────────────────────────────────────────────
    const addSkill = useCallback((skill) => {
        updateSkills(prev => [
            ...prev,
            {
                id: uuidv4(),
                level: 0,
                timeSpent: 0,
                logs: [],
                purpose: '',
                weeklyTime: 5,
                learningMethods: [],
                milestones: [],
                difficulty: 'medium',
                startDate: new Date().toISOString(),
                reminder: { enabled: false, frequency: 'daily', time: '09:00' },
                ...skill,
            },
        ]);
    }, [updateSkills]);

    const updateSkill = useCallback((id, updatedFields) => {
        updateSkills(prev =>
            prev.map(s => s.id === id ? { ...s, ...updatedFields } : s)
        );
    }, [updateSkills]);

    const deleteSkill = useCallback((id) => {
        updateSkills(prev => prev.filter(s => s.id !== id));
    }, [updateSkills]);

    const clearAllSkills = useCallback(() => {
        updateSkills(() => []);
    }, [updateSkills]);

    // ─── Session Logging ─────────────────────────────────────────────────────
    /**
     * Log a practice session.
     * timeSpent and level are derived from logs — this is the source of truth.
     */
    const logSession = useCallback((skillId, duration, note, completedMilestoneIds = [], learningMethods = []) => {
        updateSkills(prev => prev.map(skill => {
            if (skill.id !== skillId) return skill;

            const newTimeSpent = (skill.timeSpent || 0) + duration;
            // Level: 1 per 60 min accumulated, capped at 100
            const newLevel = Math.min(100, Math.floor(newTimeSpent / 60));

            const updatedMilestones = (skill.milestones || []).map(m =>
                completedMilestoneIds.includes(m.id) ? { ...m, completed: true } : m
            );

            return {
                ...skill,
                timeSpent: newTimeSpent,
                level: newLevel,
                milestones: updatedMilestones,
                logs: [
                    {
                        id: uuidv4(),
                        date: new Date().toISOString(),
                        duration,
                        note,
                        completedMilestones: completedMilestoneIds,
                        learningMethods,
                    },
                    ...(skill.logs || []),
                ],
            };
        }));
    }, [updateSkills]);

    const updateSessionLog = useCallback((skillId, logId, updatedLearningMethods) => {
        updateSkills(prev => prev.map(skill => {
            if (skill.id !== skillId) return skill;
            return {
                ...skill,
                logs: skill.logs.map(log =>
                    log.id === logId
                        ? { ...log, learningMethods: updatedLearningMethods }
                        : log
                ),
            };
        }));
    }, [updateSkills]);

    const deleteSessionLog = useCallback((skillId, logId) => {
        updateSkills(prev => prev.map(skill => {
            if (skill.id !== skillId) return skill;

            const logToDelete = skill.logs.find(l => l.id === logId);
            if (!logToDelete) return skill;

            const newTimeSpent = Math.max(0, (skill.timeSpent || 0) - logToDelete.duration);
            const newLevel = Math.min(100, Math.floor(newTimeSpent / 60));

            const reversedMilestones = (skill.milestones || []).map(m =>
                (logToDelete.completedMilestones || []).includes(m.id)
                    ? { ...m, completed: false }
                    : m
            );

            return {
                ...skill,
                timeSpent: newTimeSpent,
                level: newLevel,
                milestones: reversedMilestones,
                logs: skill.logs.filter(l => l.id !== logId),
            };
        }));
    }, [updateSkills]);

    const clearSkillHistory = useCallback((skillId) => {
        updateSkills(prev => prev.map(skill => {
            if (skill.id !== skillId) return skill;
            return {
                ...skill,
                timeSpent: 0,
                level: 0,
                milestones: (skill.milestones || []).map(m => ({ ...m, completed: false })),
                logs: [],
            };
        }));
    }, [updateSkills]);

    const restoreSkillData = useCallback((skillId, restoredData) => {
        updateSkills(prev => prev.map(skill => {
            if (skill.id !== skillId) return skill;
            return { ...skill, ...restoredData };
        }));
    }, [updateSkills]);

    // ─── Derived Selectors ────────────────────────────────────────────────────
    /**
     * Days active is ALWAYS computed — never stored.
     * Call this wherever the UI needs it.
     */
    const getDaysActive = useCallback((skill) => {
        return daysElapsedSince(skill.startDate);
    }, []);

    const getProgressPercent = useCallback((skill) => {
        return selectSkillProgressPercent(skill);
    }, []);

    return (
        <SkillContext.Provider value={{
            skills,
            loading,
            addSkill,
            updateSkill,
            deleteSkill,
            clearAllSkills,
            logSession,
            updateSessionLog,
            deleteSessionLog,
            clearSkillHistory,
            restoreSkillData,
            // Derived (no storage)
            getDaysActive,
            getProgressPercent,
        }}>
            {children}
        </SkillContext.Provider>
    );
};
