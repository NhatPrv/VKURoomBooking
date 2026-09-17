import { Platform, Vibration } from 'react-native';

export const feedbackEffects = {
  /**
   * Rung nhẹ khi người dùng tương tác chọn slot hoặc filter
   */
  lightTap(): void {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(15);
      } catch {
        // Fallback im lặng nếu thiết bị không hỗ trợ rung
      }
    }
  },

  /**
   * Rung xác nhận khi đặt phòng thành công
   */
  success(): void {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate([0, 40, 80, 40]);
      } catch {
        // Fallback im lặng
      }
    }
  },

  /**
   * Rung cảnh báo khi gặp xung đột Race Condition (409 Conflict) hoặc lỗi
   */
  errorAlert(): void {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate([0, 100, 50, 100]);
      } catch {
        // Fallback im lặng
      }
    }
  },
};
