import React, { useContext, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkillContext } from '../context/SkillContext';
import { Ionicons } from '@expo/vector-icons';

export default function SkillDetailScreen({ route, navigation }) {
    const { skillId } = route.params;
    const { skills, logSession } = useContext(SkillContext);
    const skill = skills.find(s => s.id === skillId);

    const [sessionDuration, setSessionDuration] = useState('');
    const [sessionNote, setSessionNote] = useState('');

    if (!skill) return <View style={styles.container}><Text style={styles.text}>Skill not found</Text></View>;

    const handleLog = () => {
        const duration = parseInt(sessionDuration);
        if (isNaN(duration) || duration <= 0) return;

        logSession(skill.id, duration, sessionNote);
        setSessionDuration('');
        setSessionNote('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{skill.name}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('AddEditSkill', { skillId: skill.id })}>
                    <Ionicons name="pencil" size={24} color="#4c669f" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{skill.level}</Text>
                        <Text style={styles.statLabel}>Current Level</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{Math.floor(skill.timeSpent / 60)}h {skill.timeSpent % 60}m</Text>
                        <Text style={styles.statLabel}>Total Time</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Log Session</Text>
                <View style={styles.logForm}>
                    <TextInput
                        style={styles.input}
                        placeholder="Duration (minutes)"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={sessionDuration}
                        onChangeText={setSessionDuration}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Notes (what did you learn?)"
                        placeholderTextColor="#666"
                        value={sessionNote}
                        onChangeText={setSessionNote}
                    />
                    <TouchableOpacity style={styles.logButton} onPress={handleLog}>
                        <Text style={styles.logButtonText}>Log Activity</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Recent History</Text>
                {skill.logs.map(log => (
                    <View key={log.id} style={styles.logItem}>
                        <View style={styles.logHeader}>
                            <Text style={styles.logDate}>{new Date(log.date).toLocaleDateString()}</Text>
                            <Text style={styles.logDuration}>{log.duration} min</Text>
                        </View>
                        {log.note ? <Text style={styles.logNote}>{log.note}</Text> : null}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    text: { color: '#fff' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        padding: 20,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#333',
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: '#888',
        fontSize: 12,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    logForm: {
        marginBottom: 30,
    },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    logButton: {
        backgroundColor: '#4c669f',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    logItem: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    logDate: {
        color: '#888',
        fontSize: 12,
    },
    logDuration: {
        color: '#30D158',
        fontWeight: 'bold',
    },
    logNote: {
        color: '#ccc',
    },
});
