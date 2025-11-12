/**
 * SystemBanner Component
 * Subtle system messages for empathy/support and status updates
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface SystemBannerProps {
  text: string;
  icon?: string;
}

export default function SystemBanner({ text, icon = '💬' }: SystemBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    backgroundColor: theme.colors.secondaryLight || '#F8F4FF',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textPrimary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

