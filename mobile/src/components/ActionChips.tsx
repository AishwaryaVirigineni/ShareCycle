/**
 * ActionChips Component
 * ASAP/Later/Pickup chips that send mapped text
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme';

interface ActionChip {
  id: string;
  label: string;
  text: string;
}

const ACTION_CHIPS: ActionChip[] = [
  { id: 'asap', label: 'ASAP', text: 'Could you help as soon as you can?' },
  { id: 'later', label: 'Later', text: 'No rush — later is okay.' },
  { id: 'pickup', label: "I'll pick up", text: 'I can pick up from the entrance.' },
];

interface ActionChipsProps {
  onSelect: (text: string) => void;
}

export default function ActionChips({ onSelect }: ActionChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {ACTION_CHIPS.map((chip) => (
        <TouchableOpacity
          key={chip.id}
          style={styles.chip}
          onPress={() => onSelect(chip.text)}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText}>{chip.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});

