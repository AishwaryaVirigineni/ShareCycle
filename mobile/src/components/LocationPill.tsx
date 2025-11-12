/**
 * Compact Location Pill Component
 * Shows short place label (building + campus) in a compact pill format
 * Tap to open location sheet
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { theme } from '../theme';

interface LocationPillProps {
  latitude?: number;
  longitude?: number;
  nearbyCount?: number;
  onLocationChange?: (location: { lat: number; lng: number; label: string }) => void;
}

export default function LocationPill({
  latitude,
  longitude,
  nearbyCount = 0,
  onLocationChange,
}: LocationPillProps) {
  const [placeLabel, setPlaceLabel] = useState<string>('Loading location...');
  const [showSheet, setShowSheet] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (latitude && longitude) {
      updatePlaceLabel(latitude, longitude);
    }
  }, [latitude, longitude]);

  const updatePlaceLabel = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const addresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        // Format: "Building Name - City" or "Street - City"
        const building = addr.name || addr.street || '';
        const city = addr.city || addr.region || '';
        
        if (building && city) {
          setPlaceLabel(`${building} - ${city}`);
        } else if (building) {
          setPlaceLabel(building);
        } else if (city) {
          setPlaceLabel(city);
        } else {
          setPlaceLabel('Location');
        }
      } else {
        setPlaceLabel('Location');
      }
    } catch (error) {
      console.warn('Reverse geocode error:', error);
      setPlaceLabel('Location');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    setShowSheet(true);
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    await updatePlaceLabel(lat, lng);
    if (onLocationChange) {
      onLocationChange({ lat, lng, label: placeLabel });
    }
    setShowSheet(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.pill}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.colors.surface, theme.colors.surfaceVariant]}
          style={styles.pillGradient}
        >
          <Text style={styles.pinIcon}>📍</Text>
          <View style={styles.pillContent}>
            <Text style={styles.placeLabel} numberOfLines={1}>
              {loading ? 'Loading...' : placeLabel}
            </Text>
            {nearbyCount > 0 && (
              <Text style={styles.nearbyCount}>{nearbyCount} nearby</Text>
            )}
          </View>
          <Text style={styles.searchIcon}>🔍</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Location Sheet Modal */}
      <Modal
        visible={showSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSheet(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Change Location</Text>
            <ScrollView style={styles.sheetContent}>
              <Text style={styles.sheetText}>
                Location selection feature coming soon.{'\n\n'}
                For now, your current location is being used.
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSheet(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  pillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    minHeight: 36,
  },
  pinIcon: {
    fontSize: 16,
  },
  pillContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  nearbyCount: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  searchIcon: {
    fontSize: 16,
    color: theme.colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '80%',
    ...theme.shadows.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sheetContent: {
    paddingHorizontal: 24,
  },
  sheetText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});

