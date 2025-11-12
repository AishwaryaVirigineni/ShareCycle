/**
 * Quick Prompts Component
 * Displays pre-written messages for fast replies
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { apiClient } from '../services/apiClient';

interface QuickPrompt {
  id: string;
  text: string;
}

interface Category {
  id: string;
  name: string;
  items: QuickPrompt[];
}

export default function QuickPrompts({
  onSelectPrompt,
  role,
}: {
  onSelectPrompt: (promptId: string, text: string) => void;
  role?: 'requester' | 'helper';
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrompts();
  }, [role]);

  const loadPrompts = async () => {
    const response = await apiClient.getQuickPrompts(role);
    if (response.data) {
      setCategories(response.data.categories);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading quick prompts...</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {categories.map((category) => (
        <View key={category.id} style={styles.category}>
          <Text style={styles.categoryName}>{category.name}</Text>
          {category.items.map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={styles.promptButton}
              onPress={() => onSelectPrompt(prompt.id, prompt.text)}
            >
              <Text style={styles.promptText}>{prompt.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
  },
  category: {
    marginRight: 16,
    minWidth: 200,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  promptButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  promptText: {
    fontSize: 14,
    color: '#333',
  },
});

