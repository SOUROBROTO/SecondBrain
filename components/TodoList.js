import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import TaskItem from './TaskItem';
import { TaskContext } from '../context/TaskContext';
import { useTheme } from '../utils/theme';

export default function TodoList({ tasks }) {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    const navigation = useNavigation();
    const { toggleTask, deleteTask } = useContext(TaskContext);

    const display = tasks ? tasks.slice(0, 3) : [];

    const handleEdit = (task) => navigation.navigate('AddEditTask', { taskId: task.id });
    const handleDelete = (id) =>
        Alert.alert('Delete Task', 'Remove this task?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteTask(id) },
        ]);

    return (
        <View style={s.wrap}>
            <View style={s.header}>
                <Text style={s.title}>Tasks</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Tasks')} style={s.seeAll}>
                    <Text style={s.seeAllText}>See all</Text>
                    <ArrowRight size={13} color={C.textSub} strokeWidth={1.5} />
                </TouchableOpacity>
            </View>

            {display.length === 0 ? (
                <View style={s.empty}>
                    <Text style={s.emptyText}>No tasks yet</Text>
                </View>
            ) : (
                display.map(t => (
                    <TaskItem
                        key={t.id}
                        task={t}
                        onToggle={toggleTask}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </View>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    wrap: { marginBottom: S.xl },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: S.md,
    },
    title: { ...T.h5 },
    seeAll: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAllText: { ...T.label },
    empty: {
        paddingVertical: S.xl,
        alignItems: 'center',
    },
    emptyText: { ...T.bodySm },
});
