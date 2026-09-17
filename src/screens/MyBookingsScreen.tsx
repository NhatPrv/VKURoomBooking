import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BookingPassModal } from '../components/BookingPassModal';
import { useBookingStore } from '../store/useBookingStore';
import { Booking } from '../types/booking';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { formatDisplayDate } from '../utils/dateTimeUtils';
import { feedbackEffects } from '../utils/soundEffects';

export const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const activeReservations = useBookingStore((state) => state.activeReservations);
  const cancelBooking = useBookingStore((state) => state.cancelBooking);

  const [selectedPass, setSelectedPass] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  // Phân loại danh sách đặt phòng
  const activeList = useMemo(() => {
    return activeReservations.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING_OPTIMISTIC');
  }, [activeReservations]);

  const historyList = useMemo(() => {
    return activeReservations.filter((b) => b.status === 'CANCELLED' || b.status === 'EXPIRED' || b.status === 'CHECKED_IN');
  }, [activeReservations]);

  const displayList = activeTab === 'ACTIVE' ? activeList : historyList;

  const handleOpenPass = (booking: Booking) => {
    feedbackEffects.lightTap();
    setSelectedPass(booking);
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Hủy đặt phòng',
      `Bạn có chắc chắn muốn hủy đặt ca học ${booking.slotLabel} tại phòng ${booking.roomCode}?`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Hủy phòng',
          style: 'destructive',
          onPress: async () => {
            await cancelBooking(booking.id);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Lịch Đặt Của Tôi"
        subtitle="Quản lý thẻ phòng học & mã QR điểm danh"
      />

      {/* Tabs chuyển đổi Active vs History */}
      <View style={styles.tabsContainer}>
        <Pressable
          onPress={() => {
            feedbackEffects.lightTap();
            setActiveTab('ACTIVE');
          }}
          style={[
            styles.tabBtn,
            activeTab === 'ACTIVE' && styles.tabBtnActive,
          ]}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'ACTIVE' && styles.tabBtnTextActive,
            ]}
          >
            Đang hoạt động ({activeList.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            feedbackEffects.lightTap();
            setActiveTab('HISTORY');
          }}
          style={[
            styles.tabBtn,
            activeTab === 'HISTORY' && styles.tabBtnActive,
          ]}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'HISTORY' && styles.tabBtnTextActive,
            ]}
          >
            Lịch sử ({historyList.length})
          </Text>
        </Pressable>
      </View>

      {/* Danh sách thẻ đặt phòng */}
      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isCancelled = item.status === 'CANCELLED';
          const isOptimistic = item.status === 'PENDING_OPTIMISTIC';

          return (
            <View style={styles.bookingCard}>
              {/* Header card */}
              <View style={styles.cardHeader}>
                <View style={styles.roomInfoCol}>
                  <View style={styles.roomBadgeRow}>
                    <View style={styles.roomCodePill}>
                      <Text style={styles.roomCodeText}>{item.roomCode}</Text>
                    </View>
                    <View style={styles.buildingTag}>
                      <Text style={styles.buildingTagText}>Tòa {item.building}</Text>
                    </View>
                  </View>
                  <Text style={styles.roomNameText}>{item.roomName}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isCancelled
                      ? styles.statusCancelled
                      : isOptimistic
                      ? styles.statusOptimistic
                      : styles.statusActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isCancelled
                        ? styles.textCancelled
                        : isOptimistic
                        ? styles.textOptimistic
                        : styles.textActive,
                    ]}
                  >
                    {isCancelled
                      ? 'ĐÃ HỦY'
                      : isOptimistic
                      ? 'ĐANG XỬ LÝ...'
                      : 'ĐÃ XÁC NHẬN'}
                  </Text>
                </View>
              </View>

              {/* Thông tin ngày & ca */}
              <View style={styles.timeInfoBox}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.infoValue}>{formatDisplayDate(item.date)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                  <Text style={[styles.infoValue, styles.slotHighlight]}>
                    {item.startTime} – {item.endTime} ({item.slotLabel})
                  </Text>
                </View>
              </View>

              {/* Chỉ báo thông báo nhắc nhở 15 phút */}
              {!isCancelled && (
                <View style={styles.reminderBanner}>
                  <Ionicons name="notifications" size={13} color={COLORS.accent} />
                  <Text style={styles.reminderText}>
                    Hệ thống sẽ gửi thông báo nhắc nhở trước 15 phút ca học
                  </Text>
                </View>
              )}

              {/* Tác vụ với card */}
              <View style={styles.cardActions}>
                {!isCancelled && (
                  <Pressable
                    onPress={() => handleCancelBooking(item)}
                    style={styles.cancelActionBtn}
                  >
                    <Ionicons name="close-circle-outline" size={15} color={COLORS.danger} />
                    <Text style={styles.cancelActionText}>Hủy</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => handleOpenPass(item)}
                  style={styles.qrPassBtn}
                >
                  <Ionicons name="qr-code" size={15} color={COLORS.textInverse} />
                  <Text style={styles.qrPassBtnText}>Thẻ Phòng & QR</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={54} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'ACTIVE'
                ? 'Bạn chưa có lịch đặt phòng nào'
                : 'Chưa có lịch sử đặt phòng'}
            </Text>
            <Text style={styles.emptyDesc}>
              Hãy tra cứu danh sách phòng học VKU và đặt chỗ cho buổi thảo luận nhóm tiếp theo của bạn.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('BrowseRooms')}
              style={styles.browseRoomsBtn}
            >
              <Text style={styles.browseRoomsBtnText}>Tìm Phòng Học Ngay</Text>
            </Pressable>
          </View>
        }
      />

      {/* Modal Digital Pass với QR Code */}
      <BookingPassModal
        visible={selectedPass !== null}
        booking={selectedPass}
        onClose={() => setSelectedPass(null)}
        onCancelBooking={cancelBooking}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: COLORS.textInverse,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  roomInfoCol: {
    flex: 1,
  },
  roomBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  roomCodePill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  roomCodeText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '800',
  },
  buildingTag: {
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  buildingTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  roomNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  statusActive: {
    backgroundColor: COLORS.successLight,
  },
  statusOptimistic: {
    backgroundColor: COLORS.warningLight,
  },
  statusCancelled: {
    backgroundColor: COLORS.dangerLight,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textActive: {
    color: COLORS.success,
  },
  textOptimistic: {
    color: COLORS.warning,
  },
  textCancelled: {
    color: COLORS.danger,
  },
  timeInfoBox: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: 4,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  slotHighlight: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  reminderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    marginBottom: SPACING.sm,
  },
  reminderText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
  },
  cancelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  qrPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
  },
  qrPassBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  browseRoomsBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  browseRoomsBtnText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: '800',
  },
});
