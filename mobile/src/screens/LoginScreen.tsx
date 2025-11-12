/**
 * Login Screen with OTP Verification
 * Uses Auth0 for phone number verification
 */

import React, { useState, useEffect } from 'react';
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
import { Logo } from '../components/Logo';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

// Safe Logo wrapper for Android
const SafeLogo = ({ size, animate }: { size?: number; animate?: boolean }) => {
  try {
    return <Logo size={size} animate={animate} />;
  } catch (e) {
    console.warn('Logo render error:', e);
    return <Text style={{ fontSize: size || 100 }}>🌸</Text>;
  }
};

const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;

export default function LoginScreen({ navigation, onLogin }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'name-phone' | 'otp'>('name-phone');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const validatePhone = (phoneNumber: string): boolean => {
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    return cleaned.length >= 10 && PHONE_REGEX.test(phoneNumber);
  };

  const formatPhone = (phoneNumber: string): string => {
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Format as +1 (XXX) XXX-XXXX if US number
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    return `+${cleaned}`;
  };

  const handleSendOTP = async () => {
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
      // TODO: Integrate with Auth0 phone verification
      // For now, simulate OTP send
      // In production, call Auth0's phone verification API
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store phone temporarily
      await AsyncStorage.setItem('tempPhone', formatPhone(trimmedPhone));
      await AsyncStorage.setItem('tempName', trimmedName);
      
      setOtpSent(true);
      setStep('otp');
      Alert.alert(
        'OTP Sent',
        `We've sent a verification code to ${trimmedPhone}. Please enter it below.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      // TODO: Verify OTP with Auth0
      // For now, simulate verification (accept any 6-digit code for testing)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storedName = await AsyncStorage.getItem('tempName');
      const storedPhone = await AsyncStorage.getItem('tempPhone');
      
      if (!storedName || !storedPhone) {
        throw new Error('Session expired');
      }

      // Store verified user info
      await AsyncStorage.multiSet([
        ['userName', storedName],
        ['userPhone', storedPhone],
        ['userVerified', 'true'],
      ]);

      // Clear temp data
      await AsyncStorage.multiRemove(['tempName', 'tempPhone']);

      // Call onLogin callback or navigate
      if (onLogin) {
        onLogin({ name: storedName, phone: storedPhone });
      } else {
        navigation.replace('Home');
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    await handleSendOTP();
  };

  // Initial loading screen with animated logo
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000); // Show logo for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[theme.colors.background, theme.colors.secondaryLight, theme.colors.lavenderLight, theme.colors.peachLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.loadingGradient}
        >
          <SafeLogo size={180} animate={true} />
          <Text style={styles.loadingTitle}>ShareCycle</Text>
          <Text style={styles.loadingSubtitle}>Your privacy-first support network</Text>
        </LinearGradient>
      </View>
    );
  }

  if (step === 'otp') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <LinearGradient
          colors={[theme.colors.background, theme.colors.secondaryLight, theme.colors.lavenderLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <SafeLogo size={80} />
              <Text style={styles.title}>Verify Your Phone</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to{'\n'}
                <Text style={styles.phoneText}>{phone}</Text>
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="000000"
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
                <Text style={styles.otpHint}>Enter 6-digit code</Text>
              </View>

              <TouchableOpacity
                style={[styles.buttonContainer, loading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading || otp.length !== 6 
                    ? [theme.colors.border, theme.colors.borderLight]
                    : [theme.colors.primary, theme.colors.primaryDark, theme.colors.accent]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={loading}
              >
                <Text style={styles.resendText}>
                  Didn't receive code? <Text style={styles.resendLink}>Resend</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setStep('name-phone');
                  setOtp('');
                  setOtpSent(false);
                }}
              >
                <Text style={styles.backText}>← Change phone number</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[theme.colors.background, theme.colors.secondaryLight, theme.colors.lavenderLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <SafeLogo size={100} />
            <Text style={styles.title}>ShareCycle</Text>
            <Text style={styles.subtitle}>Your privacy-first support network</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.buttonContainer, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading
                  ? [theme.colors.border, theme.colors.borderLight]
                  : [theme.colors.primary, theme.colors.primaryDark, theme.colors.accent]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.privacyNote}>
              We'll send you a verification code to confirm your phone number
            </Text>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(139, 67, 103, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  phoneText: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    ...theme.shadows.sm,
  },
  otpInput: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    padding: 20,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    ...theme.shadows.md,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
  },
  otpHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
    ...theme.shadows.lg,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  resendLink: {
    color: theme.colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  privacyNote: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  loadingTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 20,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(139, 67, 103, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  loadingSubtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
