import React, { useContext, useState, useRef, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Animated, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PlannerContext } from '../context/PlannerContext';
import { TaskContext } from '../context/TaskContext';
import { HabitContext } from '../context/HabitContext';
import { SkillContext } from '../context/SkillContext';
import PlannerBlockItem, { BLOCK_META, resolveColors } from '../components/PlannerBlockItem';
import AddBlockSheet from '../components/AddBlockSheet';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HOUR_HEIGHT = 56;
const TIMELINE_START = 6; // 6 AM
const TIMELINE_END = 23;  // 11 PM

const formatDateLabel = (dateStr) => {
    if (!dateStr) return 'Today';
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const formatShortDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
};

const isoToMinutes = (iso) => {
    if (!iso) return 0;
    try {
        const d = new Date(iso);
        return d.getHours() * 60 + d.getMinutes();
    } catch { return 0; }
};

// ─── Timeline View ────────────────────────────────────────────────────────────

const TimelineView = ({ blocks, onBlockPress, onBlockDelete, date, navigation }) => {
    const timedBlocks = blocks.filter(b => b.startTime && b.endTime);

    const getBlockStyle = (block) => {
        const startMins = isoToMinutes(block.startTime);
        const endMins = isoToMinutes(block.endTime);
        const offsetMins = startMins - TIMELINE_START * 60;
        const duration = endMins - startMins;
        const top = (offsetMins / 60) * HOUR_HEIGHT;
        const height = Math.max((duration / 60) * HOUR_HEIGHT, 28);
        return { top, height };
    };

    const hours = [];
    for (let h = TIMELINE_START; h <= TIMELINE_END; h++) {
        hours.push(h);
    }

    const timelineHeight = (TIMELINE_END - TIMELINE_START + 1) * HOUR_HEIGHT;

    const formatHour = (h) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${display} ${ampm}`;
    };

    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const nowTop = ((nowMinutes - TIMELINE_START * 60) / 60) * HOUR_HEIGHT;
    const todayStr = new Date().toISOString().split('T')[0];
    const showNowLine = date === todayStr && nowTop >= 0 && nowTop <= timelineHeight;

    return (
        <ScrollView
            style={styles.timelineScroll}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.timelineContainer, { height: timelineHeight }]}>
                {/* Hour Lines */}
                {hours.map((h) => (
                    <View
                        key={h}
                        style={[styles.hourRow, { top: (h - TIMELINE_START) * HOUR_HEIGHT }]}
                    >
                        <Text style={styles.hourLabel}>{formatHour(h)}</Text>
                        <View style={styles.hourLine} />
                    </View>
                ))}

                {/* NOW indicator */}
                {showNowLine && (
                    <View style={[styles.nowLine, { top: nowTop }]}>
                        <View style={styles.nowDot} />
                        <View style={styles.nowBar} />
                    </View>
                )}

                {/* Blocks */}
                {timedBlocks.map((block) => {
                    const { top, height } = getBlockStyle(block);
                    // Respect custom block.color, fall back to type default
                    const meta = resolveColors(block);
                    return (
                        <TouchableOpacity
                            key={block.id}
                            style={[styles.timelineBlock, { top, height, backgroundColor: `${meta.accent}22`, borderColor: `${meta.accent}55` }]}
                            onPress={() => onBlockPress(block)}
                            onLongPress={() => {
                                const { Alert } = require('react-native');
                                Alert.alert(
                                    block.title || 'Block',
                                    'What would you like to do?',
                                    [
                                        { text: 'Edit', onPress: () => onBlockPress(block) },
                                        { text: 'Delete', style: 'destructive', onPress: () => onBlockDelete(block.id) },
                                        { text: 'Cancel', style: 'cancel' },
                                    ]
                                );
                            }}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={Array.isArray(meta.gradient) ? meta.gradient : [meta.accent, meta.accent]}
                                style={styles.timelineBlockAccent}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            />
                            <View style={styles.timelineBlockContent}>
                                <Text style={[styles.timelineBlockTitle, height < 36 && { fontSize: 11 }]} numberOfLines={1}>
                                    {block.title || 'Untitled'}
                                </Text>
                                {height >= 44 && (
                                    <Text style={styles.timelineBlockType}>
                                        {(block.blockType || block.type || 'task').toUpperCase()}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Free blocks below timeline */}
            {blocks.filter(b => !b.startTime || !b.endTime).length > 0 && (
                <View style={styles.freeBlocksSection}>
                    <Text style={styles.sectionLabel}>FREE BLOCKS</Text>
                    {blocks.filter(b => !b.startTime || !b.endTime).map(block => (
                        <PlannerBlockItem
                            key={block.id}
                            block={block}
                            onPress={onBlockPress}
                            onDelete={onBlockDelete}
                        />
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

// ─── Daily Page View ──────────────────────────────────────────────────────────

const DailyPageView = ({ blocks, date, onBlockPress, onBlockDelete, onBlockUpdate, onAddBlock }) => {
    const today = new Date().toISOString().split('T')[0];
    const productivity = useMemo(() => {
        const total = blocks.length;
        const done = blocks.filter(b =>
            b.blockType === 'task' && b.content?.completed
        ).length;
        return total > 0 ? Math.round((done / total) * 100) : 0;
    }, [blocks]);

    return (
        <ScrollView
            contentContainerStyle={styles.pageContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Daily Focus */}
            <View style={styles.focusCard}>
                <LinearGradient
                    colors={['#1C1C2E', '#121228']}
                    style={styles.focusGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.focusRow}>
                        <View style={styles.focusLeft}>
                            <Text style={styles.focusLabel}>DAILY FOCUS</Text>
                            <Text style={styles.focusValue}>{date === today ? '✦ Stay consistent' : '✦ Plan your day'}</Text>
                        </View>
                        <View style={styles.scoreCircle}>
                            <Text style={styles.scoreNumber}>{productivity}</Text>
                            <Text style={styles.scorePercent}>%</Text>
                        </View>
                    </View>
                    <View style={styles.progressBarBg}>
                        <Animated.View style={[styles.progressBarFill, { width: `${productivity}%` }]} />
                    </View>
                    <Text style={styles.progressLabel}>{blocks.length} block{blocks.length !== 1 ? 's' : ''} today</Text>
                </LinearGradient>
            </View>

            {/* Timed blocks */}
            {blocks.filter(b => b.startTime && b.endTime).length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="time-outline" size={14} color="#555" />
                        <Text style={styles.sectionLabel}>SCHEDULED</Text>
                    </View>
                    {blocks.filter(b => b.startTime && b.endTime).map(block => (
                        <PlannerBlockItem
                            key={block.id}
                            block={block}
                            onPress={onBlockPress}
                            onDelete={onBlockDelete}
                            onUpdate={onBlockUpdate}
                        />
                    ))}
                </View>
            )}

            {/* Free blocks */}
            {blocks.filter(b => !b.startTime || !b.endTime).length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="layers-outline" size={14} color="#555" />
                        <Text style={styles.sectionLabel}>FREE BLOCKS</Text>
                    </View>
                    {blocks.filter(b => !b.startTime || !b.endTime).map(block => (
                        <PlannerBlockItem
                            key={block.id}
                            block={block}
                            onPress={onBlockPress}
                            onDelete={onBlockDelete}
                            onUpdate={onBlockUpdate}
                        />
                    ))}
                </View>
            )}

            {/* Empty state */}
            {blocks.length === 0 && (
                <View style={styles.emptyPage}>
                    <Text style={styles.emptyEmoji}>📋</Text>
                    <Text style={styles.emptyTitle}>Empty page</Text>
                    <Text style={styles.emptySubtitle}>Tap '+' to add your first block for this day</Text>
                    <TouchableOpacity style={styles.addFirstBlock} onPress={onAddBlock}>
                        <Ionicons name="add" size={18} color="#4c669f" />
                        <Text style={styles.addFirstBlockText}>Add a block</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={{ height: 120 }} />
        </ScrollView>
    );
};

// ─── List View ────────────────────────────────────────────────────────────────

const ListView = ({ allBlocks, dates, onBlockPress, onBlockDelete }) => {
    if (allBlocks.length === 0) {
        return (
            <View style={styles.emptyPage}>
                <Text style={styles.emptyEmoji}>🗂️</Text>
                <Text style={styles.emptyTitle}>No blocks yet</Text>
                <Text style={styles.emptySubtitle}>Block items will appear here</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
            {dates.map(date => {
                const dateBlocks = allBlocks.filter(b => b.date === date);
                if (dateBlocks.length === 0) return null;
                return (
                    <View key={date} style={styles.section}>
                        <View style={styles.listDateHeader}>
                            <View style={styles.listDateDot} />
                            <Text style={styles.listDateText}>{formatShortDate(date)}</Text>
                        </View>
                        {dateBlocks.map(block => (
                            <PlannerBlockItem
                                key={block.id}
                                block={block}
                                onPress={onBlockPress}
                                onDelete={onBlockDelete}
                                showDate={false}
                            />
                        ))}
                    </View>
                );
            })}
            <View style={{ height: 120 }} />
        </ScrollView>
    );
};

// ─── Calendar Strip ───────────────────────────────────────────────────────────

const CalendarStrip = ({ selectedDate, onDateSelect, datesWithBlocks }) => {
    const today = new Date();
    const days = [];
    for (let i = -3; i <= 10; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push(d.toISOString().split('T')[0]);
    }

    const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const todayStr = today.toISOString().split('T')[0];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.calendarStrip}
            contentContainerStyle={styles.calendarContent}
        >
            {days.map((dateStr) => {
                const d = new Date(dateStr + 'T00:00:00');
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === todayStr;
                const hasBlocks = datesWithBlocks.includes(dateStr);

                return (
                    <TouchableOpacity
                        key={dateStr}
                        style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                        onPress={() => onDateSelect(dateStr)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                            {DAY_NAMES[d.getDay()]}
                        </Text>
                        <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected, isToday && !isSelected && styles.dayNumberToday]}>
                            {d.getDate()}
                        </Text>
                        {hasBlocks && (
                            <View style={[styles.dayDot, isSelected && styles.dayDotSelected]} />
                        )}
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DailyPageScreen({ route, navigation }) {
    const { date: initialDate } = route?.params || {};
    const [selectedDate, setSelectedDate] = useState(
        initialDate || new Date().toISOString().split('T')[0]
    );
    const [activeView, setActiveView] = useState('page'); // 'page' | 'timeline' | 'list'
    const [showAddSheet, setShowAddSheet] = useState(false);

    const {
        getBlocksForDate, getAllDatesWithBlocks, deleteBlock, updateBlock, blocks
    } = useContext(PlannerContext);

    const dayBlocks = useMemo(
        () => getBlocksForDate(selectedDate),
        [getBlocksForDate, selectedDate, blocks]
    );
    const allDates = useMemo(() => getAllDatesWithBlocks(), [getAllDatesWithBlocks, blocks]);

    const handleBlockPress = useCallback((block) => {
        navigation.navigate('AddEditBlock', { blockId: block.id });
    }, [navigation]);

    const handleBlockDelete = useCallback((id) => {
        deleteBlock(id);
    }, [deleteBlock]);

    const handleBlockUpdate = useCallback((id, data) => {
        updateBlock(id, data);
    }, [updateBlock]);

    const handleSelectBlockType = useCallback((type) => {
        navigation.navigate('AddEditBlock', {
            date: selectedDate,
            defaultBlockType: type,
        });
    }, [navigation, selectedDate]);

    const VIEWS = [
        { key: 'page', label: 'Page', icon: 'document-text-outline' },
        { key: 'timeline', label: 'Timeline', icon: 'time-outline' },
        { key: 'list', label: 'List', icon: 'list-outline' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={22} color="#EFEFEF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerDate}>{formatDateLabel(selectedDate)}</Text>
                    <Text style={styles.headerSub}>{formatShortDate(selectedDate)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.addHeaderBtn}
                    onPress={() => setShowAddSheet(true)}
                >
                    <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* ── Calendar Strip ── */}
            <CalendarStrip
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                datesWithBlocks={allDates}
            />

            {/* ── View Toggle ── */}
            <View style={styles.viewToggle}>
                {VIEWS.map(v => (
                    <TouchableOpacity
                        key={v.key}
                        style={[styles.viewTab, activeView === v.key && styles.viewTabActive]}
                        onPress={() => setActiveView(v.key)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={v.icon}
                            size={14}
                            color={activeView === v.key ? '#fff' : '#666'}
                        />
                        <Text style={[styles.viewTabText, activeView === v.key && styles.viewTabTextActive]}>
                            {v.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Content ── */}
            <View style={styles.content}>
                {activeView === 'page' && (
                    <DailyPageView
                        blocks={dayBlocks}
                        date={selectedDate}
                        onBlockPress={handleBlockPress}
                        onBlockDelete={handleBlockDelete}
                        onBlockUpdate={handleBlockUpdate}
                        onAddBlock={() => setShowAddSheet(true)}
                    />
                )}
                {activeView === 'timeline' && (
                    <TimelineView
                        blocks={dayBlocks}
                        date={selectedDate}
                        onBlockPress={handleBlockPress}
                        onBlockDelete={handleBlockDelete}
                        navigation={navigation}
                    />
                )}
                {activeView === 'list' && (
                    <ListView
                        allBlocks={blocks}
                        dates={allDates.length > 0 ? allDates : [selectedDate]}
                        onBlockPress={handleBlockPress}
                        onBlockDelete={handleBlockDelete}
                    />
                )}
            </View>

            {/* ── FAB ── */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowAddSheet(true)}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={['#5673cf', '#4c669f']}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="add" size={26} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>

            {/* ── Add Block Sheet ── */}
            <AddBlockSheet
                visible={showAddSheet}
                onClose={() => setShowAddSheet(false)}
                onSelectType={handleSelectBlockType}
            />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0E0E0E',
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        paddingHorizontal: 12,
    },
    headerDate: {
        color: '#EFEFEF',
        fontSize: 18,
        fontWeight: '700',
    },
    headerSub: {
        color: '#555',
        fontSize: 12,
        marginTop: 1,
    },
    addHeaderBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#4c669f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Calendar strip
    calendarStrip: {
        maxHeight: 80,
        borderBottomWidth: 1,
        borderBottomColor: '#1C1C1C',
    },
    calendarContent: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 6,
    },
    dayCell: {
        width: 48,
        height: 64,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        marginHorizontal: 3,
    },
    dayCellSelected: {
        backgroundColor: '#4c669f',
    },
    dayName: {
        color: '#555',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    dayNameSelected: {
        color: 'rgba(255,255,255,0.8)',
    },
    dayNumber: {
        color: '#EFEFEF',
        fontSize: 16,
        fontWeight: '600',
    },
    dayNumberToday: {
        color: '#6C8EEF',
    },
    dayNumberSelected: {
        color: '#fff',
    },
    dayDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#4c669f',
        marginTop: 4,
    },
    dayDotSelected: {
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    // View Toggle
    viewToggle: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
    },
    viewTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#1C1C1E',
        gap: 6,
    },
    viewTabActive: {
        backgroundColor: '#4c669f',
    },
    viewTabText: {
        color: '#666',
        fontSize: 12,
        fontWeight: '600',
    },
    viewTabTextActive: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    // Page View
    pageContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    focusCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
    },
    focusGradient: {
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2A2A4A',
    },
    focusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    focusLeft: {
        flex: 1,
    },
    focusLabel: {
        color: '#4c669f',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    focusValue: {
        color: '#EFEFEF',
        fontSize: 15,
        fontWeight: '600',
    },
    scoreCircle: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    scoreNumber: {
        color: '#6C8EEF',
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 38,
    },
    scorePercent: {
        color: '#4c669f',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#2a2a4a',
        borderRadius: 2,
        marginBottom: 8,
    },
    progressBarFill: {
        height: 4,
        backgroundColor: '#4c669f',
        borderRadius: 2,
    },
    progressLabel: {
        color: '#555',
        fontSize: 11,
    },
    section: {
        marginBottom: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    sectionLabel: {
        color: '#444',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
    },
    // Timeline
    timelineScroll: {
        flex: 1,
    },
    timelineContainer: {
        marginHorizontal: 16,
        position: 'relative',
        marginTop: 8,
    },
    hourRow: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: HOUR_HEIGHT,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    hourLabel: {
        color: '#444',
        fontSize: 10,
        width: 44,
        textAlign: 'right',
        paddingTop: 4,
        paddingRight: 8,
    },
    hourLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#1E1E1E',
        marginTop: 10,
    },
    nowLine: {
        position: 'absolute',
        left: 44,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    nowDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF453A',
        marginLeft: -4,
    },
    nowBar: {
        flex: 1,
        height: 1.5,
        backgroundColor: '#FF453A',
    },
    timelineBlock: {
        position: 'absolute',
        left: 56,
        right: 4,
        borderRadius: 10,
        overflow: 'hidden',
        flexDirection: 'row',
        borderWidth: 1,
    },
    timelineBlockAccent: {
        width: 4,
        height: '100%',
    },
    timelineBlockContent: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        justifyContent: 'center',
    },
    timelineBlockTitle: {
        color: '#EFEFEF',
        fontSize: 12,
        fontWeight: '600',
    },
    timelineBlockType: {
        color: '#666',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    freeBlocksSection: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    // List view
    listDateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    listDateDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4c669f',
    },
    listDateText: {
        color: '#888',
        fontSize: 13,
        fontWeight: '600',
    },
    // Empty
    emptyPage: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 40,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        color: '#EFEFEF',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: '#555',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    addFirstBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4c669f44',
        backgroundColor: '#4c669f11',
    },
    addFirstBlockText: {
        color: '#4c669f',
        fontSize: 14,
        fontWeight: '600',
    },
    // FAB
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        borderRadius: 28,
        elevation: 10,
        shadowColor: '#4c669f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
