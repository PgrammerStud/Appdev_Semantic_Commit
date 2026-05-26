import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('💥 ErrorBoundary caught:', error, info);
    // Sentry.captureException(error); // uncomment if using Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={s.container}>
          <Text style={s.emoji}>💥</Text>
          <Text style={s.title}>Something went wrong</Text>
          <Text style={s.message}>{this.state.error?.message}</Text>
          <TouchableOpacity
            style={s.btn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={s.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  emoji:     { fontSize: 48, marginBottom: 16 },
  title:     { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  message:   { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 24 },
  btn:       { backgroundColor: '#e74c3c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  btnText:   { color: '#fff', fontWeight: '700' },
});

export default ErrorBoundary;