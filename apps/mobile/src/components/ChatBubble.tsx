/**
 * ChatBubble Component
 * Uber/Lyft-style readable chat bubbles with timestamps and safety hints
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface ChatBubbleProps {
  text: string;
  isMine: boolean;
  timestamp?: number;
  showSafetyHint?: boolean;
}

export default function ChatBubble({ text, isMine, timestamp, showSafetyHint }: ChatBubbleProps) {
  const formatTime = (ts?: number): string => {
    if (!ts) return '';
    const date = new Date(ts);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  return (
    <View style={[styles.container, isMine ? styles.containerMine : styles.containerTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs]}>
          {text}
        </Text>
      </View>
      {(timestamp || showSafetyHint) && (
        <View style={styles.meta}>
          {timestamp && (
            <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
          )}
          {showSafetyHint && (
            <View style={styles.safetyHint}>
              <Text style={styles.safetyHintText}>🛡️ Safety filter applied</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '78%',
  },
  containerMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  containerTheirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
    ...theme.shadows.sm,
  },
  bubbleTheirs: {
    backgroundColor: '#FFFFFF', // Light neutral background
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.borderLight || '#E0E0E0',
    ...theme.shadows.sm,
  },
  text: {
    fontSize: 16,
    lineHeight: 24, // 1.5 line-height for better readability
  },
  textMine: {
    color: '#FFFFFF', // White text on brand background (7:1 contrast)
  },
  textTheirs: {
    color: '#212121', // Dark text on light background (7:1 contrast)
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  safetyHint: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: theme.colors.warningBg || '#FFF3E0',
  },
  safetyHintText: {
    fontSize: 10,
    color: theme.colors.warningText || '#E65100',
    fontWeight: '600',
  },
});

