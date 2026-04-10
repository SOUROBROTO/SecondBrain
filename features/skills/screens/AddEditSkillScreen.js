import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Modal, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SkillContext } from '../context/SkillContext';

export default function AddEditSkillScreen({ navigation, route }) {
    const { addSkill, updateSkill, skills } = useContext(SkillContext);
    const { skillId } = route.params || {};

    const isEditing = !!skillId;
    const existingSkill = skills.find(s => s.id === skillId);

    // Form State
    const [name, setName] = useState(existingSkill?.name || '');
    const [category, setCategory] = useState(existingSkill?.category || '');
    const [targetLevel, setTargetLevel] = useState(existingSkill?.targetLevel || 'Intermediate');
    const [currentLevel, setCurrentLevel] = useState(existingSkill?.currentLevel || 'Beginner');
    const [icon, setIcon] = useState(existingSkill?.icon || '💻');
    const [color, setColor] = useState(existingSkill?.color || '#4c669f');
    const [description, setDescription] = useState(existingSkill?.description || '');
    const [customCategory, setCustomCategory] = useState('');
    const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);

    // New Enhanced Fields
    const [purpose, setPurpose] = useState(existingSkill?.purpose || '');
    const [weeklyTime, setWeeklyTime] = useState(existingSkill?.weeklyTime || 5);
    const [learningMethods, setLearningMethods] = useState(existingSkill?.learningMethods || []);
    const [milestones, setMilestones] = useState(existingSkill?.milestones || []);
    const [difficulty, setDifficulty] = useState(existingSkill?.difficulty || 'medium');
    const [startDate, setStartDate] = useState(existingSkill?.startDate ? new Date(existingSkill.startDate) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [reminder, setReminder] = useState(existingSkill?.reminder || {
        enabled: false,
        frequency: 'daily',
        time: '09:00'
    });
    const [showTimePicker, setShowTimePicker] = useState(false);

    // UI State for collapsible sections
    const [expandedSections, setExpandedSections] = useState({
        purpose: false,
        weeklyTime: false,
        learningMethods: false,
        milestones: false,
        startDate: false,
        difficulty: false,
        reminder: false
    });

    // Constants
    const CATEGORIES = ['Academic', 'Technical', 'Creative', 'Fitness', 'Personal', 'Other'];
    const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const ICONS = ['💻', '🎨', '🧠', '🏋️', '📘', '🗣️', '🎸', '🍳', '✈️', '💰'];
    const COLORS = ['#4c669f', '#5AC8FA', '#FF9500', '#FF3B30', '#30D158', '#AF52DE', '#FFCC00', '#8E8E93'];
    const LEARNING_METHODS = [
        { id: 'video', label: 'Video', icon: '📹' },
        { id: 'book', label: 'Book', icon: '📚' },
        { id: 'practice', label: 'Practice', icon: '⚡' },
        { id: 'course', label: 'Course', icon: '🎓' },
        { id: 'notes', label: 'Notes', icon: '📝' }
    ];
    const DIFFICULTY_LEVELS = [
        { id: 'easy', label: 'Easy', icon: '😊', color: '#30D158' },
        { id: 'medium', label: 'Medium', icon: '😐', color: '#FF9500' },
        { id: 'hard', label: 'Hard', icon: '😤', color: '#FF3B30' }
    ];

    // Level Mapping for Progress
    const getLevelPercentage = (lvl) => {
        switch (lvl) {
            case 'Beginner': return 10;
            case 'Intermediate': return 40;
            case 'Advanced': return 70;
            case 'Expert': return 95;
            default: return 0;
        }
    };

    // Toggle section expansion
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Learning Methods handlers
    const toggleLearningMethod = (methodId) => {
        setLearningMethods(prev =>
            prev.includes(methodId)
                ? prev.filter(m => m !== methodId)
                : [...prev, methodId]
        );
    };

    // Milestone handlers
    const addMilestone = () => {
        const newMilestone = {
            id: Date.now().toString(),
            text: '',
            completed: false
        };
        setMilestones([...milestones, newMilestone]);
    };

    const updateMilestone = (id, text) => {
        setMilestones(milestones.map(m =>
            m.id === id ? { ...m, text } : m
        ));
    };

    const deleteMilestone = (id) => {
        setMilestones(milestones.filter(m => m.id !== id));
    };

    // Format date for display
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Skill name is required');
            return;
        }
        if (!category) {
            Alert.alert('Validation Error', 'Category is required');
            return;
        }
        if (!targetLevel) {
            Alert.alert('Validation Error', 'Target level is required');
            return;
        }

        const skillData = {
            name: name.trim(),
            category,
            targetLevel,
            currentLevel,
            icon,
            color,
            description: description.trim(),
            level: getLevelPercentage(currentLevel),
            // New enhanced fields
            purpose: purpose.trim(),
            weeklyTime,
            learningMethods,
            milestones: milestones.filter(m => m.text.trim()), // Only save milestones with text
            difficulty,
            startDate: startDate.toISOString(),
            reminder,
            updatedAt: new Date().toISOString(),
        };

        if (isEditing) {
            updateSkill(skillId, skillData);
        } else {
            addSkill({ ...skillData, createdAt: new Date().toISOString() });
        }
        navigation.goBack();
    };

    const handleAddCustomCategory = () => {
        if (customCategory.trim()) {
            setCategory(customCategory.trim());
            setCustomCategory('');
            setShowCustomCategoryInput(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. App Bar / Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? 'Edit Skill' : 'Add Skill'}</Text>
                <TouchableOpacity onPress={handleSave} disabled={!name.trim() || !category}>
                    <Text style={[styles.saveText, (!name.trim() || !category) && styles.disabledSave]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* 2. Skill Name Input */}
                <Text style={styles.label}>Skill Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Physics, Flutter"
                    placeholderTextColor="#666"
                    value={name}
                    onChangeText={setName}
                    autoFocus={!isEditing}
                    maxLength={50}
                />

                {/* 3. Category Selector */}
                <Text style={styles.label}>Category *</Text>
                <View style={styles.chipsContainer}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.chip, category === cat && styles.chipSelected, category === cat && { backgroundColor: color }]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={styles.chipText}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={[styles.chip, styles.chipOutline, showCustomCategoryInput && styles.chipSelected]}
                        onPress={() => setShowCustomCategoryInput(!showCustomCategoryInput)}
                    >
                        <Text style={styles.chipText}>+ Custom</Text>
                    </TouchableOpacity>
                </View>

                {showCustomCategoryInput && (
                    <View style={styles.customCategoryRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginTop: 10 }]}
                            placeholder="Custom Category Name"
                            placeholderTextColor="#666"
                            value={customCategory}
                            onChangeText={setCustomCategory}
                        />
                        <TouchableOpacity style={styles.addCustomButton} onPress={handleAddCustomCategory}>
                            <Ionicons name="checkmark" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
                {category && !CATEGORIES.includes(category) && (
                    <View style={[styles.chip, styles.chipSelected, { marginTop: 10, alignSelf: 'flex-start', backgroundColor: color }]}>
                        <Text style={styles.chipText}>{category}</Text>
                    </View>
                )}


                {/* 4 & 5. Target & Current Level Selector */}

                <Text style={styles.label}>Current Level</Text>
                <View style={styles.levelContainer}>
                    {LEVELS.map((lvl, index) => {
                        const isSelected = currentLevel === lvl;
                        const isPassed = LEVELS.indexOf(currentLevel) >= index; // Highlight passed steps
                        return (
                            <View key={lvl} style={styles.levelStepWrapper}>
                                <TouchableOpacity
                                    style={[
                                        styles.levelCircle,
                                        isSelected && { backgroundColor: color, borderColor: color },
                                        isPassed && !isSelected && { backgroundColor: color, opacity: 0.5, borderColor: color }
                                    ]}
                                    onPress={() => setCurrentLevel(lvl)}
                                >
                                    {isSelected && <Ionicons name="location" size={12} color="#fff" />}
                                </TouchableOpacity>
                                <Text style={[styles.levelText, isSelected ? { color: '#fff', fontWeight: 'bold' } : { color: '#666' }]}>{lvl}</Text>
                                {index < LEVELS.length - 1 && (
                                    <View style={[styles.levelConnector, isPassed && LEVELS.indexOf(currentLevel) > index && { backgroundColor: color }]} />
                                )}
                            </View>
                        );
                    })}
                </View>

                <Text style={styles.label}>Target Level *</Text>
                <View style={styles.levelContainer}>
                    {LEVELS.map((lvl, index) => {
                        const isSelected = targetLevel === lvl;
                        return (
                            <View key={lvl} style={styles.levelStepWrapper}>
                                <TouchableOpacity
                                    style={[
                                        styles.levelCircle,
                                        isSelected && { backgroundColor: 'transparent', borderColor: color, borderWidth: 2 },
                                        !isSelected && { borderColor: '#444' }
                                    ]}
                                    onPress={() => setTargetLevel(lvl)}
                                >
                                    {isSelected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />}
                                </TouchableOpacity>
                                <Text style={[styles.levelText, isSelected ? { color: color, fontWeight: 'bold' } : { color: '#666' }]}>{lvl}</Text>
                                {index < LEVELS.length - 1 && (
                                    <View style={[styles.levelConnector, { backgroundColor: '#333' }]} />
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* 6 & 7. Icon & Color */}
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>Icon</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
                            {ICONS.map(ic => (
                                <TouchableOpacity
                                    key={ic}
                                    style={[styles.iconButton, icon === ic && { backgroundColor: '#333', borderColor: color, borderWidth: 1 }]}
                                    onPress={() => setIcon(ic)}
                                >
                                    <Text style={{ fontSize: 20 }}>{ic}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                <Text style={styles.label}>Color Theme</Text>
                <View style={styles.colorRow}>
                    {COLORS.map(c => (
                        <TouchableOpacity
                            key={c}
                            style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.colorSelected]}
                            onPress={() => setColor(c)}
                        >
                            {color === c && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ENHANCED SECTIONS DIVIDER */}
                <View style={styles.divider} />
                <Text style={styles.sectionHeader}>✨ Advanced Settings (Optional)</Text>

                {/* 1. Skill Purpose Section */}
                <TouchableOpacity
                    style={styles.collapsibleHeader}
                    onPress={() => toggleSection('purpose')}
                    activeOpacity={0.7}
                >
                    <View style={styles.collapsibleHeaderContent}>
                        <Text style={styles.collapsibleIcon}>💭</Text>
                        <Text style={styles.collapsibleTitle}>Why this skill?</Text>
                        {purpose && <View style={styles.completedDot} />}
                    </View>
                    <Ionicons
                        name={expandedSections.purpose ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#888"
                    />
                </TouchableOpacity>
                {expandedSections.purpose && (
                    <View style={styles.collapsibleContent}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Career growth, exams, personal interest..."
                            placeholderTextColor="#666"
                            value={purpose}
                            onChangeText={setPurpose}
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                )}

                {/* 2. Weekly Time Commitment Section */}
                <TouchableOpacity
                    style={styles.collapsibleHeader}
                    onPress={() => toggleSection('weeklyTime')}
                    activeOpacity={0.7}
                >
                    <View style={styles.collapsibleHeaderContent}>
                        <Text style={styles.collapsibleIcon}>⏰</Text>
                        <Text style={styles.collapsibleTitle}>Weekly Time Commitment</Text>
                        <Text style={styles.valueBadge}>{weeklyTime} hrs</Text>
                    </View>
                    <Ionicons
                        name={expandedSections.weeklyTime ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#888"
                    />
                </TouchableOpacity>
                {expandedSections.weeklyTime && (
                    <View style={styles.collapsibleContent}>
                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderValue}>{weeklyTime} hours / week</Text>
                            <View style={styles.customSlider}>
                                {[...Array(20)].map((_, i) => {
                                    const hour = i + 1;
                                    const isSelected = weeklyTime >= hour;
                                    return (
                                        <TouchableOpacity
                                            key={hour}
                                            style={[
                                                styles.sliderSegment,
                                                isSelected && { backgroundColor: color }
                                            ]}
                                            onPress={() => setWeeklyTime(hour)}
                                        />
                                    );
                                })}
                            </View>
                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabel}>1</Text>
                                <Text style={styles.sliderLabel}>10</Text>
                                <Text style={styles.sliderLabel}>20</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* 3. Learning Methods Section */}
                <TouchableOpacity
                    style={styles.collapsibleHeader}
                    onPress={() => toggleSection('learningMethods')}
                    activeOpacity={0.7}
                >
                    <View style={styles.collapsibleHeaderContent}>
                        <Text style={styles.collapsibleIcon}>📚</Text>
                        <Text style={styles.collapsibleTitle}>How will you learn?</Text>
                        {learningMethods.length > 0 && (
                            <Text style={styles.countBadge}>{learningMethods.length}</Text>
                        )}
                    </View>
                    <Ionicons
                        name={expandedSections.learningMethods ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#888"
                    />
                </TouchableOpacity>
                {expandedSections.learningMethods && (
                    <View style={styles.collapsibleContent}>
                        <View style={styles.methodsContainer}>
                            {LEARNING_METHODS.map(method => (
                                <TouchableOpacity
                                    key={method.id}
                                    style={[
                                        styles.methodChip,
                                        learningMethods.includes(method.id) && {
                                            backgroundColor: color,
                                            borderColor: color
                                        }
                                    ]}
                                    onPress={() => toggleLearningMethod(method.id)}
                                >
                                    <Text style={styles.methodIcon}>{method.icon}</Text>
                                    <Text style={styles.methodText}>{method.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* 4. Milestones Section */}
                <TouchableOpacity
                    style={styles.collapsibleHeader}
                    onPress={() => toggleSection('milestones')}
                    activeOpacity={0.7}
                >
                    <View style={styles.collapsibleHeaderContent}>
                        <Text style={styles.collapsibleIcon}>🎯</Text>
                        <Text style={styles.collapsibleTitle}>Milestones</Text>
                        {milestones.length > 0 && (
                            <Text style={styles.countBadge}>{milestones.length}</Text>
                        )}
                    </View>
                    <Ionicons
                        name={expandedSections.milestones ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#888"
                    />
                </TouchableOpacity>
                {expandedSections.milestones && (
                    <View style={styles.collapsibleContent}>
                        {milestones.map((milestone, index) => (
                            <View key={milestone.id} style={styles.milestoneItem}>
                                <Text style={styles.milestoneNumber}>{index + 1}</Text>
                                <TextInput
                                    style={styles.milestoneInput}
                                    placeholder="e.g., Basics, Advanced concepts..."
                                    placeholderTextColor="#666"
                                    value={milestone.text}
                                    onChangeText={(text) => updateMilestone(milestone.id, text)}
                                />
                                <TouchableOpacity
                                    onPress={() => deleteMilestone(milestone.id)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="close-circle" size={20} color="#E57373" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addButton} onPress={addMilestone}>
                            <Ionicons name="add-circle-outline" size={20} color={color} />
                            <Text style={[styles.addButtonText, { color }]}>Add Milestone</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 5. Start Date Section */}
                <TouchableOpacity
                    style={styles.collapsibleHeader}
                    onPress={() => toggleSection('startDate')}
                    activeOpacity={0.7}
                >
                    <View style={styles.collapsibleHeaderContent}>
                        <Text style={styles.collapsibleIcon}>📅</Text>
                        <Text style={styles.collapsibleTitle}>Start Date</Text>
                        <Text style={styles.valueBadge}>{formatDate(startDate)}</Text>
                    </View>
                    <Ionicons
                        name={expandedSections.startDate ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#888"
                    />
                </TouchableOpacity>
                {expandedSections.startDate && (
                    <View style={styles.collapsibleContent}>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={20} color={color} />
                            <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
                        </TouchableOpacity>
                        {showDatePicker && Platform.OS === 'web' && (
                            <input
                                type="date"
                                value={startDate.toISOString().split('T')[0]}
                                onChange={(e) => {
                                    setStartDate(new Date(e.target.value));
                                    setShowDatePicker(false);
                                }}
                                style={{
                                    backgroundColor: '#1E1E1E',
                                    color: '#fff',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    marginTop: '10px',
                                    width: '100%'
                                }}
                            />
                        )}
                    </View>
                )}

                {/* 6. Difficulty Level Section */}
                <TouchableOpacity
                    style={styles.collapsibleHeader}
                    onPress={() => toggleSection('difficulty')}
                    activeOpacity={0.7}
                >
                    <View style={styles.collapsibleHeaderContent}>
                        <Text style={styles.collapsibleIcon}>
                            {DIFFICULTY_LEVELS.find(d => d.id === difficulty)?.icon || '😐'}
                        </Text>
                        <Text style={styles.collapsibleTitle}>Difficulty</Text>
                        <Text style={[
                            styles.valueBadge,
                            { color: DIFFICULTY_LEVELS.find(d => d.id === difficulty)?.color || '#FF9500' }
                        ]}>
                            {DIFFICULTY_LEVELS.find(d => d.id === difficulty)?.label || 'Medium'}
                        </Text>
                    </View>
                    <Ionicons
                        name={expandedSections.difficulty ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#888"
                    />
                </TouchableOpacity>
                {expandedSections.difficulty && (
                    <View style={styles.collapsibleContent}>
                        <View style={styles.difficultyContainer}>
                            {DIFFICULTY_LEVELS.map(level => (
                                <TouchableOpacity
                                    key={level.id}
                                    style={[
                                        styles.difficultyChip,
                                        difficulty === level.id && {
                                            backgroundColor: level.color + '30',
                                            borderColor: level.color
                                        }
                                    ]}
                                    onPress={() => setDifficulty(level.id)}
                                >
                                    <Text style={styles.difficultyIcon}>{level.icon}</Text>
                                    <Text style={[
                                        styles.difficultyText,
                                        difficulty === level.id && { color: level.color }
                                    ]}>
                                        {level.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* 7. Skill Reminder Section */}
                <TouchableOpacity
                    style={styles.collapsibleHeader}
                    onPress={() => toggleSection('reminder')}
                    activeOpacity={0.7}
                >
                    <View style={styles.collapsibleHeaderContent}>
                        <Text style={styles.collapsibleIcon}>🔔</Text>
                        <Text style={styles.collapsibleTitle}>Skill Reminder</Text>
                        {reminder.enabled && <View style={styles.completedDot} />}
                    </View>
                    <Ionicons
                        name={expandedSections.reminder ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#888"
                    />
                </TouchableOpacity>
                {expandedSections.reminder && (
                    <View style={styles.collapsibleContent}>
                        <View style={styles.reminderRow}>
                            <Text style={styles.reminderLabel}>Enable Reminder</Text>
                            <Switch
                                value={reminder.enabled}
                                onValueChange={(value) => setReminder({ ...reminder, enabled: value })}
                                trackColor={{ false: '#333', true: color + '80' }}
                                thumbColor={reminder.enabled ? color : '#888'}
                            />
                        </View>
                        {reminder.enabled && (
                            <>
                                <Text style={styles.subLabel}>Frequency</Text>
                                <View style={styles.frequencyContainer}>
                                    {['daily', 'weekly'].map(freq => (
                                        <TouchableOpacity
                                            key={freq}
                                            style={[
                                                styles.frequencyChip,
                                                reminder.frequency === freq && {
                                                    backgroundColor: color,
                                                    borderColor: color
                                                }
                                            ]}
                                            onPress={() => setReminder({ ...reminder, frequency: freq })}
                                        >
                                            <Text style={styles.frequencyText}>
                                                {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={styles.subLabel}>Time</Text>
                                <TouchableOpacity
                                    style={styles.timeButton}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Ionicons name="time-outline" size={20} color={color} />
                                    <Text style={styles.timeButtonText}>{reminder.time}</Text>
                                </TouchableOpacity>
                                {showTimePicker && Platform.OS === 'web' && (
                                    <input
                                        type="time"
                                        value={reminder.time}
                                        onChange={(e) => {
                                            setReminder({ ...reminder, time: e.target.value });
                                            setShowTimePicker(false);
                                        }}
                                        style={{
                                            backgroundColor: '#1E1E1E',
                                            color: '#fff',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            marginTop: '10px',
                                            width: '100%'
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </View>
                )}

                {/* 8. Description / Notes */}
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What does this skill include?"
                    placeholderTextColor="#666"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />

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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    chipSelected: {
        backgroundColor: '#4c669f',
    },
    chipOutline: {
        borderWidth: 1,
        borderColor: '#4c669f',
        backgroundColor: 'transparent',
    },
    chipText: {
        color: '#fff',
        fontSize: 14,
    },
    customCategoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addCustomButton: {
        backgroundColor: '#4c669f',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        marginLeft: 10,
    },
    levelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    levelStepWrapper: {
        alignItems: 'center',
        flex: 1,
        position: 'relative',
    },
    levelCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#1E1E1E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#444',
        marginBottom: 5,
        zIndex: 2,
    },
    levelText: {
        fontSize: 10,
        textAlign: 'center',
    },
    levelConnector: {
        position: 'absolute',
        top: 15,
        left: '50%',
        width: '100%',
        height: 2,
        backgroundColor: '#333',
        zIndex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconScroll: {
        flexDirection: 'row',
        marginTop: 5,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E1E1E',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    colorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 12,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorSelected: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    // New Enhanced Section Styles
    divider: {
        height: 1,
        backgroundColor: '#2C2C2E',
        marginVertical: 20,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 15,
        textAlign: 'center',
    },
    collapsibleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    collapsibleHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    collapsibleIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    collapsibleTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
    },
    completedDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#30D158',
        marginRight: 8,
    },
    valueBadge: {
        fontSize: 13,
        color: '#888',
        fontWeight: '600',
        marginRight: 8,
    },
    countBadge: {
        backgroundColor: '#4c669f',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 8,
    },
    collapsibleContent: {
        backgroundColor: '#1A1A1A',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#252525',
    },
    // Slider Styles
    sliderContainer: {
        paddingVertical: 10,
    },
    sliderValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 15,
    },
    customSlider: {
        flexDirection: 'row',
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2A2A2A',
        overflow: 'hidden',
    },
    sliderSegment: {
        flex: 1,
        backgroundColor: '#2A2A2A',
        borderRightWidth: 1,
        borderRightColor: '#1A1A1A',
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    sliderLabel: {
        fontSize: 12,
        color: '#666',
    },
    // Learning Methods Styles
    methodsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    methodChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#333',
    },
    methodIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    methodText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    // Milestone Styles
    milestoneItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    milestoneNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2A2A2A',
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 24,
    },
    milestoneInput: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        color: '#fff',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    deleteButton: {
        padding: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#333',
        borderStyle: 'dashed',
        marginTop: 8,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    // Date Picker Styles
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        gap: 10,
    },
    dateButtonText: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '500',
    },
    // Difficulty Styles
    difficultyContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    difficultyChip: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#333',
    },
    difficultyIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    difficultyText: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '600',
    },
    // Reminder Styles
    reminderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    reminderLabel: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '600',
    },
    subLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    frequencyContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    frequencyChip: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#333',
    },
    frequencyText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        gap: 10,
    },
    timeButtonText: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '500',
    },
});
