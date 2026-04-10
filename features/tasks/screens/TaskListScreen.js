import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2 } from 'lucide-react-native';
import { TaskContext } from '../context/TaskContext';
import TaskItem from '../components/TaskItem';
import { useTheme } from '../../../shared/utils/theme';

export default function TaskListScreen({ navigation }) {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    const { tasks, toggleTask, deleteTask, clearAllTasks } = useContext(TaskContext);
    const done = tasks.filter(t => t.completed).length;

    const handleEdit = (task) => navigation.navigate('AddEditTask', { taskId: task.id });

    const handleDelete = (id) => {
        if (Platform.OS === 'web') {
            if (window.confirm('Delete this task?')) deleteTask(id);
        } else {
            Alert.alert('Delete Task', 'Remove this task?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteTask(id) },
            ]);
        }
    };

    const handleClearAll = () => {
        if (!tasks.length) return;
        if (Platform.OS === 'web') {
            if (window.confirm('Delete ALL tasks?')) clearAllTasks();
        } else {
            Alert.alert('Clear All', 'Delete all tasks? Cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearAllTasks },
            ]);
        }
    };

    return (
        <SafeAreaView style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={s.headerLabel}>ALL TASKS</Text>
                    <Text style={s.headerTitle}>{done}/{tasks.length} done</Text>
                </View>
                {tasks.length > 0 && (
                    <TouchableOpacity style={s.clearBtn} onPress={handleClearAll}>
                        <Trash2 size={14} color={C.danger} strokeWidth={1.5} />
                        <Text style={s.clearText}>Clear</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={tasks}
                keyExtractor={i => i.id}
                renderItem={({ item }) => (
                    <TaskItem task={item} onToggle={toggleTask} onEdit={handleEdit} onDelete={handleDelete} />
                )}
                contentContainerStyle={s.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={s.empty}>
                        <View style={s.emptyIcon}><Text style={{ fontSize: 32 }}>✓</Text></View>
                        <Text style={s.emptyTitle}>No tasks</Text>
                        <Text style={s.emptySub}>Tap + to add your first task</Text>
                    </View>
                }
            />

            <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AddEditTask')} activeOpacity={0.85}>
                <Plus size={22} color={C.black} strokeWidth={2} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    root: { flex: 1, backgroundColor: C.black },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: S.xl,
        paddingTop: S.lg,
        paddingBottom: S.lg,
    },
    headerLabel: { ...T.cap, marginBottom: 4 },
    headerTitle: { ...T.h2 },
    clearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: S.xs,
        paddingHorizontal: S.md,
        paddingVertical: S.sm,
        borderRadius: R.round,
        borderWidth: 1,
        borderColor: 'rgba(255,68,68,0.25)',
        backgroundColor: C.dangerBg,
    },
    clearText: { ...T.label, color: C.danger },
    list: { paddingHorizontal: S.xl, paddingBottom: 100 },
    empty: { alignItems: 'center', marginTop: 80, gap: S.md },
    emptyIcon: {
        width: 72, height: 72, borderRadius: 20,
        backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    emptyTitle: { ...T.h4 },
    emptySub: { ...T.bodySm },
    fab: {
        position: 'absolute', bottom: 28, right: S.xl,
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: C.white,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: C.white, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12, shadowRadius: 10, elevation: 6,
    },
});
