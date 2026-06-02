/** @type {import('tailwindcss').Config} */
module.exports = {
  // Custom prefix to avoid conflicts with host page styles
  prefix: 'llb-',
  
  // Scan all relevant source files for class names
  content: [
    './src/popup/**/*.{ts,tsx}',
    './src/options/**/*.{ts,tsx}',
    './src/content/**/*.ts',
    './src/shared/**/*.ts',
    './src/content/features/**/*.ts',
  ],
  
  // Core plugins: disable preflight for content script (no base reset)
  // Preflight will be enabled only for popup/options via separate CSS entry
  corePlugins: {
    preflight: false, // We'll manually enable it only in popup.css
  },
  
  theme: {
    extend: {
      colors: {
        // LinkFlow Pro industrial palette
        navy: {
          700: '#2d3748',
          800: '#1c2b46',
          900: '#152036',
        },
        peach: {
          500: '#ff8a5c',
          600: '#e67a4d',
        },
        surface: '#f0f2f5',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'hub': '0 10px 30px -10px var(--llb-hub-glow, rgba(255,138,92,0.2))',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,138,92,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255,138,92,0)' },
        },
      },
    },
  },
  
  plugins: [],
};