import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    Animated, PanResponder, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Constants ────────────────────────────────────────────────────────────────

export const BLOCK_META = {
    task: {
        icon: 'checkmark-circle-outline',
        label: 'Task',
        accent: '#6C8EEF',
        bg: 'rgba(76, 102, 159, 0.12)',
        border: 'rgba(76, 102, 159, 0.3)',
    },
    habit: {
        icon: 'repeat',
        label: 'Habit',
        accent: '#30D158',
        bg: 'rgba(48, 209, 88, 0.1)',
        border: 'rgba(48, 209, 88, 0.25)',
    },
    skill: {
        icon: 'trophy-outline',
        label: 'Skill',
        accent: '#BF5AF2',
        bg: 'rgba(191, 90, 242, 0.1)',
        border: 'rgba(191, 90, 242, 0.25)',
    },
    text: {
        icon: 'document-text-outline',
        label: 'Note',
        accent: '#8E8E93',
        bg: 'rgba(99, 99, 102, 0.08)',
        border: 'rgba(99, 99, 102, 0.2)',
    },
    checklist: {
        icon: 'list-outline',
        label: 'Checklist',
        accent: '#FF9F0A',
        bg: 'rgba(255, 159, 10, 0.1)',
        border: 'rgba(255, 159, 10, 0.25)',
    },
    divider: {
        icon: 'remove-outline',
        label: 'Divider',
        accent: '#48484a',
        bg: 'transparent',
        border: 'transparent',
    },
    toggle: {
        icon: 'chevron-forward-outline',
        label: 'Toggle',
        accent: '#64D2FF',
        bg: 'rgba(100, 210, 255, 0.08)',
        border: 'rgba(100, 210, 255, 0.2)',
    },
};

// ─── Color Resolver ───────────────────────────────────────────────────────────
// If block.color is set, override the type-based accent with the custom color.
// All derived colors (bg, border) are computed from block.color.

export const resolveColors = (block) => {
    const blockType = block.blockType || block.type || 'task';
    const base = BLOCK_META[blockType] || BLOCK_META.task;
    const custom = block.color;
    if (!custom) return base;

    return {
        ...base,
        accent: custom,
        bg: `${custom}1A`,
        border: `${custom}44`,
    };
};

// ─── Divider Block ────────────────────────────────────────────────────────────

const DividerBlock = () => (
    <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
    </View>
);

// ─── Text Block ───────────────────────────────────────────────────────────────

const TextBlock = ({ block, onUpdate }) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(block.content?.text || block.notes || '');

    const handleBlur = () => {
        setEditing(false);
        onUpdate && onUpdate(block.id, { content: { ...block.content, text: value }, notes: value });
    };

    const meta = resolveColors(block);

    return (
        <TouchableOpacity
            style={[styles.blockContainer, { backgroundColor: meta.bg, borderColor: meta.border }]}
            onPress={() => setEditing(true)}
            activeOpacity={0.85}
        >
            <View style={styles.blockLeft}>
                <View style={[styles.blockTypeBar, { backgroundColor: meta.accent }]} />
            </View>
            <View style={styles.blockContent}>
                {editing ? (
                    <TextInput
                        style={styles.textInput}
                        value={value}
                        onChangeText={setValue}
                        onBlur={handleBlur}
                        multiline
                        autoFocus
                        placeholder="Write something..."
                        placeholderTextColor="#555"
                    />
                ) : (
                    <Text style={[styles.blockBodyText, !value && styles.placeholder]}>
                        {value || 'Tap to write...'}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

// ─── Checklist Block ─────────────────────────────────────────────────────────

const ChecklistBlock = ({ block, onUpdate }) => {
    const items = block.content?.items || [];
    const meta = resolveColors(block);

    const toggle = (index) => {
        const newItems = items.map((item, i) =>
            i === index ? { ...item, done: !item.done } : item
        );
        onUpdate && onUpdate(block.id, { content: { ...block.content, items: newItems } });
    };

    return (
        <View style={[styles.blockContainer, { backgroundColor: meta.bg, borderColor: meta.border }]}>
            <View style={styles.blockLeft}>
                <View style={[styles.blockTypeBar, { backgroundColor: meta.accent }]} />
            </View>
            <View style={styles.blockContent}>
                <View style={styles.blockHeader}>
                    <View style={[styles.typeIconBadge, { backgroundColor: meta.bg }]}>
                        <Ionicons name={meta.icon} size={12} color={meta.accent} />
                    </View>
                    <Text style={[styles.blockTitle, { color: '#fff' }]}>{block.title || 'Checklist'}</Text>
                </View>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.checkItem}
                        onPress={() => toggle(index)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, item.done && { backgroundColor: meta.accent, borderColor: meta.accent }]}>
                            {item.done && <Ionicons name="checkmark" size={10} color="#fff" />}
                        </View>
                        <Text style={[styles.checkItemText, item.done && styles.checkItemDone]}>
                            {item.text}
                        </Text>
                    </TouchableOpacity>
                ))}
                {items.length === 0 && (
                    <Text style={styles.emptySubtext}>No items yet</Text>
                )}
            </View>
        </View>
    );
};

// ─── Toggle Block ─────────────────────────────────────────────────────────────

