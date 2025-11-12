/**
 * ChatScreen - Uber/Lyft-style readable chat
 * Newest messages at bottom, ascending order, role-aware labels
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { subscribeMessages, sendMessage, ChatMessage } from '../services/firestoreService';
import { BOT_ID } from '../constants/bot';
import { apiClient } from '../services/apiClient';
import ChatBubble from '../components/ChatBubble';
import SystemBanner from '../components/SystemBanner';
import PromptTray from '../components/PromptTray';
import ChatHeader from '../components/ChatHeader';
import QuickPrompts from '../components/QuickPrompts';
import { formatRequesterLabel, formatHelperLabel, initialForUser } from '../utils/names';

interface MessageItem {
  id: string;
  type: 'message' | 'day';
  text?: string;
  senderId?: string;
  timestamp?: number;
  isMine?: boolean;
  showSafetyHint?: boolean;
  dayLabel?: string;
}

export default function ChatScreen({ route, navigation }: any) {
  const { conversationId, meId, otherId, isConnected, role, urgency, isTopK, requestId } = route.params || {};
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [safetyFlagsMap, setSafetyFlagsMap] = useState<Record<string, boolean>>({});
  const [showFullPrompts, setShowFullPrompts] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine thread type: human threads never get bot auto-replies
  const threadType = otherId === BOT_ID ? 'bot' : 'human';

  // Prevent accidental back navigation - remind user to use menu
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      e.preventDefault();
      
      Alert.alert(
        'Leave Chat?',
        'Use the menu (⋯) in the top right to cancel or complete the request.',
        [
          {
            text: 'Stay',
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: 'Leave Anyway',
            style: 'destructive',
            onPress: () => {
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsub = subscribeMessages(conversationId, setMessages);
    return () => unsub();
  }, [conversationId]);

  // Debounced auto-scroll to bottom when new message arrives and user is near bottom
  useEffect(() => {
    if (messages.length > 0 && isNearBottom) {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      // Debounce scroll
      scrollTimeoutRef.current = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages.length, isNearBottom]);

  // Track safety flags for pending message
  useEffect(() => {
    if (pendingMessageId && messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg.id === pendingMessageId) {
        // Message arrived, check if we have safety flags for it
        // (flags are tracked in sendMessageWithFilter)
      }
    }
  }, [messages, pendingMessageId]);

  // Format messages for FlatList - ascending order, newest at bottom
  const formattedMessages = useMemo(() => {
    const items: MessageItem[] = [];

    // Sort messages in ascending time order (oldest first, newest last)
    const sortedMessages = [...messages].sort((a, b) => {
      const aTime = a.createdAt 
        ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : (typeof a.createdAt === 'number' ? a.createdAt : 0))
        : 0;
      const bTime = b.createdAt 
        ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : (typeof b.createdAt === 'number' ? b.createdAt : 0))
        : 0;
      return aTime - bTime;
    });

    // Group messages by day and 5-minute clusters
    let currentDay: string | null = null;
    let lastTimestamp: number | null = null;
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    const FIVE_MINUTES = 5 * 60 * 1000;

    sortedMessages.forEach((message, index) => {
      // Handle Firestore timestamp
      let msgDate: Date;
      let timestamp: number;
      if (message.createdAt) {
        if (message.createdAt.toDate) {
          msgDate = message.createdAt.toDate();
        } else if (typeof message.createdAt === 'number') {
          msgDate = new Date(message.createdAt);
        } else {
          msgDate = new Date();
        }
      } else {
        msgDate = new Date();
      }
      timestamp = msgDate.getTime();
      if (isNaN(timestamp)) timestamp = Date.now();

      const msgDay = msgDate.toDateString();
      
      // Add day separator if needed
      if (msgDay !== currentDay) {
        let dayLabel = 'Today';
        if (msgDay === yesterday) {
          dayLabel = 'Yesterday';
        } else if (msgDay !== today) {
          dayLabel = msgDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        }
        items.push({
          id: `day-${msgDay}`,
          type: 'day',
          dayLabel,
        });
        currentDay = msgDay;
        lastTimestamp = null; // Reset cluster on new day
      }

      // Group timestamps by 5-minute clusters (only show timestamp if > 5 min from last)
      const shouldShowTimestamp = lastTimestamp === null || (timestamp - lastTimestamp) > FIVE_MINUTES;
      if (shouldShowTimestamp) {
        lastTimestamp = timestamp;
      }

      // Add message
      const isMine = message.senderId === meId;
      const showSafetyHint = safetyFlagsMap[message.id || ''] || false;
      
      items.push({
        id: message.id || `msg-${index}`,
        type: 'message',
        text: message.text,
        senderId: message.senderId,
        timestamp: shouldShowTimestamp ? timestamp : undefined,
        isMine,
        showSafetyHint,
      });
    });

    return items;
  }, [messages, meId, safetyFlagsMap]);

  const sendMessageWithFilter = useCallback(async (textToSend: string) => {
    // Filter message before sending (all sends go through safety filter)
    const filterResponse = await apiClient.filterMessage(textToSend);
    if (filterResponse.data) {
      const { textRedacted, flags } = filterResponse.data;
      
      // Track if safety filter was applied
      const hadRedaction = flags && Object.values(flags).some(v => v === true);
      
      // Send redacted text
      await sendMessage(conversationId, meId, textRedacted);
      
      // Track safety flags - we'll match by text content when message arrives
      if (hadRedaction) {
        // Store flag keyed by text content (approximate matching)
        setTimeout(() => {
          const latestMsg = messages[messages.length - 1];
          if (latestMsg && latestMsg.text === textRedacted) {
            setSafetyFlagsMap(prev => ({
              ...prev,
              [latestMsg.id || '']: true,
            }));
          }
        }, 500);
      }
    } else {
      await sendMessage(conversationId, meId, textToSend);
    }
  }, [conversationId, meId, messages]);

  const doSend = useCallback(() => {
    const t = text.trim();
    if (!t) return;
    setText('');
    sendMessageWithFilter(t);
  }, [text, sendMessageWithFilter]);

  const handlePrompt = useCallback((promptId: string, promptText: string) => {
    sendMessageWithFilter(promptText);
  }, [sendMessageWithFilter]);


  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    setIsNearBottom(distanceFromBottom < 200); // Consider "near bottom" if within 200px
  }, []);

  // Determine counterpart label based on role
  const counterpartLabel = role === 'helper' 
    ? formatRequesterLabel(undefined, otherId)
    : formatHelperLabel();
  const counterpartInitial = initialForUser(undefined, otherId);

  // Only show quick prompts for human threads
  const showQuickPrompts = threadType === 'human' && isConnected !== false;

  const renderItem = useCallback(({ item }: { item: MessageItem }) => {
    if (item.type === 'day') {
      return (
        <View style={styles.daySeparator}>
          <View style={styles.dayLine} />
          <Text style={styles.dayText}>{item.dayLabel}</Text>
          <View style={styles.dayLine} />
        </View>
      );
    }
    if (item.type === 'message') {
      return (
        <ChatBubble
          text={item.text || ''}
          isMine={item.isMine || false}
          timestamp={item.timestamp}
          showSafetyHint={item.showSafetyHint}
        />
      );
    }
    return null;
  }, []);

  const keyExtractor = useCallback((item: MessageItem) => item.id, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header with urgency dot and K badge */}
      <ChatHeader
        userId={otherId}
        displayName={counterpartLabel}
        onBack={() => {
          // Navigate to Home instead of goBack since Chat is reached via replace()
          navigation.replace('Home');
        }}
        urgency={urgency}
        isTopK={isTopK}
        role={role}
        onCancel={async () => {
          try {
            const { cancelRequest } = await import('../services/firestoreService');
            if (requestId) {
              await cancelRequest(requestId, meId, role === 'requester');
            }
            const { clearActiveThread } = await import('../services/storageService');
            await clearActiveThread(meId);
            navigation.replace('Home');
          } catch (error) {
            console.error('Failed to cancel:', error);
            Alert.alert('Error', 'Failed to cancel. Please try again.');
          }
        }}
        onDroppedOff={async () => {
          try {
            const { markDroppedOff } = await import('../services/firestoreService');
            if (requestId) {
              await markDroppedOff(requestId, meId);
            }
            const { clearActiveThread } = await import('../services/storageService');
            await clearActiveThread(meId);
            navigation.replace('Home');
          } catch (error) {
            console.error('Failed to mark dropped off:', error);
            Alert.alert('Error', 'Failed to mark as dropped off. Please try again.');
          }
        }}
      />

      {/* Messages List - ascending order, newest at bottom */}
      <FlatList
        ref={flatListRef}
        data={formattedMessages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
      />

      {/* Inline Prompt Tray - compact Uber/Lyft style above input */}
      {showQuickPrompts && !showFullPrompts && (
        <View style={styles.promptTrayContainer}>
          <PromptTray
            role={role || (isConnected ? 'requester' : undefined)}
            onSelect={handlePrompt}
            onMore={() => setShowFullPrompts(true)}
          />
        </View>
      )}


      {/* Full Quick Prompts Sheet */}
      {showQuickPrompts && showFullPrompts && (
        <View style={styles.fullPromptsContainer}>
          <View style={styles.fullPromptsHeader}>
            <Text style={styles.fullPromptsTitle}>Quick Prompts</Text>
            <TouchableOpacity onPress={() => setShowFullPrompts(false)}>
              <Text style={styles.fullPromptsClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <QuickPrompts
            onSelectPrompt={handlePrompt}
            role={role || (isConnected ? 'requester' : undefined)}
          />
        </View>
      )}

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
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
            onPress={doSend}
            disabled={!text.trim()}
            activeOpacity={0.7}
          >
            <Text style={[styles.sendIcon, !text.trim() && styles.sendIconDisabled]}>
              ➤
            </Text>
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  daySeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  dayLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderLight,
  },
  dayText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
  },
  fullPromptsContainer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    maxHeight: 300,
    ...theme.shadows.lg,
  },
  fullPromptsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  fullPromptsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  fullPromptsClose: {
    fontSize: 24,
    color: theme.colors.textTertiary,
    fontWeight: '300',
  },
  promptTrayContainer: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 4,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingTop: 4,
    backgroundColor: theme.colors.background,
    minHeight: 70,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  input: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 8,
    fontSize: 16,
    color: theme.colors.textPrimary,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.borderLight,
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 18,
    color: theme.colors.surface,
    fontWeight: '700',
  },
  sendIconDisabled: {
    color: theme.colors.textTertiary,
  },
});
