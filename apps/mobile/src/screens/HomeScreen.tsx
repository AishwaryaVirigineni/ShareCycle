/**
 * HomeScreen - Converted from Figma Design
 * Matches exact Figma design with gradients, tabs, and cards
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from '../components/Logo';
import LocationPill from '../components/LocationPill';
import { theme } from '../theme';
import * as Location from 'expo-location';
import { subscribePadRequests, PadRequest, acceptRequest, subscribeMatches } from '../services/firestoreService';
import { getOwnerId } from '../ownerId';
import { kmToProximityBand, getProximityLabel } from '../utils/proximity';

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
  const [activeTab, setActiveTab] = useState<'request' | 'help'>('request');
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    getOwnerId()
      .then(setOwnerId)
      .catch((err) => {
        console.error('Failed to get owner ID:', err);
        setFirebaseError('Failed to initialize user');
      });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          return;
        }
        const p = await Location.getCurrentPositionAsync({});
        setLoc({ latitude: p.coords.latitude, longitude: p.coords.longitude });
        setLoading(false);
      } catch (err) {
        console.error('Location error:', err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // Subscribe to requests with error handling
    let unsubscribe: (() => void) | null = null;
    
    try {
      unsubscribe = subscribePadRequests((items) => {
        // Filter out any invalid items and ensure fresh data
        const validItems = items.filter(
          (item) => item && item.id && item.ownerId && item.status
        );
        setRequests(validItems);
        setFirebaseError(null);
      });
    } catch (err) {
      console.error('Firebase subscription error:', err);
      setFirebaseError('Failed to load requests');
      setRequests([]); // Clear stale data
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Calculate nearby requests that need help (for "Can Help" tab)
  // Only show pending requests from other users within 50km
  // IMPORTANT: This must be called BEFORE any early returns (Rules of Hooks)
  const nearby = useMemo(() => {
    if (!loc || !ownerId || !requests || requests.length === 0) {
      return [];
    }

    return requests
      .filter((r) => {
        // Validate request data
        if (!r || !r.id || !r.ownerId || !r.status) {
          return false;
        }
        // Only show pending/open requests from other users (not expired)
        if (r.status !== 'pending' && r.status !== 'open') {
          return false;
        }
        if (r.ownerId === ownerId) {
          return false;
        }
        // Filter out expired requests (older than 15 minutes)
        if (r.createdAt) {
          const now = Date.now();
          const fifteenMinutesAgo = now - (15 * 60 * 1000);
          const createdAt = r.createdAt.toMillis ? r.createdAt.toMillis() : (r.createdAt * 1000);
          if (createdAt < fifteenMinutesAgo) {
            return false;
          }
        }
        return true;
      })
      .map((r) => {
        try {
          const distance = kmBetween(loc, { latitude: r.latitude, longitude: r.longitude });
          return {
            ...r,
            distance,
          };
        } catch (err) {
          console.warn('Error calculating distance for request:', r.id, err);
          return null;
        }
      })
      .filter((r): r is NonNullable<typeof r> => {
        // Filter out nulls and requests beyond 50km
        return r !== null && r.distance <= 50;
      })
      .sort((a, b) => a.distance - b.distance);
  }, [requests, loc, ownerId]);

  // Debug logging (only in development)
  useEffect(() => {
    if (__DEV__) {
      console.log('HomeScreen - Nearby requests:', {
        totalRequests: requests.length,
        nearbyCount: nearby.length,
        activeTab,
        ownerId,
        hasLocation: !!loc,
      });
    }
  }, [nearby.length, requests.length, activeTab, ownerId, loc]);

  // Subscribe to matches for requester (auto-open chat when helper accepts)
  useEffect(() => {
    if (!ownerId || !requests.length) return;
    
    const hasPendingRequest = requests.some(r => r.ownerId === ownerId && (r.status === 'pending' || r.status === 'open'));
    if (!hasPendingRequest) return;
    
    let unsubscribeMatches: (() => void) | null = null;
    
    try {
      unsubscribeMatches = subscribeMatches(ownerId, async (match) => {
        if (match && match.threadId) {
          // Use helperId from match if available, otherwise find from request
          const helperId = match.helperId;
          const request = requests.find(r => r.id === match.requestId);
          
          // If we have a helperId from match, use it; otherwise fall back to request.acceptorId
          const otherUserId = helperId || (request?.acceptorId);
          
          if (otherUserId) {
            // Store active thread
            const { setActiveThread } = await import('../services/storageService');
            await setActiveThread(ownerId, {
              threadId: match.threadId,
              requestId: match.requestId,
              otherId: otherUserId,
              role: 'requester',
              urgency: request?.urgency,
              isTopK: true,
            });

            navigation.replace('Chat', {
              conversationId: match.threadId,
              meId: ownerId,
              otherId: otherUserId,
              isConnected: true,
              role: 'requester',
              urgency: request?.urgency,
              isTopK: true,
              requestId: match.requestId,
            });
          }
        }
      });
    } catch (err) {
      console.error('Matches subscription error:', err);
    }

    return () => {
      if (unsubscribeMatches) unsubscribeMatches();
    };
  }, [ownerId, requests, navigation]);

  // Early return AFTER all hooks (Rules of Hooks)
  if (loading || !loc || !ownerId) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Preparing your view…</Text>
        {firebaseError && (
          <Text style={styles.errorText}>{firebaseError}</Text>
        )}
      </View>
    );
  }

  const handleAccept = async (r: any) => {
    try {
      // Accept request and get threadId (idempotent)
      const threadId = await acceptRequest(r.id, ownerId!, r.ownerId);
      
      // Navigate with timeout fallback
      const timeout = setTimeout(() => {
        Alert.alert("Opening chat...", "Please wait a moment");
      }, 2000);
      
      // Store active thread
      const { setActiveThread } = await import('../services/storageService');
      await setActiveThread(ownerId, {
        threadId,
        requestId: r.id,
        otherId: r.ownerId,
        role: 'helper',
        urgency: r.urgency,
        isTopK: true,
      });

      navigation.replace('Chat', {
        conversationId: threadId,
        meId: ownerId,
        otherId: r.ownerId,
        isConnected: true,
        role: 'helper',
        urgency: r.urgency,
        isTopK: true,
        requestId: r.id,
      });
      
      clearTimeout(timeout);
    } catch (error: any) {
      console.error("Failed to accept request:", error);
      Alert.alert(
        "Error",
        "Failed to accept request. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.logoContainer}>
                <Logo size={45} />
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>ShareCycle</Text>
                  <Text style={styles.subtitle}>Your location is active</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.userButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.userIcon}>👤</Text>
              </TouchableOpacity>
            </View>

            {/* Compact Location Pill */}
            <View style={styles.locationPillContainer}>
              <LocationPill
                latitude={loc?.latitude}
                longitude={loc?.longitude}
                nearbyCount={nearby.length}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Sticky Tab Navigation */}
        <View style={styles.tabContainerSticky}>
          <View style={styles.tabWrapper}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'request' && styles.tabActive]}
              onPress={() => setActiveTab('request')}
            >
              <LinearGradient
                colors={activeTab === 'request' ? [theme.colors.primary, theme.colors.primaryLight] : ['transparent', 'transparent']}
                style={[styles.tabGradient, !activeTab && styles.tabInactive]}
              >
                <Text style={[styles.tabText, activeTab === 'request' && styles.tabTextActive]}>
                  Need Help
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'help' && styles.tabActive]}
              onPress={() => setActiveTab('help')}
            >
              <LinearGradient
                colors={activeTab === 'help' ? [theme.colors.secondary, theme.colors.secondaryDark] : ['transparent', 'transparent']}
                style={[styles.tabGradient, !activeTab && styles.tabInactive]}
              >
                <Text style={[styles.tabText, activeTab === 'help' && styles.tabTextActive]}>
                  Can Help
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {activeTab === 'request' ? (
            <View style={styles.requestTab}>
              {/* Main Request Button */}
              <TouchableOpacity
                style={styles.requestButton}
                onPress={() => navigation.navigate('RequestPad')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[theme.colors.accent, theme.colors.accentLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.requestButtonGradient}
                >
                  <View style={styles.requestButtonContent}>
                    <View style={styles.requestIconContainer}>
                      <Text style={styles.requestIcon}>❤️</Text>
                    </View>
                    <Text style={styles.requestButtonTitle}>Request Pad</Text>
                    <Text style={styles.requestButtonSubtitle}>Send request to nearby helpers</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Map Placeholder */}
              <View style={styles.mapPlaceholder}>
                <LinearGradient
                  colors={[theme.colors.secondary, theme.colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mapGradient}
                >
                  <View style={styles.mapContent}>
                    <Text style={styles.mapIcon}>📍</Text>
                    <Text style={styles.mapText}>Location-based matching</Text>
                    <Text style={styles.mapSubtext}>Find helpers nearby</Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Active Requests Info */}
              {nearby.length > 0 && (
                <View style={styles.activeRequestsCard}>
                  <View style={styles.activeRequestsHeader}>
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.secondary]}
                      style={styles.activeRequestsIcon}
                    >
                      <Text style={styles.activeRequestsIconText}>❤️</Text>
                    </LinearGradient>
                    <View style={styles.activeRequestsInfo}>
                      <Text style={styles.activeRequestsTitle}>Active Requests Nearby</Text>
                      <Text style={styles.activeRequestsSubtitle}>{nearby.length} people need help</Text>
                    </View>
                  </View>

                  {nearby.slice(0, 2).map((request) => (
                    <View key={request.id} style={styles.requestItem}>
                      <View style={styles.requestItemLeft}>
                        <LinearGradient
                          colors={[theme.colors.primaryLight, theme.colors.accentLight]}
                          style={styles.requestAvatar}
                        >
                          <Text style={styles.requestAvatarText}>
                            {request.ownerId?.charAt(0).toUpperCase() || '?'}
                          </Text>
                        </LinearGradient>
                        <View>
                          <View style={styles.requestNameRow}>
                            <Text style={styles.requestName}>
                              Request {request.id?.slice(-6) || 'Unknown'}
                            </Text>
                            {request.urgency && (
                              <View style={[
                                styles.urgencyBadge,
                                request.urgency === 'urgent' && styles.urgencyBadgeUrgent,
                                request.urgency === 'normal' && styles.urgencyBadgeNormal,
                              ]}>
                                <Text style={styles.urgencyDot}>●</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.requestDistance}>
                            {getProximityLabel(kmToProximityBand(request.distance))}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.helpTab}>
              {/* Help Instructions */}
              <View style={styles.helpCard}>
                <LinearGradient
                  colors={[theme.colors.secondary, theme.colors.secondaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.helpCardGradient}
                >
                  <Text style={styles.helpCardTitle}>Share with Care</Text>
                  <Text style={styles.helpCardText}>
                    Accept a request below to connect and help someone nearby. All conversations are private and secure.
                  </Text>
                </LinearGradient>
              </View>

              {/* Nearby Requests to Accept */}
              {nearby.length > 0 ? (
                <View style={styles.requestsList}>
                  <Text style={styles.requestsListTitle}>
                    {nearby.length === 1 ? 'Request Near You' : 'Requests Near You'}
                  </Text>
                  {nearby.map((request) => (
                    <View key={request.id} style={styles.helpRequestCard}>
                      <View style={styles.helpRequestHeader}>
                        <View style={styles.helpRequestLeft}>
                          <LinearGradient
                            colors={[theme.colors.primary, theme.colors.secondary]}
                            style={styles.helpRequestAvatar}
                          >
                            <Text style={styles.helpRequestAvatarText}>
                              {request.ownerId?.charAt(0).toUpperCase() || '?'}
                            </Text>
                          </LinearGradient>
                          <View>
                            <View style={styles.requestNameRow}>
                              <Text style={styles.helpRequestName}>
                                Request {request.id?.slice(-6) || 'Unknown'}
                              </Text>
                              {request.urgency && (
                                <View style={[
                                  styles.urgencyBadge,
                                  request.urgency === 'urgent' && styles.urgencyBadgeUrgent,
                                  request.urgency === 'normal' && styles.urgencyBadgeNormal,
                                ]}>
                                  <Text style={styles.urgencyDot}>●</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.helpRequestDistance}>
                              {getProximityLabel(kmToProximityBand(request.distance))}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAccept(request)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={[theme.colors.secondary, theme.colors.secondaryDark]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.acceptButtonGradient}
                        >
                          <Text style={styles.acceptButtonText}>Accept & Connect</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyTitle}>No Requests Nearby</Text>
                  <Text style={styles.emptyText}>
                    There are no pending requests in your area right now.{'\n'}
                    Check back soon or help spread the word!
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Safe Space Indicator */}
      <View style={styles.safeSpaceContainer}>
        <View style={styles.safeSpace}>
          <Text style={styles.safeSpaceIcon}>❤️</Text>
          <Text style={styles.safeSpaceText}>Safe, private, & supportive</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...theme.shadows.lg,
  },
  headerContent: {
    gap: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleContainer: {
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  userButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  userIcon: {
    fontSize: 20,
  },
  locationPillContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  locationIcon: {
    fontSize: 20,
  },
  locationInfo: {
    flex: 1,
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  locationSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  searchIcon: {
    fontSize: 20,
  },
  tabContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
  },
  tabContainerSticky: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    ...theme.shadows.sm,
  },
  tabWrapper: {
    flexDirection: 'row',
    gap: 12,
    padding: 4,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabActive: {
    ...theme.shadows.sm,
  },
  tabGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.surface,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  requestTab: {
    gap: 24,
  },
  requestButton: {
    borderRadius: 24,
    overflow: 'hidden',
    ...theme.shadows.xl,
  },
  requestButtonGradient: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButtonContent: {
    alignItems: 'center',
    gap: 12,
  },
  requestIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestIcon: {
    fontSize: 32,
  },
  requestButtonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  requestButtonSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  mapPlaceholder: {
    height: 192,
    borderRadius: 24,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  mapGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  mapContent: {
    alignItems: 'center',
    gap: 8,
  },
  mapIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  mapSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeRequestsCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
    gap: 12,
  },
  activeRequestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  activeRequestsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRequestsIconText: {
    fontSize: 20,
  },
  activeRequestsInfo: {
    flex: 1,
    gap: 4,
  },
  activeRequestsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  activeRequestsSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  requestItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  requestDistance: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  helpTab: {
    gap: 16,
  },
  helpCard: {
    borderRadius: 24,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  helpCardGradient: {
    padding: 24,
    gap: 8,
  },
  helpCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  helpCardText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  requestsList: {
    gap: 12,
  },
  requestsListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  helpRequestCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
    gap: 16,
  },
  helpRequestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  helpRequestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpRequestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpRequestAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  helpRequestName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  helpRequestDistance: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  requestNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgencyBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyBadgeUrgent: {
    backgroundColor: theme.colors.error,
  },
  urgencyBadgeNormal: {
    backgroundColor: theme.colors.warning,
  },
  urgencyDot: {
    fontSize: 8,
    color: theme.colors.surface,
  },
  acceptButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  acceptButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  safeSpaceContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    alignItems: 'center',
  },
  safeSpace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...theme.shadows.lg,
  },
  safeSpaceIcon: {
    fontSize: 16,
  },
  safeSpaceText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

