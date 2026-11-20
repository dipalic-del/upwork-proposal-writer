/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Dynamic Design Tokens (bound to CSS variables) ───────────────────
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        card:        'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        muted:       'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        border:      'var(--border)',
        ring:        'var(--ring)',

        // ── Brand Accents ───────────────────────────────────────────────────
        primary:     '#f37935',
        'primary-foreground': '#ffffff',
        'primary-hover': '#e0631f',
        secondary:   '#2c47a3',
        'secondary-foreground': '#ffffff',
        'secondary-hover': '#223985',

        // ── Status Tokens ───────────────────────────────────────────────────
        billable:    '#00a544',
        upwork:      '#00b3e1',
        unproductive:'#fb2c36',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.35rem',
        sm:  '0.25rem',
        md:  '0.35rem',
        lg:  '0.5rem',
        xl:  '0.75rem',
        '2xl': '1rem',
        full:'9999px',
      },
      boxShadow: {
        'card':      '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 12px -2px rgba(0,0,0,0.08), 0 2px 6px -1px rgba(0,0,0,0.04)',
        'orange':    '0 0 20px -4px rgba(243,121,53,0.3)',
        'orange-sm': '0 2px 10px -2px rgba(243,121,53,0.3)',
      },
      animation: {
        'fade-in':       'fadeIn 0.15s ease-out',
        'slide-down':    'slideDown 0.2s cubic-bezier(0.16,1,0.3,1)',
        'slide-up':      'slideUp 0.2s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },              to: { opacity: '1' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(6px)' },  to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
