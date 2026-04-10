import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { CheckCircle, Trophy, Flame, ListTodo, Repeat, GraduationCap } from 'lucide-react-native';
import { TaskContext } from '../../tasks/context/TaskContext';
import { HabitContext } from '../../habits/context/HabitContext';
import { SkillContext } from '../../skills/context/SkillContext';
import { useTheme } from '../../../shared/utils/theme';

export default function AnalyticsScreen() {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    const { tasks } = useContext(TaskContext);
    const { habits } = useContext(HabitContext);
    const { skills } = useContext(SkillContext);
    const W = Dimensions.get('window').width;

    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    const skillHours = Math.floor(skills.reduce((a, s) => a + s.timeSpent, 0) / 60);
    const avgStreak = habits.length > 0
        ? (habits.reduce((a, h) => a + h.streak, 0) / habits.length).toFixed(1)
        : '0.0';

    const pieData = [
        { name: 'Done', population: done || 0, color: C.white, legendFontColor: C.textSub, legendFontSize: 12 },
        { name: 'Pending', population: (total - done) || 0, color: C.surface3, legendFontColor: C.textSub, legendFontSize: 12 },
    ];

    const metrics = [
        { icon: CheckCircle, label: 'Task Rate', value: `${rate}%`, color: C.success },
        { icon: Trophy, label: 'Skill Hrs', value: `${skillHours}h`, color: C.info },
        { icon: Flame, label: 'Avg Streak', value: avgStreak, color: C.warn },
    ];

    const overview = [
        { icon: ListTodo, label: 'Total Tasks', value: total },
        { icon: Repeat, label: 'Habits', value: habits.length },
        { icon: GraduationCap, label: 'Skills', value: skills.length },
    ];

    return (
        <SafeAreaView style={s.root}>
            <View style={s.header}>
                <Text style={s.headerLabel}>OVERVIEW</Text>
                <Text style={s.headerTitle}>Insights</Text>
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                {/* Metric cards */}
                <View style={s.metricRow}>
                    {metrics.map(({ icon: Icon, label, value, color }, i) => (
                        <View key={i} style={s.metricCard}>
                            <Icon size={16} color={color} strokeWidth={1.5} />
                            <Text style={[s.metricVal, { color }]}>{value}</Text>
                            <Text style={s.metricLabel}>{label}</Text>
                        </View>
                    ))}
                </View>

                {/* Divider */}
                <View style={s.divider} />
                <Text style={s.sectionLabel}>TASK DISTRIBUTION</Text>

                {/* Pie chart */}
                <View style={s.chartCard}>
                    <PieChart
                        data={pieData}
                        width={W - 40}
                        height={180}
                        chartConfig={{ color: () => C.white, backgroundGradientFrom: C.surface, backgroundGradientTo: C.surface }}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="10"
                        absolute
                    />
                </View>

                {/* Divider */}
                <View style={s.divider} />
                <Text style={s.sectionLabel}>TOTALS</Text>

                {/* Overview */}
                <View style={s.overviewCard}>
                    {overview.map(({ icon: Icon, label, value }, i) => (
                        <View key={i} style={[s.overviewItem, i < 2 && s.overviewBorder]}>
                            <Icon size={18} color={C.textSub} strokeWidth={1.5} />
                            <Text style={s.overviewVal}>{value}</Text>
                            <Text style={s.overviewLabel}>{label}</Text>
                        </View>
                    ))}
                </View>

                <View style={s.divider} />
                <Text style={s.sectionLabel}>PRODUCTIVITY TIP</Text>
                <View style={s.tipCard}>
                    <Text style={s.tipText}>
                        {total - done > 0
                            ? `You have ${total - done} pending tasks. Clear them before starting new skills.`
                            : 'Great job! All your tasks are completed.'}
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    root: { flex: 1, backgroundColor: C.black },
    header: {
        paddingHorizontal: S.xl,
        paddingTop: S.lg,
        paddingBottom: S.lg,
    },
    headerLabel: { ...T.cap, marginBottom: 4 },
    headerTitle: { ...T.h2 },
    scroll: { paddingHorizontal: S.xl },
    metricRow: { flexDirection: 'row', gap: S.md, marginBottom: S.xl },
    metricCard: {
        flex: 1,
        backgroundColor: C.surface,
        borderRadius: R.lg,
        padding: S.lg,
        alignItems: 'center',
        gap: S.xs,
        borderWidth: 1,
        borderColor: C.border,
    },
    metricVal: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
    metricLabel: { ...T.cap, fontSize: 9 },
    divider: { height: 1, backgroundColor: C.border, marginBottom: S.md },
    sectionLabel: { ...T.cap, marginBottom: S.md },
    chartCard: {
        backgroundColor: C.surface,
        borderRadius: R.xl,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: S.xl,
        alignItems: 'center',
        overflow: 'hidden',
    },
    overviewCard: {
        flexDirection: 'row',
        backgroundColor: C.surface,
        borderRadius: R.xl,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: S.xl,
        overflow: 'hidden',
    },
    overviewItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: S.xl,
        gap: S.xs,
    },
    overviewBorder: { borderRightWidth: 1, borderRightColor: C.border },
    overviewVal: { ...T.h3, fontSize: 22 },
    overviewLabel: { ...T.cap, fontSize: 9 },
    tipCard: {
        backgroundColor: C.surface,
        borderRadius: R.lg,
        padding: S.lg,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: S.xl,
    },
    tipText: { ...T.bodySm, lineHeight: 20 },
});
