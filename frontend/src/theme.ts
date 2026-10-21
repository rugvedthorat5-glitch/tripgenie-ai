export const colors = {
  primary: '#0D9488', // Sleek travel emerald/teal
  primaryDark: '#115E59',
  primaryMid: '#14B8A6',
  primarySoft: '#F0FDFA',
  primarySoft2: '#CCFBF1',
  accent: '#F43F5E', // Warm sunset rose/coral for favorites & badges
  accentSoft: '#FFF1F2',
  accentWarm: '#F59E0B', // Amber for ratings & highlights
  bg: '#F8FAFC', // Crisp modern slate canvas
  bgWarm: '#FAFAFA',
  card: '#FFFFFF',
  text: '#0F172A', // Slate 900
  textSecondary: '#334155', // Slate 700
  muted: '#64748B', // Slate 500
  border: '#E2E8F0', // Slate 200
  borderLight: '#F1F5F9', // Slate 100
  success: '#10B981',
  successSoft: '#ECFDF5',
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  chip: '#F1F5F9',
  overlay: 'rgba(15, 23, 42, 0.45)',
  inkSoft: 'rgba(15, 23, 42, 0.04)',
};

export const gradients = {
  brand: ['#0D9488', '#0F766E', '#115E59'] as [string, string, string],
  brandModern: ['#0F766E', '#0D9488'] as [string, string],
  brandSoft: ['#F0FDFA', '#E6FFFA'] as [string, string],
  heroCard: ['#0F172A', '#1E293B'] as [string, string],
  sunset: ['#F43F5E', '#FB7185'] as [string, string],
  amber: ['#F59E0B', '#D97706'] as [string, string],
  sky: ['#0EA5E9', '#0284C7'] as [string, string],
  cardDark: ['rgba(15, 23, 42, 0.05)', 'rgba(15, 23, 42, 0.75)'] as [string, string],
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 36 };

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export const typography = {
  hero: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.3 },
  subtitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500' as const },
  label: { fontSize: 13, fontWeight: '700' as const },
};

export const shadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export const shadowSoft = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export const shadowLift = {
  shadowColor: '#0D9488',
  shadowOpacity: 0.22,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

