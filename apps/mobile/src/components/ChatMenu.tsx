/**
 * ChatMenu Component
 * Menu with role-specific actions (Cancel request / Dropped off)
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { theme } from '../theme';

interface ChatMenuProps {
  role: 'requester' | 'helper';
  onCancel: () => void;
  onDroppedOff: () => void;
}

export default function ChatMenu({ role, onCancel, onDroppedOff }: ChatMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleCancel = () => {
    setMenuVisible(false);
    Alert.alert(
      role === 'requester' ? 'Cancel Request?' : 'Cancel Help?',
      role === 'requester'
        ? 'Are you sure you want to cancel this request?'
        : 'Are you sure you want to cancel helping?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: onCancel,
        },
      ]
    );
  };

  const handleDroppedOff = () => {
    setMenuVisible(false);
    Alert.alert(
      'Mark as Dropped Off?',
      'Confirm that you have successfully dropped off the items.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: onDroppedOff,
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.menuIcon}>⋯</Text>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {role === 'requester' ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.menuItemText, styles.menuItemDanger]}>
                  Cancel Request
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleDroppedOff}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.menuItemText, styles.menuItemSuccess]}>
                    ✓ Dropped Off
                  </Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.menuItemText, styles.menuItemDanger]}>
                    Cancel Help
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setMenuVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  menuIcon: {
    fontSize: 20,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    ...theme.shadows.lg,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderLight,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  menuItemDanger: {
    color: theme.colors.error || '#F44336',
  },
  menuItemSuccess: {
    color: theme.colors.successText || '#4CAF50',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.borderLight,
  },
});

