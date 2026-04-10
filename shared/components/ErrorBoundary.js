import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to an error reporting service
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error Info:', errorInfo);

        // Store error details in state for display
        this.setState({
            error,
            errorInfo
        });

        // You can also log to external services like Sentry here
        // Example: Sentry.captureException(error);
    }

    handleReset = () => {
        // Reset the error boundary state
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            // Render fallback UI
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Ionicons name="warning" size={80} color="#FF453A" />
                        <Text style={styles.title}>Oops! Something went wrong</Text>
                        <Text style={styles.subtitle}>
                            The app encountered an unexpected error.{'\n'}
                            Don't worry, your data is safe!
                        </Text>

                        {__DEV__ && this.state.error && (
                            <View style={styles.errorDetails}>
                                <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
                                <Text style={styles.errorText}>
                                    {this.state.error.toString()}
                                </Text>
                                {this.state.errorInfo && (
                                    <Text style={styles.errorStack}>
                                        {this.state.errorInfo.componentStack}
                                    </Text>
                                )}
                            </View>
                        )}

                        <TouchableOpacity style={styles.resetButton} onPress={this.handleReset}>
                            <Ionicons name="refresh" size={20} color="#fff" style={styles.resetIcon} />
                            <Text style={styles.resetButtonText}>Try Again</Text>
                        </TouchableOpacity>

                        {this.props.onReset && (
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => {
                                    this.handleReset();
                                    this.props.onReset();
                                }}
                            >
                                <Text style={styles.secondaryButtonText}>Restart App</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
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
        maxWidth: 400,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    errorDetails: {
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: '#FF453A',
    },
    errorTitle: {
        color: '#FF453A',
        fontWeight: 'bold',
        marginBottom: 10,
        fontSize: 14,
    },
    errorText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'monospace',
        marginBottom: 10,
    },
    errorStack: {
        color: '#888',
        fontSize: 10,
        fontFamily: 'monospace',
    },
    resetButton: {
        flexDirection: 'row',
        backgroundColor: '#4c669f',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    resetIcon: {
        marginRight: 10,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        paddingHorizontal: 30,
        paddingVertical: 15,
    },
    secondaryButtonText: {
        color: '#4c669f',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ErrorBoundary;
