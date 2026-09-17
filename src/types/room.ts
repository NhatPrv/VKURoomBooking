export type Building = 'A' | 'B' | 'C' | 'V';

export type Amenity =
  | 'Projector'
  | 'Whiteboard'
  | 'High-spec PC'
  | 'AC'
  | 'Microphone'
  | 'Ethernet';

export type TimeSlotId = 'SLOT_1' | 'SLOT_2' | 'SLOT_3' | 'SLOT_4';

export interface TimeSlot {
  readonly id: TimeSlotId;
  readonly label: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly session: 'MORNING' | 'AFTERNOON';
}

export interface Room {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly building: Building;
  readonly floor: number;
  readonly capacity: number;
  readonly amenities: readonly Amenity[];
  readonly imageUrl: string;
  readonly description: string;
  readonly rules: readonly string[];
  readonly isMaintenance?: boolean;
}

export interface RoomFilterState {
  readonly searchQuery: string;
  readonly building: Building | 'ALL';
  readonly minCapacity: number;
  readonly amenities: readonly Amenity[];
}

export interface SlotAvailability {
  readonly slotId: TimeSlotId;
  readonly isAvailable: boolean;
  readonly bookedBy?: string;
  readonly bookingId?: string;
}
