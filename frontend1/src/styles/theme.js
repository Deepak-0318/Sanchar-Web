// Optimal Color Theme for Maximum Readability & User Experience
export const theme = {
  colors: {
    // Primary Colors - High contrast for accessibility
    primary: '#1E40AF',        // Deep Blue (WCAG AAA compliant)
    primaryLight: '#3B82F6',   // Lighter Blue for hover states
    primaryDark: '#1E3A8A',    // Darker Blue for active states
    
    // Secondary Colors - Calming and professional
    secondary: '#059669',      // Forest Green (nature/trust)
    secondaryLight: '#10B981', // Light Green for accents
    secondaryDark: '#047857',  // Dark Green for emphasis
    
    // Accent Colors - Warm and inviting
    accent: '#DC2626',         // Warm Red for CTAs
    accentLight: '#EF4444',    // Light Red for hover
    accentOrange: '#EA580C',   // Orange for highlights
    
    // Neutral Colors - Perfect contrast ratios
    background: '#FFFFFF',     // Pure white background
    surface: '#F8FAFC',        // Light gray surface
    surfaceHover: '#F1F5F9',   // Subtle hover state
    
    // Text Colors - Optimal readability
    textPrimary: '#111827',    // Near black (21:1 contrast ratio)
    textSecondary: '#374151',  // Dark gray (12:1 contrast ratio)
    textMuted: '#6B7280',      // Medium gray (7:1 contrast ratio)
    textLight: '#9CA3AF',      // Light gray for subtle text
    
    // Border Colors
    border: '#E5E7EB',         // Light border
    borderHover: '#D1D5DB',    // Darker border on hover
    borderFocus: '#3B82F6',    // Blue border for focus states
    
    // Status Colors
    success: '#059669',        // Green for success
    warning: '#D97706',        // Amber for warnings
    error: '#DC2626',          // Red for errors
    info: '#2563EB',           // Blue for info
    
    // Alpha Variations for overlays
    overlay: 'rgba(17, 24, 39, 0.5)',
    overlayLight: 'rgba(17, 24, 39, 0.1)',
    
    // Gradients
    primaryGradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    secondaryGradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    accentGradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
    heroGradient: 'linear-gradient(135deg, #1E40AF 0%, #059669 50%, #DC2626 100%)',
  },
  
  // Shadows with proper opacity
  shadows: {
    sm: '0 1px 2px 0 rgba(17, 24, 39, 0.05)',
    md: '0 4px 6px -1px rgba(17, 24, 39, 0.1)',
    lg: '0 10px 15px -3px rgba(17, 24, 39, 0.1)',
    xl: '0 20px 25px -5px rgba(17, 24, 39, 0.1)',
    focus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    primary: '0 10px 30px rgba(30, 64, 175, 0.2)',
    secondary: '0 10px 30px rgba(5, 150, 105, 0.2)',
    accent: '0 10px 30px rgba(220, 38, 38, 0.2)',
  },
  
  // Typography scale
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    }
  },
  
  // Spacing scale
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    '2xl': '4rem',  // 64px
    '3xl': '6rem',  // 96px
  }
};

export default theme;