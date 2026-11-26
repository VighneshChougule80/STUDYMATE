import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Ionicons name="book" size={42} color="#FFFFFF" />
      </View>

      <Text style={styles.title}>StudyMate</Text>
      <Text style={styles.subtitle}>Your learning space</Text>

      <ActivityIndicator
        size="large"
        color="#4F46E5"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#172033',
  },
  subtitle: {
    fontSize: 16,
    color: '#697386',
    marginTop: 8,
  },
  loader: {
    marginTop: 34,
  },
});