/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kiosk: {
          primary: '#FACC15',
          primaryHover: '#EAB308',
          onPrimary: '#0F172A',
          primaryLight: '#FEFCE8',
          primaryDark: '#854D0E',
          canvas: '#F8FAFC',
          surface: '#FFFFFF',
          textMain: '#0F172A',
          textSecondary: '#475569',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'control': '12px',
        'card': '16px',
        'material': '18px',
      },
      minHeight: {
        'touch': '56px',
      },
      minWidth: {
        'touch': '56px',
      },
    },
  },
  plugins: [],
};
