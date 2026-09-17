import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Booking } from '../types/booking';
import { calculateReminderDate } from '../utils/dateTimeUtils';

// Cấu hình cách hiển thị thông báo khi ứng dụng đang chạy ở foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static isInitialized = false;

  public static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[NotificationService] Quyền thông báo không được cấp.');
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('vku_booking_reminders', {
          name: 'Nhắc nhở nhận phòng VKU',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0B3B60',
          sound: 'default',
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('[NotificationService] Lỗi khi yêu cầu quyền thông báo:', error);
      return false;
    }
  }

  /**
   * Lập lịch thông báo trước giờ nhận phòng 15 phút
   */
  public static async scheduleBookingReminder(booking: Booking): Promise<string | undefined> {
    if (Platform.OS === 'web') {
      return undefined;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return undefined;

      const reminderDate = calculateReminderDate(booking.date, booking.startTime, 15);
      const now = new Date();

      // Nếu giờ hẹn trong quá khứ hoặc sắp diễn ra trong vòng 15 phút,
      // lập lịch trigger sau 5 giây để sinh viên có thể kiểm thử (Demo requirement)
      const isPastOrImminent = reminderDate.getTime() <= now.getTime();
      const trigger = isPastOrImminent
        ? { seconds: 5 }
        : { date: reminderDate };

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
        trigger: trigger as Notifications.NotificationTriggerInput,
      });

      return notificationId;
    } catch (error) {
      console.warn('[NotificationService] Không thể lập lịch thông báo:', error);
      return undefined;
    }
  }

  /**
   * Hủy thông báo đã lên lịch
   */
  public static async cancelNotification(notificationId: string): Promise<void> {
    if (Platform.OS === 'web' || !notificationId) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.warn('[NotificationService] Lỗi khi hủy thông báo:', error);
    }
  }
}
