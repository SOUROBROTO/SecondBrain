import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ErrorBoundary from './ErrorBoundary';

/**
 * ScreenErrorBoundary
 * A lighter-weight error boundary for individual screens
 * Allows the rest of the app to continue functioning if one screen fails
 */
export default function ScreenErrorBoundary({ children, screenName = 'This screen' }) {
    return (
        <ErrorBoundary
            fallback={(error, resetError) => (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Ionicons name="alert-circle" size={60} color="#FF9F0A" />
                        <Text style={styles.title}>{screenName} encountered an error</Text>
                        <Text style={styles.subtitle}>
                            The rest of the app is still working fine.{'\n'}
                            You can go back or try refreshing.
                        </Text>

                        {__DEV__ && error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error.toString()}</Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.button} onPress={resetError}>
                            <Ionicons name="refresh" size={18} color="#fff" style={styles.icon} />
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        >
            {children}
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: 350,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 15,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    errorBox: {
        backgroundColor: '#1E1E1E',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
    },
    errorText: {
        color: '#FF9F0A',
        fontSize: 11,
        fontFamily: 'monospace',
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#4c669f',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
