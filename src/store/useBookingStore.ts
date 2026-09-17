import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Room, RoomFilterState, TimeSlotId, Building, Amenity } from '../types/room';
import { Booking, CreateBookingPayload, SlotOccupancy, UserSession } from '../types/booking';
import { DEFAULT_USER_SESSION, VKU_ROOMS, VKU_TIME_SLOTS } from '../constants/mockData';
import { getTodayISODate } from '../utils/dateTimeUtils';
import { roomApi } from '../services/roomApi';
import { NotificationService } from '../services/notificationService';
import { feedbackEffects } from '../utils/soundEffects';

interface BookingStoreState {
  // Dữ liệu người dùng & cấu hình
  readonly userSession: UserSession;
  readonly selectedDate: string;
  readonly rooms: readonly Room[];
  readonly activeReservations: readonly Booking[];
  readonly occupiedSlots: readonly SlotOccupancy[];
  readonly filter: RoomFilterState;

  // Trạng thái vận hành
  readonly isLoadingRooms: boolean;
  readonly isSubmittingBooking: boolean;
  readonly raceConditionDemoMode: boolean;

  // Actions
  readonly setSelectedDate: (date: string) => void;
  readonly setFilter: (partialFilter: Partial<RoomFilterState>) => void;
  readonly resetFilter: () => void;
  readonly fetchRooms: () => Promise<void>;
  readonly fetchOccupiedSlots: (date?: string) => Promise<void>;
  readonly bookRoomOptimistic: (
    payload: CreateBookingPayload
  ) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  readonly cancelBooking: (bookingId: string) => Promise<boolean>;
  readonly toggleRaceConditionDemoMode: () => void;
  readonly clearAllBookings: () => Promise<void>;
}

const initialFilter: RoomFilterState = {
  searchQuery: '',
  building: 'ALL',
  minCapacity: 0,
  amenities: [],
};

