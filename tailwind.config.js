/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        goen: {
          green: {
            50:  '#f0faf4',
            100: '#d0eedf',
            200: '#a1ddbf',
            300: '#63c495',
            400: '#2da86a',
            500: '#1a8a52',
            600: '#146e41',
            700: '#0f5530',  // primary deep green
            800: '#0a3d22',
            900: '#052615',
          },
          gold: {
            100: '#fef3d0',
            200: '#fce49a',
            300: '#f7cc55',  // primary gold
            400: '#e8b82a',
            500: '#c99a18',
          },
          blue: {
            50:  '#eff6ff',
            100: '#dbeafe',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
          },
          warm: '#fafaf7',
        },
      },
      fontFamily: {
        sans: ['Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
