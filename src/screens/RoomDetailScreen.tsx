import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useBookingStore } from '../store/useBookingStore';
import { TimeSlotId, TimeSlot } from '../types/room';
import { TimeSlotGrid } from '../components/TimeSlotGrid';
import { BookingPassModal } from '../components/BookingPassModal';
import { Booking } from '../types/booking';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { getUpcomingDays, formatDisplayDate } from '../utils/dateTimeUtils';
import { feedbackEffects } from '../utils/soundEffects';

type DetailRouteProp = RouteProp<RootStackParamList, 'RoomDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RoomDetailScreen: React.FC = () => {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { roomId } = route.params;

  const room = useBookingStore((state) =>
    state.rooms.find((r) => r.id === roomId)
  );
  const selectedDate = useBookingStore((state) => state.selectedDate);
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate);
  const occupiedSlots = useBookingStore((state) => state.occupiedSlots);
  const isSubmittingBooking = useBookingStore(
    (state) => state.isSubmittingBooking
  );
  const raceConditionDemoMode = useBookingStore(
    (state) => state.raceConditionDemoMode
  );
  const toggleRaceConditionDemoMode = useBookingStore(
    (state) => state.toggleRaceConditionDemoMode
  );
  const bookRoomOptimistic = useBookingStore(
    (state) => state.bookRoomOptimistic
  );
  const cancelBooking = useBookingStore((state) => state.cancelBooking);

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [purpose, setPurpose] = useState<string>(
    'Thảo luận đồ án môn học Lập trình đa nền tảng (TS. Nguyễn Thanh Tuấn)'
  );
  const [attendeesCount, setAttendeesCount] = useState<number>(4);
  const [createdPassModal, setCreatedPassModal] = useState<Booking | null>(
    null
  );

  const upcomingDays = useMemo(() => getUpcomingDays(7), []);

  // Lấy danh sách các slot đã bị chiếm của phòng này trong ngày đã chọn
  const occupiedSlotIds = useMemo(() => {
    return occupiedSlots
      .filter((s) => s.roomId === roomId && s.date === selectedDate)
      .map((s) => s.slotId as TimeSlotId);
  }, [occupiedSlots, roomId, selectedDate]);

  if (!room) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Không tìm thấy thông tin phòng học</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Quay lại danh sách</Text>
        </Pressable>
      </View>
    );
  }

  const handleBookingSubmit = async () => {
    if (!selectedSlot) {
      Alert.alert('Chưa chọn ca học', 'Vui lòng chọn 1 trong 4 ca học còn trống trước khi tiếp tục.');
      return;
    }

    if (occupiedSlotIds.includes(selectedSlot.id)) {
      Alert.alert('Khung giờ không khả dụng', 'Ca học này vừa được đặt bởi người khác. Vui lòng chọn ca khác.');
      return;
    }

    if (!purpose.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mục đích sử dụng phòng học.');
      return;
    }

    // Gửi yêu cầu đặt phòng với cơ chế Optimistic UI và Rollback
    const result = await bookRoomOptimistic({
      roomId: room.id,
      date: selectedDate,
      slotId: selectedSlot.id,
      purpose: purpose.trim(),
      attendeesCount,
    });

    if (result.success && result.booking) {
      // Mở modal Thẻ nhận phòng Digital Pass với QR Code
      setCreatedPassModal(result.booking);
    } else {
      // Báo lỗi xung đột đồng thời hoặc lỗi mạng
      Alert.alert(
        '⚠️ Xung Đột Đặt Phòng (Race Condition)',
        result.error ?? 'Ca học này vừa bị chiếm bởi một sinh viên khác tại cùng thời điểm. Trạng thái giao diện đã được khôi phục (Rollback). Vui lòng chọn ca học khác.',
        [{ text: 'Đã hiểu' }]
      );
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Header điều hướng */}
      <View style={styles.topNav}>
        <Pressable
          onPress={() => {
            feedbackEffects.lightTap();
            navigation.goBack();
          }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.navBackBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </Pressable>
        <Text style={styles.navTitle}>{room.code} - Chi Tiết Phòng</Text>
        <View style={styles.navRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Ảnh đại diện phòng */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: room.imageUrl }}
            style={styles.roomImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlayBadge}>
            <Text style={styles.imageOverlayText}>TÒA NHÀ {room.building}</Text>
          </View>
        </View>

        {/* Thông tin tiêu đề & vị trí */}
        <View style={styles.headerBlock}>
          <View style={styles.codeRow}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>{room.code}</Text>
            </View>
            <View style={styles.floorBadge}>
              <Ionicons name="business" size={13} color={COLORS.primary} />
              <Text style={styles.floorBadgeText}>Tầng {room.floor}</Text>
            </View>
            <View style={styles.capacityBadge}>
              <Ionicons name="people" size={13} color={COLORS.textSecondary} />
              <Text style={styles.capacityBadgeText}>{room.capacity} chỗ ngồi</Text>
            </View>
          </View>

          <Text style={styles.roomTitle}>{room.name}</Text>
          <Text style={styles.roomDesc}>{room.description}</Text>
        </View>

        {/* Danh sách trang thiết bị */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Trang Thiết Bị & Tiện Nghi</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((amenity) => (
              <View key={`detail_amenity_${amenity}`} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quy định sử dụng phòng tại VKU */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Nội Quy Sử Dụng Phòng VKU</Text>
          <View style={styles.rulesCard}>
            {room.rules.map((rule, idx) => (
              <View key={`rule_${idx}`} style={styles.ruleItem}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Thanh chọn ngày */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>1. Chọn Ngày Sử Dụng</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}
          >
            {upcomingDays.map((item) => {
              const isSelected = selectedDate === item.date;
              return (
                <Pressable
                  key={item.date}
                  onPress={() => {
                    feedbackEffects.lightTap();
                    setSelectedDate(item.date);
                    setSelectedSlot(null);
                  }}
                  style={[
                    styles.datePill,
                    isSelected && styles.datePillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      isSelected && styles.dateTextWhite,
                    ]}
                  >
                    {item.dayName}
                  </Text>
                  <Text
                    style={[
                      styles.dateNum,
                      isSelected && styles.dateTextWhite,
                    ]}
                  >
                    {item.dayNumber}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.selectedDateCaption}>
            Ngày đã chọn: {formatDisplayDate(selectedDate)}
          </Text>
        </View>

        {/* Lưới chọn 4 ca học */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>2. Chọn Ca Học</Text>
          <TimeSlotGrid
            selectedSlotId={selectedSlot?.id}
            occupiedSlotIds={occupiedSlotIds}
            onSelectSlot={(slot) => setSelectedSlot(slot)}
            isSubmitting={isSubmittingBooking}
          />
        </View>

        {/* Thông tin mục đích & số người tham gia */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>3. Thông Tin Buổi Học</Text>

          <Text style={styles.inputLabel}>Mục đích sử dụng:</Text>
          <TextInput
            style={styles.textInput}
            value={purpose}
            onChangeText={setPurpose}
            placeholder="Ví dụ: Thảo luận bài tập lớn, nghiên cứu khoa học..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={2}
          />

          <View style={styles.attendeesRow}>
            <Text style={styles.inputLabel}>Số sinh viên tham gia:</Text>
            <View style={styles.counterRow}>
              {[2, 4, 6, 8, 12].map((num) => {
                const isSelected = attendeesCount === num;
                return (
                  <Pressable
                    key={`att_${num}`}
                    onPress={() => {
                      feedbackEffects.lightTap();
                      setAttendeesCount(num);
                    }}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.counterPill,
                      isSelected && styles.counterPillSelected,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.counterText,
                        isSelected && styles.counterTextSelected,
                      ]}
                    >
                      {num}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* THANH ĐIỀU KHIỂN KIỂM THỬ GIẢNG VIÊN (RACE CONDITION HARNESS) */}
        <View style={styles.demoHarnessCard}>
          <View style={styles.demoHeader}>
            <Ionicons name="flask" size={18} color="#DC2626" />
            <Text style={styles.demoTitle}>Harness Kiểm Thử Giảng Viên (TS. Tuấn)</Text>
          </View>
          <Text style={styles.demoDesc}>
            Bật tính năng bên dưới để ép sinh lỗi 409 Conflict nhằm kiểm tra cơ chế Optimistic UI Rollback.
          </Text>
          <View style={styles.demoSwitchRow}>
            <Text style={styles.demoSwitchLabel}>Giả lập xung đột đồng thời (409 Conflict):</Text>
            <Switch
              value={raceConditionDemoMode}
              onValueChange={toggleRaceConditionDemoMode}
              trackColor={{ false: COLORS.border, true: '#FCA5A5' }}
              thumbColor={raceConditionDemoMode ? '#DC2626' : '#FFFFFF'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Thanh nút bấm chốt đặt phòng dưới đáy */}
      <View style={styles.bottomBar}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>Ca học đã chọn:</Text>
          <Text style={styles.summarySlot}>
            {selectedSlot ? selectedSlot.label : 'Chưa chọn ca'}
          </Text>
        </View>

        <Pressable
          onPress={handleBookingSubmit}
          disabled={!selectedSlot || isSubmittingBooking}
          hitSlop={8}
          style={({ pressed }) => [
            styles.submitBtn,
            (!selectedSlot || isSubmittingBooking) && styles.submitBtnDisabled,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          {isSubmittingBooking ? (
            <ActivityIndicator color={COLORS.textInverse} size="small" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Xác Nhận Đặt</Text>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.textInverse}
              />
            </>
          )}
        </Pressable>
      </View>

      {/* Modal thẻ nhận phòng Digital Pass sinh QR động */}
      <BookingPassModal
        visible={createdPassModal !== null}
        booking={createdPassModal}
        onClose={() => {
          setCreatedPassModal(null);
          navigation.navigate('MainTabs', { screen: 'MyBookings' });
        }}
        onCancelBooking={cancelBooking}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navBackBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  navRightPlaceholder: {
    width: 36,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.surfaceVariant,
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    backgroundColor: 'rgba(11, 59, 96, 0.9)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  imageOverlayText: {
    color: COLORS.textInverse,
    fontSize: 11,
    fontWeight: '800',
  },
  headerBlock: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  codeBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  codeBadgeText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: '800',
  },
  floorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  floorBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  capacityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  roomDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  sectionBlock: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '46%',
  },
  amenityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  rulesCard: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  ruleBullet: {
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 18,
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  dateScroll: {
    gap: SPACING.xs,
    paddingVertical: 4,
  },
  datePill: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 60,
  },
  datePillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateDay: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  dateNum: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dateTextWhite: {
    color: COLORS.textInverse,
  },
  selectedDateCaption: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 13,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  attendeesRow: {
    marginTop: 4,
  },
  counterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 4,
  },
  counterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  counterTextSelected: {
    color: COLORS.textInverse,
  },
  demoHarnessCard: {
    margin: SPACING.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  demoDesc: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  demoSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoSwitchLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.prominent,
  },
  summaryCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  summarySlot: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minWidth: 150,
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.disabled,
  },
  submitBtnText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: '800',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  backBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  backBtnText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
});
