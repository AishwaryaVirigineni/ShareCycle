// src/screens/BotChatScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

/**
 * Bot Chat Screen - Now uses FastAPI backend for classification
 * Replaces direct OpenAI calls with backend /classify endpoint
 */
import { apiClient } from '../services/apiClient';
import { API_BASE_URL } from '../config/api';

type Msg = { id: string; from: "user" | "bot"; text: string };

export default function BotChatScreen() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    // Push my message locally
    const userMsg: Msg = { id: Date.now().toString(), from: "user", text };
    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setLoading(true);

    try {
      // Use backend /classify endpoint for urgency detection and empathy response
      const response = await apiClient.classifyMessage(text);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        // Use the empathy message from backend
        const botText = response.data.empathy || "💗 I'm here for you. Tell me how you're feeling.";
        const botMsg: Msg = { id: Date.now().toString() + "b", from: "bot", text: botText };
        setMessages((prev) => [botMsg, ...prev]);
      } else {
        throw new Error("No response from backend");
      }
    } catch (err: any) {
      console.warn("Bot error:", err?.message || err);
      Alert.alert(
        "Connection Error",
        `Could not reach the backend at ${API_BASE_URL}. Make sure the server is running and your device is on the same WiFi network.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🌸 Chat with Blossom Bot</Text>
        <Text style={styles.sub}>Wellbeing companion (dev mode)</Text>
      </View>

      <FlatList
        data={messages}
        inverted
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.row,
              item.from === "user" ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" },
            ]}
          >
            <View style={[styles.bubble, item.from === "user" ? styles.mine : styles.theirs]}>
              <Text style={{ color: item.from === "user" ? "#fff" : "#111" }}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Say anything…"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          editable={!loading}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={loading}>
          <Text style={{ color: "white", fontWeight: "700" }}>{loading ? "…" : "Send"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.note}>
          💡 Powered by FastAPI backend - Privacy-first, no external AI APIs
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 18, fontWeight: "700" },
  sub: { color: "#666", marginTop: 2 },
  row: { flexDirection: "row", marginVertical: 6, paddingHorizontal: 10 },
  bubble: { padding: 10, borderRadius: 16, maxWidth: "75%" },
  mine: { backgroundColor: "#E91E63" },
  theirs: { backgroundColor: "#eee" },
  inputRow: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderColor: "#eee" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 20, paddingHorizontal: 12, height: 44 },
  sendBtn: { marginLeft: 8, backgroundColor: "#E91E63", borderRadius: 20, paddingHorizontal: 16, justifyContent: "center" },
  noteBox: { paddingHorizontal: 16, paddingBottom: 8 },
  note: { color: "#999", fontSize: 12, textAlign: "center" },
});
