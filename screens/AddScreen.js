import React, { useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { TaskContext } from '../context/TaskContext';
import { HabitContext } from '../context/HabitContext';
import { SkillContext } from '../context/SkillContext';

const AddScreen = () => {
    const navigation = useNavigation();
    const { tasks, deleteTask, toggleTaskCompletion } = useContext(TaskContext);
    const { habits, deleteHabit, logHabit, unlogHabit } = useContext(HabitContext);
    const { skills, deleteSkill } = useContext(SkillContext);

    // State for skill card menu
    const [openMenuId, setOpenMenuId] = React.useState(null);

    const handleAddTask = () => {
        navigation.navigate('AddEditTask');
    };

    const handleAddHabit = () => {
        navigation.navigate('AddEditHabit');
    };

    const handleAddSkill = () => {
        navigation.navigate('AddEditSkill');
    };

    // Get recent items (last 5)
    const recentTasks = tasks.slice(0, 5);
    const recentHabits = habits.slice(0, 5);
    const recentSkills = skills.slice(0, 5);

    // Skill Card Helper Functions
    const getSkillColor = (category) => {
        const colors = {
            'Academic': '#5AC8FA',
            'Technical': '#AB47BC',
            'Creative': '#FF9500',
            'Fitness': '#30D158',
            'Personal': '#FF3B30',
        };
        return colors[category] || '#AB47BC';
    };

    const getDifficultyConfig = (difficulty) => {
        const configs = {
            'easy': { label: 'Easy', color: '#30D158', icon: '😊' },
            'medium': { label: 'Medium', color: '#FF9500', icon: '😐' },
            'hard': { label: 'Hard', color: '#FF3B30', icon: '😤' },
        };
        return configs[difficulty?.toLowerCase()] || configs.medium;
    };

    const calculateProgress = (currentLevel, targetLevel) => {
        const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
        const currentIndex = levels.indexOf(currentLevel);
        const targetIndex = levels.indexOf(targetLevel);
        if (currentIndex === -1 || targetIndex === -1 || targetIndex === 0) return 0;
        return Math.round((currentIndex / targetIndex) * 100);
    };

    const getDaysActive = (skill) => {
        if (!skill.startDate) return 0;
        const start = new Date(skill.startDate);
        const now = new Date();
        const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const formatWeeklyTime = (hours) => {
        if (!hours) return '0 hrs/wk';
        return `${hours} hrs/wk`;
    };

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


    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return '#E57373'; // Red
            case 'medium':
                return '#FFB74D'; // Orange
            case 'low':
                return '#64B5F6'; // Blue
            default:
                return '#4A90E2'; // Default blue
        }
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
            <TouchableOpacity
                style={styles.itemCard}
                onPress={() => navigation.navigate('AddEditTask', { taskId: task.id })}
                activeOpacity={0.7}
            >
                <View style={[styles.itemIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
                <View style={styles.itemContent}>
                    {/* Task Title */}
                    <View style={styles.titleRow}>
                        <Text
                            style={[
                                styles.itemTitle,
                                task.completed && styles.completedText,
                            ]}
                            numberOfLines={2}
                        >
                            {task.title}
                        </Text>
                    </View>

                    {/* Metadata Row */}
                    <View style={styles.metadataRow}>
                        {task.priority && (
                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                                <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                                    {task.priority}
                                </Text>
                            </View>
                        )}

                        {task.recurrence && task.recurrence !== 'none' && (
                            <View style={styles.iconBadge}>
                                <Ionicons name="repeat" size={12} color="#888" />
                                <Text style={styles.badgeText}>{task.recurrence}</Text>
                            </View>
                        )}
                    </View>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                        <View style={styles.tagsRow}>
                            {task.tags.slice(0, 3).map((tag, idx) => (
                                <View key={idx} style={styles.tag}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                            {task.tags.length > 3 && (
                                <Text style={styles.moreTagsText}>+{task.tags.length - 3}</Text>
                            )}
                        </View>
                    )}

                    {/* Notes Preview */}
                    {task.note && (
                        <Text style={styles.notesPreview} numberOfLines={1}>
                            <Ionicons name="document-text-outline" size={12} color="#666" /> {task.note}
                        </Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.completeButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            toggleTaskCompletion(task.id);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={task.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                            size={24}
                            color={task.completed ? '#66BB6A' : '#888'}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );

    // Get habit completion for today
    const getHabitCompletionToday = (habit) => {
        const today = new Date().toISOString().split('T')[0];
        return habit.history?.[today]?.value || 0;
    };

    // Get habit color
    const getHabitColor = (habit) => {
        return habit.color || '#2cdd2cff';
    };

    // Calculate progress percentage
    const getProgressPercentage = (completed, goal) => {
        const goalValue = typeof goal === 'object' ? goal.value : goal;
        return Math.min((completed / goalValue) * 100, 100);
    };

    // Get last 7 days history
    const getLast7Days = (habit) => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                completed: !!habit.history?.[dateStr]
            });
        }
        return days;
    };

    // Render Habit Item
    const renderHabitItem = (habit, index) => {
        const habitColor = getHabitColor(habit);
        const completedToday = getHabitCompletionToday(habit);
        const goalValue = typeof habit.goal === 'object' ? habit.goal.value : 1;
        const goalUnit = typeof habit.goal === 'object' ? habit.goal.unit : 'times';
        const progressPercent = getProgressPercentage(completedToday, goalValue);
        const last7Days = getLast7Days(habit);
        const isCompleted = completedToday >= goalValue;

        return (
            <Swipeable
                key={habit.id || index}
                renderRightActions={(progress, dragX) =>
                    renderRightActions(progress, dragX, () => deleteHabit(habit.id))
                }
                overshootRight={false}
            >
                <TouchableOpacity
                    style={styles.habitCard}
                    onPress={() => navigation.navigate('AddEditHabit', { habitId: habit.id })}
                    activeOpacity={0.7}
                >
                    {/* Top Row */}
                    <View style={styles.habitTopRow}>
                        {/* Icon Container */}
                        <View style={[styles.habitIconContainer, { backgroundColor: habitColor + '30' }]}>
                            <Text style={styles.habitIcon}>{habit.emoji || '🎯'}</Text>
                        </View>

                        {/* Habit Info */}
                        <View style={styles.habitInfo}>
                            <Text style={styles.habitName} numberOfLines={1}>
                                {habit.title || 'Habit'}
                            </Text>
                            <Text style={styles.habitFrequency}>
                                {habit.frequency || 'Daily'} · {goalValue} {goalUnit}
                            </Text>
                        </View>


                    </View>

                    {/* Progress Section */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressText}>
                                {completedToday} / {goalValue} {goalUnit}
                            </Text>
                            {isCompleted && (
                                <Ionicons name="checkmark-circle" size={16} color="#66BB6A" />
                            )}
                        </View>
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${progressPercent}%`,
                                        backgroundColor: isCompleted ? '#66BB6A' : habitColor
                                    }
                                ]}
                            />
                        </View>
                    </View>


                    {/* Quick Actions */}
                    <View style={styles.habitQuickActions}>
                        {/* Minus Button */}
                        <TouchableOpacity
                            style={[styles.quickActionButton, completedToday === 0 && styles.disabledButton]}
                            onPress={(e) => {
                                e.stopPropagation();
                                if (completedToday > 0) {
                                    const decrementValue = habit.incrementAmount || (goalUnit === 'times' ? 1 : goalUnit === 'mins' ? 5 : 1);
                                    const newValue = Math.max(completedToday - decrementValue, 0);
                                    logHabit(habit.id, newValue);
                                }
                            }}
                            disabled={completedToday === 0}
                        >
                            <Ionicons
                                name="remove-circle-outline"
                                size={20}
                                color={completedToday === 0 ? "#444" : "#E57373"}
                            />
                            <Text style={[styles.quickActionText, completedToday === 0 && styles.disabledText]}>
                                {goalUnit === 'times' ? '' : `-${habit.incrementAmount || (goalUnit === 'mins' ? 5 : 1)} ${goalUnit}`}
                            </Text>
                        </TouchableOpacity>

                        {/* Plus Button */}
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                if (isCompleted) {
                                    unlogHabit(habit.id);
                                } else {
                                    // Use custom increment amount or default
                                    const incrementValue = habit.incrementAmount || (goalUnit === 'times' ? 1 : goalUnit === 'mins' ? 5 : 1);
                                    const newValue = Math.min(completedToday + incrementValue, goalValue);
                                    logHabit(habit.id, newValue);
                                }
                            }}
                        >
                            <Ionicons
                                name={isCompleted ? "checkmark-circle" : "add-circle-outline"}
                                size={20}
                                color={isCompleted ? "#66BB6A" : habitColor}
                            />
                            <Text style={styles.quickActionText}>
                                {isCompleted ? "Done" : goalUnit === 'times' ? "Mark Done" : `+${habit.incrementAmount || (goalUnit === 'mins' ? 5 : 1)} ${goalUnit}`}
                            </Text>
                        </TouchableOpacity>

                        {habit.reminderEnabled && (
                            <View style={styles.quickActionButton}>
                                <Ionicons name="notifications" size={16} color="#888" />
                                <Text style={styles.quickActionText}>{habit.reminderTime || "Reminder"}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    // Render Skill Item - Modern & Motivational Design
    const renderSkillItem = (skill, index) => {
        const skillColor = getSkillColor(skill.category);
        const difficultyConfig = getDifficultyConfig(skill.difficulty);
        const progress = calculateProgress(skill.currentLevel, skill.targetLevel);
        const daysActive = getDaysActive(skill);
        const milestonesCompleted = skill.milestones?.filter(m => m.completed).length || 0;
        const milestonesTotal = skill.milestones?.length || 0;
        const isMenuOpen = openMenuId === skill.id;

        return (
            <Swipeable
                key={skill.id || index}
                renderRightActions={(progress, dragX) =>
                    renderRightActions(progress, dragX, () => deleteSkill(skill.id))
                }
                overshootRight={false}
            >
                <TouchableOpacity
                    style={styles.skillCard}
                    onPress={() => navigation.navigate('AddEditSkill', { skillId: skill.id })}
                    activeOpacity={0.9}
                >
                    {/* Header Section */}
                    <View style={styles.skillHeader}>
                        {/* Icon Container */}
                        <View style={[styles.skillIconContainer, { backgroundColor: skillColor + '30' }]}>
                            <Text style={styles.skillIconText}>{skill.icon || '🎓'}</Text>
                        </View>

                        {/* Name & Category */}
                        <View style={styles.skillHeaderInfo}>
                            <Text style={styles.skillName} numberOfLines={1}>
                                {skill.name}
                            </Text>
                            <Text style={styles.skillCategory}>
                                {skill.category || 'General'}
                            </Text>
                        </View>

                        {/* Difficulty Badge */}
                        <View style={[styles.difficultyBadge, { backgroundColor: difficultyConfig.color + '20' }]}>
                            <Text style={styles.difficultyEmoji}>{difficultyConfig.icon}</Text>
                            <Text style={[styles.difficultyText, { color: difficultyConfig.color }]}>
                                {difficultyConfig.label}
                            </Text>
                        </View>
                    </View>

                    {/* Level Progress Timeline */}
                    <View style={styles.levelProgressContainer}>
                        <View style={styles.levelProgressTrack}>
                            {/* Current Level */}
                            <View style={styles.levelPoint}>
                                <View style={[styles.levelDot, { backgroundColor: skillColor }]} />
                                <Text style={styles.levelLabel}>{skill.currentLevel || 'Beginner'}</Text>
                            </View>

                            {/* Progress Line */}
                            <View style={styles.progressLine}>
                                <View style={styles.progressLineBackground} />
                                <View
                                    style={[
                                        styles.progressLineFill,
                                        { width: `${progress}%`, backgroundColor: skillColor }
                                    ]}
                                />
                                {/* Animated Progress Dot */}
                                <View
                                    style={[
                                        styles.progressAnimatedDot,
                                        { left: `${progress}%`, backgroundColor: skillColor }
                                    ]}
                                />
                            </View>

                            {/* Target Level */}
                            <View style={styles.levelPoint}>
                                <View style={[styles.levelDotOutline, { borderColor: skillColor }]} />
                                <Text style={styles.levelLabel}>{skill.targetLevel || 'Expert'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Progress Bar with Percentage */}
                    <View style={styles.progressBarSection}>
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${progress}%`,
                                        backgroundColor: skillColor
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressPercentage}>{progress}%</Text>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        {/* Weekly Time Chip */}
                        <View style={styles.statChip}>
                            <Ionicons name="time-outline" size={14} color="#888" />
                            <Text style={styles.statText}>{formatWeeklyTime(skill.weeklyTime)}</Text>
                        </View>

                        {/* Days Active Chip */}
                        <View style={styles.statChip}>
                            <Ionicons name="flame" size={14} color="#FF6B35" />
                            <Text style={styles.statText}>{daysActive} days</Text>
                        </View>
                    </View>

                    {/* Milestones Preview */}
                    {milestonesTotal > 0 && (
                        <View style={styles.milestonesSection}>
                            <Text style={styles.milestonesText}>
                                ✓ {milestonesCompleted} / {milestonesTotal} Milestones
                            </Text>
                            <View style={styles.milestonesDots}>
                                {skill.milestones.slice(0, 5).map((milestone, idx) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.milestoneDot,
                                            milestone.completed && { backgroundColor: '#30D158' }
                                        ]}
                                    />
                                ))}
                                {milestonesTotal > 5 && (
                                    <Text style={styles.milestonesMore}>+{milestonesTotal - 5}</Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.skillActions}>
                        {/* Primary CTA */}
                        <TouchableOpacity
                            style={[styles.practiceButton, { backgroundColor: skillColor }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                navigation.navigate('LogSession', { skillId: skill.id });
                            }}
                        >
                            <Ionicons name="create-outline" size={18} color="#fff" />
                            <Text style={styles.practiceButtonText}>Log Session</Text>
                        </TouchableOpacity>

                        {/* Three-dot Menu */}
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(isMenuOpen ? null : skill.id);
                            }}
                        >
                            <Ionicons name="ellipsis-vertical" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>

                    {/* Menu Dropdown */}
                    {isMenuOpen && (
                        <View style={styles.menuDropdown}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    navigation.navigate('AddEditSkill', { skillId: skill.id });
                                }}
                            >
                                <Ionicons name="create-outline" size={18} color="#fff" />
                                <Text style={styles.menuItemText}>Edit Skill</Text>
                            </TouchableOpacity>

                            <View style={styles.menuDivider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    Alert.alert(
                                        'Delete Skill',
                                        `Are you sure you want to delete "${skill.name}"?`,
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Delete',
                                                style: 'destructive',
                                                onPress: () => deleteSkill(skill.id)
                                            }
                                        ]
                                    );
                                }}
                            >
                                <Ionicons name="trash-outline" size={18} color="#E57373" />
                                <Text style={[styles.menuItemText, { color: '#E57373' }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
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

                {/* Content Sections - Horizontal Scrollable */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalScrollContainer}
                    contentContainerStyle={styles.horizontalScrollContent}
                >
                    {/* Tasks Section */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
                            <Text style={styles.sectionTitle}>Recent Tasks</Text>
                            <Text style={styles.sectionCount}>{tasks.length}</Text>
                        </View>
                        <View style={styles.sectionDivider} />
                        <ScrollView
                            style={styles.sectionContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {recentTasks.length > 0 ? (
                                recentTasks.map((task, index) => renderTaskItem(task, index))
                            ) : (
                                <Text style={styles.emptyText}>No tasks yet. Add your first task!</Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Habits Section */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="repeat" size={20} color="#66BB6A" />
                            <Text style={styles.sectionTitle}>Recent Habits</Text>
                            <Text style={styles.sectionCount}>{habits.length}</Text>
                        </View>
                        <View style={styles.sectionDivider} />
                        <ScrollView
                            style={styles.sectionContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {recentHabits.length > 0 ? (
                                recentHabits.map((habit, index) => renderHabitItem(habit, index))
                            ) : (
                                <Text style={styles.emptyText}>No habits yet. Start building one!</Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Skills Section */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="school" size={20} color="#AB47BC" />
                            <Text style={styles.sectionTitle}>Recent Skills</Text>
                            <Text style={styles.sectionCount}>{skills.length}</Text>
                        </View>
                        <View style={styles.sectionDivider} />
                        <ScrollView
                            style={styles.sectionContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {recentSkills.length > 0 ? (
                                recentSkills.map((skill, index) => renderSkillItem(skill, index))
                            ) : (
                                <Text style={styles.emptyText}>No skills yet. Add one to track!</Text>
                            )}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    content: {
        flex: 1,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
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
    horizontalScrollContainer: {
        flex: 1,
    },
    horizontalScrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    sectionCard: {
        width: 320,
        marginRight: 16,
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        height: '100%',
    },
    sectionContent: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
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
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#252525',
        alignItems: 'flex-start',
    },
    itemIndicator: {
        width: 4,
        height: '100%',
        borderRadius: 2,
        marginRight: 12,
        minHeight: 50,
    },
    itemContent: {
        flex: 1,
        gap: 6,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        lineHeight: 20,
        flex: 1,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    iconBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 3,
        backgroundColor: '#252525',
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        color: '#888',
        textTransform: 'capitalize',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
    },
    tag: {
        backgroundColor: '#252525',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 11,
        color: '#4A90E2',
        fontWeight: '500',
    },
    moreTagsText: {
        fontSize: 11,
        color: '#666',
        fontStyle: 'italic',
    },
    notesPreview: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        lineHeight: 16,
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
    actionButtons: {
        flexDirection: 'column',
        gap: 8,
        marginLeft: 8,
    },
    completeButton: {
        padding: 4,
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
    // Habit Card Styles
    habitCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#252525',
    },
    habitTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    habitIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    habitIcon: {
        fontSize: 24,
    },
    habitInfo: {
        flex: 1,
    },
    habitName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    habitFrequency: {
        fontSize: 12,
        color: '#888',
    },
    habitActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    streakBadge: {
        backgroundColor: '#FF6B354040',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    streakText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FF6B35',
    },
    progressSection: {
        marginBottom: 12,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressText: {
        fontSize: 13,
        color: '#aaa',
        fontWeight: '600',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#2A2A2A',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    historySection: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 12,
        justifyContent: 'center',
    },
    historyDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2A2A2A',
    },
    habitQuickActions: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#252525',
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#252525',
        borderRadius: 8,
    },
    quickActionText: {
        fontSize: 12,
        color: '#aaa',
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.4,
    },
    disabledText: {
        color: '#444',
    },
    // Redesigned Skill Card Styles
    skillCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#252525',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    skillHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    skillIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    skillIconText: {
        fontSize: 26,
    },
    skillHeaderInfo: {
        flex: 1,
    },
    skillName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 3,
    },
    skillCategory: {
        fontSize: 12,
        color: '#888',
        textTransform: 'capitalize',
    },
    difficultyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    difficultyEmoji: {
        fontSize: 14,
    },
    difficultyText: {
        fontSize: 11,
        fontWeight: '700',
    },
    // Level Progress Timeline
    levelProgressContainer: {
        marginBottom: 14,
    },
    levelProgressTrack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    levelPoint: {
        alignItems: 'center',
        gap: 6,
    },
    levelDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    levelDotOutline: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2.5,
        backgroundColor: 'transparent',
    },
    levelLabel: {
        fontSize: 10,
        color: '#888',
        fontWeight: '600',
    },
    progressLine: {
        flex: 1,
        height: 4,
        marginHorizontal: 10,
        position: 'relative',
    },
    progressLineBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#2A2A2A',
        borderRadius: 2,
    },
    progressLineFill: {
        position: 'absolute',
        height: '100%',
        borderRadius: 2,
    },
    progressAnimatedDot: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        top: -3,
        marginLeft: -5,
        borderWidth: 2,
        borderColor: '#1E1E1E',
    },
    // Progress Bar
    progressBarSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    progressBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#2A2A2A',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressPercentage: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fff',
        minWidth: 35,
    },
    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#252525',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 5,
    },
    statText: {
        fontSize: 12,
        color: '#aaa',
        fontWeight: '600',
    },
    // Milestones
    milestonesSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#252525',
    },
    milestonesText: {
        fontSize: 12,
        color: '#aaa',
        fontWeight: '600',
    },
    milestonesDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    milestoneDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2A2A2A',
    },
    milestonesMore: {
        fontSize: 10,
        color: '#666',
        fontWeight: 'bold',
        marginLeft: 2,
    },
    // Actions
    skillActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    practiceButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 11,
        borderRadius: 12,
        gap: 6,
    },
    practiceButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    menuButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#252525',
        borderRadius: 12,
    },
    // Menu Dropdown
    menuDropdown: {
        position: 'absolute',
        top: 60,
        right: 18,
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        gap: 10,
    },
    menuItemText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#333',
    },
});

export default AddScreen;
