import React, { createContext, useState, useEffect, useCallback } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { saveData, loadData, STORAGE_KEYS } from '../../../shared/utils/storageHelper';

export const PlannerContext = createContext();

// Block types available in planner
export const BLOCK_TYPES = {
    TASK: 'task',
    HABIT: 'habit',
    SKILL: 'skill',
    TEXT: 'text',
    CHECKLIST: 'checklist',
    DIVIDER: 'divider',
    TOGGLE: 'toggle',
};

export const PlannerProvider = ({ children }) => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load planner blocks from storage on mount
    useEffect(() => {
        const loadBlocks = async () => {
            const savedBlocks = await loadData(STORAGE_KEYS.PLANNER_BLOCKS, []);
            setBlocks(savedBlocks);
            setLoading(false);
        };
        loadBlocks();
    }, []);

    // Save blocks to storage whenever they change
    useEffect(() => {
        if (!loading) {
            saveData(STORAGE_KEYS.PLANNER_BLOCKS, blocks);
        }
    }, [blocks, loading]);

    // ─── CRUD ────────────────────────────────────────────────────────────────

    const addBlock = useCallback((block) => {
        const type = block.blockType ||
            (block.linkedTaskId ? BLOCK_TYPES.TASK :
                block.linkedHabitId ? BLOCK_TYPES.HABIT :
                    block.linkedSkillId ? BLOCK_TYPES.SKILL :
                        block.type || BLOCK_TYPES.TASK);

        const newBlock = {
            id: uuidv4(),
            blockType: type,
            date: block.date || new Date().toISOString().split('T')[0],
            position: block.position ?? Date.now(),
            startTime: block.startTime || null,
            endTime: block.endTime || null,
            content: block.content || {},
            title: block.title || '',
            // Legacy compat
            type,
            color: block.color || null,
            category: block.category || null,
            linkedTaskId: block.linkedTaskId || null,
            linkedHabitId: block.linkedHabitId || null,
            linkedSkillId: block.linkedSkillId || null,
            notes: block.notes || '',
            repeat: block.repeat || 'None',
            reminderMinutes: block.reminderMinutes || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...block,
        };
        setBlocks(prev => [...prev, newBlock]);
    }, []);

    const updateBlock = useCallback((id, updatedBlock) => {
        setBlocks(prev =>
            prev.map(block =>
                block.id === id
                    ? { ...block, ...updatedBlock, updatedAt: new Date().toISOString() }
                    : block
            )
        );
    }, []);

    const deleteBlock = useCallback((id) => {
        setBlocks(prev => prev.filter(block => block.id !== id));
    }, []);

    const reorderBlocksForDate = useCallback((date, orderedIds) => {
        setBlocks(prev => {
            const updated = [...prev];
            orderedIds.forEach((id, index) => {
                const idx = updated.findIndex(b => b.id === id);
                if (idx !== -1) {
                    updated[idx] = { ...updated[idx], position: index * 100 };
                }
            });
            return updated;
        });
    }, []);

    // ─── QUERIES ─────────────────────────────────────────────────────────────

    const getBlocksForDate = useCallback((date) => {
        return blocks
            .filter(b => b.date === date)
            .sort((a, b) => {
                // Timed blocks first sorted by time
                if (a.startTime && b.startTime) {
                    return new Date(a.startTime) - new Date(b.startTime);
                }
                if (a.startTime) return -1;
                if (b.startTime) return 1;
                return (a.position || 0) - (b.position || 0);
            });
    }, [blocks]);

    const getTimedBlocksForDate = useCallback((date) => {
        return blocks
            .filter(b => b.date === date && b.startTime && b.endTime)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }, [blocks]);

    const getFreeBlocksForDate = useCallback((date) => {
        return blocks
            .filter(b => b.date === date && (!b.startTime || !b.endTime))
            .sort((a, b) => (a.position || 0) - (b.position || 0));
    }, [blocks]);

    const getAllDatesWithBlocks = useCallback(() => {
        const dateSet = new Set(blocks.map(b => b.date).filter(Boolean));
        return Array.from(dateSet).sort();
    }, [blocks]);

    // Legacy compat
    const getGroupedBlocks = useCallback(() => {
        const groups = {};
        blocks.forEach(block => {
            if (!block.startTime || !block.endTime) return;
            const timeKey = `${block.startTime}_${block.endTime}`;
            if (!groups[timeKey]) groups[timeKey] = [];
            groups[timeKey].push(block);
        });
        return groups;
    }, [blocks]);

    return (
        <PlannerContext.Provider value={{
            blocks,
            loading,
            addBlock,
            updateBlock,
            deleteBlock,
            reorderBlocksForDate,
            getBlocksForDate,
            getTimedBlocksForDate,
            getFreeBlocksForDate,
            getAllDatesWithBlocks,
            // Legacy
            getGroupedBlocks,
        }}>
            {children}
        </PlannerContext.Provider>
    );
};
