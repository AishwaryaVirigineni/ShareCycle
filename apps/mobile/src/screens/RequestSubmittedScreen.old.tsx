/**
 * Request Submitted Screen
 * Shown after user requests a pad
 * Options: Talk to Blossom Bot OR Continue Waiting
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export default function RequestSubmittedScreen({
  navigation,
  route,
}: any) {
  const { requestId, ownerId } = route.params;

  const handleTalkToBot = () => {
    navigation.navigate('BotChat');
  };

  const handleContinueWaiting = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✅</Text>
        </View>

        <Text style={styles.title}>Request Sent!</Text>
        <Text style={styles.subtitle}>
          We're looking for nearby helpers. This usually takes just a few minutes.
        </Text>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Searching for helpers nearby...</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, styles.botButton]}
            onPress={handleTalkToBot}
          >
            <Text style={styles.optionIcon}>🌸</Text>
            <Text style={styles.optionTitle}>Talk to Blossom Bot</Text>
            <Text style={styles.optionSubtitle}>
              Get support while you wait
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.waitButton]}
            onPress={handleContinueWaiting}
          >
            <Text style={styles.optionIcon}>⏳</Text>
            <Text style={styles.optionTitle}>Continue Waiting</Text>
            <Text style={styles.optionSubtitle}>
              We'll notify you when someone accepts
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#999',
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  botButton: {
    backgroundColor: '#FCE4EC',
    borderColor: '#E91E63',
  },
  waitButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

