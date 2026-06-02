module.exports = {
  prefix: 'llb-',
  content: [
    './src/popup/**/*.{ts,tsx}',
    './src/content/**/*.ts',
    './src/shared/**/*.ts',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        navy: { 800: '#1c2b46', 900: '#152036' },
        peach: { 500: '#ff8a5c', 600: '#e67a4d' },
      },
    },
  },
  plugins: [],
};