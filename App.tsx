import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useBookingStore } from './src/store/useBookingStore';
import { NotificationService } from './src/services/notificationService';
import { COLORS } from './src/constants/theme';

export default function App() {
  const fetchOccupiedSlots = useBookingStore((state) => state.fetchOccupiedSlots);
  const fetchRooms = useBookingStore((state) => state.fetchRooms);

  useEffect(() => {
    // Khởi tạo tải dữ liệu phòng và ca bận
    fetchRooms();
    fetchOccupiedSlots();

    // Đăng ký quyền thông báo cục bộ cho ứng dụng
    NotificationService.requestPermissions();
  }, [fetchRooms, fetchOccupiedSlots]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <View style={styles.container}>
          <RootNavigator />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
