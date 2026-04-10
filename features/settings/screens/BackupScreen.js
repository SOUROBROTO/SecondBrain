import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { shareBackupFile, importData, createAutoBackup, listAutoBackups, restoreAutoBackup } from '../../../shared/utils/dataBackup';

export default function BackupScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [autoBackups, setAutoBackups] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadBackups();
    }, []);

    const loadBackups = async () => {
        const { success, backups } = await listAutoBackups();
        if (success) {
            setAutoBackups(backups);
            // Calculate total items from most recent backup
            if (backups.length > 0) {
                const latest = backups[0];
                const total = Object.values(latest.itemCount).reduce((sum, count) => sum + count, 0);
                setStats({ ...latest.itemCount, total });
            }
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const result = await shareBackupFile();
            if (result.success) {
                Alert.alert(
                    'Export Successful',
                    'Your data has been exported. You can now share or save the file.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Export Failed', result.error || 'Could not export data');
            }
        } catch (error) {
            Alert.alert('Export Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.type === 'cancel') return;

            Alert.alert(
                'Import Data',
                'How would you like to import this data?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Merge',
                        onPress: () => performImport(result.uri, true)
                    },
                    {
                        text: 'Replace',
                        style: 'destructive',
                        onPress: () => performImport(result.uri, false)
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Import Failed', error.message);
        }
    };

    const performImport = async (uri, merge) => {
        setLoading(true);
        try {
            // Read file content
            const response = await fetch(uri);
            const jsonData = await response.text();

            const result = await importData(jsonData, { merge });

            if (result.success) {
                const { imported } = result;
                Alert.alert(
                    'Import Successful',
                    `Imported:\n${imported.tasks} tasks\n${imported.habits} habits\n${imported.skills} skills\n${imported.plannerBlocks} planner blocks\n${imported.journalEntries} journal entries`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                Alert.alert('Import Failed', result.error);
            }
        } catch (error) {
            Alert.alert('Import Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        setLoading(true);
        const result = await createAutoBackup();
        setLoading(false);

        if (result.success) {
            Alert.alert('Backup Created', 'Auto-backup created successfully');
            loadBackups();
        } else {
            Alert.alert('Backup Failed', result.error);
        }
    };

    const handleRestoreBackup = (backup) => {
        Alert.alert(
            'Restore Backup',
            `Restore backup from ${backup.date.toLocaleString()}?\n\nThis will replace all current data.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        const result = await restoreAutoBackup(backup.key);
                        setLoading(false);

                        if (result.success) {
                            Alert.alert(
                                'Restore Successful',
                                'Your data has been restored. Please restart the app.',
                                [{ text: 'OK', onPress: () => navigation.goBack() }]
                            );
                        } else {
                            Alert.alert('Restore Failed', result.error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Data & Backup</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Data Statistics */}
                {stats && (
                    <View style={styles.statsCard}>
                        <Text style={styles.cardTitle}>Your Data</Text>
                        <View style={styles.statsGrid}>
                            <StatItem icon="list" label="Tasks" value={stats.tasks} />
                            <StatItem icon="repeat" label="Habits" value={stats.habits} />
                            <StatItem icon="school" label="Skills" value={stats.skills} />
                            <StatItem icon="calendar" label="Planner" value={stats.plannerBlocks} />
                            <StatItem icon="book" label="Journal" value={stats.journalEntries} />
                            <View style={styles.statItem}>
                                <Ionicons name="apps" size={24} color="#4c669f" />
                                <Text style={styles.statValue}>{stats.total}</Text>
                                <Text style={styles.statLabel}>Total Items</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Export/Import Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Backup Management</Text>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleExport}
                        disabled={loading}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="share-outline" size={24} color="#4c669f" />
                            <View style={styles.buttonText}>
                                <Text style={styles.buttonTitle}>Export Data</Text>
                                <Text style={styles.buttonSubtitle}>Save and share your data as JSON file</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleImport}
                        disabled={loading}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="download-outline" size={24} color="#30D158" />
                            <View style={styles.buttonText}>
                                <Text style={styles.buttonTitle}>Import Data</Text>
                                <Text style={styles.buttonSubtitle}>Restore from a backup file</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleCreateBackup}
                        disabled={loading}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="save-outline" size={24} color="#FF9F0A" />
                            <View style={styles.buttonText}>
                                <Text style={styles.buttonTitle}>Create Backup</Text>
                                <Text style={styles.buttonSubtitle}>Save current state to auto-backup</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Auto Backups */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Auto Backups (Last 3)</Text>
                    {autoBackups.length === 0 ? (
                        <Text style={styles.emptyText}>No auto-backups yet</Text>
                    ) : (
                        autoBackups.map((backup, index) => (
                            <TouchableOpacity
                                key={backup.key}
                                style={styles.backupItem}
                                onPress={() => handleRestoreBackup(backup)}
                            >
                                <View>
                                    <Text style={styles.backupDate}>
                                        {backup.date.toLocaleDateString()} {backup.date.toLocaleTimeString()}
                                    </Text>
                                    <Text style={styles.backupInfo}>
                                        {backup.itemCount.tasks + backup.itemCount.habits + backup.itemCount.skills + backup.itemCount.plannerBlocks + backup.itemCount.journalEntries} items
                                    </Text>
                                </View>
                                <Ionicons name="refresh" size={20} color="#4c669f" />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Warning */}
                <View style={styles.warningBox}>
                    <Ionicons name="information-circle" size={20} color="#FF9F0A" />
                    <Text style={styles.warningText}>
                        Auto-backups are stored locally. Export your data regularly to keep an external copy.
                    </Text>
                </View>
            </ScrollView>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#4c669f" />
                </View>
            )}
        </SafeAreaView>
    );
}

function StatItem({ icon, label, value }) {
    return (
        <View style={styles.statItem}>
            <Ionicons name={icon} size={24} color="#4c669f" />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    statsCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        width: '30%',
        marginBottom: 15,
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 5,
    },
    statLabel: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#888',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    buttonText: {
        marginLeft: 15,
        flex: 1,
    },
    buttonTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonSubtitle: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    backupItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 10,
        marginBottom: 8,
    },
    backupDate: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    backupInfo: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
        paddingVertical: 20,
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 159, 10, 0.1)',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FF9F0A',
        marginTop: 10,
    },
    warningText: {
        color: '#FF9F0A',
        fontSize: 12,
        marginLeft: 10,
        flex: 1,
        lineHeight: 18,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
