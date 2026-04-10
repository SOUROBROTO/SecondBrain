import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Brain } from 'lucide-react-native';
import { useTheme } from '../utils/theme';

export default function LoadingScreen() {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    return (
        <View style={s.wrap}>
            <View style={s.iconWrap}>
                <Brain size={32} color={C.text} strokeWidth={1.5} />
            </View>
            <Text style={s.name}>trackmind</Text>
            <ActivityIndicator size="small" color={C.textSub} style={{ marginTop: 40 }} />
        </View>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    wrap: {
        flex: 1,
        backgroundColor: C.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.borderMed,
        backgroundColor: C.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    name: {
        ...T.h2,
        letterSpacing: 2,
        fontWeight: '300',
        color: C.text,
    },
});
