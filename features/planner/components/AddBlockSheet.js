import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Modal,
    Animated, Dimensions, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BLOCK_META } from './PlannerBlockItem';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BLOCK_OPTIONS = [
    {
        type: 'task',
        title: 'Task Block',
        desc: 'Schedule a task with time',
        icon: 'checkmark-circle-outline',
    },
    {
        type: 'habit',
        title: 'Habit Block',
        desc: 'Track a habit session',
        icon: 'repeat',
    },
    {
        type: 'skill',
        title: 'Skill Block',
        desc: 'Practice session',
        icon: 'trophy-outline',
    },
    {
        type: 'text',
        title: 'Text Note',
        desc: 'Free-form writing',
        icon: 'document-text-outline',
    },
    {
        type: 'checklist',
        title: 'Checklist',
        desc: 'Sub-tasks & to-dos',
        icon: 'list-outline',
    },
    {
        type: 'toggle',
        title: 'Toggle',
        desc: 'Collapsible content',
        icon: 'chevron-forward-circle-outline',
    },
    {
        type: 'divider',
        title: 'Divider',
        desc: 'Visual separator',
        icon: 'remove-outline',
    },
];

export default function AddBlockSheet({ visible, onClose, onSelectType }) {
    const slideAnim = useRef(new Animated.Value(400)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 400,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleSelect = (type) => {
        onClose();
        setTimeout(() => onSelectType(type), 150);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
                <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                    {/* Handle */}
                    <View style={styles.handleBar} />

                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Add Block</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sheetSubtitle}>Choose a block type to add to your daily page</Text>

                    <ScrollView contentContainerStyle={styles.optionsList} showsVerticalScrollIndicator={false}>
                        {BLOCK_OPTIONS.map((opt) => {
                            const meta = BLOCK_META[opt.type] || BLOCK_META.task;
                            return (
                                <TouchableOpacity
                                    key={opt.type}
                                    style={[styles.optionItem, { borderColor: meta.border }]}
                                    onPress={() => handleSelect(opt.type)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.optionIcon, { backgroundColor: meta.accent }]}>
                                        <Ionicons name={opt.icon} size={20} color="#fff" />
                                    </View>
                                    <View style={styles.optionText}>
                                        <Text style={styles.optionTitle}>{opt.title}</Text>
                                        <Text style={styles.optionDesc}>{opt.desc}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color="#444" />
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#171717',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingBottom: 40,
        maxHeight: SCREEN_HEIGHT * 0.75,
        borderTopWidth: 1,
        borderTopColor: 'rgba(249,249,249,0.08)',
    },
    handleBar: {
        width: 36,
        height: 3,
        backgroundColor: 'rgba(249,249,249,0.15)',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,
    },
    sheetTitle: {
        color: '#F9F9F9',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(249,249,249,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(249,249,249,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetSubtitle: {
        color: '#444444',
        fontSize: 12,
        paddingHorizontal: 20,
        marginBottom: 16,
        letterSpacing: 0.2,
    },
    optionsList: {
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(249,249,249,0.06)',
        gap: 14,
    },
    optionIcon: {
        width: 42,
        height: 42,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        flex: 1,
    },
    optionTitle: {
        color: '#F9F9F9',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    optionDesc: {
        color: '#444444',
        fontSize: 12,
    },
});
