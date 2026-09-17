import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Building, Amenity, RoomFilterState } from '../types/room';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { feedbackEffects } from '../utils/soundEffects';

interface FilterChipsProps {
  readonly filter: RoomFilterState;
  readonly onChange: (partial: Partial<RoomFilterState>) => void;
  readonly onReset: () => void;
}

const BUILDINGS: readonly (Building | 'ALL')[] = ['ALL', 'A', 'B', 'C', 'V'];

const CAPACITIES: readonly { label: string; min: number }[] = [
  { label: 'Tất cả sức chứa', min: 0 },
  { label: '≥ 4 chỗ', min: 4 },
  { label: '≥ 8 chỗ', min: 8 },
  { label: '≥ 12 chỗ', min: 12 },
  { label: '≥ 16 chỗ', min: 16 },
];

const AMENITY_LIST: readonly Amenity[] = [
  'High-spec PC',
  'Projector',
  'Whiteboard',
  'AC',
  'Microphone',
  'Ethernet',
];

export const FilterChips: React.FC<FilterChipsProps> = ({
  filter,
  onChange,
  onReset,
}) => {
  const hasActiveFilter =
    filter.building !== 'ALL' ||
    filter.minCapacity > 0 ||
    filter.amenities.length > 0 ||
    filter.searchQuery.trim().length > 0;

  const handleBuildingSelect = (b: Building | 'ALL') => {
    feedbackEffects.lightTap();
    onChange({ building: b });
  };

  const handleCapacitySelect = (min: number) => {
    feedbackEffects.lightTap();
    onChange({ minCapacity: min });
  };

  const handleAmenityToggle = (amenity: Amenity) => {
    feedbackEffects.lightTap();
    const exists = filter.amenities.includes(amenity);
    const newAmenities = exists
      ? filter.amenities.filter((a) => a !== amenity)
      : [...filter.amenities, amenity];
    onChange({ amenities: newAmenities });
  };

  return (
    <View style={styles.container}>
      {/* Hàng lọc Tòa Nhà */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Tòa nhà:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {BUILDINGS.map((b) => {
            const isSelected = filter.building === b;
            const label = b === 'ALL' ? 'Tất cả tòa' : `Khu ${b}`;
            return (
              <Pressable
                key={`bldg_${b}`}
                onPress={() => handleBuildingSelect(b)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected ? styles.chipActive : styles.chipInactive,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Hàng lọc Tiện ích & Sức chứa */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Tiện ích:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {AMENITY_LIST.map((amenity) => {
            const isSelected = filter.amenities.includes(amenity);
            return (
              <Pressable
                key={`amenity_${amenity}`}
                onPress={() => handleAmenityToggle(amenity)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.chip,
                  styles.amenityChip,
                  isSelected ? styles.amenityChipActive : styles.chipInactive,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={13}
                    color={COLORS.textInverse}
                    style={styles.chipIcon}
                  />
                )}
                <Text
                  style={[
                    styles.chipText,
                    isSelected ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {amenity}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Sức chứa & Nút Đặt lại nếu có filter */}
      <View style={styles.bottomRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {CAPACITIES.map((cap) => {
            const isSelected = filter.minCapacity === cap.min;
            return (
              <Pressable
                key={`cap_${cap.min}`}
                onPress={() => handleCapacitySelect(cap.min)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.capChip,
                  isSelected ? styles.capChipActive : styles.chipInactive,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.capText,
                    isSelected ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {cap.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {hasActiveFilter && (
          <Pressable
            onPress={() => {
              feedbackEffects.lightTap();
              onReset();
            }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.resetBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="refresh-outline" size={14} color={COLORS.secondary} />
            <Text style={styles.resetBtnText}>Xóa lọc</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.md,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    width: 58,
  },
  scrollContent: {
    paddingRight: SPACING.md,
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenityChip: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 5,
  },
  chipInactive: {
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  amenityChipActive: {
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.textInverse,
  },
  chipTextInactive: {
    color: COLORS.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: SPACING.md,
    paddingRight: SPACING.md,
    marginTop: 2,
  },
  capChip: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  capChipActive: {
    backgroundColor: COLORS.primaryLight,
  },
  capText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.secondaryLight,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});
