import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Check, Pencil, Trash2, RotateCcw, Star, CalendarDays, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../utils/theme';

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    const { id, title, priority, dueDate, tags = [], completed, isImportant, recurrence } = task;

    const priorityColor = priority === 'High' ? C.high : priority === 'Medium' ? C.med : priority === 'Low' ? C.low : C.textMuted;
    const overdue = dueDate && new Date(dueDate) < new Date() && !completed;

    const renderLeft = (_, dragX) => {
        const trans = dragX.interpolate({ inputRange: [0, 80], outputRange: [-20, 0], extrapolate: 'clamp' });
        return (
            <TouchableOpacity style={s.leftAction} onPress={() => onToggle(id)}>
                <Animated.View style={{ transform: [{ translateX: trans }], alignItems: 'center', gap: 3 }}>
                    {completed
                        ? <RotateCcw size={18} color="#fff" strokeWidth={1.5} />
                        : <Check size={18} color="#fff" strokeWidth={2} />}
                    <Text style={s.actionLabel}>{completed ? 'Undo' : 'Done'}</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    const renderRight = (_, dragX) => {
        const trans = dragX.interpolate({ inputRange: [-80, 0], outputRange: [0, 20], extrapolate: 'clamp' });
        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={[s.rightAction, { backgroundColor: C.surface3 }]} onPress={() => onEdit(task)}>
                    <Animated.View style={{ transform: [{ translateX: trans }], alignItems: 'center', gap: 3 }}>
                        <Pencil size={16} color={C.textSub} strokeWidth={1.5} />
                        <Text style={s.actionLabel}>Edit</Text>
                    </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity style={[s.rightAction, { backgroundColor: C.dangerBg }]} onPress={() => onDelete(id)}>
                    <Animated.View style={{ transform: [{ translateX: trans }], alignItems: 'center', gap: 3 }}>
                        <Trash2 size={16} color={C.danger} strokeWidth={1.5} />
                        <Text style={[s.actionLabel, { color: C.danger }]}>Delete</Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Swipeable renderLeftActions={renderLeft} renderRightActions={renderRight} overshootLeft={false} overshootRight={false}>
            <View style={[s.row, completed && s.rowDone]}>
                {/* Priority bar */}
                <View style={[s.bar, { backgroundColor: priorityColor }]} />

                {/* Checkbox */}
                <TouchableOpacity onPress={() => onToggle(id)} style={s.checkWrap}>
                    <View style={[s.check, completed && s.checkDone]}>
                        {completed && <Check size={10} color={C.black} strokeWidth={2.5} />}
                    </View>
                </TouchableOpacity>

                {/* Content */}
                <TouchableOpacity style={s.content} onPress={() => onEdit(task)} activeOpacity={0.7}>
                    <Text style={[s.title, completed && s.titleDone]} numberOfLines={1}>{title}</Text>
                    <View style={s.meta}>
                        {dueDate && (
                            <View style={s.metaItem}>
                                <CalendarDays size={10} color={overdue ? C.danger : C.textMuted} strokeWidth={1.5} />
                                <Text style={[s.metaText, overdue && { color: C.danger }]}>
                                    {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Text>
                            </View>
                        )}
                        {recurrence && recurrence !== 'None' && (
                            <RefreshCw size={10} color={C.textMuted} strokeWidth={1.5} />
                        )}
                        {tags.map((tag, i) => (
                            <View key={i} style={s.tag}>
                                <Text style={s.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </TouchableOpacity>

                {/* Star */}
                {isImportant && <Star size={13} color={C.warn} fill={C.warn} strokeWidth={0} style={{ marginRight: S.sm }} />}
            </View>
        </Swipeable>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        borderRadius: R.md,
        marginBottom: S.sm,
        overflow: 'hidden',
        minHeight: 62,
        borderWidth: 1,
        borderColor: C.border,
    },
    rowDone: { opacity: 0.5 },
    bar: { width: 3, height: '100%' },
    checkWrap: { paddingHorizontal: S.md, alignSelf: 'stretch', justifyContent: 'center' },
    check: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: C.borderStrong,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkDone: { backgroundColor: C.text, borderColor: C.text },
    content: { flex: 1, paddingVertical: S.md, paddingRight: S.sm },
    title: { ...T.h5, fontSize: 14, marginBottom: 4 },
    titleDone: { textDecorationLine: 'line-through', color: C.textMuted },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    metaText: { ...T.label, color: C.textMuted, fontSize: 10 },
    tag: {
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderWidth: 1,
        borderColor: C.border,
    },
    tagText: { ...T.cap, fontSize: 9, color: C.textMuted, textTransform: 'none' },
    // Swipe
    leftAction: {
        backgroundColor: C.surface2,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: S.sm,
        borderRadius: R.md,
        paddingHorizontal: S.lg,
    },
    rightAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 66,
        marginBottom: S.sm,
        borderRadius: 0,
    },
    actionLabel: { ...T.cap, fontSize: 9, color: C.textSub, letterSpacing: 0.5, marginTop: 2 },
});
