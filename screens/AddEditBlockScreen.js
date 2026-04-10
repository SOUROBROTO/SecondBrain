import React, { useState, useContext, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PlannerContext } from '../context/PlannerContext';
import { TaskContext } from '../context/TaskContext';
import { HabitContext } from '../context/HabitContext';
import { SkillContext } from '../context/SkillContext';

export default function AddEditBlockScreen({ navigation, route }) {
    const { addBlock, updateBlock, blocks, deleteBlock } = useContext(PlannerContext);
    const { tasks } = useContext(TaskContext);
    const { skills } = useContext(SkillContext);
    const { habits } = useContext(HabitContext);

    const { blockId, date } = route.params || {};
    const isEditing = !!blockId;
    const existingBlock = useMemo(() => blocks.find(b => b.id === blockId), [blocks, blockId]);

    // Form State
    const [title, setTitle] = useState(existingBlock?.title || '');

    // Time Setup
    // Default to passed date or today, default start next hour, end +1 hour
    const defaultStart = new Date();
    if (date) {
        const [y, m, d] = date.split('-').map(Number);
        defaultStart.setFullYear(y, m - 1, d);
    }
    defaultStart.setMinutes(0, 0, 0);
    if (!existingBlock && !date) {
        defaultStart.setHours(defaultStart.getHours() + 1);
    }

    const [startTime, setStartTime] = useState(existingBlock?.startTime ? new Date(existingBlock.startTime) : defaultStart);
    const [endTime, setEndTime] = useState(existingBlock?.endTime ? new Date(existingBlock.endTime) : new Date(defaultStart.getTime() + 60 * 60 * 1000));

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Category
    const CATEGORIES = ['Study', 'Work', 'Skill', 'Health', 'Break', 'Personal'];
    const [category, setCategory] = useState(existingBlock?.category || 'Study');

    // Color
    const COLORS = ['#FF453A', '#FF9F0A', '#30D158', '#4c669f', '#BF5AF2', '#64D2FF', '#FFD60A', '#8E8E93'];
    const [color, setColor] = useState(existingBlock?.color || '#4c669f');

    // Linking
    const [linkType, setLinkType] = useState(existingBlock?.linkedTaskId ? 'Task' : existingBlock?.linkedSkillId ? 'Skill' : existingBlock?.linkedHabitId ? 'Habit' : 'None');
    const [linkedId, setLinkedId] = useState(existingBlock?.linkedTaskId || existingBlock?.linkedSkillId || existingBlock?.linkedHabitId || null);
    const [showLinkModal, setShowLinkModal] = useState(false);

    // Repeat & Reminder
    const [repeat, setRepeat] = useState(existingBlock?.repeat?.type || existingBlock?.repeat || 'None');
    const [weekDays, setWeekDays] = useState(existingBlock?.repeat?.days || []);
    const [reminderEnabled, setReminderEnabled] = useState(!!existingBlock?.reminderMinutes);
    const [reminderMinutes, setReminderMinutes] = useState(existingBlock?.reminderMinutes || 10);

    // Notes
    const [notes, setNotes] = useState(existingBlock?.notes || '');

    // Conflict Detection
    const [hasConflict, setHasConflict] = useState(false);
    const [conflictingBlock, setConflictingBlock] = useState(null);


    // Helpers
    const formatTime = (dateObj) => {
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getDurationString = () => {
        const diff = (endTime - startTime) / 1000 / 60; // minutes
        if (diff < 0) return 'Invalid duration';
        const h = Math.floor(diff / 60);
        const m = Math.round(diff % 60);
        return `${h}h ${m}m`;
    };

    const toggleWeekDay = (day) => {
        if (weekDays.includes(day)) {
            setWeekDays(weekDays.filter(d => d !== day));
        } else {
            setWeekDays([...weekDays, day]);
        }
    };

    const clearLink = () => {
        setLinkedId(null);
        setLinkType('None');
    };

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a block title.');
            return;
        }
        if (endTime <= startTime) {
            Alert.alert('Invalid Time', 'End time must be after start time.');
            return;
        }

        saveBlock();
    };

    const saveBlock = () => {
        // Infer type from linked item
        const blockType = linkType === 'Task' ? 'task' :
            linkType === 'Habit' ? 'habit' :
                linkType === 'Skill' ? 'skill' : 'task';

        // Get date from startTime
        const blockDate = new Date(startTime).toISOString().split('T')[0];

        const blockData = {
            title,
            type: blockType,
            date: blockDate,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            category,
            color,
            category,
            color,
            linkedTaskId: linkType === 'Task' ? linkedId : null,
            linkedSkillId: linkType === 'Skill' ? linkedId : null,
            linkedHabitId: linkType === 'Habit' ? linkedId : null,
            repeat: repeat === 'Weekly' ? { type: 'Weekly', days: weekDays } : repeat,
            reminderMinutes: reminderEnabled ? reminderMinutes : null,
            notes,
            updatedAt: new Date().toISOString(),
        };

        if (isEditing) {
            updateBlock(blockId, blockData);
        } else {
            addBlock({
                ...blockData,
                createdAt: new Date().toISOString(),
            });
        }
        navigation.goBack();
    };

    const handleDelete = () => {
        Alert.alert('Delete Block', 'Are you sure you want to delete this block?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: () => {
                    deleteBlock(blockId);
                    navigation.goBack();
                }
            }
        ]);
    };

    const renderLinkSelection = () => {
        const data = linkType === 'Task' ? tasks : linkType === 'Skill' ? skills : habits;
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={showLinkModal}
                onRequestClose={() => setShowLinkModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {linkType}</Text>
                            <TouchableOpacity onPress={() => setShowLinkModal(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={data}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setLinkedId(item.id);
                                        setTitle(item.title || item.name); // Auto-fill title
                                        setShowLinkModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item.title || item.name}</Text>
                                    {linkedId === item.id && <Ionicons name="checkmark" size={20} color="#4c669f" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? 'Edit Block' : 'Add Block'}</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!title.trim() || endTime <= startTime}
                >
                    <Text style={[
                        styles.saveText,
                        (!title.trim() || endTime <= startTime) && styles.disabledText
                    ]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Title Input */}
                <TextInput
                    style={styles.titleInput}
                    placeholder="Block Title"
                    placeholderTextColor="#666"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={50}
                />

                {/* Time Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Time</Text>
                    <View style={styles.row}>
                        <View style={styles.timeRow}>
                            <TouchableOpacity style={styles.timeButton} onPress={() => setShowStartPicker(true)}>
                                <Text style={styles.label}>Starts</Text>
                                <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                            </TouchableOpacity>
                            <Ionicons name="arrow-forward" size={16} color="#666" style={{ marginHorizontal: 10 }} />
                            <TouchableOpacity style={styles.timeButton} onPress={() => setShowEndPicker(true)}>
                                <Text style={styles.label}>Ends</Text>
                                <Text style={styles.timeText}>{formatTime(endTime)}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.durationText}>{getDurationString()}</Text>
                    </View>
                    {showStartPicker && (
                        <DateTimePicker
                            value={startTime}
                            mode="time"
                            display="spinner"
                            onChange={(e, d) => {
                                setShowStartPicker(false);
                                if (d) {
                                    setStartTime(d);
                                    // Auto-adjust end time if start is after end
                                    if (d >= endTime) {
                                        setEndTime(new Date(d.getTime() + 60 * 60 * 1000));
                                    }
                                }
                            }}
                        />
                    )}
                    {showEndPicker && (
                        <DateTimePicker
                            value={endTime}
                            mode="time"
                            display="spinner"
                            onChange={(e, d) => {
                                setShowEndPicker(false);
                                if (d) setEndTime(d);
                            }}
                        />
                    )}
                </View>

                {/* Category */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.chip, category === cat && styles.chipSelected]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[styles.chipText, category === cat && styles.chipTextSelected]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Color */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Color</Text>
                    <View style={styles.colorContainer}>
                        {COLORS.map(c => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.colorSelected]}
                                onPress={() => setColor(c)}
                            />
                        ))}
                    </View>
                </View>

                {/* Link */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Link to...</Text>
                    <View style={styles.segmentControl}>
                        {['None', 'Task', 'Habit', 'Skill'].map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.segment, linkType === type && styles.segmentSelected]}
                                onPress={() => {
                                    setLinkType(type);
                                    if (type === 'None') setLinkedId(null);
                                    else setShowLinkModal(true);
                                }}
                            >
                                <Text style={[styles.segmentText, linkType === type && styles.segmentTextSelected]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {linkedId && linkType !== 'None' && (
                        <View style={styles.linkedItemPreview}>
                            <Text style={styles.linkedLabel}>Linked: </Text>
                            <Text style={styles.linkedValue}>
                                {linkType === 'Task' ? tasks.find(t => t.id === linkedId)?.title :
                                    linkType === 'Skill' ? skills.find(s => s.id === linkedId)?.name :
                                        habits.find(h => h.id === linkedId)?.title}
                            </Text>
                            <TouchableOpacity onPress={() => setShowLinkModal(true)} style={{ marginRight: 15 }}>
                                <Text style={styles.changeLinkText}>Change</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={clearLink}>
                                <Ionicons name="close-circle" size={24} color="#FF453A" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Repeat */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Repeat</Text>
                    <View style={styles.segmentControl}>
                        {['None', 'Daily', 'Weekly'].map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.segment, repeat === opt && styles.segmentSelected]}
                                onPress={() => setRepeat(opt)}
                            >
                                <Text style={[styles.segmentText, repeat === opt && styles.segmentTextSelected]}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {repeat === 'Weekly' && (
                        <View style={styles.weekDayContainer}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <TouchableOpacity
                                    key={day}
                                    style={[styles.weekDayButton, weekDays.includes(day) && styles.weekDaySelected]}
                                    onPress={() => toggleWeekDay(day)}
                                >
                                    <Text style={[styles.weekDayText, weekDays.includes(day) && styles.weekDayTextSelected]}>{day.charAt(0)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Reminder */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.sectionTitle}>Reminder</Text>
                        <Switch
                            value={reminderEnabled}
                            onValueChange={setReminderEnabled}
                            trackColor={{ false: '#3e3e3e', true: '#4c669f' }}
                        />
                    </View>
                    {reminderEnabled && (
                        <View style={styles.chipContainer}>
                            {[5, 10, 30].map(min => (
                                <TouchableOpacity
                                    key={min}
                                    style={[styles.smallChip, reminderMinutes === min && styles.smallChipSelected]}
                                    onPress={() => setReminderMinutes(min)}
                                >
                                    <Text style={[styles.smallChipText, reminderMinutes === min && styles.smallChipTextSelected]}>{min} min before</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="Add notes (optional)"
                        placeholderTextColor="#666"
                        multiline
                        numberOfLines={3}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                {isEditing && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.deleteButtonText}>Delete Block</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {renderLinkSelection()}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelText: {
        color: '#FF453A',
        fontSize: 16,
    },
    saveText: {
        color: '#4c669f',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledText: {
        color: '#555',
    },
    content: {
        padding: 20,
        paddingBottom: 50,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 30,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#888',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeButton: {
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
    },
    label: {
        color: '#666',
        fontSize: 10,
    },
    timeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    durationText: {
        color: '#666',
        fontSize: 12,
    },
    errorContainer: {
        borderWidth: 2,
        borderColor: '#FF453A',
        borderRadius: 8,
        padding: 8,
    },
    errorMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF453A',
    },
    errorText: {
        color: '#FF453A',
        fontSize: 12,
        marginLeft: 8,
        flex: 1,
    },
    chipContainer: {
        flexDirection: 'row',
        marginTop: 5,
    },
    chip: {
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    chipSelected: {
        backgroundColor: '#4c669f',
        borderColor: '#4c669f',
    },
    chipText: {
        color: '#ccc',
    },
    chipTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    colorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Using space-between to spread evenly
        flexWrap: 'wrap',
    },
    colorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        margin: 5, // margin for spacing if wrapping occurs
    },
    colorSelected: {
        borderWidth: 3,
        borderColor: '#fff',
    },
    segmentControl: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 4,
    },
    segment: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    segmentSelected: {
        backgroundColor: '#3a3a3c',
    },
    segmentText: {
        color: '#888',
        fontWeight: '500',
    },
    segmentTextSelected: {
        color: '#fff',
    },
    linkedItemPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        backgroundColor: '#1E1E1E',
        padding: 10,
        borderRadius: 8,
    },
    linkedLabel: {
        color: '#888',
        marginRight: 5,
    },
    linkedValue: {
        color: '#fff',
        fontWeight: '600',
        flex: 1,
    },
    changeLinkText: {
        color: '#4c669f',
        fontWeight: 'bold',
    },
    smallChip: {
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        marginRight: 8,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    smallChipSelected: {
        backgroundColor: '#4c669f',
        borderColor: '#4c669f',
    },
    smallChipText: {
        color: '#888',
        fontSize: 12,
    },
    smallChipTextSelected: {
        color: '#fff',
    },
    notesInput: {
        backgroundColor: '#1E1E1E',
        color: '#fff',
        borderRadius: 8,
        padding: 15,
        height: 80,
        textAlignVertical: 'top',
    },
    deleteButton: {
        marginTop: 30,
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#2C2C2E',
        borderRadius: 10,
    },
    deleteButtonText: {
        color: '#FF453A',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '60%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalItemText: {
        color: '#fff',
        fontSize: 16,
    },
    weekDayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    weekDayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    weekDaySelected: {
        backgroundColor: '#4c669f',
        borderColor: '#4c669f',
    },
    weekDayText: {
        color: '#888',
        fontSize: 12,
    },
    weekDayTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
