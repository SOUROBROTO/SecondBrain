import React, { useContext } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { TaskContext } from '../context/TaskContext';
import { HabitContext } from '../context/HabitContext';
import { SkillContext } from '../context/SkillContext';

const AddActionModal = ({ visible, onClose }) => {
    const navigation = useNavigation();
    const { tasks, deleteTask, toggleTaskCompletion } = useContext(TaskContext);
    const { habits, deleteHabit } = useContext(HabitContext);
    const { skills, deleteSkill } = useContext(SkillContext);

    const handleAddTask = () => {
        onClose();
        navigation.navigate('AddEditTask');
    };

    const handleAddHabit = () => {
        onClose();
        navigation.navigate('AddEditHabit');
    };

    const handleAddSkill = () => {
        onClose();
        navigation.navigate('AddEditSkill');
    };

    // Get recent items (last 5)
    const recentTasks = tasks.slice(0, 5);
    const recentHabits = habits.slice(0, 5);
    const recentSkills = skills.slice(0, 5);

    // Render right swipe actions (delete)
    const renderRightActions = (progress, dragX, onDelete) => {
        const trans = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={onDelete}
            >
                <Animated.View style={{ transform: [{ scale: trans }] }}>
                    <Ionicons name="trash" size={24} color="#fff" />
                </Animated.View>
            </TouchableOpacity>
        );
    };

    // Render Task Item
    const renderTaskItem = (task, index) => (
        <Swipeable
            key={task.id || index}
            renderRightActions={(progress, dragX) =>
                renderRightActions(progress, dragX, () => deleteTask(task.id))
            }
            overshootRight={false}
        >
            <View style={styles.itemCard}>
                <View style={[styles.itemIndicator, { backgroundColor: '#4A90E2' }]} />
                <View style={styles.itemContent}>
                    <Text
                        style={[
                            styles.itemTitle,
                            task.completed && styles.completedText,
                        ]}
                        numberOfLines={1}
                    >
                        {task.title}
                    </Text>
                    {task.priority && (
                        <Text style={styles.itemMeta}>Priority: {task.priority}</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={[
                        styles.completeButton,
                        task.completed && styles.completeButtonActive,
                    ]}
                    onPress={() => toggleTaskCompletion(task.id)}
                >
                    <Ionicons
                        name={task.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                        size={28}
                        color={task.completed ? '#66BB6A' : '#888'}
                    />
                </TouchableOpacity>
            </View>
        </Swipeable>
    );

    // Render Habit Item
    const renderHabitItem = (habit, index) => (
        <Swipeable
            key={habit.id || index}
            renderRightActions={(progress, dragX) =>
                renderRightActions(progress, dragX, () => deleteHabit(habit.id))
            }
            overshootRight={false}
        >
            <View style={styles.itemCard}>
                <View style={[styles.itemIndicator, { backgroundColor: '#66BB6A' }]} />
                <View style={styles.itemContent}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                        {habit.emoji || '🎯'} {habit.goal}
                    </Text>
                    {habit.frequency && (
                        <Text style={styles.itemMeta}>{habit.frequency}</Text>
                    )}
                </View>
            </View>
        </Swipeable>
    );

    // Render Skill Item
    const renderSkillItem = (skill, index) => (
        <Swipeable
            key={skill.id || index}
            renderRightActions={(progress, dragX) =>
                renderRightActions(progress, dragX, () => deleteSkill(skill.id))
            }
            overshootRight={false}
        >
            <View style={styles.itemCard}>
                <View style={[styles.itemIndicator, { backgroundColor: '#AB47BC' }]} />
                <View style={styles.itemContent}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                        {skill.icon || '🎓'} {skill.name}
                    </Text>
                    {skill.category && (
                        <Text style={styles.itemMeta}>{skill.category}</Text>
                    )}
                </View>
            </View>
        </Swipeable>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header with Close Button */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Horizontal Pill Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.pillButton} onPress={handleAddTask}>
                            <View style={[styles.pillIcon, { backgroundColor: '#4A90E2' }]}>
                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                            </View>
                            <Text style={styles.pillButtonText}>Add Task</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.pillButton} onPress={handleAddHabit}>
                            <View style={[styles.pillIcon, { backgroundColor: '#66BB6A' }]}>
                                <Ionicons name="repeat" size={24} color="#fff" />
                            </View>
                            <Text style={styles.pillButtonText}>Add Habit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.pillButton} onPress={handleAddSkill}>
                            <View style={[styles.pillIcon, { backgroundColor: '#AB47BC' }]}>
                                <Ionicons name="school" size={24} color="#fff" />
                            </View>
                            <Text style={styles.pillButtonText}>Add Skill</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content Sections with Charts/Lists */}
                    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                        {/* Tasks Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
                                <Text style={styles.sectionTitle}>Recent Tasks</Text>
                                <Text style={styles.sectionCount}>{tasks.length}</Text>
                            </View>
                            <View style={styles.sectionDivider} />
                            {recentTasks.length > 0 ? (
                                recentTasks.map((task, index) => renderTaskItem(task, index))
                            ) : (
                                <Text style={styles.emptyText}>No tasks yet. Add your first task!</Text>
                            )}
                        </View>

                        {/* Habits Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="repeat" size={20} color="#66BB6A" />
                                <Text style={styles.sectionTitle}>Recent Habits</Text>
                                <Text style={styles.sectionCount}>{habits.length}</Text>
                            </View>
                            <View style={styles.sectionDivider} />
                            {recentHabits.length > 0 ? (
                                recentHabits.map((habit, index) => renderHabitItem(habit, index))
                            ) : (
                                <Text style={styles.emptyText}>No habits yet. Start building one!</Text>
                            )}
                        </View>

                        {/* Skills Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="school" size={20} color="#AB47BC" />
                                <Text style={styles.sectionTitle}>Recent Skills</Text>
                                <Text style={styles.sectionCount}>{skills.length}</Text>
                            </View>
                            <View style={styles.sectionDivider} />
                            {recentSkills.length > 0 ? (
                                recentSkills.map((skill, index) => renderSkillItem(skill, index))
                            ) : (
                                <Text style={styles.emptyText}>No skills yet. Add one to track!</Text>
                            )}
                        </View>

                        {/* Bottom spacing */}
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#121212',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '90%',
        paddingBottom: 34,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    closeButton: {
        padding: 4,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 20,
        gap: 10,
    },
    pillButton: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    pillIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    pillButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 28,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
    },
    sectionCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#252525',
        marginBottom: 12,
    },
    itemCard: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#252525',
        alignItems: 'center',
    },
    itemIndicator: {
        width: 4,
        height: '100%',
        borderRadius: 2,
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
    itemMeta: {
        fontSize: 12,
        color: '#888',
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    completeButton: {
        padding: 4,
        marginLeft: 8,
    },
    completeButtonActive: {
        // Active state styling handled by icon color
    },
    deleteButton: {
        backgroundColor: '#E57373',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '92%',
        borderRadius: 12,
        marginBottom: 8,
    },
});

export default AddActionModal;
