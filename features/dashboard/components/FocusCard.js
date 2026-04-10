import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, Clock } from 'lucide-react-native';
import { useTheme } from '../../../shared/utils/theme';

export default function FocusCard() {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    return (
        <View style={s.card}>
            {/* Label row */}
            <View style={s.labelRow}>
                <Target size={13} color={C.textSub} strokeWidth={1.5} />
                <Text style={s.label}>TODAY'S FOCUS</Text>
            </View>

            {/* Focus text */}
            <Text style={s.focus}>Complete the TrackMind App Prototype</Text>

            {/* Footer */}
            <View style={s.footer}>
                <View style={s.timePill}>
                    <Clock size={11} color={C.textSub} strokeWidth={1.5} />
                    <Text style={s.timeText}>2h 30m left</Text>
                </View>
                <View style={s.statusDot} />
            </View>
        </View>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    card: {
        backgroundColor: C.surface,
        borderRadius: R.xl,
        padding: S.xl,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: S.lg,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 14,
    },
    label: {
        ...T.cap,
    },
    focus: {
        ...T.h4,
        lineHeight: 26,
        marginBottom: 16,
        color: C.text,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: R.round,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.surface2,
    },
    timeText: {
        ...T.label,
        color: C.textSub,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: C.success,
    },
});
