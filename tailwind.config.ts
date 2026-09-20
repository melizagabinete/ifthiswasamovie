import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"], // Changed from "media" to "class" for better compatibility with Shadcn
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        limelight: ['Limelight', 'cursive'],
        mono: ['Courier Prime', 'monospace'],
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      colors: {
        // --- YOUR CUSTOM CINEMA THEME (legacy, kept for compatibility) ---
        'cinema-black': '#0a0a0a',
        'cinema-burgundy': '#2B0000',
        'cinema-red': '#cc3000',
        'cinema-red-light': '#e74c3c',
        'cinema-gold': '#D4AF37',
        'cinemaYellow': "#C9A24D",
        'cc3000': '#cc3000',

        // --- NEW MINIMAL BEIGE / BURGUNDY THEME ---
        cream: {
          DEFAULT: '#FBF3E6',
          soft: '#F6EBD9',
          dark: '#EFE0C6',
        },
        paper: '#F3E7D2',
        ink: {
          DEFAULT: '#211712',
          soft: '#4A3D34',
          muted: '#7A6C5D',
        },
        burgundy: {
          DEFAULT: '#6B0F14',
          dark: '#4E0A0D',
          light: '#8C1C22',
        },

        // --- SHADCN / SYSTEM COLORS ---
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }, // moves left by 50% of container
        },
        'scroll-right': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' }, // moves right by 50% of container
        },
      },
      animation: {
        'scroll-left': 'scroll-left 40s linear infinite',
        'scroll-right': 'scroll-right 40s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}