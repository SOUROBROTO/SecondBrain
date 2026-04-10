import React, { useContext } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings } from 'lucide-react-native';
import { TaskContext } from '../context/TaskContext';
import { HabitContext } from '../context/HabitContext';
import Greeting from '../components/Greeting';
import FocusCard from '../components/FocusCard';
import ProgressRing from '../components/ProgressRing';
import TodoList from '../components/TodoList';
import ReminderCard from '../components/ReminderCard';
import FloatingAddButton from '../components/FloatingAddButton';
import { useTheme } from '../utils/theme';

export default function DashboardScreen({ navigation }) {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    const { tasks } = useContext(TaskContext);
    const { habits } = useContext(HabitContext);

    return (
        <SafeAreaView style={s.root}>
            {/* Top bar */}
            <View style={s.topBar}>
                <Greeting />
                <TouchableOpacity style={s.settingsBtn} onPress={() => navigation.navigate('Settings')}>
                    <Settings size={18} color={C.textSub} strokeWidth={1.5} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <FocusCard />
                <ProgressRing tasks={tasks} habits={habits} />
                <TodoList tasks={tasks} />
                <ReminderCard />
                <View style={{ height: 90 }} />
            </ScrollView>

            <FloatingAddButton />
        </SafeAreaView>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    root: { flex: 1, backgroundColor: C.black },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: S.xl,
        paddingTop: S.lg,
        paddingBottom: S.lg,
    },
    settingsBtn: {
        width: 36,
        height: 36,
        borderRadius: R.md,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        paddingHorizontal: S.xl,
        paddingTop: S.sm,
    },
});
