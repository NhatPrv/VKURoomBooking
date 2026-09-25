import { Building as OldBuilding, Room as OldRoom, Amenity as OldAmenity, TimeSlotId } from './room';
import { Booking as OldBooking } from './booking';

export type BuildingId = 'A' | 'B' | 'C' | 'V';
export type TimeSlot = '07:30-09:30' | '09:30-11:30' | '13:00-15:00' | '15:00-17:00';
export type RoomAmenity = 'Projector' | 'Whiteboard' | 'High-spec PC' | 'AC';

export interface Room {
  readonly id: string;
  readonly name: string;
  readonly building: BuildingId;
  readonly floor: number;
  readonly capacity: number; // 2 to 20 seats
  readonly amenities: readonly RoomAmenity[];
  readonly imageUrl: string;
  readonly isAvailableNow: boolean;
  readonly code?: string;
  readonly description?: string;
  readonly rules?: readonly string[];
}

export interface Reservation {
  readonly id: string; // Unique booking token
  readonly roomId: string;
  readonly roomName: string;
  readonly date: string; // YYYY-MM-DD
  readonly timeSlot: TimeSlot;
  readonly studentId: string;
  readonly bookedAt: string; // ISO string
  readonly qrData: string; // Encrypted/stringified pass payload
}

// Re-export toàn bộ types hiện tại để tương thích 100% với hệ thống
export * from './room';
export * from './booking';
export * from './navigation';
