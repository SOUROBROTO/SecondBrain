import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Greeting from './Greeting';
import FocusCard from './FocusCard';
import ProgressRing from './ProgressRing';
import TodoList from './TodoList';
import ReminderCard from './ReminderCard';
import FloatingAddButton from './FloatingAddButton';

export default function Dashboard() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Greeting />
                <FocusCard />
                <ProgressRing />
                <TodoList />
                <ReminderCard />
                <View style={styles.sectionSpacer} />
            </ScrollView>
            <FloatingAddButton />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100, // Space for FAB
    },
    sectionSpacer: {
        height: 20,
    },
});
