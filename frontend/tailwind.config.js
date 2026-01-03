/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // AnyChat Theme Palette
                lavender: {
                    50: '#F5F3FF', // Sidebar Background (Lavender Mist)
                    100: '#EDE9FE',
                    200: '#DDD6FE',
                    300: '#C4B5FD',
                    400: '#A78BFA',
                    500: '#8B5CF6', // Primary Brand Purple
                    600: '#7C3AED',
                    700: '#6D28D9',
                },
                lime: {
                    400: '#A3E635', // AnyChat Lime (Highlights)
                    500: '#84CC16',
                },
                primary: {
                    DEFAULT: '#000000', // Primary Buttons are Black
                    hover: '#1F2937',
                    50: '#F5F3FF', // Re-mapping old primary-50 to Lavender for safety
                    600: '#8B5CF6', // Re-mapping old primary-600 to Purple for safety
                    700: '#7C3AED',
                },
                background: {
                    DEFAULT: '#F3F4F6', // Main Content Grey
                    card: '#FFFFFF',
                },
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6', // Main Background
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    800: '#1F2937',
                    900: '#111827',
                }
            },
            fontFamily: {
                sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 15px rgba(139, 92, 246, 0.3)',
            },
            borderRadius: {
                '3xl': '1.5rem', // Heavy rounding for cards
            }
        },
    },
    plugins: [],
}
