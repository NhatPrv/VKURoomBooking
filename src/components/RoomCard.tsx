import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types/room';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { feedbackEffects } from '../utils/soundEffects';

interface RoomCardProps {
  readonly room: Room;
  readonly occupiedSlotsCount?: number;
  readonly onPress: (room: Room) => void;
}

const RoomCardComponent: React.FC<RoomCardProps> = ({
  room,
  occupiedSlotsCount = 0,
  onPress,
}) => {
  const isAllOccupied = occupiedSlotsCount >= 4;

  const handlePress = () => {
    feedbackEffects.lightTap();
    onPress(room);
  };

  const getAmenityIcon = (amenity: string): keyof typeof Ionicons.glyphMap => {
    switch (amenity) {
      case 'High-spec PC':
        return 'desktop-outline';
      case 'Projector':
        return 'videocam-outline';
      case 'Whiteboard':
        return 'create-outline';
      case 'AC':
        return 'snow-outline';
      case 'Microphone':
        return 'mic-outline';
      case 'Ethernet':
        return 'globe-outline';
      default:
        return 'hardware-chip-outline';
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Ảnh bìa phòng & Tags trạng thái */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: room.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.buildingBadge}>
          <Text style={styles.buildingBadgeText}>Tòa {room.building}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isAllOccupied ? styles.statusOccupied : styles.statusAvailable,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isAllOccupied ? styles.dotOccupied : styles.dotAvailable,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isAllOccupied ? styles.textOccupied : styles.textAvailable,
            ]}
          >
            {isAllOccupied ? 'Hết ca trống' : `${4 - occupiedSlotsCount}/4 ca trống`}
          </Text>
        </View>
      </View>

      {/* Thông tin phòng học */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.codePill}>
            <Text style={styles.codeText}>{room.code}</Text>
          </View>
          <View style={styles.capacityBadge}>
            <Ionicons name="people" size={13} color={COLORS.primary} />
            <Text style={styles.capacityText}>{room.capacity} chỗ</Text>
          </View>
        </View>

        <Text style={styles.roomName} numberOfLines={2}>
          {room.name}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {room.description}
        </Text>

        {/* Danh sách tiện ích */}
        <View style={styles.amenitiesRow}>
          {room.amenities.slice(0, 3).map((item) => (
            <View key={`card_amenity_${room.id}_${item}`} style={styles.amenityTag}>
              <Ionicons
                name={getAmenityIcon(item)}
                size={12}
                color={COLORS.textSecondary}
              />
              <Text style={styles.amenityTagText}>{item}</Text>
            </View>
          ))}
          {room.amenities.length > 3 && (
            <View style={styles.amenityMoreTag}>
              <Text style={styles.amenityMoreText}>
                +{room.amenities.length - 3}
              </Text>
            </View>
          )}
        </View>

        {/* Nút hành động xem chi tiết / đặt phòng */}
        <View style={styles.footerRow}>
          <View style={styles.floorInfo}>
            <Ionicons name="layers-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.floorText}>Tầng {room.floor}</Text>
          </View>

          <View style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Chọn ca học</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={COLORS.textInverse}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

// Bọc component trong React.memo với hàm so sánh tùy biến để triệt tiêu re-render thừa trong FlatList 60fps
export const RoomCard = React.memo(RoomCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.room.id === nextProps.room.id &&
    prevProps.occupiedSlotsCount === nextProps.occupiedSlotsCount
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    width: '100%',
    backgroundColor: COLORS.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buildingBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  buildingBadgeText: {
    color: COLORS.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusAvailable: {
    backgroundColor: COLORS.availableBg,
    borderColor: COLORS.availableBorder,
  },
  statusOccupied: {
    backgroundColor: COLORS.occupiedBg,
    borderColor: COLORS.occupiedBorder,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dotAvailable: {
    backgroundColor: COLORS.success,
  },
  dotOccupied: {
    backgroundColor: COLORS.danger,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textAvailable: {
    color: COLORS.availableText,
  },
  textOccupied: {
    color: COLORS.occupiedText,
  },
  content: {
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  codePill: {
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  capacityText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  amenityTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  amenityMoreTag: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    justifyContent: 'center',
  },
  amenityMoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
  },
  floorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floorText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
  },
  actionBtnText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
});
