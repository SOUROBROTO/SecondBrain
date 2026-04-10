import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { HabitContext } from '../context/HabitContext';

// Common Emojis
const EMOJIS = ['💧', '🏃‍♂️', '🧘‍♀️', '📖', '💻', '🍎', '💤', '🧹', '🎸', '🎨', '💊', '💰'];

export default function AddEditHabitScreen({ navigation, route }) {
    const { addHabit, updateHabit, habits } = useContext(HabitContext);
    const { habitId } = route.params || {};

    const isEditing = !!habitId;
    const existingHabit = habits.find(h => h.id === habitId);

    const [name, setName] = useState(existingHabit?.title || '');
    const [goalValue, setGoalValue] = useState(existingHabit?.goal?.value?.toString() || '1');
    const [goalUnit, setGoalUnit] = useState(existingHabit?.goal?.unit || 'times');
    const [incrementAmount, setIncrementAmount] = useState(existingHabit?.incrementAmount?.toString() || '');
    const [emoji, setEmoji] = useState(existingHabit?.emoji || EMOJIS[0]);
    const [frequency, setFrequency] = useState(existingHabit?.frequency || 'daily');
    const [customDays, setCustomDays] = useState(existingHabit?.customDays || []);

    // Reminder state
    const [reminderEnabled, setReminderEnabled] = useState(!!existingHabit?.reminderTime);
    const [reminderTime, setReminderTime] = useState(existingHabit?.reminderTime ? new Date(existingHabit.reminderTime) : new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Habit name is required');
            return;
        }
        if (!goalValue.trim() || isNaN(goalValue)) {
            Alert.alert('Validation Error', 'Please enter a valid goal number');
            return;
        }

        const habitData = {
            title: name.trim(),
            goal: {
                value: parseInt(goalValue),
                unit: goalUnit
            },
            incrementAmount: incrementAmount ? parseInt(incrementAmount) : (goalUnit === 'times' ? 1 : goalUnit === 'mins' ? 5 : 1),
            emoji,
            frequency,
            customDays: frequency === 'weekly' ? customDays : [], // Store days only if weekly
            reminderTime: reminderEnabled ? reminderTime.toISOString() : null,
            updatedAt: new Date().toISOString()
        };

        if (isEditing) {
            updateHabit(habitId, habitData);
        } else {
            addHabit({ ...habitData, createdAt: new Date().toISOString() });
        }
        navigation.goBack();
    };

    const toggleCustomDay = (day) => {
        if (customDays.includes(day)) {
            setCustomDays(customDays.filter(d => d !== day));
        } else {
            setCustomDays([...customDays, day]);
        }
    };

    const onTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate || reminderTime;
        setShowTimePicker(false);
        setReminderTime(currentDate);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? 'Edit Habit' : 'Add Habit'}</Text>
                <TouchableOpacity onPress={handleSave} disabled={!name.trim()}>
                    <Text style={[styles.saveText, !name.trim() && styles.disabledSave]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* 2. Habit Name */}
                <Text style={styles.label}>Habit Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Read, Exercise"
                    placeholderTextColor="#666"
                    value={name}
                    onChangeText={setName}
                    autoFocus={!isEditing}
                    maxLength={60}
                />

                {/* 3. Goal Definition */}
                <Text style={styles.label}>Goal *</Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 10 }]}
                        placeholder="1"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={goalValue}
                        onChangeText={setGoalValue}
                    />
                    <View style={styles.unitSelector}>
                        {['times', 'mins', 'pages'].map(u => (
                            <TouchableOpacity
                                key={u}
                                style={[styles.unitButton, goalUnit === u && styles.unitSelected]}
                                onPress={() => setGoalUnit(u)}
                            >
                                <Text style={[styles.unitText, goalUnit === u && { color: '#fff' }]}>{u}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Increment Amount */}
                <Text style={styles.label}>Increment Amount per Click</Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder={goalUnit === 'times' ? '1' : goalUnit === 'mins' ? '5' : '1'}
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={incrementAmount}
                        onChangeText={setIncrementAmount}
                    />
                    <Text style={styles.incrementHint}>
                        {goalUnit === 'times' ? 'per completion' : `${goalUnit} per tap`}
                    </Text>
                </View>

                {/* 4. Icon / Emoji Picker */}
                <Text style={styles.label}>Icon</Text>
                <View style={styles.row}>
                    <TouchableOpacity style={styles.emojiPreview} onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <Text style={{ fontSize: 32 }}>{emoji}</Text>
                    </TouchableOpacity>
                    {showEmojiPicker && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiList}>
                            {EMOJIS.map(e => (
                                <TouchableOpacity key={e} onPress={() => { setEmoji(e); setShowEmojiPicker(false); }} style={{ padding: 10 }}>
                                    <Text style={{ fontSize: 28 }}>{e}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* 5. Frequency Selector */}
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.segmentContainer}>
                    {['daily', 'weekly'].map(freq => (
                        <TouchableOpacity
                            key={freq}
                            style={[styles.segmentButton, frequency === freq && styles.segmentSelected]}
                            onPress={() => setFrequency(freq)}
                        >
                            <Text style={[styles.segmentText, frequency === freq && { color: '#fff' }]}>
                                {freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Weekly Day Selector */}
                {frequency === 'weekly' && (
                    <View style={styles.daysContainer}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <TouchableOpacity
                                key={day}
                                style={[styles.dayButton, customDays.includes(day) && styles.daySelected]}
                                onPress={() => toggleCustomDay(day)}
                            >
                                <Text style={[styles.dayText, customDays.includes(day) && { color: '#fff' }]}>{day[0]}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* 6. Reminder */}
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Enable Reminder</Text>
                    <Switch
                        trackColor={{ false: "#77737aff", true: "#4c669f" }}
                        thumbColor={reminderEnabled ? "#f4f3f4" : "#f4f3f4"}
                        onValueChange={setReminderEnabled}
                        value={reminderEnabled}
                    />
                </View>
                {reminderEnabled && (
                    <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
                        <Text style={styles.timeText}>
                            Remind me at {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Ionicons name="time-outline" size={20} color="#ccc" />
                    </TouchableOpacity>
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={reminderTime}
                        mode="time"
                        display="default"
                        onChange={onTimeChange}
                    />
                )}

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
        borderBottomColor: '#525255ff',
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
        marginTop: 20,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unitSelector: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 4,
    },
    unitButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    unitSelected: {
        backgroundColor: '#4c669f',
    },
    unitText: {
        color: '#888',
        fontWeight: '600',
    },
    emojiPreview: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    emojiList: {
        flexGrow: 0,
    },
    segmentContainer: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 4,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    segmentSelected: {
        backgroundColor: '#4c669f',
    },
    segmentText: {
        color: '#888',
        fontWeight: '600',
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    daySelected: {
        backgroundColor: '#4c669f',
        borderColor: '#4c669f',
    },
    dayText: {
        color: '#888',
        fontWeight: 'bold',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 25,
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 8,
    },
    switchLabel: {
        color: '#fff',
        fontSize: 16,
    },
    timeButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    timeText: {
        color: '#fff',
        fontSize: 16,
    },
    incrementHint: {
        color: '#888',
        fontSize: 14,
        marginLeft: 12,
        alignSelf: 'center',
    },
});
