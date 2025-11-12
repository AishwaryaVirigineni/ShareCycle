/**
 * Home Screen - Redesigned with elegant UI
 * Better button arrangement and minimal design
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { subscribePadRequests, PadRequest, acceptRequest } from "../services/firestoreService";
import { getOwnerId } from "../ownerId";

function kmBetween(a: any, b: any) {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export default function HomeScreen({ navigation }: any) {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loc, setLoc] = useState<any>(null);
  const [requests, setRequests] = useState<PadRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"nearby" | "mine">("nearby");

  useEffect(() => { getOwnerId().then(setOwnerId); }, []);
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return setLoading(false);
      const p = await Location.getCurrentPositionAsync({});
      setLoc({ latitude: p.coords.latitude, longitude: p.coords.longitude });
      setLoading(false);
    })();
  }, []);
  useEffect(() => subscribePadRequests(setRequests), []);

  if (loading || !loc || !ownerId)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Preparing your view…</Text>
      </View>
    );

  const mine = requests.filter((r) => r.ownerId === ownerId);
  const nearby = requests
    .filter((r) => r.status === "pending" && r.ownerId !== ownerId)
    .map((r) => ({
      ...r,
      distance: kmBetween(loc, { latitude: r.latitude, longitude: r.longitude }),
    }))
    .filter((r) => r.distance <= 50)
    .sort((a, b) => a.distance - b.distance);

  const list = mode === "mine" ? mine : nearby;

  const handleAccept = async (r: any) => {
    await acceptRequest(r.id, ownerId!, r.ownerId);
    navigation.navigate("Chat", {
      conversationId: r.id,
      meId: ownerId,
      otherId: r.ownerId,
      isConnected: true, // Mark as connected to real person
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌸</Text>
          <Text style={styles.title}>ShareCycle</Text>
          <Text style={styles.subtitle}>Privacy-first support network</Text>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("RequestPad")}
        >
          <Text style={styles.primaryButtonIcon}>➕</Text>
          <Text style={styles.primaryButtonText}>Request a Pad</Text>
        </TouchableOpacity>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === "nearby" && styles.modeButtonActive]}
            onPress={() => setMode("nearby")}
          >
            <Text style={[styles.modeButtonText, mode === "nearby" && styles.modeButtonTextActive]}>
              Nearby Requests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === "mine" && styles.modeButtonActive]}
            onPress={() => setMode("mine")}
          >
            <Text style={[styles.modeButtonText, mode === "mine" && styles.modeButtonTextActive]}>
              My Requests
            </Text>
          </TouchableOpacity>
        </View>

        {/* Requests List */}
        {list.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              {mode === "nearby"
                ? "No nearby requests at the moment"
                : "You haven't made any requests yet"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(i) => i.id!}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const isMine = item.ownerId === ownerId;
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>
                      {isMine ? "My Request" : "Nearby Request"}
                    </Text>
                    {item.status === "pending" && (
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Pending</Text>
                      </View>
                    )}
                    {item.status === "accepted" && (
                      <View style={[styles.statusBadge, styles.statusBadgeAccepted]}>
                        <Text style={[styles.statusText, styles.statusTextAccepted]}>Accepted</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.cardLocation}>
                    📍 {item.address ?? `${item.latitude.toFixed(3)}, ${item.longitude.toFixed(3)}`}
                  </Text>
                  {item.distance && (
                    <Text style={styles.cardDistance}>{item.distance.toFixed(1)} km away</Text>
                  )}

                  {mode === "nearby" && !isMine && item.status === "pending" && (
                    <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item)}>
                      <Text style={styles.acceptButtonText}>Accept & Help</Text>
                    </TouchableOpacity>
                  )}

                  {mode === "mine" && isMine && item.status === "accepted" && (
                    <TouchableOpacity
                      style={styles.chatButton}
                      onPress={() =>
                        navigation.navigate("Chat", {
                          conversationId: item.id,
                          meId: ownerId,
                          otherId: item.acceptorId,
                          isConnected: true, // Mark as connected to real person
                        })
                      }
                    >
                      <Text style={styles.chatButtonText}>Open Chat</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#E91E63",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E91E63",
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  modeToggle: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  modeButtonTextActive: {
    color: "#E91E63",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  statusBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeAccepted: {
    backgroundColor: "#E8F5E9",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F57C00",
  },
  statusTextAccepted: {
    color: "#2E7D32",
  },
  cardLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  cardDistance: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  chatButton: {
    backgroundColor: "#E91E63",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});
