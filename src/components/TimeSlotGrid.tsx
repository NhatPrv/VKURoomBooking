import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeSlotId, TimeSlot } from '../types/room';
import { VKU_TIME_SLOTS } from '../constants/mockData';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { feedbackEffects } from '../utils/soundEffects';

interface TimeSlotGridProps {
  readonly selectedSlotId?: TimeSlotId;
  readonly occupiedSlotIds: readonly TimeSlotId[];
  readonly onSelectSlot: (slot: TimeSlot) => void;
  readonly isSubmitting?: boolean;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  selectedSlotId,
  occupiedSlotIds,
  onSelectSlot,
  isSubmitting = false,
}) => {
  const handlePressSlot = (slot: TimeSlot, isOccupied: boolean) => {
    if (isOccupied || isSubmitting) return;
    feedbackEffects.lightTap();
    onSelectSlot(slot);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Chọn Khung Giờ Học (Ca VKU)</Text>
        <Text style={styles.subtitle}>4 ca học tiêu chuẩn mỗi ngày</Text>
      </View>

      <View style={styles.grid}>
        {VKU_TIME_SLOTS.map((slot) => {
          const isOccupied = occupiedSlotIds.includes(slot.id);
          const isSelected = selectedSlotId === slot.id;

          return (
            <Pressable
              key={slot.id}
              disabled={isOccupied || isSubmitting}
              onPress={() => handlePressSlot(slot, isOccupied)}
              style={({ pressed }) => [
                styles.slotCard,
                isOccupied && styles.slotOccupied,
                isSelected && !isOccupied && styles.slotSelected,
                pressed && !isOccupied && styles.slotPressed,
              ]}
            >
              {/* Đầu thẻ slot: Tên ca & Trạng thái */}
              <View style={styles.slotHeader}>
                <View
                  style={[
                    styles.caPill,
                    isSelected && !isOccupied && styles.caPillSelected,
                    isOccupied && styles.caPillOccupied,
                  ]}
                >
                  <Text
                    style={[
                      styles.caPillText,
                      isSelected && !isOccupied && styles.caPillTextSelected,
                      isOccupied && styles.caPillTextOccupied,
                    ]}
                  >
                    {slot.session === 'MORNING' ? 'BUỔI SÁNG' : 'BUỔI CHIỀU'}
                  </Text>
                </View>

                {isOccupied ? (
                  <View style={styles.occupiedBadge}>
                    <Ionicons name="lock-closed" size={11} color={COLORS.occupiedText} />
                    <Text style={styles.occupiedBadgeText}>Đã có người đặt</Text>
                  </View>
                ) : isSelected ? (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={13} color={COLORS.textInverse} />
                    <Text style={styles.selectedBadgeText}>Đã chọn</Text>
                  </View>
                ) : (
                  <View style={styles.availableBadge}>
                    <View style={styles.greenDot} />
                    <Text style={styles.availableBadgeText}>Còn trống</Text>
                  </View>
                )}
              </View>

              {/* Thời gian chi tiết */}
              <Text
                style={[
                  styles.slotTimeText,
                  isSelected && !isOccupied && styles.slotTimeTextSelected,
                  isOccupied && styles.slotTimeTextOccupied,
                ]}
              >
                {slot.startTime} – {slot.endTime}
              </Text>

              <Text
                style={[
                  styles.slotLabel,
                  isSelected && !isOccupied && styles.slotLabelSelected,
                  isOccupied && styles.slotLabelOccupied,
                ]}
              >
                {slot.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  headerRow: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  grid: {
    gap: SPACING.sm,
  },
  slotCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  slotPressed: {
    opacity: 0.85,
  },
  slotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotOccupied: {
    backgroundColor: COLORS.occupiedBg,
    borderColor: COLORS.occupiedBorder,
    opacity: 0.75,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  caPill: {
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  caPillSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  caPillOccupied: {
    backgroundColor: '#FCA5A5',
  },
  caPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  caPillTextSelected: {
    color: COLORS.textInverse,
  },
  caPillTextOccupied: {
    color: COLORS.occupiedText,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.success,
  },
  availableBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  occupiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  occupiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.occupiedText,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  selectedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  slotTimeText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  slotTimeTextSelected: {
    color: COLORS.textInverse,
  },
  slotTimeTextOccupied: {
    color: COLORS.occupiedText,
    textDecorationLine: 'line-through',
  },
  slotLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  slotLabelSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  slotLabelOccupied: {
    color: COLORS.occupiedText,
  },
});
