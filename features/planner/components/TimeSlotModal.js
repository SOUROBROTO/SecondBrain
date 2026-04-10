import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TYPE_COLORS = {
    task: '#4c669f',
    habit: '#30D158',
    skill: '#BF5AF2'
};

const TYPE_ICONS = {
    task: 'checkmark-circle',
    habit: 'repeat',
    skill: 'trophy'
};

const TYPE_EMOJI = {
    task: '☑️',
    habit: '🔁',
    skill: '🎯'
};

export default function TimeSlotModal({ visible, onClose, blocks, onEdit, onDelete, onComplete }) {
    if (!blocks || blocks.length === 0) return null;

    // Get time range from first block
    const firstBlock = blocks[0];
    const formatTime = (isoString) => {
        if (!isoString) return '';
        if (!isoString.includes('T')) return isoString;
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const startTimeStr = formatTime(firstBlock.startTime);
    const endTimeStr = formatTime(firstBlock.endTime);

    const handleDelete = (block) => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${block.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        onDelete(block.id);
                        // Close modal if this was the last item
                        if (blocks.length === 1) {
                            onClose();
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const blockType = item.type || 'task';
        const color = TYPE_COLORS[blockType] || TYPE_COLORS.task;
        const icon = TYPE_ICONS[blockType] || TYPE_ICONS.task;
        const emoji = TYPE_EMOJI[blockType] || TYPE_EMOJI.task;

        return (
            <View style={styles.itemContainer}>
                {/* Color indicator bar */}
                <View style={[styles.colorBar, { backgroundColor: color }]} />

                <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                        <View style={styles.titleRow}>
                            <Text style={styles.emoji}>{emoji}</Text>
                            <View style={styles.titleContainer}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <View style={[styles.typeBadge, { backgroundColor: color }]}>
                                    <Ionicons name={icon} size={10} color="#fff" style={{ marginRight: 3 }} />
                                    <Text style={styles.typeBadgeText}>{blockType.toUpperCase()}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                onEdit(item.id);
                                onClose();
                            }}
                        >
                            <Ionicons name="create-outline" size={20} color="#4c669f" />
                            <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDelete(item)}
                        >
                            <Ionicons name="trash-outline" size={20} color="#FF453A" />
                            <Text style={[styles.actionText, { color: '#FF453A' }]}>Delete</Text>
                        </TouchableOpacity>

                        {blockType === 'task' && onComplete && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => onComplete(item.id)}
                            >
                                <Ionicons name="checkmark-circle-outline" size={20} color="#30D158" />
                                <Text style={[styles.actionText, { color: '#30D158' }]}>Complete</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Ionicons name="time-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
                            <View>
                                <Text style={styles.headerTitle}>Scheduled Items</Text>
                                <Text style={styles.headerSubtitle}>
                                    {startTimeStr} - {endTimeStr}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* List */}
                    <FlatList
                        data={blocks}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#888',
        fontSize: 14,
        marginTop: 2,
    },
    closeButton: {
        padding: 5,
    },
    listContent: {
        padding: 15,
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        overflow: 'hidden',
    },
    colorBar: {
        width: 4,
    },
    itemContent: {
        flex: 1,
        padding: 15,
    },
    itemHeader: {
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    emoji: {
        fontSize: 24,
        marginRight: 10,
    },
    titleContainer: {
        flex: 1,
    },
    itemTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 15,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        gap: 5,
    },
    actionText: {
        color: '#4c669f',
        fontSize: 13,
        fontWeight: '500',
    },
    separator: {
        height: 12,
    },
});
