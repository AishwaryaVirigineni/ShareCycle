/**
 * Request Pad Screen with Draggable Pin
 * Shows map with draggable pin, logo while loading
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
  PanResponder,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../theme";
import { Logo } from "../components/Logo";

// Safe Logo wrapper for Android
const SafeLogo = ({ size, animate }: { size?: number; animate?: boolean }) => {
  try {
    return <Logo size={size} animate={animate} />;
  } catch (e) {
    console.warn('Logo render error:', e);
    return <Text style={{ fontSize: size || 100 }}>🌸</Text>;
  }
};
import * as Location from "expo-location";
import { addPadRequest } from "../services/firestoreService";
import { getOwnerId } from "../ownerId";
import { apiClient } from "../services/apiClient";

export default function RequestPadScreen({ navigation }: any) {
  const [loc, setLoc] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingAddress, setUpdatingAddress] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  // Pan responder for dragging pin - Android-safe version
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond if moved more than 5 pixels
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        try {
          pan.setOffset({
            x: (pan.x as any)._value || 0,
            y: (pan.y as any)._value || 0,
          });
        } catch (e) {
          console.warn("Pan responder grant error:", e);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        try {
          pan.setValue({
            x: gestureState.dx,
            y: gestureState.dy,
          });
        } catch (e) {
          console.warn("Pan responder move error:", e);
        }
      },
      onPanResponderRelease: async () => {
        try {
          pan.flattenOffset();
          // Update location based on drag
          if (loc) {
            const currentX = (pan.x as any)._value || 0;
            const currentY = (pan.y as any)._value || 0;
            
            // Convert pan offset to lat/lng delta (approximate)
            const latDelta = currentY / 111000; // ~111km per degree latitude
            const lngDelta = currentX / (111000 * Math.cos(loc.latitude * Math.PI / 180));
            
            const newLoc = {
              latitude: Math.max(-90, Math.min(90, loc.latitude - latDelta)),
              longitude: Math.max(-180, Math.min(180, loc.longitude + lngDelta)),
            };
            setSelectedLoc(newLoc);
            
            // Reverse geocode new location
            setUpdatingAddress(true);
            try {
              const addr = await Location.reverseGeocodeAsync(newLoc);
              if (addr && addr.length > 0) {
                const a = addr[0];
                const formatted = [
                  a.name,
                  a.street,
                  a.city,
                  a.region,
                  a.postalCode,
                  a.country,
                ]
                  .filter(Boolean)
                  .join(", ");
                setAddress(formatted);
              }
            } catch (e) {
              console.warn("Reverse geocode error:", e);
            } finally {
              setUpdatingAddress(false);
            }
          }
          
          // Reset pan after a delay
          setTimeout(() => {
            pan.setValue({ x: 0, y: 0 });
          }, 100);
        } catch (e) {
          console.warn("Pan responder release error:", e);
        }
      },
    })
  ).current;

  // Fetch user location + reverse geocode
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location permission is required.");
          setLoading(false);
          return;
        }

        const res = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: res.coords.latitude,
          longitude: res.coords.longitude,
        };
        setLoc(coords);
        setSelectedLoc(coords);

        // Animate zoom effect
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();

        const addr = await Location.reverseGeocodeAsync(coords);
        if (addr.length > 0) {
          const a = addr[0];
          const formatted = [
            a.name,
            a.street,
            a.city,
            a.region,
            a.postalCode,
            a.country,
          ]
            .filter(Boolean)
            .join(", ");
          setAddress(formatted);
        }
      } catch (e) {
        console.warn("Location/reverse geocode error:", e);
        Alert.alert("Error", "Could not fetch location.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRequestPad = async () => {
    const locationToUse = selectedLoc || loc;
    if (!locationToUse) {
      Alert.alert("Please wait", "Location not ready yet.");
      return;
    }
    
    try {
      setSaving(true);
      
      // Get owner ID with error handling
      let ownerId: string;
      try {
        ownerId = await getOwnerId();
        if (!ownerId) {
          throw new Error("User ID not available");
        }
      } catch (err) {
        console.error("Failed to get owner ID:", err);
        Alert.alert(
          "Error",
          "Failed to get user information. Please try logging in again."
        );
        setSaving(false);
        return;
      }

      // Create request with detailed error handling
      console.log("Creating pad request...", {
        lat: locationToUse.latitude,
        lng: locationToUse.longitude,
        address,
        ownerId,
      });

      // Navigate to confirmation screen (empathy gated)
      navigation.navigate("ConfirmRequest", {
        latitude: locationToUse.latitude,
        longitude: locationToUse.longitude,
        address: address ?? undefined,
        ownerId,
      });
    } catch (e: any) {
      console.error("Request creation failed:", e);
      const errorMessage = e?.message || e?.toString() || "Unknown error";
      
      Alert.alert(
        "Failed to Create Request",
        `Could not send request: ${errorMessage}\n\nPlease check:\n• Your internet connection\n• Firebase configuration\n• Try again in a moment`,
        [
          { text: "OK", style: "default" },
          {
            text: "Retry",
            onPress: () => handleRequestPad(),
          },
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <LinearGradient
          colors={[theme.colors.background, theme.colors.secondaryLight]}
          style={styles.loadingGradient}
        >
          <SafeLogo size={140} animate={true} />
          <Text style={styles.loadingText}>Finding your location…</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Placeholder with Gradient */}
      <Animated.View
        style={[
          styles.map,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.colors.secondary, theme.colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mapGradient}
        >
          <View style={styles.mapContent}>
            {/* Draggable Pin */}
            <Animated.View
              style={[
                styles.pinContainer,
                {
                  transform: [
                    { translateX: pan.x },
                    { translateY: pan.y },
                  ],
                },
              ]}
              {...(panResponder?.panHandlers || {})}
            >
              <View style={styles.pin}>
                <View style={styles.pinDot} />
                <View style={styles.pinPulse} />
              </View>
            </Animated.View>
            
            <Text style={styles.mapHint}>Drag the pin to adjust location</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Request a Pad</Text>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.handle} />
          
          {/* Location Display */}
          <TouchableOpacity
            style={styles.locationCard}
            onPress={() => {
              // Could open location picker here
              Alert.alert("Change Location", "Drag the pin on the map to change your location");
            }}
          >
            <Text style={styles.locationLabel}>Your location</Text>
            {updatingAddress ? (
              <ActivityIndicator size="small" color={theme.colors.textSecondary} />
            ) : (
              <Text style={styles.locationText} numberOfLines={2}>
                {address || "Getting address..."}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.requestButton, saving && styles.requestButtonDisabled]}
            onPress={handleRequestPad}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.requestButtonText}>Request a Pad</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  map: {
    flex: 1,
  },
  mapGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  mapHint: {
    position: "absolute",
    bottom: 100,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  pinContainer: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  pin: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  pinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    borderWidth: 4,
    borderColor: theme.colors.surface,
    ...theme.shadows.lg,
    zIndex: 2,
  },
  pinPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    opacity: 0.3,
    top: -8,
    left: -8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "box-none",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    ...theme.shadows.md,
  },
  backButtonText: {
    fontSize: 24,
    color: "#333",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    ...theme.shadows.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  locationCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceVariant,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  requestButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    ...theme.shadows.primary,
  },
  requestButtonDisabled: {
    opacity: 0.6,
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
