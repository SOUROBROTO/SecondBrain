import 'react-native-get-random-values';
import React, { useContext, useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { JournalContext } from '../context/JournalContext';
import { ChevronLeft, MoreHorizontal, FileText } from 'lucide-react-native';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../utils/theme';

export default function JournalEntryScreen() {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    const { entries, updatePage, deletePage } = useContext(JournalContext);
    const navigation = useNavigation();
    const route = useRoute();
    const { entryId } = route.params;

    const pageData = entries.find(e => e.id === entryId) || {
        title: '', icon: '📄', blocks: [{ id: uuidv4(), type: 'text', content: '' }]
    };

    const [title, setTitle] = useState(pageData.title);
    const [icon, setIcon] = useState(pageData.icon);
    const [blocks, setBlocks] = useState(pageData.blocks || [{ id: uuidv4(), type: 'text', content: '' }]);

    // Track which block should be focused
    const [focusedBlockId, setFocusedBlockId] = useState(null);
    const inputRefs = useRef({});

    useEffect(() => {
        // Save automatically when changes happen
        updatePage(entryId, { title, icon, blocks });
    }, [title, icon, blocks]);

    useEffect(() => {
        if (focusedBlockId && inputRefs.current[focusedBlockId]) {
            inputRefs.current[focusedBlockId].focus();
        }
    }, [focusedBlockId, blocks.length]);

    const handleBlockChange = (id, text) => {
        // Check if user pressed Enter (newline)
        if (text.includes('\n')) {
            const parts = text.split('\n');
            const newContent = parts[0];
            const nextContent = parts.slice(1).join('\n');

            const blockIndex = blocks.findIndex(b => b.id === id);
            const newBlockId = uuidv4();

            const newBlocks = [...blocks];
            newBlocks[blockIndex].content = newContent;
            newBlocks.splice(blockIndex + 1, 0, {
                id: newBlockId,
                type: 'text',
                content: nextContent
            });

            setBlocks(newBlocks);
            setFocusedBlockId(newBlockId);
        } else {
            setBlocks(blocks.map(b => b.id === id ? { ...b, content: text } : b));
        }
    };

    const handleKeyPress = (e, id, index) => {
        if (e.nativeEvent.key === 'Backspace' && blocks[index].content === '') {
            // Delete block and focus previous
            if (index > 0) {
                const prevId = blocks[index - 1].id;
                const newBlocks = blocks.filter(b => b.id !== id);
                setBlocks(newBlocks);
                setFocusedBlockId(prevId);
            }
        }
    };

    const handleDelete = () => {
        deletePage(entryId);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={s.root} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconBtn}>
                    <ChevronLeft size={24} color={C.text} strokeWidth={1.5} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={s.iconBtn}>
                    <MoreHorizontal size={24} color={C.textMuted} strokeWidth={1.5} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={s.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={s.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Page Icon */}
                    <TextInput
                        style={s.iconInput}
                        value={icon}
                        onChangeText={setIcon}
                        maxLength={2}
                    />

                    {/* Page Title */}
                    <TextInput
                        style={s.titleInput}
                        placeholder="Untitled"
                        placeholderTextColor={C.textDisabled}
                        value={title}
                        onChangeText={setTitle}
                        multiline
                    />

                    {/* Blocks */}
                    <View style={s.blocksContainer}>
                        {blocks.map((block, index) => (
                            <View key={block.id} style={s.blockRow}>
                                <TextInput
                                    ref={(ref) => inputRefs.current[block.id] = ref}
                                    style={s.blockInput}
                                    placeholder={index === 0 && blocks.length === 1 && !title ? "Tap here to continue..." : ""}
                                    placeholderTextColor={C.textDisabled}
                                    value={block.content}
                                    onChangeText={(text) => handleBlockChange(block.id, text)}
                                    onKeyPress={(e) => handleKeyPress(e, block.id, index)}
                                    multiline
                                    onFocus={() => setFocusedBlockId(block.id)}
                                />
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingHorizontal: S.md,
        paddingVertical: S.sm,
    },
    iconBtn: {
        padding: S.sm,
    },
    keyboardView: {
        flex: 1,
    },
    scroll: {
        paddingHorizontal: S.xl,
        paddingTop: S.xl,
    },
    iconInput: {
        fontSize: 48,
        marginBottom: S.lg,
    },
    titleInput: {
        ...T.h1,
        color: C.text,
        marginBottom: S.xl,
    },
    blocksContainer: {
        gap: 2, // Tight gap between blocks like Notion
    },
    blockRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    blockInput: {
        ...T.body,
        color: C.text,
        flex: 1,
        minHeight: 28, // Give it a basic height
        paddingVertical: 2,
    },
});
