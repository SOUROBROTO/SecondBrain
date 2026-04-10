import React, { useContext } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { JournalContext } from '../context/JournalContext';
import { Plus, FileText, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../shared/utils/theme';

export default function JournalScreen() {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    const { entries, addPage } = useContext(JournalContext);
    const navigation = useNavigation();

    const handleNewPage = () => {
        const newPage = addPage();
        navigation.navigate('JournalEntry', { entryId: newPage.id });
    };

    const openPage = (id) => {
        navigation.navigate('JournalEntry', { entryId: id });
    };

    return (
        <SafeAreaView style={s.root} edges={['top']}>
            <View style={s.header}>
                <Text style={s.headerTitle}>Journal Pages</Text>
                <TouchableOpacity onPress={handleNewPage} style={s.iconBtn}>
                    <Plus size={24} color={C.text} strokeWidth={1.5} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
            >
                {entries.length === 0 ? (
                    <View style={s.emptyState}>
                        <FileText size={48} color={C.borderStrong} strokeWidth={1} style={{ marginBottom: S.lg }} />
                        <Text style={s.emptyTitle}>No pages yet</Text>
                        <Text style={s.emptySub}>Tap + to start drawing out your thoughts Notion-style</Text>
                    </View>
                ) : (
                    <View style={s.pageList}>
                        {entries.map(e => (
                            <TouchableOpacity
                                key={e.id}
                                style={s.pageRow}
                                onPress={() => openPage(e.id)}
                            >
                                <View style={s.pageRowLeft}>
                                    <Text style={s.pageIcon}>{e.icon || '📄'}</Text>
                                    <View>
                                        <Text style={s.pageTitle}>{e.title || 'Untitled'}</Text>
                                        <Text style={s.pageDate}>
                                            {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Text>
                                    </View>
                                </View>
                                <ChevronRight size={18} color={C.textMuted} strokeWidth={1.5} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={{ height: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.black
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: S.xl,
        paddingVertical: S.lg,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    headerTitle: {
        ...T.h3,
    },
    iconBtn: {
        padding: S.xs,
    },
    scroll: {
        paddingTop: S.xl,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: S.xl,
        marginTop: S.xxl * 2,
    },
    emptyTitle: {
        ...T.h4,
        color: C.textSub,
        marginBottom: S.sm,
    },
    emptySub: {
        ...T.body,
        color: C.textMuted,
        textAlign: 'center',
    },
    pageList: {
        // Notion has very tight, clean lists
    },
    pageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: S.lg,
        paddingHorizontal: S.xl,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    pageRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: S.md,
    },
    pageIcon: {
        fontSize: 24,
    },
    pageTitle: {
        ...T.body,
        fontWeight: '500',
        marginBottom: 2,
    },
    pageDate: {
        ...T.label,
        color: C.textMuted,
    },
});
