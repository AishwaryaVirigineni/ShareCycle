/**
 * PromptTray Component
 * Inline horizontal pill row for quick prompts (Uber/Lyft style)
 */

import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { apiClient } from '../services/apiClient';
import { theme } from '../theme';

interface PromptItem {
  id: string;
  text: string;
}

interface PromptTrayProps {
  role?: 'requester' | 'helper';
  onSelect: (promptId: string, text: string) => void;
  onMore: () => void;
}

export default function PromptTray({ role, onSelect, onMore }: PromptTrayProps) {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrompts();
  }, [role]);

  const loadPrompts = async () => {
    try {
      const response = await apiClient.getQuickPrompts(role);
      if (response.data) {
        // Flatten categories and take top 6
        const allPrompts: PromptItem[] = [];
        for (const category of response.data.categories) {
          for (const item of category.items) {
            allPrompts.push({ id: item.id, text: item.text });
          }
        }
        // Take first 6 for inline tray
        setPrompts(allPrompts.slice(0, 6));
      }
    } catch (error) {
      console.warn('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || prompts.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {prompts.map((prompt) => (
        <TouchableOpacity
          key={prompt.id}
          style={styles.pill}
          onPress={() => onSelect(prompt.id, prompt.text)}
          activeOpacity={0.7}
          accessibilityLabel={`Quick prompt: ${prompt.text}. Double tap to send.`}
          accessibilityRole="button"
          accessibilityHint="Double tap to send this quick message"
        >
          <Text style={styles.pillText} numberOfLines={1}>
            {prompt.text}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.morePill}
        onPress={onMore}
        activeOpacity={0.7}
        accessibilityLabel="More quick prompts"
        accessibilityRole="button"
      >
        <Text style={styles.moreText}>More…</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight || '#E0E0E0',
    height: 32,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 160,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textPrimary || '#212121',
  },
  morePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight || '#E0E0E0',
    height: 32,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary || '#212121',
  },
});

