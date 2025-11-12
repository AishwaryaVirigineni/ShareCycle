/**
 * ConfirmRequest Screen
 * Shows empathy preview and product selection before persisting request
 * Empathy is gated - only shown here after user confirms
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { apiClient } from '../services/apiClient';

interface ConfirmRequestScreenProps {
  navigation: any;
  route: {
    params: {
      latitude: number;
      longitude: number;
      address?: string;
      ownerId: string;
    };
  };
}

export default function ConfirmRequestScreen({ navigation, route }: ConfirmRequestScreenProps) {
  const { latitude, longitude, address, ownerId } = route.params || {};
  const [productType, setProductType] = useState<'pad' | 'tampon' | 'liner'>('pad');
  const [locationHint, setLocationHint] = useState('');
  const [empathy, setEmpathy] = useState<string | null>(null);
  const [urgencyChoice, setUrgencyChoice] = useState<'asap' | 'later' | 'pickup' | null>(null);
  const [urgency, setUrgency] = useState<'urgent' | 'normal' | 'low'>('normal');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Classify message to get empathy preview (not stored yet)
    // Use a timeout to debounce and avoid blocking UI
    let timeoutId: NodeJS.Timeout;
    
    const classifyForPreview = async () => {
      try {
        let message = `I need a ${productType}`;
        if (urgencyChoice === 'asap') {
          message += ' urgently';
        } else if (urgencyChoice === 'later') {
          message += ' later is fine';
        } else if (urgencyChoice === 'pickup') {
          message += ' I can pick up';
        }
        const result = await apiClient.classifyMessage(message);
        if (result.data) {
          setEmpathy(result.data.empathy);
          setUrgency(result.data.urgency);
        }
      } catch (err) {
        console.warn('Failed to classify for preview:', err);
        // Set default urgency if classification fails
        if (urgencyChoice === 'asap') {
          setUrgency('urgent');
        } else if (urgencyChoice === 'later' || urgencyChoice === 'pickup') {
          setUrgency('normal');
        }
      } finally {
        setLoading(false);
      }
    };

    if (urgencyChoice !== null) {
      // Debounce classification to avoid blocking UI
      setLoading(true);
      timeoutId = setTimeout(() => {
        classifyForPreview();
      }, 300);
    } else {
      setLoading(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [productType, urgencyChoice]);

  const handleSendRequest = async () => {
    // Validate urgency choice is selected
    if (!urgencyChoice) {
      Alert.alert('Please select', 'Choose when you need help (ASAP, Later, or I\'ll pick up)');
      return;
    }

    // Prevent double submission
    if (sending) {
      return;
    }

    try {
      setSending(true);

      // Import here to avoid circular dependency
      const { addPadRequest } = await import('../services/firestoreService');

      // Now persist to Firestore with urgency and empathy (empathy not stored in chat)
      const requestId = await addPadRequest(
        latitude,
        longitude,
        address,
        ownerId,
        urgency,
        empathy || undefined // Empathy stored with request but never posted to chat
      );

      if (!requestId) {
        throw new Error('Request ID not returned');
      }

      // Record event (no PII, no raw text)
      // Analytics would go here: recordEvent('request_confirmed', { requestId, urgency })

      // Navigate to RequestSent screen
      navigation.replace('RequestSent', {
        requestId,
        ownerId,
        urgency,
        empathy,
      });
    } catch (e: any) {
      console.error('Request creation failed:', e);
      Alert.alert(
        'Failed to Send Request',
        `Could not send request: ${e?.message || 'Unknown error'}\n\nPlease try again.`
      );
      setSending(false); // Reset on error so user can retry
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Preparing your request...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Confirm Request</Text>
            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>

        {/* Product Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What do you need?</Text>
          <View style={styles.productGrid}>
            {(['pad', 'tampon', 'liner'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.productButton,
                  productType === type && styles.productButtonActive,
                ]}
                onPress={() => setProductType(type)}
              >
                <Text style={[
                  styles.productText,
                  productType === type && styles.productTextActive,
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location Hint (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meeting location (optional)</Text>
          <View style={styles.locationHintContainer}>
            <Text style={styles.locationHintText}>
              {address || 'Your current location'}
            </Text>
            <Text style={styles.locationHintSubtext}>
              Helpers will see your approximate location
            </Text>
          </View>
        </View>

        {/* Urgency Choice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When do you need help?</Text>
          <View style={styles.urgencyChipsContainer}>
            <TouchableOpacity
              style={[
                styles.urgencyChip,
                urgencyChoice === 'asap' && styles.urgencyChipActive,
              ]}
              onPress={() => setUrgencyChoice('asap')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.urgencyChipText,
                urgencyChoice === 'asap' && styles.urgencyChipTextActive,
              ]}>
                ASAP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.urgencyChip,
                urgencyChoice === 'later' && styles.urgencyChipActive,
              ]}
              onPress={() => setUrgencyChoice('later')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.urgencyChipText,
                urgencyChoice === 'later' && styles.urgencyChipTextActive,
              ]}>
                Later
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.urgencyChip,
                urgencyChoice === 'pickup' && styles.urgencyChipActive,
              ]}
              onPress={() => setUrgencyChoice('pickup')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.urgencyChipText,
                urgencyChoice === 'pickup' && styles.urgencyChipTextActive,
              ]}>
                I'll pick up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Empathy Preview (Gated - only shown here) */}
        {empathy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support message</Text>
            <View style={styles.empathyCard}>
              <Text style={styles.empathyText}>{empathy}</Text>
            </View>
          </View>
        )}

        {/* Send Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.sendButton, (sending || !urgencyChoice) && styles.sendButtonDisabled]}
            onPress={handleSendRequest}
            disabled={sending || !urgencyChoice}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LinearGradient
              colors={sending || !urgencyChoice
                ? [theme.colors.border || '#CCCCCC', theme.colors.borderLight || '#DDDDDD']
                : [theme.colors.primary, theme.colors.primaryDark || theme.colors.primary, theme.colors.accent || theme.colors.primary]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
              pointerEvents="none"
            >
              {sending ? (
                <ActivityIndicator color={theme.colors.surface || '#FFFFFF'} />
              ) : (
                <Text style={styles.sendButtonText}>
                  {!urgencyChoice ? 'Select urgency first' : 'Send Request'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...theme.shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  backIcon: {
    fontSize: 20,
    color: theme.colors.textTertiary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    padding: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  productGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  productButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  productButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary, // Use solid primary color instead of light
    borderWidth: 3, // Thicker border when active
  },
  productText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  productTextActive: {
    color: theme.colors.surface || '#FFFFFF', // White text on primary background for contrast
    fontWeight: '700',
  },
  locationHintContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  locationHintText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  locationHintSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  empathyCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.secondaryLight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  empathyText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textPrimary,
    fontStyle: 'italic',
  },
  actionSection: {
    padding: 24,
    paddingBottom: 40,
  },
  sendButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  sendButtonText: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  urgencyChipsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  urgencyChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight || '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  urgencyChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  urgencyChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  urgencyChipTextActive: {
    color: theme.colors.surface,
  },
});

