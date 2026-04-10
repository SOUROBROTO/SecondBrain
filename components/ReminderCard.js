import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bell, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../utils/theme';

export default function ReminderCard() {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    return (
        <View style={s.card}>
            <View style={s.iconWrap}>
                <Bell size={16} color={C.warn} strokeWidth={1.5} />
            </View>
            <View style={s.content}>
                <Text style={s.label}>REMINDER</Text>
                <Text style={s.msg}>Drink water – 500ml</Text>
                <Text style={s.time}>In 15 mins</Text>
            </View>
            <ChevronRight size={16} color={C.textMuted} strokeWidth={1.5} />
        </View>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        borderRadius: R.lg,
        padding: S.lg,
        marginBottom: S.lg,
        borderWidth: 1,
        borderColor: C.border,
        gap: S.md,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: R.md,
        backgroundColor: C.warnBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: { flex: 1 },
    label: { ...T.cap, marginBottom: 3 },
    msg: { ...T.h5, fontSize: 14, marginBottom: 2 },
    time: { ...T.label, color: C.warn },
});
