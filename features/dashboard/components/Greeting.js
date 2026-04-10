import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/utils/theme';

export default function Greeting() {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    const d = new Date();
    const h = d.getHours();
    const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const day = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <View>
            <Text style={s.date}>{day}</Text>
            <Text style={s.greeting}>{greeting}</Text>
        </View>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    date: {
        ...T.cap,
        marginBottom: 6,
    },
    greeting: {
        ...T.h2,
    },
});