const ToggleBlock = ({ block }) => {
    const [open, setOpen] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const meta = resolveColors(block);

    const handleToggle = () => {
        setOpen(!open);
        Animated.spring(rotateAnim, {
            toValue: open ? 0 : 1,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
        }).start();
    };

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    return (
        <View style={[styles.blockContainer, { backgroundColor: meta.bg, borderColor: meta.border }]}>
            <View style={styles.blockLeft}>
                <View style={[styles.blockTypeBar, { backgroundColor: meta.accent }]} />
            </View>
            <View style={styles.blockContent}>
                <TouchableOpacity style={styles.toggleHeader} onPress={handleToggle} activeOpacity={0.85}>
                    <Animated.View style={{ transform: [{ rotate }] }}>
                        <Ionicons name="chevron-forward" size={16} color={meta.accent} />
                    </Animated.View>
                    <Text style={[styles.blockTitle, { marginLeft: 8 }]}>{block.title || 'Toggle'}</Text>
                </TouchableOpacity>
                {open && (
                    <View style={styles.toggleBody}>
                        <Text style={styles.blockBodyText}>{block.content?.body || block.notes || 'No content'}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

// ─── Main Block Item ──────────────────────────────────────────────────────────

export default function PlannerBlockItem({ block, onPress, onDelete, onUpdate, showDate }) {
    const blockType = block.blockType || block.type || 'task';
    // Use custom block.color if set, else fall back to type defaults
    const meta = resolveColors(block);

    const formatTime = (iso) => {
        if (!iso) return '';
        try {
            if (iso.includes('T')) return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return iso;
        } catch { return iso; }
    };

    // Special renders
    if (blockType === 'divider') return <DividerBlock />;
    if (blockType === 'text') return <TextBlock block={block} onUpdate={onUpdate} />;
    if (blockType === 'checklist') return <ChecklistBlock block={block} onUpdate={onUpdate} />;
    if (blockType === 'toggle') return <ToggleBlock block={block} />;

    const hasTime = block.startTime && block.endTime;

    return (
        <TouchableOpacity
            style={[styles.blockContainer, { backgroundColor: meta.bg, borderColor: meta.border }]}
            onPress={() => onPress && onPress(block)}
            onLongPress={() => {
                Alert.alert(
                    block.title || 'Block',
                    'What would you like to do?',
                    [
                        { text: 'Edit', onPress: () => onPress && onPress(block) },
                        { text: 'Delete', style: 'destructive', onPress: () => onDelete && onDelete(block.id) },
                        { text: 'Cancel', style: 'cancel' },
                    ]
                );
            }}
            activeOpacity={0.85}
        >
            <View style={styles.blockLeft}>
                <View style={[styles.blockTypeBar, { backgroundColor: meta.accent }]} />
            </View>
            <View style={styles.blockContent}>
                <View style={styles.blockHeader}>
                    <View style={[styles.typeIconBadge, { backgroundColor: `${meta.accent}22` }]}>
                        <Ionicons name={meta.icon} size={12} color={meta.accent} />
                        <Text style={[styles.typeBadgeText, { color: meta.accent }]}>{meta.label}</Text>
                    </View>
                    {hasTime && (
                        <View style={styles.timeBadge}>
                            <Ionicons name="time-outline" size={10} color="#888" />
                            <Text style={styles.timeBadgeText}>
                                {formatTime(block.startTime)}–{formatTime(block.endTime)}
                            </Text>
                        </View>
                    )}
                    {showDate && block.date && (
                        <Text style={styles.dateBadge}>{block.date}</Text>
                    )}
                </View>
                <Text style={styles.blockTitle} numberOfLines={2}>{block.title || 'Untitled'}</Text>
                {block.notes ? (
                    <Text style={styles.blockSubText} numberOfLines={1}>{block.notes}</Text>
                ) : null}
                {block.category && (
                    <Text style={styles.categoryTag}>{block.category}</Text>
                )}
            </View>
            <View style={styles.blockRight}>
                <Ionicons name="chevron-forward" size={14} color="#444" />
            </View>
        </TouchableOpacity>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    blockContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        overflow: 'hidden',
        minHeight: 60,
    },
    blockLeft: {
        width: 4,
        minHeight: '100%',
    },
    blockTypeBar: {
        flex: 1,
        width: 4,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    blockContent: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'center',
    },
    blockHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        flexWrap: 'wrap',
        gap: 6,
    },
    typeIconBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 20,
        gap: 4,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    timeBadgeText: {
        color: '#888',
        fontSize: 10,
    },
    dateBadge: {
        color: '#555',
        fontSize: 10,
    },
    blockTitle: {
        color: '#EFEFEF',
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    blockSubText: {
        color: '#666',
        fontSize: 12,
        marginTop: 3,
    },
    categoryTag: {
        color: '#555',
        fontSize: 10,
        marginTop: 4,
        fontWeight: '500',
    },
    blockRight: {
        justifyContent: 'center',
        paddingRight: 10,
    },
    // Divider
    dividerContainer: {
        paddingVertical: 8,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    dividerLine: {
        height: 1,
        backgroundColor: '#2C2C2E',
    },
    // Text
    textInput: {
        color: '#EFEFEF',
        fontSize: 14,
        lineHeight: 22,
        minHeight: 40,
    },
    blockBodyText: {
        color: '#EFEFEF',
        fontSize: 14,
        lineHeight: 22,
    },
    placeholder: {
        color: '#555',
        fontStyle: 'italic',
    },
    // Checklist
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        gap: 10,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkItemText: {
        color: '#ddd',
        fontSize: 14,
        flex: 1,
    },
    checkItemDone: {
        textDecorationLine: 'line-through',
        color: '#555',
    },
    emptySubtext: {
        color: '#555',
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 5,
    },
    // Toggle
    toggleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleBody: {
        marginTop: 10,
        paddingLeft: 24,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#2C2C2E',
    },
});
