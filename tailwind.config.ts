import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-opensans)", "var(--font-sans)"],
        serif: ["var(--font-playfair)", "var(--font-serif)"],
        cinzel: ["var(--font-cinzel)", "serif"],
      },
      colors: {
        // Classical Pianist Palette
        'ebony': {
          DEFAULT: '#1C2526',
          50: '#F1F2F2',
          100: '#E4E6E6',
          200: '#C9CDCE',
          300: '#AEB4B6',
          400: '#939B9E',
          500: '#788286',
          600: '#5D686E',
          700: '#424F56',
          800: '#27363E',
          900: '#1C2526',
          950: '#0C1113',
        },
        'ivory': {
          DEFAULT: '#F8F1E9',
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FFFFFF',
          300: '#FFFFFF',
          400: '#FEFCF9',
          500: '#F8F1E9',
          600: '#EFD9C1',
          700: '#E6C199',
          800: '#DDA971',
          900: '#D49149',
          950: '#C8812D',
        },
        'gold': {
          DEFAULT: '#D4A017',
          50: '#FCF5E1',
          100: '#F9EECC',
          200: '#F3DFA3',
          300: '#EDD17A',
          400: '#E7C251',
          500: '#E1B428',
          600: '#D4A017',
          700: '#A67C12',
          800: '#78590D',
          900: '#4A3608',
          950: '#372904',
        },
        'burgundy': {
          DEFAULT: '#4A2C2A',
          50: '#F0EBEB',
          100: '#E1D7D6',
          200: '#C3AFAD',
          300: '#A58784',
          400: '#875F5B',
          500: '#693732',
          600: '#4A2C2A',
          700: '#3A2221',
          800: '#2A1918',
          900: '#1A100F',
          950: '#0F0807',
        },
        'slate-blue': {
          DEFAULT: '#5C829A',
          50: '#EEF2F6',
          100: '#DCE6ED',
          200: '#B9CDDB',
          300: '#96B4C9',
          400: '#739BB7',
          500: '#5C829A',
          600: '#4A6A7B',
          700: '#38525C',
          800: '#263A3D',
          900: '#14221E',
          950: '#0A110F',
        },
        // Semantic color system (unchanged)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
