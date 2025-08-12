import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Slumber!</Text>
      <Text style={styles.subtitle}>Your subscription is active. 🎉</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
  },
});

export default HomeScreen;
