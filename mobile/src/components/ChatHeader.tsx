/**
 * ChatHeader Component
 * Header with initial avatar and short user ID
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { initialForUser } from '../utils/names';
import ChatMenu from './ChatMenu';

interface ChatHeaderProps {
  userId?: string;
  displayName?: string;
  onBack: () => void;
  urgency?: 'urgent' | 'normal' | 'low';
  isTopK?: boolean;
  cancelLabel?: string;
  role?: 'requester' | 'helper';
  onCancel?: () => void;
  onDroppedOff?: () => void;
}

export default function ChatHeader({ userId, displayName, onBack, urgency, isTopK, cancelLabel, role, onCancel, onDroppedOff }: ChatHeaderProps) {
  const initial = initialForUser(displayName, userId);
  const userDisplay = displayName || 'User';

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.content}>
        <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
          <Text style={styles.cancelText}>{cancelLabel || 'Cancel'}</Text>
        </TouchableOpacity>

        <View style={styles.center}>
          <LinearGradient
            colors={[theme.colors.accent, theme.colors.accentLight]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {userDisplay}
              </Text>
              {urgency && (
                <View style={[
                  styles.urgencyDot,
                  urgency === 'urgent' && styles.urgencyDotUrgent,
                  urgency === 'normal' && styles.urgencyDotNormal,
                  urgency === 'low' && styles.urgencyDotLow,
                ]} />
              )}
              {isTopK && (
                <View style={styles.topKBadge}>
                  <Text style={styles.topKBadgeText}>K</Text>
                </View>
              )}
            </View>
            <View style={styles.location}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>Nearby</Text>
            </View>
          </View>
        </View>

        {role ? (
          <ChatMenu
            role={role}
            onCancel={onCancel || onBack}
            onDroppedOff={onDroppedOff || (() => {
              console.warn('onDroppedOff not provided for helper role');
            })}
          />
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...theme.shadows.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.error || '#F44336',
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgencyDotUrgent: {
    backgroundColor: theme.colors.error || '#F44336',
  },
  urgencyDotNormal: {
    backgroundColor: theme.colors.warning || '#FF9800',
  },
  urgencyDotLow: {
    backgroundColor: theme.colors.successText || '#4CAF50',
  },
  topKBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  topKBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  spacer: {
    width: 40,
  },
});

