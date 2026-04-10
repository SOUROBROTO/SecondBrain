import React from 'react';
import { TouchableOpacity, Alert, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DeleteButton({
    onDelete,
    itemType = 'Item',
    confirmationMessage,
    style,
    size = 24,
    color = '#FF453A'
}) {
    const handleDelete = () => {
        if (Platform.OS === 'web') {
            if (window.confirm(confirmationMessage || `Are you sure you want to delete this ${itemType.toLowerCase()}? This action cannot be undone.`)) {
                onDelete();
            }
        } else {
            Alert.alert(
                `Delete ${itemType}`,
                confirmationMessage || `Are you sure you want to delete this ${itemType.toLowerCase()}? This action cannot be undone.`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: onDelete
                    }
                ]
            );
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={handleDelete}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="trash-outline" size={size} color={color} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50, // High zIndex for the component itself
    },
    iconContainer: {
        borderRadius: 20,
        padding: 4,
    }
});
