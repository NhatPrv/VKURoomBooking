import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useBookingStore } from '../store/useBookingStore';

interface HeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly showUserBadge?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showUserBadge = true,
}) => {
  const userSession = useBookingStore((state) => state.userSession);
  const raceConditionDemoMode = useBookingStore((state) => state.raceConditionDemoMode);

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <View style={styles.badgeRow}>
          <View style={styles.vkuBadge}>
            <Text style={styles.vkuBadgeText}>VKU SMART CAMPUS</Text>
          </View>
          {raceConditionDemoMode && (
            <View style={styles.testBadge}>
              <Ionicons name="flash" size={12} color="#DC2626" />
              <Text style={styles.testBadgeText}>409 TEST MODE</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {showUserBadge && (
        <View style={styles.userBadge}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>
              {userSession.studentId.substring(0, 2)}
            </Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentId}>{userSession.studentId}</Text>
            <Text style={styles.studentName} numberOfLines={1}>
              {userSession.name}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  leftCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  vkuBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  vkuBadgeText: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  testBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  testBadgeText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 140,
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  avatarMiniText: {
    color: COLORS.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
  studentInfo: {
    flex: 1,
  },
  studentId: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  studentName: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
});
