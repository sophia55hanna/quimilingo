/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        duo: {
          bg: '#131f24',
          surface: '#202f36',
          border: '#37464f',
          text: '#f1f7fb',
          muted: '#8fa3ad',
          green: { DEFAULT: '#58cc02', dark: '#58a700', light: '#89e219' },
          blue: { DEFAULT: '#1cb0f6', dark: '#1899d6' },
          purple: { DEFAULT: '#ce82ff', dark: '#a568cc' },
          yellow: { DEFAULT: '#ffc800', dark: '#e0a800' },
          orange: { DEFAULT: '#ff9600', dark: '#cc7a00' },
          red: { DEFAULT: '#ff4b4b', dark: '#ea2b2b' },
        },
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'heart-loss': {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.4) rotate(-10deg)' },
          '60%': { transform: 'scale(0.9) rotate(8deg)' },
          '100%': { transform: 'scale(1) rotate(0)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0.6' },
        },
      },
      animation: {
        shake: 'shake 0.45s ease-in-out',
        pop: 'pop 0.35s ease-out both',
        'slide-up': 'slide-up 0.25s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        float: 'float 2s ease-in-out infinite',
        'heart-loss': 'heart-loss 0.6s ease-in-out',
        'confetti-fall': 'confetti-fall 3s linear forwards',
      },
    },
  },
  plugins: [],
};
