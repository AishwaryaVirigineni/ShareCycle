/**
 * Profile Screen
 * User profile information and settings
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import { Logo } from '../components/Logo';

export default function ProfileScreen({ navigation, onLogout }: any) {
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const phone = await AsyncStorage.getItem('userPhone');
      setUserName(name || '');
      setUserPhone(phone || '');
    } catch (error) {
      console.warn('Failed to load user info:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all user data first
              await AsyncStorage.multiRemove([
                'userName',
                'userPhone',
                'userVerified',
                'tempName',
                'tempPhone',
              ]);
              
              // Call the logout handler from AppNavigator
              // This will update the login state and trigger re-render
              if (onLogout) {
                await onLogout();
              }
              
              // The AppNavigator will automatically show Login screen
              // due to conditional rendering based on isLoggedIn state
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.accentLight]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase() || '?'}
                </Text>
              </LinearGradient>
            </View>
            <Text style={styles.headerName}>{userName || 'User'}</Text>
            <Text style={styles.headerPhone}>{userPhone || 'No phone number'}</Text>
          </View>
        </LinearGradient>

        {/* Profile Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{userName || 'Not set'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{userPhone || 'Not set'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Account Status</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔒</Text>
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>ℹ️</Text>
            <Text style={styles.settingText}>About ShareCycle</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>💬</Text>
            <Text style={styles.settingText}>Help & Support</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>📧</Text>
            <Text style={styles.settingText}>Contact Us</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Logo */}
        <View style={styles.footer}>
          <Logo size={60} />
          <Text style={styles.footerText}>ShareCycle</Text>
          <Text style={styles.footerSubtext}>Privacy-first support network</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...theme.shadows.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...theme.shadows.md,
  },
  backIcon: {
    fontSize: 20,
    color: theme.colors.textTertiary,
  },
  headerContent: {
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  headerName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  headerPhone: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    padding: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.successBg,
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.successText,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
    marginBottom: 12,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  settingArrow: {
    fontSize: 24,
    color: theme.colors.textTertiary,
  },
  logoutSection: {
    padding: 24,
    paddingTop: 8,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.errorBg,
    borderWidth: 2,
    borderColor: theme.colors.error,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  footerText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  footerSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

