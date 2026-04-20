import React, { useContext } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkillContext } from '../context/SkillContext';
import { Ionicons } from '@expo/vector-icons';
import DeleteButton from '../../../shared/components/DeleteButton';
import { useNavigation } from '@react-navigation/native';

export default function SkillListScreen() {
    const navigation = useNavigation();
    const { skills, deleteSkill, clearAllSkills } = useContext(SkillContext);

    const handleClearAll = () => {
        if (skills.length === 0) return;

        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to delete ALL skills? This action cannot be undone.")) {
                clearAllSkills();
            }
        } else {
            Alert.alert(
                "Clear All Skills",
                "Are you sure you want to delete ALL skills? This action cannot be undone.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Clear All", style: "destructive", onPress: clearAllSkills }
                ]
            );
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity
                onPress={() => navigation.navigate('SkillDetail', { skillId: item.id })}
                activeOpacity={0.8}
                style={styles.cardSurface}
            >
                <View style={styles.cardGradient}>
                    <View style={styles.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Text style={styles.skillName}>{item.name}</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{item.category}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <Text style={styles.levelText}>Lvl {item.level}</Text>
                        <Text style={styles.targetText}>Target: {item.targetLevel}</Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${item.level}%` }]} />
                    </View>

                    <View style={styles.footerRow}>
                        <Ionicons name="time-outline" size={14} color="#888" />
                        <Text style={styles.timeText}>{Math.floor(item.timeSpent / 60)}h {item.timeSpent % 60}m spent</Text>
                    </View>
                </View>
            </TouchableOpacity>
            <View style={styles.deleteOverlay}>
                <DeleteButton
                    onDelete={() => deleteSkill(item.id)}
                    itemType="Skill"
                    color="#FF453A"
                    size={24}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Skill Progression</Text>
                {skills.length > 0 && (
                    <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={skills}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="folder-open-outline" size={64} color="#333" />
                        <Text style={styles.emptyText}>No skills tracked</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddEditSkill')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 20,
        marginTop: 10,
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 20,
        marginBottom: 20,
    },
    clearButton: {
        marginTop: 10,
    },
    clearButtonText: {
        color: '#FF453A',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#10a37f',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#666',
        fontSize: 18,
        marginTop: 10,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for FAB
    },
    card: {
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    cardSurface: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
    },
    cardGradient: {
        padding: 12,
        backgroundColor: '#1a1a1a',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingRight: 40, // Space for delete button
    },
    deleteOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        elevation: 10,
    },
    skillName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 10,
    },
    badge: {
        backgroundColor: '#10a37f',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    levelText: {
        color: '#30D158',
        fontWeight: 'bold',
    },
    targetText: {
        color: '#888',
        fontSize: 12,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        marginBottom: 12,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#30D158',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        color: '#888',
        fontSize: 12,
        marginLeft: 4,
    }
});
