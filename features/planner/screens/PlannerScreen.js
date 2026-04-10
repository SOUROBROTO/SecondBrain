import React, { useContext, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Plus, ArrowRight, CalendarDays, Clock } from 'lucide-react-native';
import { PlannerContext } from '../context/PlannerContext';
import { resolveColors } from '../components/PlannerBlockItem';
import AddBlockSheet from '../components/AddBlockSheet';
import { useTheme } from '../../../shared/utils/theme';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const toStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

function MiniCalendar({ year, month, selected, onSelect, markedDates, s }) {
    const first = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const today = toStr(new Date());

    const cells = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

    return (
        <View>
            {/* Day labels */}
            <View style={s.weekRow}>
                {DAYS.map(d => <Text key={d} style={s.weekDay}>{d}</Text>)}
            </View>
            {rows.map((row, ri) => (
                <View key={ri} style={s.calRow}>
                    {row.map((day, ci) => {
                        if (!day) return <View key={ci} style={s.calCell} />;
                        const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isSel = ds === selected;
                        const isTdy = ds === today;
                        const hasMark = markedDates.includes(ds);
                        return (
                            <TouchableOpacity
                                key={ci}
                                style={[s.calCell, isSel && s.calCellSel, isTdy && !isSel && s.calCellToday]}
                                onPress={() => onSelect(ds)}
                                activeOpacity={0.7}
                            >
                                <Text style={[s.calDay, isSel && s.calDaySel, isTdy && !isSel && s.calDayToday]}>{day}</Text>
                                {hasMark && !isSel && <View style={s.dot} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

export default function PlannerScreen({ navigation }) {
    const { C, T, R, S } = useTheme();
    const { blocks, getBlocksForDate, getAllDatesWithBlocks } = useContext(PlannerContext);
    const today = new Date();
    const todayStr = toStr(today);

    const [selected, setSelected] = useState(todayStr);
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [showSheet, setShowSheet] = useState(false);

    const s = useMemo(() => getStyles(C, T, R, S), [C, T, R, S]);

    const marked = useMemo(() => getAllDatesWithBlocks(), [getAllDatesWithBlocks, blocks]);
    const dayBlocks = useMemo(() => getBlocksForDate(selected), [getBlocksForDate, selected, blocks]);

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const fmtSel = () => {
        if (selected === todayStr) return 'Today';
        const d = new Date(selected + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const handleSelect = useCallback((type) => {
        navigation.navigate('AddEditBlock', { date: selected, defaultBlockType: type });
    }, [navigation, selected]);

    return (
        <SafeAreaView style={s.root} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={s.headerLabel}>PLANNER</Text>
                    <Text style={s.headerTitle}>{MONTHS[month]} {year}</Text>
                </View>
                <View style={s.headerActions}>
                    <TouchableOpacity
                        style={s.iconBtn}
                        onPress={() => { setSelected(todayStr); setMonth(today.getMonth()); setYear(today.getFullYear()); }}
                    >
                        <CalendarDays size={16} color={C.textSub} strokeWidth={1.5} />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.addBtn} onPress={() => setShowSheet(true)}>
                        <Plus size={18} color={C.black} strokeWidth={2} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Month nav */}
                <View style={s.monthNav}>
                    <TouchableOpacity style={s.navBtn} onPress={prevMonth}>
                        <ChevronLeft size={16} color={C.textSub} strokeWidth={1.5} />
                    </TouchableOpacity>
                    <Text style={s.monthLabel}>{MONTHS[month]} {year}</Text>
                    <TouchableOpacity style={s.navBtn} onPress={nextMonth}>
                        <ChevronRight size={16} color={C.textSub} strokeWidth={1.5} />
                    </TouchableOpacity>
                </View>

                {/* Calendar */}
                <View style={s.calCard}>
                    <MiniCalendar
                        year={year}
                        month={month}
                        selected={selected}
                        onSelect={setSelected}
                        markedDates={marked}
                        s={s}
                    />
                </View>

                {/* Selected day */}
                <View style={s.daySection}>
                    <View style={s.daySectionHeader}>
                        <Text style={s.dayTitle}>{fmtSel()}</Text>
                        <TouchableOpacity
                            style={s.openBtn}
                            onPress={() => navigation.navigate('DailyPage', { date: selected })}
                        >
                            <Text style={s.openBtnText}>Open</Text>
                            <ArrowRight size={12} color={C.textSub} strokeWidth={1.5} />
                        </TouchableOpacity>
                    </View>

                    {dayBlocks.length === 0 ? (
                        <View style={s.emptyDay}>
                            <Text style={s.emptyDayText}>Nothing scheduled</Text>
                        </View>
                    ) : (
                        dayBlocks.slice(0, 5).map(block => {
                            const meta = resolveColors(block);
                            const fmt = (iso) => { try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
                            return (
                                <TouchableOpacity
                                    key={block.id}
                                    style={s.blockRow}
                                    onPress={() => navigation.navigate('AddEditBlock', { blockId: block.id })}
                                >
                                    <View style={[s.blockBar, { backgroundColor: meta.accent }]} />
                                    <View style={s.blockContent}>
                                        <Text style={s.blockTitle} numberOfLines={1}>{block.title || 'Untitled'}</Text>
                                        {block.startTime && (
                                            <View style={s.blockTime}>
                                                <Clock size={10} color={C.textMuted} strokeWidth={1.5} />
                                                <Text style={s.blockTimeText}>{fmt(block.startTime)} – {fmt(block.endTime)}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={[s.blockType, { backgroundColor: `${meta.accent}18` }]}>
                                        <Text style={[s.blockTypeText, { color: meta.accent }]}>
                                            {(block.blockType || block.type || 'task').toUpperCase()}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}

                    {dayBlocks.length > 5 && (
                        <Text style={s.moreText}>+{dayBlocks.length - 5} more</Text>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={s.fab} onPress={() => setShowSheet(true)} activeOpacity={0.85}>
                <Plus size={22} color={C.black} strokeWidth={2} />
            </TouchableOpacity>

            <AddBlockSheet visible={showSheet} onClose={() => setShowSheet(false)} onSelectType={handleSelect} />
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
    headerTitle: { ...T.h3 },
    headerActions: { flexDirection: 'row', gap: S.sm, alignItems: 'center' },
    iconBtn: {
        width: 36, height: 36, borderRadius: R.md,
        backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    addBtn: {
        width: 36, height: 36, borderRadius: R.md,
        backgroundColor: C.white,
        justifyContent: 'center', alignItems: 'center',
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: S.xl,
        paddingBottom: S.md,
    },
    navBtn: {
        width: 34, height: 34, borderRadius: R.sm,
        backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    monthLabel: { ...T.h5 },
    calCard: {
        marginHorizontal: S.xl,
        backgroundColor: C.surface,
        borderRadius: R.xl,
        padding: S.lg,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: S.xl,
    },
    weekRow: { flexDirection: 'row', marginBottom: S.sm },
    weekDay: { flex: 1, textAlign: 'center', ...T.cap, fontSize: 10 },
    calRow: { flexDirection: 'row' },
    calCell: {
        flex: 1, aspectRatio: 1,
        alignItems: 'center', justifyContent: 'center',
        margin: 1, borderRadius: R.sm,
    },
    calCellSel: { backgroundColor: C.white },
    calCellToday: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderMed },
    calDay: { ...T.label, color: C.textSub },
    calDaySel: { color: C.black, fontWeight: '700' },
    calDayToday: { color: C.white, fontWeight: '700' },
    dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.textSub, marginTop: 1 },
    // Day section
    daySection: {
        marginHorizontal: S.xl,
        backgroundColor: C.surface,
        borderRadius: R.xl,
        padding: S.lg,
        borderWidth: 1,
        borderColor: C.border,
    },
    daySectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: S.md,
    },
    dayTitle: { ...T.h5 },
    openBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    openBtnText: { ...T.label },
    emptyDay: { paddingVertical: S.xl, alignItems: 'center' },
    emptyDayText: { ...T.bodySm },
    blockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface2,
        borderRadius: R.md,
        marginBottom: S.sm,
        overflow: 'hidden',
        minHeight: 52,
        borderWidth: 1,
        borderColor: C.border,
        gap: S.md,
    },
    blockBar: { width: 3, height: '100%' },
    blockContent: { flex: 1, paddingVertical: S.sm },
    blockTitle: { ...T.h5, fontSize: 13, marginBottom: 3 },
    blockTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    blockTimeText: { ...T.cap, fontSize: 9, color: C.textMuted },
    blockType: {
        paddingHorizontal: S.sm,
        paddingVertical: 3,
        borderRadius: R.xs,
        marginRight: S.sm,
    },
    blockTypeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
    moreText: { ...T.bodySm, textAlign: 'center', paddingTop: S.sm },
    fab: {
        position: 'absolute', bottom: 24, right: S.xl,
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: C.white,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: C.white, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
    },
});
