import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, Check, Flame } from 'lucide-react-native';
import { HabitContext } from '../context/HabitContext';
import { ContributionGraph } from 'react-native-chart-kit';
import DeleteButton from '../components/DeleteButton';
import { useTheme } from '../utils/theme';

export default function HabitTrackerScreen({ navigation }) {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    const { habits, deleteHabit, clearAllHabits, logHabit, unlogHabit } = useContext(HabitContext);
    const W = Dimensions.get('window').width;

    const today = new Date().toISOString().split('T')[0];
    const isLogged = (h) => h.history?.[today];
    const toggle = (h) => isLogged(h) ? unlogHabit(h.id) : logHabit(h.id, h.goal);
    const loggedCount = habits.filter(h => isLogged(h)).length;

    const data = [
        { date: '2023-10-02', count: 1 }, { date: '2023-10-03', count: 2 },
        { date: '2023-10-04', count: 3 }, { date: '2023-10-05', count: 4 },
        { date: '2023-11-01', count: 2 }, { date: '2023-11-05', count: 3 },
    ];

    const clearAll = () => {
        if (!habits.length) return;
        if (Platform.OS === 'web') {
            if (window.confirm('Delete all habits?')) clearAllHabits();
        } else {
            Alert.alert('Clear All', 'Delete all habits?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearAllHabits },
            ]);
        }
    };

    return (
        <SafeAreaView style={s.root}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={s.header}>
                    <View>
                        <Text style={s.headerLabel}>HABIT TRACKER</Text>
                        <Text style={s.headerTitle}>{loggedCount}/{habits.length} today</Text>
                    </View>
                    <View style={s.iconWrap}>
                        <Flame size={18} color={C.warn} strokeWidth={1.5} />
                    </View>
                </View>

                {/* Heatmap */}
                <View style={s.heatCard}>
                    <Text style={s.sectionLabel}>CONSISTENCY</Text>
                    <ContributionGraph
                        values={data}
                        endDate={new Date('2023-11-05')}
                        numDays={95}
                        width={W - 72}
                        height={170}
                        chartConfig={{
                            backgroundColor: C.surface,
                            backgroundGradientFrom: C.surface,
                            backgroundGradientTo: C.surface,
                            decimalPlaces: 0,
                            color: (op = 1) => `rgba(249,249,249,${op})`,
                            style: { borderRadius: R.lg },
                        }}
                    />
                </View>

                {/* Habits header */}
                <View style={s.habitsHeader}>
                    <Text style={s.sectionLabel}>YOUR HABITS</Text>
                    {habits.length > 0 && (
                        <TouchableOpacity onPress={clearAll} style={s.clearBtn}>
                            <Trash2 size={12} color={C.danger} strokeWidth={1.5} />
                            <Text style={s.clearText}>Clear all</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {habits.length === 0 && (
                    <View style={s.empty}>
                        <View style={s.emptyIcon}><Text style={{ fontSize: 28 }}>🔁</Text></View>
                        <Text style={s.emptyTitle}>No habits yet</Text>
                        <Text style={s.emptySub}>Build streaks, build yourself</Text>
                    </View>
                )}

                {habits.map(h => (
                    <View key={h.id} style={s.habitRow}>
                        <TouchableOpacity
                            style={s.habitMain}
                            onPress={() => navigation.navigate('AddEditHabit', { habitId: h.id })}
                            activeOpacity={0.7}
                        >
                            <View style={s.emoji}>
                                <Text style={s.emojiText}>{h.emoji}</Text>
                            </View>
                            <View style={s.habitInfo}>
                                <Text style={s.habitName}>{h.title}</Text>
                                {h.streak > 0 && (
                                    <View style={s.streakRow}>
                                        <Flame size={10} color={C.warn} strokeWidth={1.5} />
                                        <Text style={s.streakText}>{h.streak} day streak</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[s.logBtn, isLogged(h) && s.logBtnDone]}
                            onPress={() => toggle(h)}
                        >
                            <Check size={16} color={isLogged(h) ? C.black : C.textMuted} strokeWidth={2} />
                        </TouchableOpacity>

                        <DeleteButton
                            onDelete={() => deleteHabit(h.id)}
                            itemType="Habit"
                            size={16}
                            color={C.textMuted}
                            style={{ paddingHorizontal: S.sm }}
                        />
                    </View>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>

            <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AddEditHabit')} activeOpacity={0.85}>
                <Plus size={22} color={C.black} strokeWidth={2} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    root: { flex: 1, backgroundColor: C.black },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: S.xl,
        paddingTop: S.lg,
        paddingBottom: S.lg,
    },
    headerLabel: { ...T.cap, marginBottom: 4 },
    headerTitle: { ...T.h2 },
    iconWrap: {
        width: 40, height: 40, borderRadius: R.md,
        backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    heatCard: {
        backgroundColor: C.surface,
        borderRadius: R.xl,
        padding: S.lg,
        marginHorizontal: S.xl,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: S.xl,
        alignItems: 'center',
    },
    sectionLabel: { ...T.cap, marginBottom: S.md, alignSelf: 'flex-start' },
    habitsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: S.xl,
        marginBottom: S.md,
    },
    clearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: S.md,
        paddingVertical: S.xs,
        borderRadius: R.round,
        backgroundColor: C.dangerBg,
        borderWidth: 1,
        borderColor: 'rgba(255,68,68,0.2)',
    },
    clearText: { ...T.cap, fontSize: 9, color: C.danger },
    empty: { alignItems: 'center', paddingVertical: 40, gap: S.sm },
    emptyIcon: {
        width: 64, height: 64, borderRadius: 18,
        backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    emptyTitle: { ...T.h5 },
    emptySub: { ...T.bodySm },
    habitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        marginHorizontal: S.xl,
        marginBottom: S.sm,
        borderRadius: R.lg,
        borderWidth: 1,
        borderColor: C.border,
    },
    habitMain: {
        flex: 1, flexDirection: 'row', alignItems: 'center', padding: S.lg, gap: S.md,
    },
    emoji: {
        width: 42, height: 42, borderRadius: R.md,
        backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    emojiText: { fontSize: 20 },
    habitInfo: { flex: 1 },
    habitName: { ...T.h5, fontSize: 14, marginBottom: 3 },
    streakRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    streakText: { ...T.cap, fontSize: 9, color: C.warn },
    logBtn: {
        width: 34, height: 34, borderRadius: R.sm,
        borderWidth: 1, borderColor: C.borderStrong,
        justifyContent: 'center', alignItems: 'center',
        marginRight: S.xs,
    },
    logBtnDone: { backgroundColor: C.white, borderColor: C.white },
    fab: {
        position: 'absolute', bottom: 28, right: S.xl,
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: C.white,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: C.white, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12, shadowRadius: 10, elevation: 6,
    },
});
