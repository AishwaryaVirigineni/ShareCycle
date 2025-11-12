import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { subscribeMessages, sendMessage, ChatMessage } from "../services/firestoreService";
import { BOT_ID, BOT_NAME } from "../constants/bot";
import { apiClient } from "../services/apiClient";
import QuickPrompts from "../components/QuickPrompts";

export default function ChatScreen({ route }: any) {
  const { conversationId, meId, otherId, isConnected } = route.params || {};
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const unsub = subscribeMessages(conversationId, setMessages);
    return () => unsub();
  }, [conversationId]);

  const doSend = async () => {
    const t = text.trim();
    if (!t) return;
    setText("");

    // Filter message for PII before sending
    const filterResponse = await apiClient.filterMessage(t);
    if (filterResponse.data) {
      const filteredText = filterResponse.data.textRedacted;
      const flags = filterResponse.data.flags;

      // Show safety notice if PII was detected
      if (Object.values(flags).some(v => v)) {
        Alert.alert(
          "Safety Filter",
          "Personal information was removed from your message for privacy.",
          [{ text: "OK" }]
        );
      }

      // Send filtered text to Firestore (or backend if using backend chat)
      await sendMessage(conversationId, meId, filteredText);
    } else {
      // Fallback: send original text if filter fails
      await sendMessage(conversationId, meId, t);
    }
  };

  const handleQuickPrompt = async (promptId: string, promptText: string) => {
    // Quick prompts are pre-sanitized, but we still filter them
    const filterResponse = await apiClient.filterMessage(promptText);
    const textToSend = filterResponse.data?.textRedacted || promptText;
    await sendMessage(conversationId, meId, textToSend);
  };

  // Only show quick prompts if connected to a real person (not bot)
  const showQuickPrompts = isConnected !== false && otherId !== BOT_ID;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {otherId === BOT_ID ? BOT_NAME : "Chat"}
        </Text>
      </View>

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 8 }}
        inverted
        data={messages}
        keyExtractor={(m) => m.id!}
        renderItem={({ item }) => {
          const mine = item.senderId === meId;
          return (
            <View style={[styles.row, mine ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.text, !mine && { color: "#111" }]}>{item.text}</Text>
              </View>
            </View>
          );
        }}
      />

      {showQuickPrompts && <QuickPrompts onSelectPrompt={handleQuickPrompt} />}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          value={text}
          onChangeText={setText}
          onSubmitEditing={doSend}
        />
        <TouchableOpacity style={styles.send} onPress={doSend}>
          <Text style={{ color: "white", fontWeight: "700" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 18, fontWeight: "700" },
  row: { flexDirection: "row", paddingHorizontal: 12, marginVertical: 6 },
  bubble: { maxWidth: "78%", padding: 10, borderRadius: 16 },
  mine: { backgroundColor: "#E91E63" },
  theirs: { backgroundColor: "#eee" },
  text: { color: "white" },
  inputRow: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderColor: "#eee" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 20, paddingHorizontal: 14, height: 44 },
  send: { marginLeft: 8, backgroundColor: "#E91E63", borderRadius: 20, paddingHorizontal: 16, justifyContent: "center" },
});
