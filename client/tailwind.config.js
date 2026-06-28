/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Bridal / luxury palette: soft rose gold, ivory, deep charcoal.
      colors: {
        rosegold: {
          50: '#fbf3ef',
          100: '#f6e3da',
          200: '#edc7b5',
          300: '#e2a98e',
          400: '#d68e6e',
          500: '#c47a5a', // primary rose gold
          600: '#a9623f',
          700: '#874c30',
          800: '#5f3622',
          900: '#3d2316',
        },
        ivory: {
          DEFAULT: '#fbf8f3',
          100: '#fdfcf9',
          200: '#f7f1e8',
        },
        charcoal: {
          DEFAULT: '#2b2b2e',
          light: '#4a4a50',
          dark: '#1c1c1f',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(43, 43, 46, 0.18)',
        lift: '0 22px 55px -20px rgba(43, 43, 46, 0.32)',
      },
      // Reusable entrance + ambient animations used across the UI.
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
