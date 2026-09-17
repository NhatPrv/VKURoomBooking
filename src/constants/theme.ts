export const COLORS = {
  // Thương hiệu VKU & Hệ thống màu chính
  primary: '#0B3B60',        // Deep VKU Navy Blue
  primaryDark: '#07243B',    // Darker tone
  primaryLight: '#185A9D',   // Accent lighter blue
  secondary: '#D32F2F',      // VKU Red Accent
  secondaryLight: '#FFEBEE', // Red surface
  accent: '#00A896',         // Modern Emerald/Teal
  
  // Nền & Bề mặt
  background: '#F4F7FB',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF3F8',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#EDF2F7',

  // Văn bản
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Trạng thái (Status colors)
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Visual states
  disabled: '#CBD5E1',
  disabledText: '#94A3B8',
  occupiedBg: '#FEE2E2',
  occupiedBorder: '#FCA5A5',
  occupiedText: '#991B1B',
  availableBg: '#ECFDF5',
  availableBorder: '#6EE7B7',
  availableText: '#065F46',
  selectedBg: '#0B3B60',
  selectedText: '#FFFFFF',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const SHADOWS = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  card: {
    shadowColor: '#0B3B60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  prominent: {
    shadowColor: '#0B3B60',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
