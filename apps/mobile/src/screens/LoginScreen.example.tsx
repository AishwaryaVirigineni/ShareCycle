/**
 * Example: LoginScreen using Theme
 * 
 * This shows how to use the theme system.
 * Once you update the theme files with your Figma values,
 * all components will automatically match your design.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme'; // Import theme

const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;

export default function LoginScreenExample({ navigation, onLogin }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePhone = (phoneNumber: string): boolean => {
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    return cleaned.length >= 10 && PHONE_REGEX.test(phoneNumber);
  };

  const handleLogin = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      Alert.alert('Name Required', 'Please enter your name');
      return;
    }

    if (!trimmedPhone) {
      Alert.alert('Phone Required', 'Please enter your phone number');
      return;
    }

    if (!validatePhone(trimmedPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.multiSet([
        ['userName', trimmedName],
        ['userPhone', trimmedPhone],
      ]);

      if (onLogin) {
        onLogin({ name: trimmedName, phone: trimmedPhone });
      } else {
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save login information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, { padding: theme.spacing.xl }]}>
        <View style={[styles.header, { marginBottom: theme.spacing['4xl'] }]}>
          <Text style={styles.logo}>🌸</Text>
          <Text style={[styles.title, theme.typography.styles.h1, { color: theme.colors.primary }]}>
            ShareCycle
          </Text>
          <Text style={[styles.subtitle, theme.typography.styles.body, { color: theme.colors.textSecondary }]}>
            Your privacy-first support network
          </Text>
        </View>

        <View style={styles.form}>
          <View style={{ marginBottom: theme.spacing.lg }}>
            <Text style={[styles.label, theme.typography.styles.captionBold, { color: theme.colors.textPrimary }]}>
              Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.base,
                  fontSize: theme.typography.fontSize.base,
                  backgroundColor: theme.colors.surface,
                }
              ]}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={{ marginBottom: theme.spacing.lg }}>
            <Text style={[styles.label, theme.typography.styles.captionBold, { color: theme.colors.textPrimary }]}>
              Phone Number
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.base,
                  fontSize: theme.typography.fontSize.base,
                  backgroundColor: theme.colors.surface,
                }
              ]}
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.lg,
                ...theme.shadows.primary,
              },
              loading && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={[styles.buttonText, theme.typography.styles.bodyBold, { color: theme.colors.background }]}>
              {loading ? 'Signing in...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.privacyNote, theme.typography.styles.small, { color: theme.colors.textTertiary }]}>
            Your information is kept private and secure
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
  },
  button: {
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {},
  privacyNote: {
    textAlign: 'center',
    marginTop: 16,
  },
});

