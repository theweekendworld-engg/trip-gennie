import type { Config } from "tailwindcss";

export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: 'hsl(var(--primary-50))',
                    100: 'hsl(var(--primary-100))',
                    200: 'hsl(var(--primary-200))',
                    300: 'hsl(var(--primary-300))',
                    400: 'hsl(var(--primary-400))',
                    500: 'hsl(var(--primary-500))',
                    600: 'hsl(var(--primary-600))',
                    700: 'hsl(var(--primary-700))',
                    800: 'hsl(var(--primary-800))',
                    900: 'hsl(var(--primary-900))',
                },
                accent: {
                    50: 'hsl(var(--accent-50))',
                    100: 'hsl(var(--accent-100))',
                    200: 'hsl(var(--accent-200))',
                    300: 'hsl(var(--accent-300))',
                    400: 'hsl(var(--accent-400))',
                    500: 'hsl(var(--accent-500))',
                    600: 'hsl(var(--accent-600))',
                    700: 'hsl(var(--accent-700))',
                    800: 'hsl(var(--accent-800))',
                    900: 'hsl(var(--accent-900))',
                },
                background: 'hsl(var(--background) / <alpha-value>)',
                foreground: 'hsl(var(--foreground) / <alpha-value>)',
                muted: {
                    DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
                    foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
                },
                border: 'hsl(var(--border) / <alpha-value>)',
                card: {
                    DEFAULT: 'hsl(var(--card) / <alpha-value>)',
                    foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
                },
            },
            borderRadius: {
                sm: 'var(--radius-sm)',
                md: 'var(--radius-md)',
                lg: 'var(--radius-lg)',
                xl: 'var(--radius-xl)',
                '2xl': 'var(--radius-2xl)',
                full: 'var(--radius-full)',
            },
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                xl: 'var(--shadow-xl)',
                '2xl': 'var(--shadow-2xl)',
            },
            transitionDuration: {
                fast: 'var(--transition-fast)',
                base: 'var(--transition-base)',
                slow: 'var(--transition-slow)',
            },
            animation: {
                'fade-in': 'fadeIn var(--transition-base) ease-in',
                'slide-up': 'slideUp var(--transition-base) ease-out',
                'scale-in': 'scaleIn var(--transition-base) ease-out',
                'shimmer': 'shimmer 2s infinite linear',
            },
        },
    },
    plugins: [],
} satisfies Config;
