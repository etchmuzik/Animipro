/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      // Dense type tokens — replace 215 arbitrary text-[Npx] uses across modules.
      // tiny=9px, micro=10px, mini=11px, "13"=13px (between Tailwind xs and sm)
      fontSize: {
        tiny:  ['9px',  { lineHeight: '1.2' }],
        micro: ['10px', { lineHeight: '1.25' }],
        mini:  ['11px', { lineHeight: '1.3' }],
        13:    ['13px', { lineHeight: '1.4' }],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        // Brand teal scale — also aliased via `--primary` for shadcn primitives.
        // Use `bg-brand-teal` etc. when you need the brand color *regardless*
        // of the surface (vs `bg-primary` which can be overridden per surface).
        'brand-teal': {
          50:  'hsl(var(--brand-teal-50))',
          100: 'hsl(var(--brand-teal-100))',
          200: 'hsl(var(--brand-teal-200))',
          300: 'hsl(var(--brand-teal-300))',
          400: 'hsl(var(--brand-teal-400))',
          500: 'hsl(var(--brand-teal-500))',
          600: 'hsl(var(--brand-teal-600))',
          DEFAULT: 'hsl(var(--brand-teal))',     // === primary === cyan-700
          800: 'hsl(var(--brand-teal-800))',
          900: 'hsl(var(--brand-teal-900))',
          950: 'hsl(var(--brand-teal-950))',
        },
        // Marketing surface tokens
        'brand-navy': {
          DEFAULT: 'hsl(var(--brand-navy))',
          elev1:   'hsl(var(--brand-navy-elev1))',
          elev2:   'hsl(var(--brand-navy-elev2))',
          line:    'hsl(var(--brand-navy-line))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionTimingFunction: {
        spring: 'var(--ease-spring)',
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
        slowest: 'var(--dur-slowest)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
