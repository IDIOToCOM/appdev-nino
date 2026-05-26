/**
 * Uto Mobility customer theme — matches PROJECT B landing.css / car-catalog.css
 */
export const UTO = {
  navy: '#0a0a0a',
  text: '#0a0a0a',
  textBody: '#374151',
  muted: '#6b7280',
  muted2: '#4b5563',
  border: '#e5e7eb',
  borderSoft: 'rgba(0, 0, 0, 0.08)',
  inputBg: '#f9fafb',
  white: '#ffffff',
  background: '#f5f5f5',
  backgroundGradientEnd: '#ededed',
  radius: 12,
  radiusLg: 20,
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  shadowHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
  },
  primaryButton: '#0a0a0a',
  primaryButtonEnd: '#525252',
  success: '#0a0a0a',
  error: '#b91c1c',
  warningBg: '#fff8e1',
  warningBorder: '#ffe082',
  warningText: '#b45309',
  mediaPlaceholder: ['#f5f5f5', '#e8e8e8'] as const,
} as const;

export const UTO_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export function formatPricePerDay(amount: number): string {
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString('en-PH', { maximumFractionDigits: 0 })
    : String(amount);
  return `₱${formatted}/day`;
}
