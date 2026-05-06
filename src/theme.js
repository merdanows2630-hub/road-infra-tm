// src/theme.js
export const COLORS = {
  primary: '#0A2540',       // Dark navy
  primaryLight: '#1A3A5C',
  accent: '#00C896',        // Turkmenistan green
  accentLight: '#00E5A8',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',
  white: '#FFFFFF',
  offWhite: '#F8FAFC',
  light: '#E2E8F0',
  muted: '#94A3B8',
  text: '#1E293B',
  textSecondary: '#64748B',
  cardBg: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.08)',

  // Condition colors
  conditionGood: '#10B981',
  conditionMedium: '#F59E0B',
  conditionBad: '#EF4444',

  // Severity
  severityLow: '#10B981',
  severityModerate: '#F59E0B',
  severityHigh: '#F97316',
  severityCritical: '#EF4444',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  borderRadius: 12,
  borderRadiusLg: 20,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const getConditionColor = (condition) => {
  switch (condition) {
    case 'good': return COLORS.conditionGood;
    case 'medium': return COLORS.conditionMedium;
    case 'bad': return COLORS.conditionBad;
    default: return COLORS.muted;
  }
};

export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'low': return COLORS.severityLow;
    case 'moderate': return COLORS.severityModerate;
    case 'high': return COLORS.severityHigh;
    case 'critical': return COLORS.severityCritical;
    default: return COLORS.muted;
  }
};

export const getIncidentIcon = (type) => {
  switch (type) {
    case 'pothole': return '🕳️';
    case 'cracking': return '⚡';
    case 'flooding': return '🌊';
    case 'signDamage': return '⚠️';
    case 'bridgeDamage': return '🌉';
    case 'roadblock': return '🚧';
    default: return '📍';
  }
};
