import { Room, TimeSlotId } from '../types/room';
import { Booking, CreateBookingPayload, SlotOccupancy } from '../types/booking';
import { VKU_ROOMS, VKU_TIME_SLOTS, DEFAULT_USER_SESSION } from '../constants/mockData';
import { getTodayISODate } from '../utils/dateTimeUtils';

// Trạng thái server mô phỏng lưu trên bộ nhớ
class MockServerDatabase {
  private static instance: MockServerDatabase;
  private occupiedSlots: SlotOccupancy[] = [];
  private bookings: Booking[] = [];
  public forceRaceConditionMode: boolean = false;

  private constructor() {
    this.seedInitialOccupancy();
  }

  public static getInstance(): MockServerDatabase {
    if (!MockServerDatabase.instance) {
      MockServerDatabase.instance = new MockServerDatabase();
    }
    return MockServerDatabase.instance;
  }

  /**
   * Khởi tạo dữ liệu chiếm chỗ mẫu để kiểm thử visual disabled state ngay khi mở app
   */
  private seedInitialOccupancy(): void {
    const today = getTodayISODate();

    // Giả lập phòng V.204 đã bị sinh viên khác đặt ca 1 và ca 3
    this.occupiedSlots.push({
      roomId: 'room_v204',
      date: today,
      slotId: 'SLOT_1',
      bookedByStudentId: '21IT099',
      bookingId: 'seed_bk_01',
    });
    this.occupiedSlots.push({
      roomId: 'room_v204',
      date: today,
      slotId: 'SLOT_3',
      bookedByStudentId: '20IT123',
      bookingId: 'seed_bk_02',
    });

    // Phòng A.102 bị chiếm ca 2
    this.occupiedSlots.push({
      roomId: 'room_a102',
      date: today,
      slotId: 'SLOT_2',
      bookedByStudentId: '22IT104',
      bookingId: 'seed_bk_03',
    });

    // Phòng B.101 bị chiếm ca 4
    this.occupiedSlots.push({
      roomId: 'room_b101',
      date: today,
      slotId: 'SLOT_4',
      bookedByStudentId: '22IT888',
      bookingId: 'seed_bk_04',
    });
  }

  public getOccupiedSlots(): SlotOccupancy[] {
    return [...this.occupiedSlots];
  }

  public isSlotOccupied(roomId: string, date: string, slotId: TimeSlotId): boolean {
    return this.occupiedSlots.some(
      (s) => s.roomId === roomId && s.date === date && s.slotId === slotId
    );
  }

  public registerOccupancy(occupancy: SlotOccupancy): void {
    this.occupiedSlots.push(occupancy);
  }

  public removeOccupancy(roomId: string, date: string, slotId: TimeSlotId): void {
    this.occupiedSlots = this.occupiedSlots.filter(
      (s) => !(s.roomId === roomId && s.date === date && s.slotId === slotId)
    );
  }

  public addBooking(booking: Booking): void {
    this.bookings.push(booking);
  }

  public getBookings(): Booking[] {
    return [...this.bookings];
  }

  public removeBooking(bookingId: string): void {
    this.bookings = this.bookings.filter((b) => b.id !== bookingId);
  }
}

const db = MockServerDatabase.getInstance();

const simulateLatency = (minMs: number = 300, maxMs: number = 600): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const roomApi = {
  /**
   * Lấy danh sách tất cả phòng học VKU
   */
  async getRooms(): Promise<readonly Room[]> {
    await simulateLatency(200, 400);
    return VKU_ROOMS;
  },

  /**
   * Lấy danh sách các slot đã bị chiếm tại ngày chỉ định
   */
  async getOccupiedSlotsByDate(date: string): Promise<SlotOccupancy[]> {
    await simulateLatency(150, 300);
    return db.getOccupiedSlots().filter((s) => s.date === date);
  },

  /**
   * Đặt phòng với mô phỏng kiểm tra Race Condition và độ trễ mạng
   */
  async bookRoom(payload: CreateBookingPayload, forceSimulateConflict: boolean = false): Promise<Booking> {
    await simulateLatency(400, 650);

    const room = VKU_ROOMS.find((r) => r.id === payload.roomId);
    if (!room) {
      throw new Error(`404 Not Found: Không tìm thấy phòng ${payload.roomId}`);
    }

    const slot = VKU_TIME_SLOTS.find((s) => s.id === payload.slotId);
    if (!slot) {
      throw new Error(`400 Bad Request: Khung giờ ${payload.slotId} không hợp lệ`);
    }

    // Kiểm tra giả lập xung đột đồng thời hoặc kiểm tra thực tế DB
    const alreadyOccupied = db.isSlotOccupied(payload.roomId, payload.date, payload.slotId);

    if (forceSimulateConflict || db.forceRaceConditionMode || alreadyOccupied) {
      const error: Error & { statusCode?: number } = new Error(
        '409 Conflict: Khung giờ này vừa có sinh viên khác đăng ký thành công trước bạn! Vui lòng chọn ca học khác.'
      );
      error.statusCode = 409;
      throw error;
    }

    // Đăng ký thành công vào DB
    const newBookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBooking: Booking = {
      id: newBookingId,
      roomId: room.id,
      roomCode: room.code,
      roomName: room.name,
      building: room.building,
      date: payload.date,
      slotId: slot.id,
      slotLabel: slot.label,
      startTime: slot.startTime,
      endTime: slot.endTime,
      userId: DEFAULT_USER_SESSION.id,
      userName: DEFAULT_USER_SESSION.name,
      userEmail: DEFAULT_USER_SESSION.email,
      userStudentId: DEFAULT_USER_SESSION.studentId,
      purpose: payload.purpose,
      attendeesCount: payload.attendeesCount,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      qrPayload: JSON.stringify({
        bookingId: newBookingId,
        studentId: DEFAULT_USER_SESSION.studentId,
        roomCode: room.code,
        date: payload.date,
        slot: slot.id,
        timestamp: Date.now(),
        institution: 'VKU - Danang',
      }),
    };

    db.registerOccupancy({
      roomId: room.id,
      date: payload.date,
      slotId: slot.id,
      bookedByStudentId: DEFAULT_USER_SESSION.studentId,
      bookingId: newBookingId,
    });

    db.addBooking(newBooking);

    return newBooking;
  },

  /**
   * Hủy đặt phòng và giải phóng khung giờ
   */
  async cancelBooking(bookingId: string): Promise<boolean> {
    await simulateLatency(250, 450);
    const booking = db.getBookings().find((b) => b.id === bookingId);
    if (booking) {
      db.removeOccupancy(booking.roomId, booking.date, booking.slotId);
      db.removeBooking(bookingId);
    }
    return true;
  },

  /**
   * Bật/Tắt chế độ ép giả lập 409 Race Condition để kiểm thử trên điện thoại thật
   */
  setForceRaceConditionMode(enabled: boolean): void {
    db.forceRaceConditionMode = enabled;
  },

  getForceRaceConditionMode(): boolean {
    return db.forceRaceConditionMode;
  },
};
