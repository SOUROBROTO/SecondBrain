import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Alert,
    Modal,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkillContext } from '../context/SkillContext';

const LEARNING_METHODS = [
    { id: 'video', label: 'Video', icon: '📹' },
    { id: 'book', label: 'Book', icon: '📚' },
    { id: 'practice', label: 'Practice', icon: '⚡' },
    { id: 'course', label: 'Course', icon: '🎓' },
    { id: 'notes', label: 'Notes', icon: '📝' }
];

export default function LogSessionScreen({ navigation, route }) {
    const { skillId } = route.params;
    const { skills, logSession, clearSkillHistory, updateSessionLog, deleteSessionLog, restoreSkillData } = useContext(SkillContext);

    const skill = skills.find(s => s.id === skillId);

    // Form state
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedMilestones, setSelectedMilestones] = useState([]);
    const [learningMethodsData, setLearningMethodsData] = useState({});

    // Modal states
    const [methodModalVisible, setMethodModalVisible] = useState(false);
    const [currentMethod, setCurrentMethod] = useState(null);
    const [editingLogId, setEditingLogId] = useState(null); // Track which log is being edited
    const [methodDetails, setMethodDetails] = useState({
        videoUrl: '',
        bookName: '',
        bookPage: '',
        courseName: '',
        practiceNotes: ''
    });

    // Bottom sheet state
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    // Undo state
    const [deletedLog, setDeletedLog] = useState(null);
    const [clearedData, setClearedData] = useState(null); // For Clear All undo
    const [undoTimeout, setUndoTimeout] = useState(null);

    if (!skill) {
        navigation.goBack();
        return null;
    }

    // Get uncompleted milestones
    const uncompletedMilestones = skill.milestones?.filter(m => !m.completed) || [];

    // Filter learning methods to show only those selected in skill settings
    const availableMethods = LEARNING_METHODS.filter(method =>
        skill.learningMethods && skill.learningMethods.includes(method.id)
    );

    // Format total time display
    const formatTotalTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const totalTime = skill.timeSpent || 0;
    const currentLevel = skill.level || 0;

    // Toggle milestone selection
    const toggleMilestone = (milestoneId) => {
        setSelectedMilestones(prev =>
            prev.includes(milestoneId)
                ? prev.filter(id => id !== milestoneId)
                : [...prev, milestoneId]
        );
    };

    // Open method modal
    const openMethodModal = (methodId) => {
        setCurrentMethod(methodId);
        // Load existing data if any
        if (learningMethodsData[methodId]) {
            setMethodDetails(learningMethodsData[methodId]);
        } else {
            setMethodDetails({
                videoUrl: '',
                bookName: '',
                bookPage: '',
                courseName: '',
                practiceNotes: ''
            });
        }
        setMethodModalVisible(true);
    };

    // Save method details
    const saveMethodDetails = () => {
        if (currentMethod === 'video' && !methodDetails.videoUrl.trim()) {
            Alert.alert('Required', 'Please enter a video URL');
            return;
        }
        if (currentMethod === 'book' && (!methodDetails.bookName.trim() || !methodDetails.bookPage.trim())) {
            Alert.alert('Required', 'Please enter book name and page number');
            return;
        }
        if (currentMethod === 'course' && !methodDetails.courseName.trim()) {
            Alert.alert('Required', 'Please enter course name');
            return;
        }
        if ((currentMethod === 'practice' || currentMethod === 'notes') && !methodDetails.practiceNotes.trim()) {
            Alert.alert('Required', 'Please enter notes');
            return;
        }

        // If editing an existing log
        if (editingLogId && selectedLog) {
            const updatedMethods = {
                ...selectedLog.learningMethods,
                [currentMethod]: { ...methodDetails }
            };
            updateSessionLog(skillId, editingLogId, updatedMethods);
            // Update selectedLog to refresh the bottom sheet
            setSelectedLog({ ...selectedLog, learningMethods: updatedMethods });
            Alert.alert('Success', 'Learning method updated successfully');
        } else {
            // Creating new entry for current session
            setLearningMethodsData(prev => ({
                ...prev,
                [currentMethod]: { ...methodDetails }
            }));
        }

        setMethodModalVisible(false);
        setEditingLogId(null);
    };

    // Remove method
    const removeMethod = (methodId) => {
        const newData = { ...learningMethodsData };
        delete newData[methodId];
        setLearningMethodsData(newData);
    };

    // Get selected methods list
    const selectedMethods = Object.keys(learningMethodsData);

    // Handle log activity
    const handleLogActivity = () => {
        if (!duration.trim() || isNaN(duration) || parseInt(duration) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid duration in minutes');
            return;
        }

        const durationNum = parseInt(duration);

        logSession(skillId, durationNum, notes.trim(), selectedMilestones, learningMethodsData);

        // Reset form
        setDuration('');
        setNotes('');
        setSelectedMilestones([]);
        setLearningMethodsData({});

        // Show success message
        Alert.alert(
            'Session Logged!',
            `Great work! You practiced for ${durationNum} minutes.`,
            [{ text: 'OK' }]
        );
    };

    // Handle clear all history
    const handleClearAll = () => {
        Alert.alert(
            'Clear All History',
            'Are you sure you want to clear all session history? You can undo this action within 5 seconds.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: () => {
                        // Clear any existing timeout
                        if (undoTimeout) {
                            clearTimeout(undoTimeout);
                        }

                        // Store current data for undo (deep copy to avoid reference issues)
                        setClearedData({
                            logs: JSON.parse(JSON.stringify(skill.logs || [])),
                            timeSpent: skill.timeSpent,
                            level: skill.level,
                            milestones: JSON.parse(JSON.stringify(skill.milestones || []))
                        });

                        // Clear the history
                        clearSkillHistory(skillId);

                        // Clear deletedLog state to avoid confusion
                        setDeletedLog(null);

                        // Set timeout to clear undo data after 5 seconds
                        const timeout = setTimeout(() => {
                            setClearedData(null);
                        }, 5000);
                        setUndoTimeout(timeout);
                    }
                }
            ]
        );
    };

    // Open bottom sheet with log details
    const openLogDetails = (log) => {
        setSelectedLog(log);
        setBottomSheetVisible(true);
    };

    // Handle delete log with undo
    const handleDeleteLog = (log) => {
        // Clear any existing timeout
        if (undoTimeout) {
            clearTimeout(undoTimeout);
        }

        // Delete the log
        deleteSessionLog(skillId, log.id);

        // Store deleted log for undo
        setDeletedLog(log);

        // Set timeout to clear deleted log after 5 seconds
        const timeout = setTimeout(() => {
            setDeletedLog(null);
        }, 5000);
        setUndoTimeout(timeout);

        // Close bottom sheet if it's open
        if (bottomSheetVisible) {
            setBottomSheetVisible(false);
        }
    };

    // Handle undo delete
    const handleUndoDelete = () => {
        // Clear the timeout
        if (undoTimeout) {
            clearTimeout(undoTimeout);
        }

        if (clearedData) {
            // Restore all cleared data using dedicated restore function
            restoreSkillData(skillId, clearedData);

            // Clear state
            setClearedData(null);
            setUndoTimeout(null);
        } else if (deletedLog) {
            // Re-add the single deleted log
            logSession(skillId, deletedLog.duration, deletedLog.note, deletedLog.completedMilestones || [], deletedLog.learningMethods || {});

            // Clear deleted log state
            setDeletedLog(null);
            setUndoTimeout(null);
        }
    };

    // Get milestone text by ID
    const getMilestoneText = (milestoneId) => {
        const milestone = skill.milestones?.find(m => m.id === milestoneId);
        return milestone ? milestone.text : 'Unknown';
    };

    // Get method label by ID
    const getMethodLabel = (methodId) => {
        const method = LEARNING_METHODS.find(m => m.id === methodId);
        return method ? method.label : methodId;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{skill.name}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddEditSkill', { skillId })}>
                    <Ionicons name="create-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{currentLevel}</Text>
                        <Text style={styles.statLabel}>Current Level</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{formatTotalTime(totalTime)}</Text>
                        <Text style={styles.statLabel}>Total Time</Text>
                    </View>
                </View>

                {/* Log Session Form */}
                <Text style={styles.sectionTitle}>Log Session</Text>

                {/* Duration Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Duration (minutes)"
                    placeholderTextColor="#666"
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                />

                {/* Notes Input */}
                <TextInput
                    style={[styles.input, styles.notesInput]}
                    placeholder="Notes (what did you learn?)"
                    placeholderTextColor="#666"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                />

                {/* How will you learn */}
                <Text style={styles.milestonesTitle}>How will you learn?</Text>
                {availableMethods.length > 0 ? (
                    <View style={styles.methodsContainer}>
                        {availableMethods.map((method) => (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.methodChip,
                                    learningMethodsData[method.id] && styles.methodSelected
                                ]}
                                onPress={() => openMethodModal(method.id)}
                            >
                                <Text style={styles.methodIcon}>{method.icon}</Text>
                                <Text style={styles.methodText}>{method.label}</Text>
                                {learningMethodsData[method.id] && (
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            removeMethod(method.id);
                                        }}
                                        style={styles.removeMethodButton}
                                    >
                                        <Ionicons name="close-circle" size={18} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyMethods}>
                        <Text style={styles.emptyMethodsText}>
                            No learning methods configured. Edit the skill to add learning methods.
                        </Text>
                    </View>
                )}

                {/* Milestones Section */}
                {uncompletedMilestones.length > 0 && (
                    <>
                        <Text style={styles.milestonesTitle}>Mark Milestones Completed</Text>
                        <View style={styles.milestonesContainer}>
                            {uncompletedMilestones.map((milestone) => (
                                <TouchableOpacity
                                    key={milestone.id}
                                    style={[
                                        styles.milestoneItem,
                                        selectedMilestones.includes(milestone.id) && styles.milestoneSelected
                                    ]}
                                    onPress={() => toggleMilestone(milestone.id)}
                                >
                                    <View style={[
                                        styles.milestoneCheckbox,
                                        selectedMilestones.includes(milestone.id) && styles.milestoneCheckboxSelected
                                    ]}>
                                        {selectedMilestones.includes(milestone.id) && (
                                            <Ionicons name="checkmark" size={18} color="#fff" />
                                        )}
                                    </View>
                                    <Text style={styles.milestoneText}>{milestone.text}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* Log Activity Button */}
                <TouchableOpacity style={styles.logButton} onPress={handleLogActivity}>
                    <Text style={styles.logButtonText}>Log Activity</Text>
                </TouchableOpacity>

                {/* Recent History Section */}
                <View style={styles.historyHeaderRow}>
                    <Text style={styles.sectionTitle}>Recent History</Text>
                    {skill.logs && skill.logs.length > 0 && (
                        <TouchableOpacity onPress={handleClearAll}>
                            <Text style={styles.clearAllButton}>Clear All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {skill.logs && skill.logs.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.historyScroll}
                    >
                        {skill.logs.slice(0, 10).map((log) => (
                            <View key={log.id} style={styles.historyCardWrapper}>
                                <TouchableOpacity
                                    style={styles.historyCard}
                                    onPress={() => openLogDetails(log)}
                                >
                                    <Text style={styles.historyDate}>
                                        {new Date(log.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                    <Text style={styles.historyDuration}>{log.duration} mins</Text>
                                    {log.note && (
                                        <Text style={styles.historyNotes} numberOfLines={2}>
                                            {log.note}
                                        </Text>
                                    )}
                                    {log.completedMilestones && log.completedMilestones.length > 0 && (
                                        <View style={styles.historyMilestones}>
                                            <Ionicons name="checkmark-circle" size={14} color="#30D158" />
                                            <Text style={styles.historyMilestonesText}>
                                                {log.completedMilestones.length} milestone
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteLog(log)}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.emptyHistory}>
                        <Ionicons name="time-outline" size={48} color="#444" />
                        <Text style={styles.emptyHistoryText}>No sessions logged yet</Text>
                        <Text style={styles.emptyHistorySubtext}>Start practicing to build your history!</Text>
                    </View>
                )}
            </ScrollView>

            {/* Undo Notification Banner */}
            {(deletedLog || clearedData) && (
                <View style={styles.undoBanner}>
                    <View style={styles.undoContent}>
                        <Ionicons name="checkmark-circle" size={20} color="#30D158" />
                        <Text style={styles.undoText}>
                            {clearedData ? 'All sessions cleared' : 'Session deleted'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleUndoDelete} style={styles.undoButton}>
                        <Text style={styles.undoButtonText}>UNDO</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Method Details Modal */}
            <Modal
                visible={methodModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setMethodModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.methodModal}>
                        <Text style={styles.methodModalTitle}>
                            {currentMethod && getMethodLabel(currentMethod)} Details
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {currentMethod === 'video' && (
                                <View>
                                    <Text style={styles.inputLabel}>Video URL/Link</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        placeholderTextColor="#666"
                                        value={methodDetails.videoUrl}
                                        onChangeText={(text) => setMethodDetails(prev => ({ ...prev, videoUrl: text }))}
                                    />
                                </View>
                            )}

                            {currentMethod === 'book' && (
                                <View>
                                    <Text style={styles.inputLabel}>Book Name</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Enter book name"
                                        placeholderTextColor="#666"
                                        value={methodDetails.bookName}
                                        onChangeText={(text) => setMethodDetails(prev => ({ ...prev, bookName: text }))}
                                    />
                                    <Text style={styles.inputLabel}>Page Number</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="e.g., 45-52"
                                        placeholderTextColor="#666"
                                        value={methodDetails.bookPage}
                                        onChangeText={(text) => setMethodDetails(prev => ({ ...prev, bookPage: text }))}
                                    />
                                </View>
                            )}

                            {currentMethod === 'course' && (
                                <View>
                                    <Text style={styles.inputLabel}>Course Name</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Enter course name"
                                        placeholderTextColor="#666"
                                        value={methodDetails.courseName}
                                        onChangeText={(text) => setMethodDetails(prev => ({ ...prev, courseName: text }))}
                                    />
                                </View>
                            )}

                            {(currentMethod === 'practice' || currentMethod === 'notes') && (
                                <View>
                                    <Text style={styles.inputLabel}>Notes</Text>
                                    <TextInput
                                        style={[styles.modalInput, styles.modalTextArea]}
                                        placeholder="What did you practice/note down?"
                                        placeholderTextColor="#666"
                                        value={methodDetails.practiceNotes}
                                        onChangeText={(text) => setMethodDetails(prev => ({ ...prev, practiceNotes: text }))}
                                        multiline
                                        numberOfLines={6}
                                        textAlignVertical="top"
                                    />
                                </View>
                            )}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setMethodModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={saveMethodDetails}
                                >
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Bottom Sheet for Log Details */}
            <Modal
                visible={bottomSheetVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setBottomSheetVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setBottomSheetVisible(false)}
                >
                    <View style={styles.bottomSheet}>
                        <View style={styles.bottomSheetHandle} />

                        {selectedLog && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.bottomSheetTitle}>Session Details</Text>

                                {/* Date and Duration */}
                                <View style={styles.detailRow}>
                                    <Ionicons name="calendar" size={20} color="#888" />
                                    <Text style={styles.detailLabel}>Date:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(selectedLog.date).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="time" size={20} color="#888" />
                                    <Text style={styles.detailLabel}>Duration:</Text>
                                    <Text style={styles.detailValue}>{selectedLog.duration} minutes</Text>
                                </View>

                                {/* Notes */}
                                {selectedLog.note && (
                                    <View style={styles.detailSection}>
                                        <View style={styles.detailRow}>
                                            <Ionicons name="document-text" size={20} color="#888" />
                                            <Text style={styles.detailLabel}>Notes:</Text>
                                        </View>
                                        <Text style={styles.detailNotes}>{selectedLog.note}</Text>
                                    </View>
                                )}

                                {/* Learning Methods Details */}
                                {selectedLog.learningMethods && Object.keys(selectedLog.learningMethods).length > 0 && (
                                    <View style={styles.detailSection}>
                                        <View style={styles.detailRow}>
                                            <Ionicons name="school" size={20} color="#888" />
                                            <Text style={styles.detailLabel}>How you learned:</Text>
                                        </View>
                                        {Object.entries(selectedLog.learningMethods).map(([methodId, details]) => (
                                            <TouchableOpacity
                                                key={methodId}
                                                style={styles.methodDetailCard}
                                                onPress={() => {
                                                    // Open modal with existing data for editing
                                                    setEditingLogId(selectedLog.id);
                                                    setCurrentMethod(methodId);
                                                    setMethodDetails(details);
                                                    setMethodModalVisible(true);
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.methodDetailHeader}>
                                                    <Text style={styles.methodDetailTitle}>
                                                        {getMethodLabel(methodId)}
                                                    </Text>
                                                    <Ionicons name="pencil" size={16} color="#888" />
                                                </View>
                                                {methodId === 'video' && details.videoUrl && (
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            e.stopPropagation();
                                                            Linking.openURL(details.videoUrl).catch(() => {
                                                                Alert.alert('Error', 'Unable to open URL');
                                                            });
                                                        }}
                                                    >
                                                        <Text style={[styles.methodDetailText, styles.linkText]}>
                                                            🔗 {details.videoUrl}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                                {methodId === 'book' && (details.bookName || details.bookPage) && (
                                                    <>
                                                        {details.bookName && (
                                                            <Text style={styles.methodDetailText}>
                                                                Book: {details.bookName}
                                                            </Text>
                                                        )}
                                                        {details.bookPage && (
                                                            <Text style={styles.methodDetailText}>
                                                                Pages: {details.bookPage}
                                                            </Text>
                                                        )}
                                                    </>
                                                )}
                                                {methodId === 'course' && details.courseName && (
                                                    <Text style={styles.methodDetailText}>
                                                        Course: {details.courseName}
                                                    </Text>
                                                )}
                                                {(methodId === 'practice' || methodId === 'notes') && details.practiceNotes && (
                                                    <Text style={styles.methodDetailText}>
                                                        {details.practiceNotes}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* Completed Milestones */}
                                {selectedLog.completedMilestones && selectedLog.completedMilestones.length > 0 && (
                                    <View style={styles.detailSection}>
                                        <View style={styles.detailRow}>
                                            <Ionicons name="checkmark-circle" size={20} color="#30D158" />
                                            <Text style={styles.detailLabel}>Milestones Completed:</Text>
                                        </View>
                                        {selectedLog.completedMilestones.map((milestoneId) => (
                                            <View key={milestoneId} style={styles.milestoneDetail}>
                                                <Ionicons name="checkmark" size={16} color="#30D158" />
                                                <Text style={styles.milestoneDetailText}>
                                                    {getMilestoneText(milestoneId)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Action Buttons */}
                                <View style={styles.bottomSheetActions}>
                                    <TouchableOpacity
                                        style={styles.deleteSessionButton}
                                        onPress={() => {
                                            Alert.alert(
                                                'Delete Session',
                                                'Are you sure you want to delete this session? You can undo this action within 5 seconds.',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Delete',
                                                        style: 'destructive',
                                                        onPress: () => handleDeleteLog(selectedLog)
                                                    }
                                                ]
                                            );
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                        <Text style={styles.deleteSessionButtonText}>Delete Session</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setBottomSheetVisible(false)}
                                    >
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    // Stats Section
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Form Section
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
        marginTop: 8,
    },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    notesInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    // Learning Methods
    methodsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
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
        gap: 6,
    },
    methodSelected: {
        backgroundColor: '#2C2C2E',
        borderColor: '#4A90E2',
    },
    methodIcon: {
        fontSize: 16,
    },
    methodText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    removeMethodButton: {
        marginLeft: 4,
    },
    emptyMethods: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2C2C2E',
        marginBottom: 24,
    },
    emptyMethodsText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    milestonesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    milestonesContainer: {
        marginBottom: 24,
    },
    milestoneItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    milestoneSelected: {
        backgroundColor: '#2C2C2E',
        borderColor: '#4A90E2',
    },
    milestoneCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#444',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    milestoneCheckboxSelected: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    milestoneText: {
        flex: 1,
        fontSize: 15,
        color: '#fff',
    },
    logButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 32,
    },
    logButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    historyHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    clearAllButton: {
        fontSize: 14,
        color: '#FF3B30',
        fontWeight: '600',
    },
    historyScroll: {
        marginBottom: 20,
    },
    historyCardWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    historyCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2C2C2E',
        width: 180,
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#2C2C2E',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    historyDate: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
        marginBottom: 8,
    },
    historyDuration: {
        fontSize: 24,
        color: '#4A90E2',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    historyNotes: {
        fontSize: 13,
        color: '#aaa',
        lineHeight: 18,
        marginBottom: 8,
    },
    historyMilestones: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    historyMilestonesText: {
        fontSize: 11,
        color: '#30D158',
        fontWeight: '600',
    },
    emptyHistory: {
        alignItems: 'center',
        padding: 40,
    },
    emptyHistoryText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
        marginTop: 16,
    },
    emptyHistorySubtext: {
        fontSize: 14,
        color: '#444',
        marginTop: 8,
    },
    // Undo Banner
    undoBanner: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    undoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    undoText: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '600',
    },
    undoButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    undoButtonText: {
        fontSize: 14,
        color: '#4A90E2',
        fontWeight: 'bold',
    },
    // Method Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    methodModal: {
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        maxHeight: '70%',
    },
    methodModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
        marginTop: 12,
        fontWeight: '600',
    },
    modalInput: {
        backgroundColor: '#2C2C2E',
        color: '#fff',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    modalTextArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    modalButton: {
        flex: 1,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#2C2C2E',
    },
    saveButton: {
        backgroundColor: '#4A90E2',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    // Bottom Sheet
    bottomSheet: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        maxHeight: '80%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    bottomSheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    bottomSheetTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    detailSection: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    detailLabel: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 14,
        color: '#fff',
        flex: 1,
    },
    detailNotes: {
        fontSize: 15,
        color: '#fff',
        lineHeight: 22,
        marginLeft: 30,
    },
    methodDetailCard: {
        backgroundColor: '#2C2C2E',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        marginLeft: 30,
        borderWidth: 1,
        borderColor: '#4A90E2',
    },
    methodDetailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    methodDetailTitle: {
        fontSize: 15,
        color: '#4A90E2',
        fontWeight: 'bold',
    },
    methodDetailText: {
        fontSize: 14,
        color: '#fff',
        lineHeight: 20,
        marginBottom: 4,
    },
    linkText: {
        color: '#5AC8FA',
        textDecorationLine: 'underline',
    },
    milestoneDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        marginLeft: 30,
    },
    milestoneDetailText: {
        fontSize: 14,
        color: '#fff',
    },
    bottomSheetActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    deleteSessionButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    deleteSessionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    closeButton: {
        flex: 1,
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
