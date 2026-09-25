import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { FilterChips } from '../components/FilterChips';
import { RoomCard } from '../components/RoomCard';
import { useBookingStore } from '../store/useBookingStore';
import { Room } from '../types/room';
import { RootStackParamList } from '../types/navigation';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { getUpcomingDays } from '../utils/dateTimeUtils';
import { feedbackEffects } from '../utils/soundEffects';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BrowseRoomsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const rooms = useBookingStore((state) => state.rooms);
  const filter = useBookingStore((state) => state.filter);
  const selectedDate = useBookingStore((state) => state.selectedDate);
  const occupiedSlots = useBookingStore((state) => state.occupiedSlots);
  const setFilter = useBookingStore((state) => state.setFilter);
  const resetFilter = useBookingStore((state) => state.resetFilter);
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate);

  const upcomingDays = useMemo(() => getUpcomingDays(7), []);

  // Lọc danh sách phòng theo bộ lọc đa tham số
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Tìm kiếm từ khóa
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        const matchCode = room.code.toLowerCase().includes(query);
        const matchName = room.name.toLowerCase().includes(query);
        const matchDesc = room.description.toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchDesc) return false;
      }

      // Lọc tòa nhà
      if (filter.building !== 'ALL' && room.building !== filter.building) {
        return false;
      }

      // Lọc sức chứa
      if (filter.minCapacity > 0 && room.capacity < filter.minCapacity) {
        return false;
      }

      // Lọc tiện ích
      if (filter.amenities.length > 0) {
        const hasAllAmenities = filter.amenities.every((a) =>
          room.amenities.includes(a)
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  }, [rooms, filter]);

  // Đếm số slot đã bị chiếm của từng phòng trong ngày đã chọn
  const getOccupiedCountForRoom = useCallback(
    (roomId: string) => {
      return occupiedSlots.filter(
        (s) => s.roomId === roomId && s.date === selectedDate
      ).length;
    },
    [occupiedSlots, selectedDate]
  );

  const handleSelectRoom = useCallback(
    (room: Room) => {
      navigation.navigate('RoomDetail', { roomId: room.id });
    },
    [navigation]
  );

  const handleSelectDate = useCallback(
    (date: string) => {
      feedbackEffects.lightTap();
      setSelectedDate(date);
    },
    [setSelectedDate]
  );

  const renderItem: ListRenderItem<Room> = useCallback(
    ({ item }) => {
      const occupiedCount = getOccupiedCountForRoom(item.id);
      return (
        <RoomCard
          room={item}
          occupiedSlotsCount={occupiedCount}
          onPress={handleSelectRoom}
        />
      );
    },
    [getOccupiedCountForRoom, handleSelectRoom]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <Header
        title="Đặt Phòng Học VKU"
        subtitle="Hệ thống đăng ký phòng thực hành & tự học thông minh"
      />

      {/* Thanh tìm kiếm */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo mã phòng (V.204, A.102) hoặc tiện ích..."
            placeholderTextColor="#94A3B8"
            value={filter.searchQuery}
            onChangeText={(text) => setFilter({ searchQuery: text })}
            clearButtonMode="while-editing"
          />
          {filter.searchQuery.length > 0 && (
            <Pressable
              onPress={() => setFilter({ searchQuery: '' })}
              hitSlop={8}
              style={({ pressed }) => [
                styles.clearSearchBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Thanh chọn ngày sử dụng */}
      <View style={styles.dateSelectorSection}>
        <Text style={styles.dateSectionLabel}>Ngày đặt phòng:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScrollContent}
        >
          {upcomingDays.map((item) => {
            const isSelected = selectedDate === item.date;
            return (
              <Pressable
                key={item.date}
                onPress={() => handleSelectDate(item.date)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.datePill,
                  isSelected && styles.datePillSelected,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.dateDayName,
                    isSelected && styles.dateTextSelected,
                  ]}
                >
                  {item.dayName}
                </Text>
                <Text
                  style={[
                    styles.dateDayNumber,
                    isSelected && styles.dateTextSelected,
                  ]}
                >
                  {item.dayNumber}
                </Text>
                <Text
                  style={[
                    styles.dateMonth,
                    isSelected && styles.dateTextSelected,
                  ]}
                >
                  {item.month}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Bộ lọc Chips đa tham số */}
      <FilterChips
        filter={filter}
        onChange={setFilter}
        onReset={resetFilter}
      />

      {/* Danh sách phòng tối ưu 60fps chuẩn E-commerce */}
      <FlatList
        data={filteredRooms}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Các tham số ảo hóa FlatList 60fps bắt buộc theo tiêu chuẩn kiến trúc
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Không tìm thấy phòng phù hợp</Text>
            <Text style={styles.emptySubtitle}>
              Vui lòng thử nới lỏng các tiêu chí lọc tòa nhà, sức chứa hoặc từ khóa tìm kiếm.
            </Text>
            <Pressable
              onPress={resetFilter}
              hitSlop={8}
              style={({ pressed }) => [
                styles.resetFilterBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.resetFilterBtnText}>Đặt lại bộ lọc</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBarContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  clearSearchBtn: {
    padding: 4,
  },
  dateSelectorSection: {
    backgroundColor: COLORS.surface,
    paddingLeft: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  dateSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateScrollContent: {
    paddingRight: SPACING.md,
    gap: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  datePill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 54,
  },
  datePillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateDayName: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dateDayNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dateMonth: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  dateTextSelected: {
    color: COLORS.textInverse,
  },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  resetFilterBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  resetFilterBtnText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
});
