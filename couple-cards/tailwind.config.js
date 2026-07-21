/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-soft': 'var(--bg-soft)',
        fg: 'var(--fg)',
        'fg-soft': 'var(--fg-soft)',
        card: 'var(--card)',
        border: 'var(--border-c)',
        muted: 'var(--muted)',
        rose: 'var(--accent-rose)',
        gold: 'var(--accent-gold)',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Cormorant Garamond"', 'serif'],
        display: ['"Cormorant Garamond"', '"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        glow: '0 0 40px rgba(201,112,100,0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'float-up': {
          '0%': { transform: 'translateY(0)', opacity: '0.6' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(-30px)', opacity: '0' },
        },
        'breathe': {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'float-up': 'float-up 6s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
}