export const useBookingStore = create<BookingStoreState>()(
  persist(
    (set, get) => ({
      userSession: DEFAULT_USER_SESSION,
      selectedDate: getTodayISODate(),
      rooms: VKU_ROOMS,
      activeReservations: [],
      occupiedSlots: [],
      filter: initialFilter,
      isLoadingRooms: false,
      isSubmittingBooking: false,
      raceConditionDemoMode: false,

      setSelectedDate: (date: string) => {
        set({ selectedDate: date });
        get().fetchOccupiedSlots(date);
      },

      setFilter: (partialFilter: Partial<RoomFilterState>) => {
        set((state) => ({
          filter: { ...state.filter, ...partialFilter },
        }));
      },

      resetFilter: () => {
        set({ filter: initialFilter });
      },

      fetchRooms: async () => {
        set({ isLoadingRooms: true });
        try {
          const rooms = await roomApi.getRooms();
          set({ rooms, isLoadingRooms: false });
        } catch {
          set({ isLoadingRooms: false });
        }
      },

      fetchOccupiedSlots: async (date?: string) => {
        const targetDate = date ?? get().selectedDate;
        try {
          const serverOccupied = await roomApi.getOccupiedSlotsByDate(targetDate);
          
          // Hợp nhất với các phòng đang được đặt bởi phiên người dùng hiện tại
          const localBookingsForDate = get().activeReservations.filter(
            (b) => b.date === targetDate && b.status === 'CONFIRMED'
          );

          const merged = [...serverOccupied];
          for (const local of localBookingsForDate) {
            const exists = merged.some(
              (m) => m.roomId === local.roomId && m.date === local.date && m.slotId === local.slotId
            );
            if (!exists) {
              merged.push({
                roomId: local.roomId,
                date: local.date,
                slotId: local.slotId,
                bookedByStudentId: local.userStudentId,
                bookingId: local.id,
              });
            }
          }

          set({ occupiedSlots: merged });
        } catch (error) {
          console.warn('[useBookingStore] Lỗi khi tải danh sách slot occupied:', error);
        }
      },

      /**
       * CƠ CHẾ OPTIMISTIC UI KÈM ROLLBACK VÀ CHỐNG TRÙNG LẶP SUBMIT
       */
      bookRoomOptimistic: async (payload: CreateBookingPayload) => {
        const state = get();

        // 1. Chống double-submit (Debouncing / Lock)
        if (state.isSubmittingBooking) {
          return { success: false, error: 'Hệ thống đang xử lý yêu cầu trước đó, vui lòng đợi trong giây lát.' };
        }

        const room = state.rooms.find((r) => r.id === payload.roomId);
        const slot = VKU_TIME_SLOTS.find((s) => s.id === payload.slotId);

        if (!room || !slot) {
          return { success: false, error: 'Thông tin phòng học hoặc khung giờ không hợp lệ.' };
        }

        // 2. Snapshot trạng thái trước khi thay đổi (Dùng để Rollback nếu có lỗi)
        const previousReservations = [...state.activeReservations];
        const previousOccupiedSlots = [...state.occupiedSlots];

        // 3. Tạo bản ghi tạm thời cho Optimistic UI
        const tempId = `opt_${Date.now()}`;
        const optimisticBooking: Booking = {
          id: tempId,
          roomId: room.id,
          roomCode: room.code,
          roomName: room.name,
          building: room.building,
          date: payload.date,
          slotId: slot.id,
          slotLabel: slot.label,
          startTime: slot.startTime,
          endTime: slot.endTime,
          userId: state.userSession.id,
          userName: state.userSession.name,
          userEmail: state.userSession.email,
          userStudentId: state.userSession.studentId,
          purpose: payload.purpose,
          attendeesCount: payload.attendeesCount,
          status: 'PENDING_OPTIMISTIC',
          createdAt: new Date().toISOString(),
          qrPayload: JSON.stringify({
            bookingId: tempId,
            studentId: state.userSession.studentId,
            roomCode: room.code,
            date: payload.date,
            slot: slot.id,
            timestamp: Date.now(),
            institution: 'VKU - Danang',
          }),
        };

        const optimisticOccupancy: SlotOccupancy = {
          roomId: room.id,
          date: payload.date,
          slotId: slot.id,
          bookedByStudentId: state.userSession.studentId,
          bookingId: tempId,
        };

        // 4. ÁP DỤNG OPTIMISTIC UPDATE: Đổi trạng thái UI ngay lập tức
        set({
          isSubmittingBooking: true,
          activeReservations: [optimisticBooking, ...state.activeReservations],
          occupiedSlots: [...state.occupiedSlots, optimisticOccupancy],
        });

        try {
          // 5. Gửi request bất đồng bộ tới Mock API Server
          const confirmedBooking = await roomApi.bookRoom(
            payload,
            state.raceConditionDemoMode
          );

          // 6. Lập lịch thông báo cục bộ trước 15 phút
          let notificationId: string | undefined;
          try {
            notificationId = await NotificationService.scheduleBookingReminder(confirmedBooking);
          } catch (notifErr) {
            console.warn('[useBookingStore] Lỗi lên lịch thông báo:', notifErr);
          }

          const finalBooking: Booking = {
            ...confirmedBooking,
            notificationScheduledId: notificationId,
          };

          // 7. COMMIT: Cập nhật bản ghi chính thức từ server thay cho bản ghi tạm thời
          set((currentState) => ({
            isSubmittingBooking: false,
            activeReservations: currentState.activeReservations.map((item) =>
              item.id === tempId ? finalBooking : item
            ),
            occupiedSlots: currentState.occupiedSlots.map((item) =>
              item.bookingId === tempId ? { ...item, bookingId: finalBooking.id } : item
            ),
          }));

          feedbackEffects.success();
          return { success: true, booking: finalBooking };
        } catch (err: unknown) {
          // 8. ROLLBACK: Hoàn tác trạng thái về nguyên trạng khi xảy ra 409 Conflict hoặc lỗi mạng
          set({
            isSubmittingBooking: false,
            activeReservations: previousReservations,
            occupiedSlots: previousOccupiedSlots,
          });

          feedbackEffects.errorAlert();

          const message =
            err instanceof Error
              ? err.message
              : 'Xung đột khi đặt phòng! Khung giờ vừa bị chiếm bởi yêu cầu khác.';

          return { success: false, error: message };
        }
      },

      /**
       * Hủy phòng và giải phóng ca học
       */
      cancelBooking: async (bookingId: string) => {
        const booking = get().activeReservations.find((b) => b.id === bookingId);
        if (!booking) return false;

        try {
          // Hủy thông báo nhắc nhở đã lên lịch
          if (booking.notificationScheduledId) {
            await NotificationService.cancelNotification(booking.notificationScheduledId);
          }

          await roomApi.cancelBooking(bookingId);

          set((state) => ({
            activeReservations: state.activeReservations.map((b) =>
              b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
            ),
            occupiedSlots: state.occupiedSlots.filter((s) => s.bookingId !== bookingId),
          }));

          feedbackEffects.lightTap();
          return true;
        } catch (error) {
          console.warn('[useBookingStore] Lỗi khi hủy phòng:', error);
          return false;
        }
      },

      toggleRaceConditionDemoMode: () => {
        const nextMode = !get().raceConditionDemoMode;
        roomApi.setForceRaceConditionMode(nextMode);
        set({ raceConditionDemoMode: nextMode });
      },

      clearAllBookings: async () => {
        set({ activeReservations: [], occupiedSlots: [] });
      },
    }),
    {
      name: 'vku_booking_storage_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeReservations: state.activeReservations,
        raceConditionDemoMode: state.raceConditionDemoMode,
      }),
    }
  )
);
