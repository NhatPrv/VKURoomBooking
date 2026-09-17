import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { useBookingStore } from '../store/useBookingStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { feedbackEffects } from '../utils/soundEffects';

export const ProfileScreen: React.FC = () => {
  const userSession = useBookingStore((state) => state.userSession);
  const activeReservations = useBookingStore((state) => state.activeReservations);
  const raceConditionDemoMode = useBookingStore((state) => state.raceConditionDemoMode);
  const toggleRaceConditionDemoMode = useBookingStore((state) => state.toggleRaceConditionDemoMode);
  const clearAllBookings = useBookingStore((state) => state.clearAllBookings);
  const fetchOccupiedSlots = useBookingStore((state) => state.fetchOccupiedSlots);

  const activeCount = activeReservations.filter((b) => b.status === 'CONFIRMED').length;
  const totalCount = activeReservations.length;

  const handleClearData = () => {
    Alert.alert(
      'Xóa bộ nhớ đệm ứng dụng',
      'Thao tác này sẽ xóa toàn bộ danh sách phòng đã đặt được lưu trữ bền vững trong AsyncStorage.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa toàn bộ',
          style: 'destructive',
          onPress: async () => {
            await clearAllBookings();
            await fetchOccupiedSlots();
            feedbackEffects.errorAlert();
            Alert.alert('Thành công', 'Đã làm mới dữ liệu bộ nhớ đệm AsyncStorage.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <Header
        title="Hồ Sơ Sinh Viên"
        subtitle="Thông tin cá nhân & Thiết lập kiểm thử giảng viên"
        showUserBadge={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card thông tin sinh viên VKU */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {userSession.studentId.substring(0, 2)}
            </Text>
          </View>

          <Text style={styles.studentName}>{userSession.name}</Text>
          <View style={styles.studentIdBadge}>
            <Text style={styles.studentIdText}>MSSV: {userSession.studentId}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CHUYÊN NGÀNH</Text>
              <Text style={styles.infoValue}>{userSession.major}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ĐƠN VỊ ĐÀO TẠO</Text>
              <Text style={styles.infoValue}>{userSession.department}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>EMAIL SINH VIÊN</Text>
              <Text style={styles.infoValue}>{userSession.email}</Text>
            </View>
          </View>
        </View>

        {/* Thống kê hoạt động đặt phòng */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeCount}</Text>
            <Text style={styles.statLabel}>Phòng Đang Đặt</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Tổng Lượt Đăng Ký</Text>
          </View>
        </View>

        {/* BẢNG ĐIỀU KHIỂN CHẤM ĐIỂM CHO GIẢNG VIÊN (GRADER & TESTING PANEL) */}
        <View style={styles.harnessCard}>
          <View style={styles.harnessHeader}>
            <Ionicons name="construct" size={20} color="#DC2626" />
            <Text style={styles.harnessTitle}>Bảng Kiểm Thử Đồ Án (TS. Nguyễn Thanh Tuấn)</Text>
          </View>
          <Text style={styles.harnessSubtitle}>
            Các công cụ mô phỏng để chấm điểm cơ chế Race Condition, Rollback và Persistence.
          </Text>

          {/* Công tắc ép lỗi 409 */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Mô phỏng Xung đột 409 Conflict</Text>
              <Text style={styles.switchDesc}>
                Khi bật, mọi thao tác đặt phòng sẽ bị ép sinh lỗi 409 (Race Collision) để kiểm tra cơ chế Optimistic UI Rollback.
              </Text>
            </View>
            <Switch
              value={raceConditionDemoMode}
              onValueChange={toggleRaceConditionDemoMode}
              trackColor={{ false: COLORS.border, true: '#FCA5A5' }}
              thumbColor={raceConditionDemoMode ? '#DC2626' : '#FFFFFF'}
            />
          </View>

          {/* Nút xóa cache AsyncStorage */}
          <Pressable
            onPress={handleClearData}
            hitSlop={8}
            style={({ pressed }) => [
              styles.actionRowBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="trash-bin-outline" size={16} color={COLORS.danger} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionBtnTitle}>Làm Mới Bộ Nhớ AsyncStorage</Text>
              <Text style={styles.actionBtnDesc}>Xóa các lượt đặt phòng đã lưu để chạy lại từ đầu</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* Thông tin học phần & học thuật */}
        <View style={styles.academicCard}>
          <Text style={styles.academicTitle}>Thông Tin Học Phần VKU</Text>
          <View style={styles.academicItem}>
            <Text style={styles.academicLabel}>Môn học:</Text>
            <Text style={styles.academicValue}>Lập trình Đa nền tảng (Cross-Platform Dev)</Text>
          </View>
          <View style={styles.academicItem}>
            <Text style={styles.academicLabel}>Đề tài:</Text>
            <Text style={styles.academicValue}>Mini-Project 2: Real-time Study Room Booking</Text>
          </View>
          <View style={styles.academicItem}>
            <Text style={styles.academicLabel}>Giảng viên phụ trách:</Text>
            <Text style={styles.academicValue}>TS. Nguyễn Thanh Tuấn</Text>
          </View>
          <View style={styles.academicItem}>
            <Text style={styles.academicLabel}>Kiến trúc:</Text>
            <Text style={styles.academicValue}>3-Layer Decoupled (Presentation - Logic - Data)</Text>
          </View>
          <View style={styles.academicItem}>
            <Text style={styles.academicLabel}>Trọng số học phần:</Text>
            <Text style={styles.academicValue}>10% (Tuần 5 - Tuần 6)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 3,
    borderColor: '#E0F2FE',
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textInverse,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  studentIdBadge: {
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentIdText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  infoDivider: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  infoGrid: {
    width: '100%',
    gap: SPACING.sm,
  },
  infoItem: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginVertical: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  harnessCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  harnessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  harnessTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
  },
  harnessSubtitle: {
    fontSize: 11,
    color: '#7F1D1D',
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: SPACING.sm,
  },
  switchTextCol: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  switchTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  switchDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.xs,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  actionTextCol: {
    flex: 1,
  },
  actionBtnTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  actionBtnDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  academicCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  academicTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  academicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  academicLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    width: 120,
  },
  academicValue: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
});
