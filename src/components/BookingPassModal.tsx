import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types/booking';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { formatDisplayDate } from '../utils/dateTimeUtils';
import { feedbackEffects } from '../utils/soundEffects';

interface BookingPassModalProps {
  readonly visible: boolean;
  readonly booking: Booking | null;
  readonly onClose: () => void;
  readonly onCancelBooking: (bookingId: string) => Promise<boolean>;
}

export const BookingPassModal: React.FC<BookingPassModalProps> = ({
  visible,
  booking,
  onClose,
  onCancelBooking,
}) => {
  if (!booking) return null;

  const handleCancelPress = () => {
    Alert.alert(
      'Xác nhận hủy đặt phòng',
      `Bạn có chắc chắn muốn hủy ca học ${booking.slotLabel} tại ${booking.roomName} (${booking.roomCode})? Khung giờ sẽ được giải phóng ngay lập tức cho sinh viên khác.`,
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Hủy phòng',
          style: 'destructive',
          onPress: async () => {
            const ok = await onCancelBooking(booking.id);
            if (ok) {
              onClose();
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Nút đóng modal góc trên */}
          <View style={styles.modalHeader}>
            <View style={styles.passTypeTag}>
              <Ionicons name="school" size={14} color={COLORS.primary} />
              <Text style={styles.passTypeTagText}>VKU DIGITAL ROOM PASS</Text>
            </View>

            <Pressable
              onPress={() => {
                feedbackEffects.lightTap();
                onClose();
              }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* THẺ BÁO CÁO / BOARDING PASS STYLE */}
            <View style={styles.passCard}>
              {/* Header Thẻ: Tên phòng & Mã phòng */}
              <View style={styles.passTop}>
                <View>
                  <Text style={styles.passRoomCode}>{booking.roomCode}</Text>
                  <Text style={styles.passRoomName}>{booking.roomName}</Text>
                </View>
                <View style={styles.buildingStamp}>
                  <Text style={styles.buildingStampText}>TÒA {booking.building}</Text>
                </View>
              </View>

              {/* Vùng QR Code động */}
              <View style={styles.qrSection}>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={booking.qrPayload}
                    size={180}
                    color={COLORS.primaryDark}
                    backgroundColor={COLORS.surface}
                  />
                </View>
                <Text style={styles.qrHint}>
                  Quét mã tại ổ khóa thông minh hoặc xuất trình cho Cán bộ trực phòng
                </Text>
                <Text style={styles.passIdText}>ID: {booking.id}</Text>
              </View>

              {/* Đường đục lỗ thẻ vé (Ticket Perforation effect) */}
              <View style={styles.perforationRow}>
                <View style={styles.perfCutLeft} />
                <View style={styles.perfLine} />
                <View style={styles.perfCutRight} />
              </View>

              {/* Thông tin chi tiết sinh viên & ca học */}
              <View style={styles.passDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>NGÀY SỬ DỤNG</Text>
                    <Text style={styles.detailValue}>
                      {formatDisplayDate(booking.date)}
                    </Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>KHUNG GIỜ</Text>
                    <Text style={[styles.detailValue, styles.slotHighlight]}>
                      {booking.startTime} - {booking.endTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>SINH VIÊN ĐẶT CHỖ</Text>
                    <Text style={styles.detailValue}>{booking.userName}</Text>
                    <Text style={styles.subDetailValue}>MSSV: {booking.userStudentId}</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>SỐ NGƯỜI</Text>
                    <Text style={styles.detailValue}>
                      {booking.attendeesCount} thành viên
                    </Text>
                  </View>
                </View>

                <View style={styles.purposeBox}>
                  <Text style={styles.purposeLabel}>MỤC ĐÍCH SỬ DỤNG:</Text>
                  <Text style={styles.purposeText}>{booking.purpose}</Text>
                </View>

                {/* Trạng thái đặt chỗ */}
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Trạng thái thẻ:</Text>
                  <View style={styles.statusPill}>
                    <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
                    <Text style={styles.statusPillText}>ĐÃ XÁC NHẬN CHÍNH THỨC</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Hướng dẫn nhận phòng */}
            <View style={styles.instructionBox}>
              <Ionicons name="information-circle" size={18} color={COLORS.info} />
              <View style={styles.instructionTextContainer}>
                <Text style={styles.instructionTitle}>Lưu ý điểm danh VKU</Text>
                <Text style={styles.instructionBody}>
                  Hệ thống tự động kích hoạt thông báo nhắc nhở 15 phút trước giờ nhận phòng.
                  Nếu không có mặt sau 20 phút kể từ giờ bắt đầu, hệ thống sẽ tự động hủy phòng.
                </Text>
              </View>
            </View>

            {/* Các nút tác vụ */}
            <View style={styles.actionButtons}>
              <Pressable
                onPress={handleCancelPress}
                style={styles.cancelBtn}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                <Text style={styles.cancelBtnText}>Hủy Đặt Phòng</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  feedbackEffects.lightTap();
                  onClose();
                }}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>Xong</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 36, 59, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '92%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  passTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  passTypeTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  passCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.prominent,
  },
  passTop: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  passRoomCode: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textInverse,
    letterSpacing: 0.5,
  },
  passRoomName: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    maxWidth: 200,
  },
  buildingStamp: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  buildingStampText: {
    color: COLORS.textInverse,
    fontSize: 11,
    fontWeight: '800',
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  qrWrapper: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    ...SHADOWS.card,
  },
  qrHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    maxWidth: 240,
    lineHeight: 16,
  },
  passIdText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    position: 'relative',
  },
  perfCutLeft: {
    width: 14,
    height: 20,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: COLORS.background,
  },
  perfLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  perfCutRight: {
    width: 14,
    height: 20,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: COLORS.background,
  },
  passDetails: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subDetailValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  slotHighlight: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  purposeBox: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  purposeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  purposeText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.success,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.infoLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  instructionTextContainer: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  instructionBody: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  doneBtnText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
});
