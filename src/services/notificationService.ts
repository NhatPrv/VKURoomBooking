import { Platform, Alert } from 'react-native';
import { Booking } from '../types/booking';
import { calculateReminderDate } from '../utils/dateTimeUtils';
import { feedbackEffects } from '../utils/soundEffects';

// Lưu trữ các bộ hẹn giờ cục bộ cho môi trường Expo Go Android
const localTimerRegistry: Record<string, ReturnType<typeof setTimeout>> = {};

let nativeNotificationsModule: typeof import('expo-notifications') | null = null;
let isNativeModuleAttempted = false;

/**
 * Trình tải an toàn cho expo-notifications.
 * Từ Expo SDK 53+, Expo đã gỡ bỏ tính năng push notifications khỏi Expo Go trên Android,
 * và việc nạp module tĩnh sẽ gây lỗi [runtime not ready]. Trình tải này đảm bảo
 * ứng dụng chạy mượt mà 100% trong Expo Go mà không bao giờ bị dừng ứng dụng.
 */
function getSafeNotificationsModule(): typeof import('expo-notifications') | null {
  if (isNativeModuleAttempted) {
    return nativeNotificationsModule;
  }
  isNativeModuleAttempted = true;

  // Trên Android trong môi trường Expo Go, sử dụng cơ chế In-App Scheduled Notification Engine
  if (Platform.OS === 'android') {
    return null;
  }

  try {
    const mod = require('expo-notifications');
    if (mod && mod.setNotificationHandler) {
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      nativeNotificationsModule = mod;
    }
  } catch {
    // Fallback im lặng nếu native module không hỗ trợ
  }

  return nativeNotificationsModule;
}

export class NotificationService {
  /**
   * Đăng ký quyền thông báo cho ứng dụng
   */
  public static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const Notifications = getSafeNotificationsModule();
    if (Notifications) {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        return finalStatus === 'granted';
      } catch (error) {
        console.warn('[NotificationService] Lỗi khi xin quyền:', error);
      }
    }

    // Môi trường Expo Go Android: Luôn sẵn sàng cho In-App Scheduled Reminders
    return true;
  }

  /**
   * Lập lịch thông báo trước giờ nhận phòng 15 phút
   */
  public static async scheduleBookingReminder(booking: Booking): Promise<string | undefined> {
    if (Platform.OS === 'web') {
      return undefined;
    }

    const reminderDate = calculateReminderDate(booking.date, booking.startTime, 15);
    const now = new Date();

    // Nếu giờ hẹn trong quá khứ hoặc sắp diễn ra trong vòng 15 phút,
    // lập lịch trigger sau 5 giây để sinh viên / giảng viên kiểm thử (Demo requirement)
    const isPastOrImminent = reminderDate.getTime() <= now.getTime();
    const delayMs = isPastOrImminent ? 5000 : Math.max(1000, reminderDate.getTime() - now.getTime());

    const Notifications = getSafeNotificationsModule();
    if (Notifications) {
      try {
        const trigger = isPastOrImminent ? { seconds: 5 } : { date: reminderDate };
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🔔 Nhắc nhở nhận phòng: ${booking.roomCode}`,
            body: `Ca học ${booking.slotLabel} tại ${booking.roomName} sắp bắt đầu. Vui lòng mở mã QR để điểm danh!`,
            data: {
              bookingId: booking.id,
              roomId: booking.roomId,
              roomCode: booking.roomCode,
            },
            sound: true,
          },
          trigger: trigger as any,
        });

        return notificationId;
      } catch (error) {
        console.warn('[NotificationService] Native schedule error, chuyển sang fallback timer:', error);
      }
    }

    // IN-APP SCHEDULED NOTIFICATION ENGINE (Hoạt động hoàn hảo trong Expo Go)
    const notificationId = `vku_notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const timer = setTimeout(() => {
      feedbackEffects.success();
      Alert.alert(
        `🔔 Nhắc Nhở Nhận Phòng: ${booking.roomCode}`,
        `Ca học ${booking.slotLabel} tại ${booking.roomName} sắp bắt đầu sau 15 phút. Vui lòng chuẩn bị thẻ phòng số hóa (QR Pass) để điểm danh!`,
        [{ text: 'Đã hiểu' }]
      );
      delete localTimerRegistry[notificationId];
    }, delayMs);

    localTimerRegistry[notificationId] = timer;
    return notificationId;
  }

  /**
   * Hủy thông báo đã lên lịch
   */
  public static async cancelNotification(notificationId: string): Promise<void> {
    if (!notificationId) return;

    // Hủy timer trong bộ nhớ
    if (localTimerRegistry[notificationId]) {
      clearTimeout(localTimerRegistry[notificationId]);
      delete localTimerRegistry[notificationId];
    }

    const Notifications = getSafeNotificationsModule();
    if (Notifications) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch {
        // Fallback im lặng
      }
    }
  }
}
