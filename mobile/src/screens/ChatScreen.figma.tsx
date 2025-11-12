/**
 * ChatScreen - Converted from Figma Design
 * Gradient messages, safety notice, meeting location card
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { subscribeMessages, sendMessage, ChatMessage } from '../services/firestoreService';
import { BOT_ID } from '../constants/bot';
import { apiClient } from '../services/apiClient';
import QuickPrompts from '../components/QuickPrompts';

export default function ChatScreen({ route }: any) {
  const { conversationId, meId, otherId, isConnected } = route.params || {};
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const unsub = subscribeMessages(conversationId, setMessages);
    return () => unsub();
  }, [conversationId]);

  const doSend = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');

    const filterResponse = await apiClient.filterMessage(t);
    if (filterResponse.data) {
      await sendMessage(conversationId, meId, filterResponse.data.textRedacted);
    } else {
      await sendMessage(conversationId, meId, t);
    }
  };

  const handleQuickPrompt = async (promptId: string, promptText: string) => {
    const filterResponse = await apiClient.filterMessage(promptText);
    const textToSend = filterResponse.data?.textRedacted || promptText;
    await sendMessage(conversationId, meId, textToSend);
  };

  const showQuickPrompts = isConnected !== false && otherId !== BOT_ID;

  // Get other user's initial for avatar
  const otherInitial = otherId?.charAt(0).toUpperCase() || '?';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => route.params?.navigation?.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <LinearGradient
              colors={[theme.colors.accent, theme.colors.accentLight]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{otherInitial}</Text>
            </LinearGradient>
            <View>
              <Text style={styles.headerName}>User {otherId?.slice(-4) || 'Unknown'}</Text>
              <View style={styles.headerLocation}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.headerLocationText}>Nearby</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Safety Notice */}
        <View style={styles.safetyNotice}>
          <Text style={styles.safetyIcon}>🛡️</Text>
          <Text style={styles.safetyText}>Private & secure conversation</Text>
        </View>
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => {
          const mine = message.senderId === meId;
          return (
            <View
              key={message.id}
              style={[styles.messageRow, mine ? styles.messageRowRight : styles.messageRowLeft]}
            >
              <View style={[styles.messageBubble, mine ? styles.messageBubbleMine : styles.messageBubbleThem]}>
                {mine ? (
                  <LinearGradient
                    colors={[theme.colors.secondary, theme.colors.secondaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.messageGradient}
                  >
                    <Text style={styles.messageText}>{message.text}</Text>
                  </LinearGradient>
                ) : (
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.messageGradient}
                  >
                    <Text style={styles.messageText}>{message.text}</Text>
                  </LinearGradient>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Meeting Location Card */}
      {showQuickPrompts && (
        <View style={styles.meetingCard}>
          <LinearGradient
            colors={['#FFF8E7', '#FFE4E1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.meetingCardGradient}
          >
            <View style={styles.meetingCardContent}>
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.accentLight]}
                style={styles.meetingIcon}
              >
                <Text style={styles.meetingIconText}>📍</Text>
              </LinearGradient>
              <View style={styles.meetingInfo}>
                <Text style={styles.meetingTitle}>Meeting Location</Text>
                <Text style={styles.meetingSubtitle}>Coffee Shop, Main Street</Text>
                <TouchableOpacity style={styles.directionsButton}>
                  <Text style={styles.directionsButtonText}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Support Message */}
      {showQuickPrompts && (
        <View style={styles.supportMessage}>
          <LinearGradient
            colors={[`${theme.colors.primary}33`, `${theme.colors.secondary}33`]}
            style={styles.supportGradient}
          >
            <Text style={styles.supportIcon}>❤️</Text>
            <Text style={styles.supportText}>Helping with dignity & care</Text>
          </LinearGradient>
        </View>
      )}

      {/* Quick Prompts */}
      {showQuickPrompts && <QuickPrompts onSelectPrompt={handleQuickPrompt} />}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Send a message..."
            placeholderTextColor={theme.colors.textTertiary}
            value={text}
            onChangeText={setText}
            onSubmitEditing={doSend}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={doSend}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...theme.shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  headerLocationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  headerSpacer: {
    width: 40,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  safetyIcon: {
    fontSize: 16,
  },
  safetyText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 24,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 24,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  messageBubbleMine: {
    borderTopRightRadius: 8,
  },
  messageBubbleThem: {
    borderTopLeftRadius: 8,
  },
  messageGradient: {
    padding: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.surface,
  },
  meetingCard: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  meetingCardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${theme.colors.primary}4D`,
  },
  meetingCardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  meetingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingIconText: {
    fontSize: 20,
  },
  meetingInfo: {
    flex: 1,
    gap: 4,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  meetingSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  directionsButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  directionsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },
  supportMessage: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  supportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  supportIcon: {
    fontSize: 16,
  },
  supportText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.lg,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 20,
    color: theme.colors.surface,
    fontWeight: '700',
  },
});

