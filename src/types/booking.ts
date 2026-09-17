import { Building, TimeSlotId } from './room';

export type BookingStatus =
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PENDING_OPTIMISTIC';

export interface Booking {
  readonly id: string;
  readonly roomId: string;
  readonly roomCode: string;
  readonly roomName: string;
  readonly building: Building;
  readonly date: string; // Định dạng YYYY-MM-DD
  readonly slotId: TimeSlotId;
  readonly slotLabel: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly userStudentId: string;
  readonly purpose: string;
  readonly attendeesCount: number;
  readonly status: BookingStatus;
  readonly createdAt: string;
  readonly notificationScheduledId?: string;
  readonly qrPayload: string;
}

export interface SlotOccupancy {
  readonly roomId: string;
  readonly date: string; // YYYY-MM-DD
  readonly slotId: TimeSlotId;
  readonly bookedByStudentId: string;
  readonly bookingId: string;
}

export interface CreateBookingPayload {
  readonly roomId: string;
  readonly date: string; // YYYY-MM-DD
  readonly slotId: TimeSlotId;
  readonly purpose: string;
  readonly attendeesCount: number;
}

export interface UserSession {
  readonly id: string;
  readonly studentId: string;
  readonly name: string;
  readonly email: string;
  readonly major: string;
  readonly department: string;
  readonly avatarUrl: string;
}

export interface BookingPassData {
  readonly bookingId: string;
  readonly studentId: string;
  readonly roomCode: string;
  readonly date: string;
  readonly slot: string;
  readonly signature: string;
}
