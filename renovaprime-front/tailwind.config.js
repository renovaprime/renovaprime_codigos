/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0052FF',
          light: '#4D7CFF',
          50: '#E6EDFF',
          100: '#CCDBff',
          200: '#99B7FF',
          300: '#6693FF',
          400: '#336FFF',
          500: '#0052FF',
          600: '#0042CC',
          700: '#003199',
          800: '#002166',
          900: '#001033',
        },
        background: '#FAFAFA',
        foreground: '#0F172A',
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        border: '#E2E8F0',
        card: '#FFFFFF',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 20px 25px -5px rgba(0, 0, 0, 0.05)',
        'elevated-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 25px 50px -12px rgba(0, 0, 0, 0.12)',
        'accent': '0 4px 14px 0 rgba(0, 82, 255, 0.25)',
        'accent-lg': '0 8px 28px 0 rgba(0, 82, 255, 0.35)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0052FF 0%, #4D7CFF 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #0042CC 0%, #0052FF 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
