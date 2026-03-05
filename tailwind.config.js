/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#fdf9ed',
          100: '#f9f0d0',
          200: '#f3dfa1',
          300: '#ebc868',
          400: '#e4ae3a',
          500: '#d4922b',
          600: '#b97020',
          700: '#925219',
          800: '#78421b',
          900: '#66381b',
        },
        obsidian: {
          50: '#f5f5f4',
          100: '#e8e7e5',
          200: '#d2d0cc',
          300: '#b1aeaa',
          400: '#888480',
          500: '#6d6a66',
          600: '#5c5955',
          700: '#4d4b47',
          800: '#44423f',
          900: '#3c3a37',
          950: '#1a1917',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,146,43,0)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212,146,43,0.2)' },
        },
      },
    },
  },
  plugins: [],
};
