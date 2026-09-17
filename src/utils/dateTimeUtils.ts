export function getTodayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dateObj = new Date(year, month, day);

  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = dayNames[dateObj.getDay()] ?? '';
  return `${dayName}, ngày ${day}/${parts[1]}/${year}`;
}

export interface DayOption {
  readonly date: string;
  readonly dayName: string;
  readonly dayNumber: string;
  readonly month: string;
  readonly isToday: boolean;
}

export function getUpcomingDays(count: number = 7): readonly DayOption[] {
  const options: DayOption[] = [];
  const today = new Date();
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    options.push({
      date: dateStr,
      dayName: i === 0 ? 'Hôm nay' : dayNames[d.getDay()] ?? '',
      dayNumber: day,
      month: `T${d.getMonth() + 1}`,
      isToday: i === 0,
    });
  }

  return options;
}

export function calculateReminderDate(isoDate: string, startTime: string, minutesBefore: number = 15): Date {
  const parts = isoDate.split('-');
  const timeParts = startTime.split(':');
  
  const year = parseInt(parts[0] ?? '2026', 10);
  const month = parseInt(parts[1] ?? '1', 10) - 1;
  const day = parseInt(parts[2] ?? '1', 10);
  const hour = parseInt(timeParts[0] ?? '7', 10);
  const minute = parseInt(timeParts[1] ?? '30', 10);

  const targetDate = new Date(year, month, day, hour, minute, 0);
  // Lùi lại số phút quy định
  targetDate.setMinutes(targetDate.getMinutes() - minutesBefore);
  return targetDate;
}
