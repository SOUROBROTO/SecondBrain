import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TaskContext } from '../context/TaskContext';

export default function AddEditTaskScreen({ navigation, route }) {
    const { addTask, updateTask, tasks } = useContext(TaskContext);
    const { taskId } = route.params || {};

    const isEditing = !!taskId;
    const existingTask = tasks.find(t => t.id === taskId);

    const [title, setTitle] = useState(existingTask?.title || '');
    const [note, setNote] = useState(existingTask?.note || '');
    const [priority, setPriority] = useState(existingTask?.priority || 'Medium');
    const [dueDate, setDueDate] = useState(existingTask?.dueDate ? new Date(existingTask.dueDate) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Recurrence & Tags (Mocked UI for now as requested, data model support ready)
    const [recurrence, setRecurrence] = useState(existingTask?.recurrence || 'None');
    const [tags, setTags] = useState(existingTask?.tags || []);
    const [newTag, setNewTag] = useState('');

    const [isImportant, setIsImportant] = useState(existingTask?.isImportant || false);

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Task title is required');
            return;
        }

        const taskData = {
            title,
            note,
            priority,
            dueDate: dueDate.toISOString(),
            recurrence,
            tags,
            isImportant,
        };

        if (isEditing) {
            updateTask(taskId, taskData);
        } else {
            addTask(taskData);
        }
        navigation.goBack();
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || dueDate;
        setShowDatePicker(false);
        setDueDate(currentDate);
    };

    const onTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate || dueDate;
        setShowTimePicker(false);
        setDueDate(currentDate);
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? 'Edit Task' : 'Add Task'}</Text>
                <TouchableOpacity onPress={handleSave} disabled={!title.trim()}>
                    <Text style={[styles.saveText, !title.trim() && styles.disabledSave]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Title */}
                <Text style={styles.label}>Title *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Task title"
                    placeholderTextColor="#666"
                    value={title}
                    onChangeText={setTitle}
                    autoFocus={!isEditing}
                    maxLength={100}
                />

                {/* Note */}
                <Text style={styles.label}>Notes</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add notes (optional)"
                    placeholderTextColor="#666"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={5}
                />

                {/* Priority */}
                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityContainer}>
                    {['Low', 'Medium', 'High'].map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.priorityButton,
                                priority === p && styles.prioritySelected,
                                priority === p && { backgroundColor: p === 'High' ? '#FF453A' : p === 'Medium' ? '#FF9F0A' : '#30D158' }
                            ]}
                            onPress={() => setPriority(p)}
                        >
                            <Text style={styles.priorityText}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Due Date */}
                <Text style={styles.label}>Due Date</Text>
                <View style={styles.row}>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateText}>{dueDate.toDateString()}</Text>
                        <Ionicons name="calendar-outline" size={20} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
                        <Text style={styles.dateText}>{dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        <Ionicons name="time-outline" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>
                {showDatePicker && (
                    <DateTimePicker
                        value={dueDate}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={dueDate}
                        mode="time"
                        display="default"
                        onChange={onTimeChange}
                    />
                )}

                {/* Recurrence */}
                <Text style={styles.label}>Repeat</Text>
                <View style={styles.customPicker}>
                    {['None', 'Daily', 'Weekly'].map(opt => (
                        <TouchableOpacity key={opt} onPress={() => setRecurrence(opt)} style={{ padding: 10, marginRight: 10 }}>
                            <Text style={{ color: recurrence === opt ? '#4c669f' : '#666', fontWeight: recurrence === opt ? 'bold' : 'normal' }}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tags */}
                <Text style={styles.label}>Tags</Text>
                <View style={styles.tagInputContainer}>
                    <TextInput
                        style={styles.tagInput}
                        placeholder="Add tag..."
                        placeholderTextColor="#666"
                        value={newTag}
                        onChangeText={setNewTag}
                        onSubmitEditing={addTag}
                    />
                    <TouchableOpacity onPress={addTag}>
                        <Ionicons name="add-circle" size={30} color="#4c669f" />
                    </TouchableOpacity>
                </View>
                <View style={styles.tagsContainer}>
                    {tags.map(tag => (
                        <View key={tag} style={styles.tagChip}>
                            <Text style={styles.tagText}>{tag}</Text>
                            <TouchableOpacity onPress={() => removeTag(tag)}>
                                <Ionicons name="close-circle" size={16} color="#fff" style={{ marginLeft: 5 }} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Additional Options */}
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Mark as Important</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#4c669f" }}
                        thumbColor={isImportant ? "#f4f3f4" : "#f4f3f4"}
                        onValueChange={setIsImportant}
                        value={isImportant}
                    />
                </View>

            </ScrollView>
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
    saveText: {
        color: '#4c669f',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledSave: {
        color: '#555',
    },
    content: {
        padding: 20,
        paddingBottom: 50,
    },
    label: {
        color: '#888',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 15,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    priorityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priorityButton: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        paddingVertical: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    prioritySelected: {
        borderColor: 'transparent',
    },
    priorityText: {
        color: '#fff',
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    dateText: {
        color: '#fff',
    },
    customPicker: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        padding: 5,
        borderRadius: 8,
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagInput: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        marginRight: 10,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4c669f',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        color: '#fff',
        fontSize: 12,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 8,
    },
    switchLabel: {
        color: '#fff',
        fontSize: 16,
    },
});
