import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../shared/utils/theme';

export default function FloatingAddButton() {
    const { C, T, R, S } = useTheme();
    const s = getStyles(C, T, R, S);
    const navigation = useNavigation();
    return (
        <View style={s.wrap}>
            <TouchableOpacity style={s.btn} activeOpacity={0.8} onPress={() => navigation.navigate('AddEditTask')}>
                <Plus size={24} color={C.black} strokeWidth={2} />
            </TouchableOpacity>
        </View>
    );
}

const getStyles = (C, T, R, S) => StyleSheet.create({
    wrap: {
        position: 'absolute',
        bottom: 28,
        right: 20,
    },
    btn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: C.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: C.white,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
});
