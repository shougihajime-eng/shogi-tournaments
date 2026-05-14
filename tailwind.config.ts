import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917'
        },
        shogi: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#102A43'
        },
        tokyo: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B'
        },
        kanto: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412'
        },
        going: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#16A34A',
          600: '#15803D',
          700: '#166534'
        },
        interest: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309'
        },
        deadline: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C'
        },
        // 伝統色：駒木地（薄黄）
        koma: {
          50: '#FFFBF0',
          100: '#FAF1DA',
          200: '#F2E2B6',
          300: '#E6CB8B',
          400: '#D4AC5E',
          500: '#B8893A',
          600: '#8E6628',
          700: '#664818',
          800: '#3F2C0E'
        },
        // 伝統色：朱（鮮やかな赤）
        shu: {
          50: '#FFF1ED',
          100: '#FFD9CD',
          400: '#E55B30',
          500: '#C8421B',
          600: '#A8330F'
        },
        // 伝統色：紫（高貴）
        murasaki: {
          50: '#F5EFFB',
          100: '#E5D6F4',
          500: '#7B3FA8',
          600: '#5E2A88',
          700: '#3F1E62',
          800: '#2A1646'
        },
        // 伝統色：金（アクセント）
        kin: {
          400: '#E0B354',
          500: '#C99A3A',
          600: '#A07825'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace']
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }]
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgb(16 42 67 / 0.06), 0 2px 8px -2px rgb(16 42 67 / 0.08)',
        'card-hover': '0 8px 16px -4px rgb(16 42 67 / 0.12), 0 4px 8px -4px rgb(16 42 67 / 0.08)',
        'elevated': '0 12px 24px -8px rgb(16 42 67 / 0.18), 0 4px 8px -4px rgb(16 42 67 / 0.08)',
        'inner-soft': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'glow-featured': '0 0 0 1px rgb(123 63 168 / 0.25), 0 8px 24px -4px rgb(123 63 168 / 0.25)',
        'glow-prize': '0 0 0 1px rgb(201 154 58 / 0.3), 0 8px 24px -4px rgb(201 154 58 / 0.25)'
      },
      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px'
      },
      backgroundImage: {
        'shogi-board': "linear-gradient(135deg, #FAF1DA 0%, #F2E2B6 100%)",
        'page-warm': "linear-gradient(180deg, #FFFBF0 0%, #FAF6EE 30%, #F5F0E4 100%)",
        'header-deep': "linear-gradient(135deg, #102A43 0%, #243B53 50%, #334E68 100%)",
        'gold-line': "linear-gradient(90deg, transparent 0%, #C99A3A 30%, #E0B354 50%, #C99A3A 70%, transparent 100%)"
      },
      animation: {
        'fade-in': 'fade-in 240ms ease-out',
        'slide-up': 'slide-up 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.4s ease-in-out infinite'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      maxWidth: {
        '8xl': '88rem'
      }
    }
  },
  plugins: []
}

export default config
