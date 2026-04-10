import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/utils/theme';

export default function ProgressRing({ tasks = [], habits = [] }) {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.completed).length;
    const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    const totalHabits = habits.length;
    const doneHabits = habits.filter(h => h.completedToday).length;
    const habitPct = totalHabits > 0 ? Math.round((doneHabits / totalHabits) * 100) : 0;

    const overallPct = (taskPct + habitPct) / 2;

    return (
        <View style={s.card}>
            <View style={s.header}>
                <Text style={s.label}>TODAY'S PROGRESS</Text>
                <Text style={s.pct}>{Math.round(overallPct)}%</Text>
            </View>

            <View style={s.barRow}>
                <Text style={s.barLabel}>Tasks</Text>
                <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${taskPct}%`, backgroundColor: C.accent }]} />
                </View>
                <Text style={s.barValue}>{doneTasks}/{totalTasks}</Text>
            </View>

            <View style={s.barRow}>
                <Text style={s.barLabel}>Habits</Text>
                <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${habitPct}%`, backgroundColor: C.success }]} />
                </View>
                <Text style={s.barValue}>{doneHabits}/{totalHabits}</Text>
            </View>
        </View>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    card: {
        backgroundColor: C.surface,
        borderRadius: R.xl,
        padding: S.xl,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: S.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: S.lg,
    },
    label: {
        ...T.cap,
    },
    pct: {
        ...T.h4,
        color: C.accent,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: S.sm,
        gap: S.sm,
    },
    barLabel: {
        ...T.label,
        width: 48,
    },
    barBg: {
        flex: 1,
        height: 6,
        backgroundColor: C.surface2,
        borderRadius: R.round,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: R.round,
        minWidth: 4,
    },
    barValue: {
        ...T.label,
        width: 32,
        textAlign: 'right',
    },
});
