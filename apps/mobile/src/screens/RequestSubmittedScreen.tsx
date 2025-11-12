/**
 * RequestSubmittedScreen - Converted from Figma Design
 * Pulsing search animation, request details, safety tips
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';
import { theme } from '../theme';

export default function RequestSubmittedScreen({ navigation, route }: any) {
  const { requestId, ownerId, urgency, empathy } = route.params || {};

  // Pulsing animation values using regular Animated API
  const pulse1Scale = useRef(new Animated.Value(1)).current;
  const pulse1Opacity = useRef(new Animated.Value(0.5)).current;
  const pulse2Scale = useRef(new Animated.Value(1)).current;
  const pulse2Opacity = useRef(new Animated.Value(0.5)).current;
  const centerScale = useRef(new Animated.Value(0.8)).current;
  const centerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Center icon animation
    Animated.parallel([
      Animated.timing(centerScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(centerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse 1 animation
    const pulse1Anim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse1Scale, {
            toValue: 1.5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulse1Opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulse1Scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulse1Opacity, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse1Anim.start();

    // Pulse 2 animation (delayed)
    setTimeout(() => {
      const pulse2Anim = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulse2Scale, {
              toValue: 1.5,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulse2Opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulse2Scale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(pulse2Opacity, {
              toValue: 0.5,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulse2Anim.start();
    }, 500);
  }, []);

  const pulse1Style = {
    transform: [{ scale: pulse1Scale }],
    opacity: pulse1Opacity,
  };

  const pulse2Style = {
    transform: [{ scale: pulse2Scale }],
    opacity: pulse2Opacity,
  };

  const centerStyle = {
    transform: [{ scale: centerScale }],
    opacity: centerOpacity,
  };

  const handleTalkToBot = () => {
    navigation.navigate('BotChat');
  };

  const handleContinueWaiting = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={[theme.colors.accent, theme.colors.accentLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Request Sent</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Location Card */}
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>Downtown, City Center</Text>
              <Text style={styles.locationSubtext}>Request sent to 3 nearby helpers</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Searching Animation */}
        <View style={styles.searchingContainer}>
          <View style={styles.searchingContent}>
            <View style={styles.pulseContainer}>
              {/* Pulsing circles */}
              <Animated.View style={[styles.pulseCircle, styles.pulse1, pulse1Style]} />
              <Animated.View style={[styles.pulseCircle, styles.pulse2, pulse2Style]} />

              {/* Center icon */}
              <Animated.View style={[styles.centerIcon, centerStyle]}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.centerIconGradient}
                >
                  <Text style={styles.centerIconText}>⏰</Text>
                </LinearGradient>
              </Animated.View>
            </View>

            <Text style={styles.searchingTitle}>Finding nearby helpers...</Text>
            <Text style={styles.searchingSubtitle}>
              You'll be notified when someone accepts your request
            </Text>
            {empathy && (
              <View style={styles.empathyCard}>
                <Text style={styles.empathyText}>{empathy}</Text>
              </View>
            )}
          </View>

          {/* Request Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Request Details</Text>

            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>Searching</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Sent to</Text>
                <Text style={styles.detailValue}>3 nearby helpers</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Max distance</Text>
                <Text style={styles.detailValue}>1 km radius</Text>
              </View>
            </View>
          </View>

          {/* Safety Tips */}
          <View style={styles.safetyCard}>
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.secondaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.safetyCardGradient}
            >
              <Text style={styles.safetyTitle}>Safety Tips</Text>
              <View style={styles.safetyList}>
                <View style={styles.safetyItem}>
                  <Text style={styles.safetyBullet}>•</Text>
                  <Text style={styles.safetyText}>Meet in a public, well-lit location</Text>
                </View>
                <View style={styles.safetyItem}>
                  <Text style={styles.safetyBullet}>•</Text>
                  <Text style={styles.safetyText}>Let someone know where you're going</Text>
                </View>
                <View style={styles.safetyItem}>
                  <Text style={styles.safetyBullet}>•</Text>
                  <Text style={styles.safetyText}>Keep conversations on the app until you meet</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.botButton}
              onPress={handleTalkToBot}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.botButtonGradient}
              >
                <Text style={styles.botIcon}>🌸</Text>
                <Text style={styles.botButtonTitle}>Talk to Blossom Bot</Text>
                <Text style={styles.botButtonSubtitle}>Get support while you wait</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.waitButton}
              onPress={handleContinueWaiting}
              activeOpacity={0.8}
            >
              <Text style={styles.waitIcon}>⏳</Text>
              <Text style={styles.waitButtonTitle}>Continue Waiting</Text>
              <Text style={styles.waitButtonSubtitle}>We'll notify you when someone accepts</Text>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...theme.shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  closeIcon: {
    fontSize: 20,
    color: theme.colors.accent,
    fontWeight: '700',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  locationIcon: {
    fontSize: 20,
  },
  locationInfo: {
    flex: 1,
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  locationSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  searchingContainer: {
    padding: 24,
    gap: 24,
  },
  searchingContent: {
    alignItems: 'center',
    gap: 16,
  },
  pulseContainer: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pulseCircle: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
  },
  pulse1: {
    borderColor: theme.colors.primary,
  },
  pulse2: {
    borderColor: theme.colors.secondary,
  },
  centerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    ...theme.shadows.lg,
  },
  centerIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIconText: {
    fontSize: 32,
  },
  searchingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  searchingSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  detailsCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
    gap: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  detailsList: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
  },
  detailLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  safetyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  safetyCardGradient: {
    padding: 24,
    gap: 12,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  safetyList: {
    gap: 8,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  safetyBullet: {
    fontSize: 16,
    color: theme.colors.primary,
    marginTop: 2,
  },
  safetyText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 16,
  },
  botButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  botButtonGradient: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  botIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  botButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.surface,
    marginBottom: 4,
  },
  botButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  waitButton: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    gap: 12,
    ...theme.shadows.md,
  },
  waitIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  waitButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  waitButtonSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    ...theme.shadows.md,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});

